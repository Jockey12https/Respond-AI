"""
Test Firebase Sync - Fetch incidents from Firebase and sync severity scores
"""
import sys
import argparse
from models.firebase_integration import FirebaseIntegration
from models.severity import SeverityCalculator, get_crisis_level

def test_firebase_connection():
    """Test if Firebase is connected"""
    print("=" * 80)
    print("STEP 1: Testing Firebase Connection")
    print("=" * 80)
    
    FirebaseIntegration.initialize()
    db = FirebaseIntegration.get_db()
    
    if db:
        print("✅ Firebase connected successfully!")
        return True
    else:
        print("❌ Firebase connection failed!")
        print("   Make sure FIREBASE_CREDENTIALS_PATH is set in .env")
        return False

def fetch_sample_incidents(zone=None, limit=5):
    """Fetch sample incidents from Firebase"""
    print("\n" + "=" * 80)
    print(f"STEP 2: Fetching Incidents from Firebase{f' (Zone: {zone})' if zone else ''}")
    print("=" * 80)
    
    incidents = FirebaseIntegration.fetch_incidents(zone=zone, limit=limit)
    
    if not incidents:
        print("⚠️  No incidents found in Firebase")
        print("   Make sure you have incidents in the 'incidents' collection")
        return []
    
    print(f"✅ Found {len(incidents)} incidents:\n")
    
    for i, incident in enumerate(incidents, 1):
        desc = incident.get('description', 'No description')
        zone_name = incident.get('zone', 'No zone')
        incident_id = incident.get('id', 'Unknown')
        
        print(f"{i}. ID: {incident_id}")
        print(f"   Zone: {zone_name}")
        print(f"   Description: {desc[:80]}{'...' if len(desc) > 80 else ''}")
        print()
    
    return incidents

def calculate_severities(incidents, show_details=True):
    """Calculate severity scores for incidents"""
    print("=" * 80)
    print("STEP 3: Calculating Severity Scores")
    print("=" * 80)
    
    calculator = SeverityCalculator()
    results = []
    
    for incident in incidents:
        description = incident.get('description', '')
        zone = incident.get('zone', 'Unknown')
        
        if not description:
            continue
        
        severity_score = calculator.calculate(description)
        crisis_level = get_crisis_level(severity_score)
        emergency_type = calculator.classify_emergency_type(description)
        
        result = {
            'incident_id': incident.get('id'),
            'zone': zone,
            'description': description,
            'severity_score': severity_score,
            'crisis_level': crisis_level,
            'emergency_type': emergency_type
        }
        results.append(result)
        
        if show_details:
            print(f"\n📍 Zone: {zone}")
            print(f"   Description: {description[:60]}...")
            print(f"   ➜ Severity Score: {severity_score}")
            print(f"   ➜ Crisis Level: {crisis_level.upper()}")
            print(f"   ➜ Emergency Type: {emergency_type}")
    
    return results

def sync_to_firebase(results, dry_run=True):
    """Sync severity scores to Firebase crises collection"""
    print("\n" + "=" * 80)
    print(f"STEP 4: {'[DRY RUN] ' if dry_run else ''}Syncing to Firebase")
    print("=" * 80)
    
    if dry_run:
        print("ℹ️  DRY RUN MODE - No actual updates will be made\n")
    
    updated_zones = set()
    
    for result in results:
        zone = result['zone']
        crisis_level = result['crisis_level']
        severity_score = result['severity_score']
        
        if dry_run:
            print(f"Would update: Zone '{zone}' → Crisis Level: {crisis_level.upper()} (Score: {severity_score})")
        else:
            success = FirebaseIntegration.update_crisis_level(
                zone=zone,
                crisis_level=crisis_level,
                severity_score=severity_score
            )
            if success:
                updated_zones.add(zone)
    
    print(f"\n{'Would update' if dry_run else 'Updated'} {len(updated_zones)} unique zones")
    return updated_zones

def show_statistics():
    """Show severity statistics"""
    print("\n" + "=" * 80)
    print("STEP 5: Severity Statistics")
    print("=" * 80)
    
    import requests
    try:
        response = requests.get('http://localhost:5000/api/firebase/severity-stats', timeout=5)
        if response.status_code == 200:
            stats = response.json()
            
            print(f"\n📊 Total Crises: {stats.get('total_crises', 0)}")
            print(f"📈 Average Severity: {stats.get('average_severity', 0)}\n")
            
            print("Crisis Level Distribution:")
            dist = stats.get('level_distribution', {})
            for level, count in dist.items():
                print(f"  {level.upper():10} : {count:3} {'█' * count}")
        else:
            print("⚠️  Could not fetch statistics")
    except Exception as e:
        print(f"⚠️  Error fetching statistics: {e}")

def main():
    parser = argparse.ArgumentParser(description='Test Firebase Severity Sync')
    parser.add_argument('--zone', type=str, help='Filter by specific zone')
    parser.add_argument('--limit', type=int, default=10, help='Number of incidents to fetch')
    parser.add_argument('--sync-all', action='store_true', help='Actually sync to Firebase (not dry run)')
    parser.add_argument('--test-only', action='store_true', help='Only test calculations, no sync')
    
    args = parser.parse_args()
    
    print("\n🔥 FIREBASE SEVERITY SYNC TEST")
    print("=" * 80)
    
    # Step 1: Test connection
    if not test_firebase_connection():
        return
    
    # Step 2: Fetch incidents
    incidents = fetch_sample_incidents(zone=args.zone, limit=args.limit)
    if not incidents:
        return
    
    # Step 3: Calculate severities
    results = calculate_severities(incidents)
    
    if args.test_only:
        print("\n✅ Test completed (no sync performed)")
        return
    
    # Step 4: Sync to Firebase
    dry_run = not args.sync_all
    sync_to_firebase(results, dry_run=dry_run)
    
    # Step 5: Show statistics
    if args.sync_all:
        show_statistics()
    
    print("\n" + "=" * 80)
    print("✅ TEST COMPLETED")
    print("=" * 80)
    
    if dry_run:
        print("\nℹ️  To actually sync to Firebase, run with --sync-all flag:")
        print("   python test_firebase_sync.py --sync-all")

if __name__ == '__main__':
    main()
