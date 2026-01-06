"""
Core Trust-Weighted Severity Model (TWSM)
Main calculator that combines all scoring components
"""
from typing import Dict, Optional
from datetime import datetime

from models.severity import SeverityCalculator
from models.reputation import ReputationManager
from models.evidence import EvidenceAnalyzer
from models.context import ContextAnalyzer
from config import PRIORITY_THRESHOLD_DISPATCH, PRIORITY_THRESHOLD_VALIDATE


class TWSMCalculator:
    """
    Trust-Weighted Severity Model Calculator
    
    Formula: final_priority = severity × trust × evidence × context_risk
    """
    
    def __init__(self):
        self.severity_calc = SeverityCalculator()
        self.reputation_mgr = ReputationManager()
        self.evidence_analyzer = EvidenceAnalyzer()
        self.context_analyzer = ContextAnalyzer()
    
    def calculate_priority(
        self,
        description: str,
        user_trust_score: float,
        evidence_type: str,
        has_metadata: bool = False,
        has_geolocation: bool = False,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        population_density: str = 'medium',
        weather_condition: str = 'normal',
        is_disaster_zone: bool = False,
        time_of_day: Optional[datetime] = None
    ) -> Dict:
        """
        Calculate final priority score and determine action
        
        Args:
            description: Report description text
            user_trust_score: Reporter's trust score (0-1)
            evidence_type: Type of evidence provided
            has_metadata: Whether evidence has metadata
            has_geolocation: Whether evidence has geolocation
            latitude: Location latitude
            longitude: Location longitude
            population_density: Area population density
            weather_condition: Current weather condition
            is_disaster_zone: Whether area is disaster-prone
            time_of_day: Time of report (uses current time if None)
            
        Returns:
            dict: Complete priority calculation breakdown
        """
        # Calculate severity score
        severity_score = self.severity_calc.calculate(description)
        emergency_type = self.severity_calc.classify_emergency_type(description)
        
        # Get trust score (already calculated for user)
        trust_score = user_trust_score
        
        # Calculate evidence score
        evidence_score = self.evidence_analyzer.calculate_evidence_score(
            evidence_type, has_metadata, has_geolocation
        )
        
        # Calculate context risk
        context_risk = self.context_analyzer.calculate_context_risk(
            population_density=population_density,
            time_of_day=time_of_day,
            weather_condition=weather_condition,
            is_disaster_zone=is_disaster_zone,
            emergency_type=emergency_type
        )
        
        # Calculate final priority
        final_priority = severity_score * trust_score * evidence_score * context_risk
        final_priority = round(final_priority, 3)
        
        # Determine action
        action = self.classify_action(final_priority)
        
        # Get additional context
        evidence_quality = self.evidence_analyzer.classify_evidence_quality(evidence_score)
        trust_level = self.reputation_mgr.get_trust_level(trust_score)
        
        # Response time assessment if location provided
        response_assessment = None
        if latitude and longitude:
            response_assessment = self.context_analyzer.assess_response_time(
                latitude, longitude, emergency_type
            )
        
        return {
            'final_priority': final_priority,
            'action': action,
            'breakdown': {
                'severity': {
                    'score': severity_score,
                    'emergency_type': emergency_type
                },
                'trust': {
                    'score': trust_score,
                    'level': trust_level
                },
                'evidence': {
                    'score': evidence_score,
                    'quality': evidence_quality,
                    'type': evidence_type
                },
                'context': {
                    'risk_multiplier': context_risk,
                    'population_density': population_density,
                    'weather': weather_condition,
                    'is_disaster_zone': is_disaster_zone
                }
            },
            'response_assessment': response_assessment,
            'calculation_formula': f"{severity_score} × {trust_score} × {evidence_score} × {context_risk} = {final_priority}"
        }
    
    @staticmethod
    def classify_action(priority_score: float) -> str:
        """
        Classify action based on priority score
        
        Args:
            priority_score: Final priority score (0-1)
            
        Returns:
            str: Action to take (DISPATCH, VALIDATE, or HOLD)
        """
        if priority_score >= PRIORITY_THRESHOLD_DISPATCH:
            return "DISPATCH"  # Instant dispatch to authorities
        elif priority_score >= PRIORITY_THRESHOLD_VALIDATE:
            return "VALIDATE"  # Community validation needed
        else:
            return "HOLD"  # Hold for verification
    
    def get_action_description(self, action: str) -> Dict:
        """
        Get detailed description of what each action means
        
        Args:
            action: Action type (DISPATCH, VALIDATE, HOLD)
            
        Returns:
            dict: Action details
        """
        actions = {
            'DISPATCH': {
                'title': 'Instant Dispatch',
                'description': 'High-priority emergency. Authorities notified immediately.',
                'next_steps': [
                    'Emergency services dispatched',
                    'Real-time tracking enabled',
                    'Community alerted in affected area'
                ],
                'color': 'red'
            },
            'VALIDATE': {
                'title': 'Community Validation',
                'description': 'Medium-priority report. Seeking community confirmation.',
                'next_steps': [
                    'Nearby users notified for validation',
                    'Awaiting additional reports or confirmations',
                    'Will escalate if validated'
                ],
                'color': 'orange'
            },
            'HOLD': {
                'title': 'Hold for Verification',
                'description': 'Low-priority or unverified report. Under review.',
                'next_steps': [
                    'Report flagged for manual review',
                    'Additional evidence requested',
                    'Will not trigger immediate response'
                ],
                'color': 'yellow'
            }
        }
        
        return actions.get(action, actions['HOLD'])


