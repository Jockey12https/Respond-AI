"""
Example API usage scripts
Demonstrates how to interact with the TWSM backend
"""
import requests
import json

BASE_URL = "http://localhost:5000"


def example_1_submit_high_priority_report():
    """Example 1: Submit a high-priority emergency report"""
    print("\n" + "=" * 70)
    print("EXAMPLE 1: Submit High-Priority Report (Fire Emergency)")
    print("=" * 70)
    
    # Create a user first
    user_data = {
        "user_id": "user_trusted_001",
        "name": "John Doe"
    }
    
    response = requests.post(f"{BASE_URL}/api/user/create", json=user_data)
    print(f"\n1. Created user: {response.json()}")
    
    # Submit multiple verified reports to build trust
    print("\n2. Building user trust with verified reports...")
    for i in range(5):
        report = {
            "user_id": "user_trusted_001",
            "description": f"Test verified report {i+1}",
            "evidence_type": "image",
            "location": {"lat": 8.524, "lng": 76.936}
        }
        requests.post(f"{BASE_URL}/api/emergency/report", json=report)
    
    # Now submit the actual high-priority report
    emergency_report = {
        "user_id": "user_trusted_001",
        "description": "Fire and smoke, people panicking! Building on fire!",
        "evidence_type": "camera",
        "location": {"lat": 8.524, "lng": 76.936},
        "has_metadata": True,
        "population_density": "high",
        "weather_condition": "normal"
    }
    
    response = requests.post(f"{BASE_URL}/api/emergency/report", json=emergency_report)
    result = response.json()
    
    print(f"\n3. Emergency Report Submitted:")
    print(f"   Report ID: {result['report']['id']}")
    print(f"   Final Priority: {result['report']['scores']['final_priority']}")
    print(f"   Action: {result['report']['action']}")
    print(f"   Action Details: {result['action_details']['title']}")
    print(f"   Formula: {result['priority_breakdown']['calculation_formula']}")


def example_2_low_trust_report():
    """Example 2: Submit report from new/untrusted user"""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Submit Report from New User (Low Trust)")
    print("=" * 70)
    
    report = {
        "user_id": "new_user_002",
        "name": "New User",
        "description": "Major emergency! Help needed urgently!",
        "evidence_type": "text",
        "location": {"lat": 8.525, "lng": 76.937}
    }
    
    response = requests.post(f"{BASE_URL}/api/emergency/report", json=report)
    result = response.json()
    
    print(f"\nReport Submitted:")
    print(f"   Report ID: {result['report']['id']}")
    print(f"   Final Priority: {result['report']['scores']['final_priority']}")
    print(f"   Action: {result['report']['action']}")
    print(f"   Reason: Low trust score + weak evidence = HOLD for verification")


def example_3_community_validation():
    """Example 3: Community validation workflow"""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Community Validation Workflow")
    print("=" * 70)
    
    # Submit a medium-priority report
    report = {
        "user_id": "user_003",
        "description": "Accident on highway, vehicle damage",
        "evidence_type": "image",
        "has_metadata": True,
        "location": {"lat": 8.526, "lng": 76.938}
    }
    
    response = requests.post(f"{BASE_URL}/api/emergency/report", json=report)
    report_id = response.json()['report']['id']
    
    print(f"\n1. Report submitted (ID: {report_id})")
    print(f"   Action: {response.json()['report']['action']}")
    
    # Multiple users validate the report
    validators = [
        {"user_id": "validator_1", "is_valid": True, "comment": "I saw the accident"},
        {"user_id": "validator_2", "is_valid": True, "comment": "Can confirm"},
        {"user_id": "validator_3", "is_valid": True, "comment": "Yes, it's real"}
    ]
    
    print("\n2. Community validations:")
    for validator in validators:
        response = requests.post(
            f"{BASE_URL}/api/emergency/validate/{report_id}",
            json=validator
        )
        result = response.json()
        print(f"   - {validator['user_id']}: {'✓' if validator['is_valid'] else '✗'}")
    
    print(f"\n3. Final Status: {result['report_status']}")
    print(f"   Validation Ratio: {result['validation_stats']['ratio']}")


def example_4_multi_report_aggregation():
    """Example 4: Multiple reports of same incident"""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Multi-Report Aggregation")
    print("=" * 70)
    
    # Multiple users report the same fire
    reports = [
        {
            "user_id": "user_a",
            "description": "Fire in building!",
            "evidence_type": "camera",
            "location": {"lat": 8.524, "lng": 76.936}
        },
        {
            "user_id": "user_b",
            "description": "Smoke and flames visible",
            "evidence_type": "image",
            "location": {"lat": 8.5241, "lng": 76.9361}  # Very close
        },
        {
            "user_id": "user_c",
            "description": "Building fire emergency",
            "evidence_type": "image_geo",
            "location": {"lat": 8.5239, "lng": 76.9359}  # Very close
        }
    ]
    
    print("\n1. Submitting 3 reports of same incident:")
    for i, report in enumerate(reports):
        response = requests.post(f"{BASE_URL}/api/emergency/report", json=report)
        result = response.json()
        print(f"   Report {i+1}: Priority = {result['report']['scores']['final_priority']}")
        
        if result.get('aggregation'):
            print(f"   ⚡ AGGREGATED: {result['aggregation']['report_count']} reports clustered")
            print(f"   Combined Priority: {result['aggregation']['combined_priority']}")


def example_5_analytics():
    """Example 5: Get system analytics"""
    print("\n" + "=" * 70)
    print("EXAMPLE 5: System Analytics")
    print("=" * 70)
    
    # Get overall stats
    response = requests.get(f"{BASE_URL}/api/analytics/stats")
    stats = response.json()
    
    print("\nSystem Statistics:")
    print(f"   Total Reports: {stats['reports']['total']}")
    print(f"   - Dispatch: {stats['reports']['by_action']['dispatch']}")
    print(f"   - Validate: {stats['reports']['by_action']['validate']}")
    print(f"   - Hold: {stats['reports']['by_action']['hold']}")
    print(f"   Average Priority: {stats['reports']['average_priority']}")
    print(f"   Total Users: {stats['users']['total']}")
    print(f"   Average Trust: {stats['users']['average_trust']}")


def run_all_examples():
    """Run all examples"""
    print("\n" + "=" * 70)
    print("RESPOND.AI - TWSM Backend API Examples")
    print("=" * 70)
    print("\nMake sure the backend is running at http://localhost:5000")
    print("Start it with: python app.py")
    
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("\n❌ Backend server is not running!")
            return
        
        print("\n✅ Backend server is running\n")
        
        # Run examples
        example_1_submit_high_priority_report()
        example_2_low_trust_report()
        example_3_community_validation()
        example_4_multi_report_aggregation()
        example_5_analytics()
        
        print("\n" + "=" * 70)
        print("All examples completed successfully! ✅")
        print("=" * 70)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend server")
        print("Make sure to start the server with: python app.py")


if __name__ == '__main__':
    run_all_examples()
