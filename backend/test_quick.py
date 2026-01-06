"""Quick test of TWSM model"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.twsm import TWSMCalculator

calc = TWSMCalculator()

print("=" * 70)
print("TWSM MODEL - QUICK VERIFICATION TEST")
print("=" * 70)
print()

# Test Case 1: High Trust, High Severity
print("Case 1: High Trust, High Severity")
result1 = calc.calculate_priority(
    description="Fire and smoke, people panicking!",
    user_trust_score=0.85,
    evidence_type="camera",
    has_geolocation=True,
    latitude=8.524,
    longitude=76.936,
    population_density="high"
)
print(f"Priority: {result1['final_priority']} | Action: {result1['action']}")
print(f"Expected: ~0.83, DISPATCH | Result: {'✅ PASS' if result1['action'] == 'DISPATCH' else '❌ FAIL'}")
print()

# Test Case 2: Low Trust, High Severity
print("Case 2: Low Trust, High Severity")
result2 = calc.calculate_priority(
    description="Major emergency!",
    user_trust_score=0.2,
    evidence_type="text"
)
print(f"Priority: {result2['final_priority']} | Action: {result2['action']}")
print(f"Expected: ~0.09, HOLD | Result: {'✅ PASS' if result2['action'] == 'HOLD' else '❌ FAIL'}")
print()

# Test Case 3: Medium Everything
print("Case 3: Medium Everything")
result3 = calc.calculate_priority(
    description="Accident on highway",
    user_trust_score=0.5,
    evidence_type="image",
    has_metadata=True
)
print(f"Priority: {result3['final_priority']} | Action: {result3['action']}")
print(f"Expected: ~0.45, VALIDATE | Result: {'✅ PASS' if result3['action'] == 'VALIDATE' else '❌ FAIL'}")
print()

print("=" * 70)
print("VERIFICATION COMPLETE!")
print("=" * 70)
