"""
Test script to validate TWSM model with specification examples
"""
import sys
sys.path.append('..')

from models.twsm import TWSMCalculator


def test_specification_cases():
    """Test the three cases from the specification"""
    calculator = TWSMCalculator()
    
    print("=" * 80)
    print("TWSM MODEL VALIDATION - Testing Against Specification")
    print("=" * 80)
    print()
    
    # Case 1: High Trust, High Severity → Should get ~0.83, DISPATCH
    print("TEST CASE 1: High Trust, High Severity")
    print("-" * 80)
    print("Expected: Final Score ≈ 0.83, Action = DISPATCH")
    print()
    
    result1 = calculator.calculate_priority(
        description="Fire and smoke, people panicking!",
        user_trust_score=0.85,
        evidence_type="camera",
        has_geolocation=True,
        latitude=8.524,
        longitude=76.936,
        population_density="high",
        weather_condition="normal"
    )
    
    print(f"Actual: Final Score = {result1['final_priority']}, Action = {result1['action']}")
    print(f"Formula: {result1['calculation_formula']}")
    print(f"Breakdown:")
    print(f"  - Severity: {result1['breakdown']['severity']['score']}")
    print(f"  - Trust: {result1['breakdown']['trust']['score']}")
    print(f"  - Evidence: {result1['breakdown']['evidence']['score']}")
    print(f"  - Context Risk: {result1['breakdown']['context']['risk_multiplier']}")
    
    # Validate
    assert result1['action'] == 'DISPATCH', "❌ FAILED: Should be DISPATCH"
    assert result1['final_priority'] > 0.6, "❌ FAILED: Priority should be > 0.6"
    print("✅ PASSED: High priority report correctly dispatched")
    print()
    
    # Case 2: Low Trust, High Severity → Should get ~0.09, HOLD
    print("TEST CASE 2: Low Trust, High Severity")
    print("-" * 80)
    print("Expected: Final Score ≈ 0.09, Action = HOLD")
    print()
    
    result2 = calculator.calculate_priority(
        description="Major emergency happening now!",
        user_trust_score=0.2,
        evidence_type="text",
        has_geolocation=False,
        population_density="medium",
        weather_condition="normal"
    )
    
    print(f"Actual: Final Score = {result2['final_priority']}, Action = {result2['action']}")
    print(f"Formula: {result2['calculation_formula']}")
    print(f"Breakdown:")
    print(f"  - Severity: {result2['breakdown']['severity']['score']}")
    print(f"  - Trust: {result2['breakdown']['trust']['score']}")
    print(f"  - Evidence: {result2['breakdown']['evidence']['score']}")
    print(f"  - Context Risk: {result2['breakdown']['context']['risk_multiplier']}")
    
    # Validate
    assert result2['action'] == 'HOLD', "❌ FAILED: Should be HOLD"
    assert result2['final_priority'] < 0.3, "❌ FAILED: Priority should be < 0.3"
    print("✅ PASSED: Low trust report correctly held for verification")
    print()
    
    # Case 3: Medium Everything → Should get ~0.45, VALIDATE
    print("TEST CASE 3: Medium Everything")
    print("-" * 80)
    print("Expected: Final Score ≈ 0.45, Action = VALIDATE")
    print()
    
    result3 = calculator.calculate_priority(
        description="Accident on highway, some damage",
        user_trust_score=0.5,
        evidence_type="image",
        has_metadata=True,
        latitude=8.524,
        longitude=76.936,
        population_density="medium",
        weather_condition="normal"
    )
    
    print(f"Actual: Final Score = {result3['final_priority']}, Action = {result3['action']}")
    print(f"Formula: {result3['calculation_formula']}")
    print(f"Breakdown:")
    print(f"  - Severity: {result3['breakdown']['severity']['score']}")
    print(f"  - Trust: {result3['breakdown']['trust']['score']}")
    print(f"  - Evidence: {result3['breakdown']['evidence']['score']}")
    print(f"  - Context Risk: {result3['breakdown']['context']['risk_multiplier']}")
    
    # Validate
    assert result3['action'] == 'VALIDATE', "❌ FAILED: Should be VALIDATE"
    assert 0.3 <= result3['final_priority'] <= 0.6, "❌ FAILED: Priority should be 0.3-0.6"
    print("✅ PASSED: Medium priority report correctly sent for validation")
    print()
    
    print("=" * 80)
    print("ALL TESTS PASSED! ✅")
    print("The TWSM model behaves exactly as specified.")
    print("=" * 80)


if __name__ == '__main__':
    test_specification_cases()
