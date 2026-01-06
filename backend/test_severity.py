"""
Test script for severity calculation
"""
import sys
sys.path.append('.')

from models.severity import SeverityCalculator, get_crisis_level

# Test cases
test_descriptions = [
    "Major fire with people trapped, urgent help needed!",
    "Minor traffic accident, no injuries",
    "Building collapse in residential area",
    "Flood water rising rapidly, evacuate immediately",
    "Small gas leak detected"
]

print("=" * 70)
print("SEVERITY CALCULATION TEST")
print("=" * 70)

calculator = SeverityCalculator()

for desc in test_descriptions:
    severity = calculator.calculate(desc)
    crisis_level = get_crisis_level(severity)
    emergency_type = calculator.classify_emergency_type(desc)
    
    print(f"\nDescription: {desc}")
    print(f"  Severity Score: {severity}")
    print(f"  Crisis Level: {crisis_level.upper()}")
    print(f"  Emergency Type: {emergency_type}")
    print("-" * 70)

print("\n✅ Severity calculation test completed!")