# Example usage and testing
if __name__ == '__main__':
    calculator = TWSMCalculator()
    
    print("=" * 70)
    print("TRUST-WEIGHTED SEVERITY MODEL (TWSM) - TEST CASES")
    print("=" * 70)
    print()
    
    # Test Case 1: High Trust, High Severity (from specification)
    print("CASE 1: High Trust, High Severity")
    print("-" * 70)
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
    print(f"Description: Fire and smoke, people panicking!")
    print(f"Severity: {result1['breakdown']['severity']['score']}")
    print(f"Trust: {result1['breakdown']['trust']['score']}")
    print(f"Evidence: {result1['breakdown']['evidence']['score']}")
    print(f"Context Risk: {result1['breakdown']['context']['risk_multiplier']}")
    print(f"Formula: {result1['calculation_formula']}")
    print(f"FINAL PRIORITY: {result1['final_priority']}")
    print(f"ACTION: {result1['action']}")
    print(f"Expected: ≈ 0.83, DISPATCH ✓" if result1['final_priority'] > 0.6 else "❌")
    print()
    
    # Test Case 2: Low Trust, High Severity (from specification)
    print("CASE 2: Low Trust, High Severity")
    print("-" * 70)
    result2 = calculator.calculate_priority(
        description="Major emergency happening now!",
        user_trust_score=0.2,
        evidence_type="text",
        has_geolocation=False,
        population_density="medium",
        weather_condition="normal"
    )
    print(f"Description: Major emergency happening now!")
    print(f"Severity: {result2['breakdown']['severity']['score']}")
    print(f"Trust: {result2['breakdown']['trust']['score']}")
    print(f"Evidence: {result2['breakdown']['evidence']['score']}")
    print(f"Context Risk: {result2['breakdown']['context']['risk_multiplier']}")
    print(f"Formula: {result2['calculation_formula']}")
    print(f"FINAL PRIORITY: {result2['final_priority']}")
    print(f"ACTION: {result2['action']}")
    print(f"Expected: ≈ 0.09, HOLD ✓" if result2['final_priority'] < 0.3 else "❌")
    print()
    
    # Test Case 3: Medium Everything (from specification)
    print("CASE 3: Medium Everything")
    print("-" * 70)
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
    print(f"Description: Accident on highway, some damage")
    print(f"Severity: {result3['breakdown']['severity']['score']}")
    print(f"Trust: {result3['breakdown']['trust']['score']}")
    print(f"Evidence: {result3['breakdown']['evidence']['score']}")
    print(f"Context Risk: {result3['breakdown']['context']['risk_multiplier']}")
    print(f"Formula: {result3['calculation_formula']}")
    print(f"FINAL PRIORITY: {result3['final_priority']}")
    print(f"ACTION: {result3['action']}")
    print(f"Expected: ≈ 0.45, VALIDATE ✓" if 0.3 <= result3['final_priority'] <= 0.6 else "❌")
    print()
    
    print("=" * 70)
    print("All test cases completed!")
    print("=" * 70)
