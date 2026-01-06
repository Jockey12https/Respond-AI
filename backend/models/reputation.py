"""
Reputation/Trust Score System
Manages user trust scores based on reporting history
"""
from datetime import datetime, timedelta
from config import (
    TRUST_MIN, TRUST_MAX, TRUST_INITIAL,
    TRUST_POSITIVE_INCREMENT, TRUST_NEGATIVE_DECREMENT,
    TRUST_DECAY_RATE
)


class ReputationManager:
    """Manage user reputation/trust scores"""
    
    @staticmethod
    def get_initial_trust() -> float:
        """Get initial trust score for new users"""
        return TRUST_INITIAL
    
    @staticmethod
    def calculate_trust(verified_reports: int, total_reports: int, false_reports: int = 0) -> float:
        """
        Calculate trust score based on reporting history
        
        Args:
            verified_reports: Number of verified/confirmed reports
            total_reports: Total number of reports submitted
            false_reports: Number of false alarm reports
            
        Returns:
            float: Trust score between TRUST_MIN and TRUST_MAX
        """
        if total_reports == 0:
            return TRUST_INITIAL
        
        # Base trust from verification ratio
        verification_ratio = verified_reports / total_reports
        base_trust = verification_ratio
        
        # Penalty for false reports
        false_penalty = false_reports * 0.1
        
        # Calculate final trust
        trust = base_trust - false_penalty
        
        # Clamp between min and max
        trust = max(TRUST_MIN, min(TRUST_MAX, trust))
        
        return round(trust, 3)
    
    @staticmethod
    def update_trust_positive(current_trust: float, severity: float) -> float:
        """
        Update trust score positively after verified report
        
        Args:
            current_trust: Current trust score
            severity: Severity of the verified report (0-1)
            
        Returns:
            float: Updated trust score
        """
        # Higher severity reports give more trust boost
        increment = TRUST_POSITIVE_INCREMENT * severity
        new_trust = current_trust + increment
        
        # Cap at maximum
        new_trust = min(TRUST_MAX, new_trust)
        
        return round(new_trust, 3)
    
    @staticmethod
    def update_trust_negative(current_trust: float) -> float:
        """
        Update trust score negatively after false report
        
        Args:
            current_trust: Current trust score
            
        Returns:
            float: Updated trust score
        """
        new_trust = current_trust - TRUST_NEGATIVE_DECREMENT
        
        # Floor at minimum
        new_trust = max(TRUST_MIN, new_trust)
        
        return round(new_trust, 3)
    
    @staticmethod
    def apply_time_decay(current_trust: float, last_report_date: datetime) -> float:
        """
        Apply time-based trust decay
        Trust decays over time to prevent abuse and encourage active participation
        
        Args:
            current_trust: Current trust score
            last_report_date: Date of last report
            
        Returns:
            float: Trust score after decay
        """
        if not last_report_date:
            return current_trust
        
        # Calculate months since last report
        now = datetime.utcnow()
        months_inactive = (now - last_report_date).days / 30.0
        
        # Apply decay
        decay = TRUST_DECAY_RATE * months_inactive
        new_trust = current_trust - decay
        
        # Floor at minimum
        new_trust = max(TRUST_MIN, new_trust)
        
        return round(new_trust, 3)
    
    @staticmethod
    def get_trust_level(trust_score: float) -> str:
        """
        Get human-readable trust level
        
        Args:
            trust_score: Trust score (0-1)
            
        Returns:
            str: Trust level description
        """
        if trust_score >= 0.8:
            return "HIGHLY_TRUSTED"
        elif trust_score >= 0.6:
            return "TRUSTED"
        elif trust_score >= 0.4:
            return "MODERATE"
        elif trust_score >= 0.2:
            return "LOW"
        else:
            return "UNTRUSTED"


# Example usage and testing
if __name__ == '__main__':
    manager = ReputationManager()
    
    print("Reputation Manager Test Cases:")
    print("-" * 60)
    
    # Test Case 1: New user
    print("Case 1: New User")
    initial = manager.get_initial_trust()
    print(f"Initial Trust: {initial}")
    print(f"Trust Level: {manager.get_trust_level(initial)}")
    print()
    
    # Test Case 2: Experienced, reliable user
    print("Case 2: Experienced User (17/20 verified)")
    trust = manager.calculate_trust(verified_reports=17, total_reports=20, false_reports=1)
    print(f"Trust Score: {trust}")
    print(f"Trust Level: {manager.get_trust_level(trust)}")
    print()
    
    # Test Case 3: Unreliable user
    print("Case 3: Unreliable User (2/10 verified, 5 false)")
    trust = manager.calculate_trust(verified_reports=2, total_reports=10, false_reports=5)
    print(f"Trust Score: {trust}")
    print(f"Trust Level: {manager.get_trust_level(trust)}")
    print()
    
    # Test Case 4: Trust update after verified high-severity report
    print("Case 4: Trust Update (verified high-severity report)")
    current = 0.7
    updated = manager.update_trust_positive(current, severity=0.9)
    print(f"Before: {current} -> After: {updated}")
    print()
    
    # Test Case 5: Trust decay
    print("Case 5: Trust Decay (3 months inactive)")
    current = 0.8
    last_report = datetime.utcnow() - timedelta(days=90)
    decayed = manager.apply_time_decay(current, last_report)
    print(f"Before: {current} -> After: {decayed}")
    print("-" * 60)
