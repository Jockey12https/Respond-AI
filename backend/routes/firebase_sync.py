"""
Firebase Severity Sync Routes
Endpoints for syncing incident severity scores to crisis levels in Firestore
"""
from flask import Blueprint, jsonify, request
from models.severity import SeverityCalculator, get_crisis_level
from models.firebase_integration import FirebaseIntegration

firebase_sync_bp = Blueprint('firebase_sync', __name__, url_prefix='/api/firebase')


@firebase_sync_bp.route('/sync-severity', methods=['POST'])
def sync_all_severity():
    """
    Process all incidents and update crisis levels in Firestore
    
    Query Parameters:
        zone (optional): Filter by specific zone
        
    Returns:
        JSON response with processing statistics
    """
    try:
        # Get optional zone filter from query params
        zone_filter = request.args.get('zone')
        
        # Fetch incidents from Firestore
        incidents = FirebaseIntegration.fetch_incidents(zone=zone_filter)
        
        if not incidents:
            return jsonify({
                'success': False,
                'message': 'No incidents found',
                'processed': 0
            }), 404
        
        # Process each incident
        processed_count = 0
        updated_zones = set()
        severity_calculator = SeverityCalculator()
        
        print(f"\n{'='*80}")
        print(f"🔍 PROCESSING {len(incidents)} INCIDENTS")
        print(f"{'='*80}\n")
        
        for i, incident in enumerate(incidents, 1):
            description = incident.get('description', '')
            zone = incident.get('zone')
            location = incident.get('location', 'Unknown location')
            
            if not description or not zone:
                continue
            
            # Calculate severity score
            severity_score = severity_calculator.calculate(description)
            crisis_level = get_crisis_level(severity_score)
            emergency_type = severity_calculator.classify_emergency_type(description)
            
            # Print detailed info
            print(f"Incident {i}/{len(incidents)}:")
            print(f"  Location: {location}")
            print(f"  Zone: {zone}")
            print(f"  Description: {description[:60]}...")
            print(f"  → Severity Score: {severity_score:.3f}")
            print(f"  → Crisis Level: {crisis_level.upper()}")
            print(f"  → Emergency Type: {emergency_type}")
            print()
            
            # Update crisis level for this zone
            success = FirebaseIntegration.update_crisis_level(
                zone=zone,
                crisis_level=crisis_level,
                severity_score=severity_score
            )
            
            if success:
                processed_count += 1
                updated_zones.add(zone)
        
        return jsonify({
            'success': True,
            'message': f'Successfully processed {processed_count} incidents',
            'processed': processed_count,
            'total_incidents': len(incidents),
            'updated_zones': list(updated_zones)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@firebase_sync_bp.route('/sync-severity/<incident_id>', methods=['POST'])
def sync_single_severity(incident_id):
    """
    Process a single incident and update its crisis level
    
    Args:
        incident_id: Firestore document ID of the incident
        
    Returns:
        JSON response with processing result
    """
    try:
        db = FirebaseIntegration.get_db()
        if not db:
            return jsonify({
                'success': False,
                'error': 'Firebase not initialized'
            }), 500
        
        # Fetch specific incident
        incident_ref = db.collection('incidents').document(incident_id)
        incident_doc = incident_ref.get()
        
        if not incident_doc.exists:
            return jsonify({
                'success': False,
                'error': f'Incident {incident_id} not found'
            }), 404
        
        incident_data = incident_doc.to_dict()
        description = incident_data.get('description', '')
        zone = incident_data.get('zone')
        
        if not description or not zone:
            return jsonify({
                'success': False,
                'error': 'Incident missing description or zone'
            }), 400
        
        # Calculate severity
        severity_calculator = SeverityCalculator()
        severity_score = severity_calculator.calculate(description)
        crisis_level = get_crisis_level(severity_score)
        emergency_type = severity_calculator.classify_emergency_type(description)
        
        # Update crisis level
        success = FirebaseIntegration.update_crisis_level(
            zone=zone,
            crisis_level=crisis_level,
            severity_score=severity_score
        )
        
        if success:
            return jsonify({
                'success': True,
                'incident_id': incident_id,
                'zone': zone,
                'severity_score': severity_score,
                'crisis_level': crisis_level,
                'emergency_type': emergency_type
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update crisis level'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@firebase_sync_bp.route('/severity-stats', methods=['GET'])
def get_severity_stats():
    """
    Get statistics on severity scores across all zones
    
    Returns:
        JSON response with severity statistics
    """
    try:
        db = FirebaseIntegration.get_db()
        if not db:
            return jsonify({
                'success': False,
                'error': 'Firebase not initialized'
            }), 500
        
        # Fetch all crises
        crises_ref = db.collection('crises')
        crises = []
        
        for doc in crises_ref.stream():
            crisis_data = doc.to_dict()
            crisis_data['id'] = doc.id
            crises.append(crisis_data)
        
        # Calculate statistics
        total_crises = len(crises)
        level_counts = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        total_severity = 0
        for crisis in crises:
            level = crisis.get('crisisLevel', 'low')
            if level in level_counts:
                level_counts[level] += 1
            
            severity = crisis.get('severityScore', 0)
            total_severity += severity
        
        avg_severity = total_severity / total_crises if total_crises > 0 else 0
        
        return jsonify({
            'success': True,
            'total_crises': total_crises,
            'level_distribution': level_counts,
            'average_severity': round(avg_severity, 3),
            'crises': crises
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@firebase_sync_bp.route('/test-severity', methods=['POST'])
def test_severity_calculation():
    """
    Test severity calculation without updating database
    
    Request Body:
        {
            "description": "Incident description text"
        }
        
    Returns:
        JSON response with calculated severity and crisis level
    """
    try:
        data = request.get_json()
        description = data.get('description', '')
        
        if not description:
            return jsonify({
                'success': False,
                'error': 'Description is required'
            }), 400
        
        severity_calculator = SeverityCalculator()
        severity_score = severity_calculator.calculate(description)
        crisis_level = get_crisis_level(severity_score)
        emergency_type = severity_calculator.classify_emergency_type(description)
        
        return jsonify({
            'success': True,
            'description': description,
            'severity_score': severity_score,
            'crisis_level': crisis_level,
            'emergency_type': emergency_type
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
