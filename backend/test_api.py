"""
Comprehensive test of the severity scoring API
"""
import requests
import json

BASE_URL = "http://localhost:5000/api/firebase"

# Test cases with expected results
test_cases = [
    {
        "description": "Major fire with people trapped, urgent help needed!",
        "expected_level": "critical"
    },
    {
        "description": "Minor traffic accident, no injuries reported",
        "expected_level": "high"  # Due to "accident" keyword
    },
    {
        "description": "Flood water rising rapidly in residential area, evacuate immediately",
        "expected_level": "high"
    },
    {
        "description": "Building collapse with multiple casualties",
        "expected_level": "critical"
    },
    {
        "description": "Small gas leak detected in kitchen",
        "expected_level": "medium"
    },
    {
        "description": "Power outage in the neighborhood",
        "expected_level": "low"
    }
]

print("=" * 80)
print("SEVERITY SCORE MODEL - API TEST RESULTS")
print("=" * 80)
print()

for i, test in enumerate(test_cases, 1):
    try:
        response = requests.post(
            f"{BASE_URL}/test-severity",
            json={"description": test["description"]},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"Test {i}:")
            print(f"  Description: {test['description']}")
            print(f"  ✅ Severity Score: {result['severity_score']}")
            print(f"  ✅ Crisis Level: {result['crisis_level'].upper()}")
            print(f"  ✅ Emergency Type: {result['emergency_type']}")
            
            # Check if matches expected
            if result['crisis_level'] == test['expected_level']:
                print(f"  ✓ Matches expected level: {test['expected_level'].upper()}")
            else:
                print(f"  ⚠ Expected: {test['expected_level'].upper()}, Got: {result['crisis_level'].upper()}")
        else:
            print(f"Test {i}: ❌ Failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Test {i}: ❌ Error: {e}")
    
    print("-" * 80)
    print()

print("=" * 80)
print("✅ API TEST COMPLETED")
print("=" * 80)
