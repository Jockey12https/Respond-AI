"""
Firebase Firestore Integration for TWSM System
Handles reading incidents and updating crises with calculated severity scores
"""
# Load environment variables from .env.local
try:
    import load_env
except:
    pass

import firebase_admin
from firebase_admin import credentials, firestore
import os
from typing import List, Dict, Optional
from datetime import datetime


class FirebaseIntegration:
    """Manages Firebase Firestore operations for severity scoring"""
    
    _initialized = False
    _db = None
    
    @classmethod
    def initialize(cls, credentials_path: Optional[str] = None):
        """
        Initialize Firebase Admin SDK
        
        Args:
            credentials_path: Path to Firebase service account JSON file (optional)
        """
        if cls._initialized:
            return
        
        try:
            # Option 1: Try credentials file path
            cred_path = credentials_path or os.getenv('FIREBASE_CREDENTIALS_PATH')
            
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                cls._db = firestore.client()
                cls._initialized = True
                print("✅ Firebase Admin SDK initialized with credentials file")
                return
            
            # Option 2: Try environment variables (from .env.local)
            project_id = os.getenv('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
            
            if project_id:
                # Initialize with project ID only (uses default credentials)
                firebase_admin.initialize_app(options={
                    'projectId': project_id
                })
                cls._db = firestore.client()
                cls._initialized = True
                print(f"✅ Firebase Admin SDK initialized with project ID: {project_id}")
                return
            
            # Option 3: Try default credentials
            firebase_admin.initialize_app()
            cls._db = firestore.client()
            cls._initialized = True
            print("✅ Firebase Admin SDK initialized with default credentials")
            
        except Exception as e:
            print(f"⚠️ Firebase initialization error: {e}")
            print("Continuing without Firebase integration...")
            print("Tip: Set NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local or provide credentials file")
    
    @classmethod
    def get_db(cls):
        """Get Firestore database client"""
        if not cls._initialized:
            cls.initialize()
        return cls._db
    
    @staticmethod
    def fetch_incidents(zone: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """
        Fetch incidents from Firestore
        
        Args:
            zone: Optional zone filter
            limit: Maximum number of incidents to fetch
            
        Returns:
            List of incident dictionaries
        """
        db = FirebaseIntegration.get_db()
        if not db:
            return []
        
        try:
            incidents_ref = db.collection('incidents')
            
            # Apply zone filter if provided
            if zone:
                query = incidents_ref.where('zone', '==', zone).limit(limit)
            else:
                query = incidents_ref.limit(limit)
            
            incidents = []
            for doc in query.stream():
                incident_data = doc.to_dict()
                incident_data['id'] = doc.id
                incidents.append(incident_data)
            
            return incidents
        except Exception as e:
            print(f"Error fetching incidents: {e}")
            return []
    
    @staticmethod
    def get_moderator_by_zone(zone: str) -> Optional[Dict]:
        """
        Get moderator information for a specific zone
        
        Args:
            zone: Zone name
            
        Returns:
            Moderator data dictionary or None
        """
        db = FirebaseIntegration.get_db()
        if not db:
            return None
        
        try:
            moderators_ref = db.collection('moderators')
            query = moderators_ref.where('zone', '==', zone).limit(1)
            
            for doc in query.stream():
                moderator_data = doc.to_dict()
                moderator_data['id'] = doc.id
                return moderator_data
            
            return None
        except Exception as e:
            print(f"Error fetching moderator: {e}")
            return None
    
    @staticmethod
    def update_crisis_level(zone: str, crisis_level: str, severity_score: float) -> bool:
        """
        Update crisis level in crises table for a specific zone
        
        Args:
            zone: Zone name
            crisis_level: Calculated crisis level (critical, high, medium, low)
            severity_score: Raw severity score (0-1)
            
        Returns:
            True if update successful, False otherwise
        """
        db = FirebaseIntegration.get_db()
        if not db:
            return False
        
        # Print to console
        print(f"\n{'='*60}")
        print(f"📊 SEVERITY CALCULATION RESULT")
        print(f"{'='*60}")
        print(f"Zone: {zone}")
        print(f"Severity Score: {severity_score:.3f}")
        print(f"Crisis Level: {crisis_level.upper()}")
        print(f"{'='*60}\n")
        
        try:
            crises_ref = db.collection('crises')
            
            # Find crisis document for this zone
            query = crises_ref.where('zone', '==', zone).limit(1)
            
            crisis_doc = None
            for doc in query.stream():
                crisis_doc = doc
                break
            
            if crisis_doc:
                # Update existing crisis
                crisis_doc.reference.update({
                    'crisisLevel': crisis_level,
                    'severityScore': severity_score,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })
                print(f"✅ Updated crisis level for zone '{zone}': {crisis_level} (score: {severity_score})")
                return True
            else:
                # Create new crisis document if it doesn't exist
                print(f"⚠️ No crisis found for zone '{zone}' - creating new crisis document")
                crises_ref.add({
                    'zone': zone,
                    'crisisLevel': crisis_level,
                    'severityScore': severity_score,
                    'lastUpdated': firestore.SERVER_TIMESTAMP,
                    'createdAt': firestore.SERVER_TIMESTAMP
                })
                print(f"✅ Created new crisis for zone '{zone}': {crisis_level} (score: {severity_score})")
                return True
                
        except Exception as e:
            print(f"Error updating crisis level: {e}")
            return False
    
    @staticmethod
    def create_or_update_crisis(zone: str, crisis_data: Dict) -> bool:
        """
        Create or update a crisis record for a zone
        
        Args:
            zone: Zone name
            crisis_data: Crisis information including crisisLevel, severityScore, etc.
            
        Returns:
            True if successful, False otherwise
        """
        db = FirebaseIntegration.get_db()
        if not db:
            return False
        
        try:
            crises_ref = db.collection('crises')
            
            # Check if crisis exists for this zone
            query = crises_ref.where('zone', '==', zone).limit(1)
            
            crisis_doc = None
            for doc in query.stream():
                crisis_doc = doc
                break
            
            crisis_data['zone'] = zone
            crisis_data['lastUpdated'] = firestore.SERVER_TIMESTAMP
            
            if crisis_doc:
                # Update existing
                crisis_doc.reference.update(crisis_data)
                print(f"✅ Updated crisis for zone '{zone}'")
            else:
                # Create new
                crises_ref.add(crisis_data)
                print(f"✅ Created new crisis for zone '{zone}'")
            
            return True
            
        except Exception as e:
            print(f"Error creating/updating crisis: {e}")
            return False
