"""
Severity Score Calculator (0-1)
Analyzes report content to determine emergency severity
"""
import re
from config import SEVERITY_KEYWORDS


class SeverityCalculator:
    """Calculate severity score based on report description"""
    
    @staticmethod
    def calculate(description: str) -> float:
        """
        Calculate severity score from report description
        
        Args:
            description: Report text description
            
        Returns:
            float: Severity score between 0 and 1
        """
        if not description:
            return 0.3  # Default low severity for empty description
        
        description_lower = description.lower()
        max_severity = 0.0
        
        # Check for critical keywords first
        for level, data in SEVERITY_KEYWORDS.items():
            keywords = data['keywords']
            score = data['score']
            
            for keyword in keywords:
                if keyword in description_lower:
                    max_severity = max(max_severity, score)
        
        # If no keywords matched, use text analysis
        if max_severity == 0.0:
            max_severity = SeverityCalculator._analyze_urgency(description_lower)
        
        # Boost score if multiple critical indicators present
        critical_count = sum(
            1 for keyword in SEVERITY_KEYWORDS['critical']['keywords']
            if keyword in description_lower
        )
        
        if critical_count >= 2:
            max_severity = min(1.0, max_severity + 0.1)
        
        return round(max_severity, 3)
    
    @staticmethod
    def _analyze_urgency(text: str) -> float:
        """
        Analyze urgency based on text patterns
        
        Args:
            text: Lowercase description text
            
        Returns:
            float: Urgency-based severity score
        """
        urgency_indicators = {
            'immediate': ['now', 'immediately', 'urgent', 'asap', 'hurry', 'quick'],
            'danger': ['danger', 'risk', 'threat', 'unsafe', 'hazard'],
            'people': ['people', 'person', 'child', 'children', 'crowd'],
            'multiple': ['many', 'multiple', 'several', 'lots']
        }
        
        score = 0.3  # Base score
        
        # Check for urgency indicators
        for category, keywords in urgency_indicators.items():
            if any(keyword in text for keyword in keywords):
                score += 0.1
        
        # Check for exclamation marks (indicates urgency)
        exclamation_count = text.count('!')
        if exclamation_count > 0:
            score += min(0.1, exclamation_count * 0.05)
        
        # Check for all caps words (indicates urgency/panic)
        caps_words = re.findall(r'\b[A-Z]{3,}\b', text)
        if caps_words:
            score += 0.1
        
        return min(1.0, score)
    
    @staticmethod
    def classify_emergency_type(description: str) -> str:
        """
        Classify the type of emergency
        
        Args:
            description: Report description
            
        Returns:
            str: Emergency type classification
        """
        description_lower = description.lower()
        
        emergency_types = {
            'FIRE': ['fire', 'smoke', 'burning', 'flames', 'explosion'],
            'MEDICAL': ['injured', 'hurt', 'accident', 'bleeding', 'unconscious', 'medical'],
            'NATURAL_DISASTER': ['flood', 'earthquake', 'landslide', 'storm', 'tsunami'],
            'CRIME': ['shooting', 'robbery', 'theft', 'assault', 'terrorist'],
            'INFRASTRUCTURE': ['collapse', 'damage', 'broken', 'gas leak', 'power outage'],
            'OTHER': []
        }
        
        for emergency_type, keywords in emergency_types.items():
            if any(keyword in description_lower for keyword in keywords):
                return emergency_type
        
        return 'OTHER'


# Example usage and testing
if __name__ == '__main__':
    calc = SeverityCalculator()
    
    test_cases = [
        "Fire and smoke, people panicking!",
        "Minor accident, no injuries",
        "URGENT! Building collapse with people trapped",
        "Small issue with traffic light",
        "Flood water rising rapidly, many homes affected"
    ]
    
    print("Severity Calculator Test Cases:")
    print("-" * 60)
    for case in test_cases:
        severity = calc.calculate(case)
        emergency_type = calc.classify_emergency_type(case)
        crisis_level = calc.get_crisis_level(severity)
        print(f"Description: {case}")
        print(f"Severity: {severity} | Type: {emergency_type} | Level: {crisis_level}")
        print("-" * 60)


def get_crisis_level(severity_score: float) -> str:
    """
    Convert severity score to crisis level category
    
    Args:
        severity_score: Severity score between 0 and 1
        
    Returns:
        str: Crisis level - 'critical', 'high', 'medium', or 'low'
    """
    if severity_score >= 0.8:
        return 'critical'
    elif severity_score >= 0.6:
        return 'high'
    elif severity_score >= 0.4:
        return 'medium'
    else:
        return 'low'

