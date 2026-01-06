"""
Evidence Strength Calculator
Evaluates the quality and reliability of evidence provided with reports
"""
from config import EVIDENCE_SCORES


class EvidenceAnalyzer:
    """Analyze evidence strength for emergency reports"""
    
    @staticmethod
    def calculate_evidence_score(evidence_type: str, has_metadata: bool = False, 
                                 has_geolocation: bool = False) -> float:
        """
        Calculate evidence strength score
        
        Args:
            evidence_type: Type of evidence (camera, image, text, etc.)
            has_metadata: Whether evidence includes metadata
            has_geolocation: Whether evidence includes geolocation
            
        Returns:
            float: Evidence score between 0 and 1
        """
        # Get base score from evidence type
        base_score = EVIDENCE_SCORES.get(evidence_type, 0.4)
        
        # Adjust based on metadata and geolocation
        if evidence_type == 'camera':
            # Live camera feed is already highest quality
            return 1.0
        
        elif evidence_type in ['image', 'image_geo']:
            if has_geolocation and has_metadata:
                return 0.8  # Image with full metadata
            elif has_geolocation:
                return 0.7  # Image with geolocation only
            elif has_metadata:
                return 0.6  # Image with metadata only
            else:
                return 0.5  # Plain image
        
        elif evidence_type == 'text':
            # Text-only reports have lower evidence strength
            return 0.4
        
        else:
            # Unknown evidence type
            return 0.3
    
    @staticmethod
    def classify_evidence_quality(evidence_score: float) -> str:
        """
        Classify evidence quality level
        
        Args:
            evidence_score: Evidence score (0-1)
            
        Returns:
            str: Quality classification
        """
        if evidence_score >= 0.8:
            return "STRONG"
        elif evidence_score >= 0.6:
            return "MODERATE"
        elif evidence_score >= 0.4:
            return "WEAK"
        else:
            return "VERY_WEAK"
    
    @staticmethod
    def get_evidence_requirements(priority_level: str) -> dict:
        """
        Get evidence requirements for different priority levels
        
        Args:
            priority_level: DISPATCH, VALIDATE, or HOLD
            
        Returns:
            dict: Evidence requirements
        """
        requirements = {
            'DISPATCH': {
                'min_evidence_score': 0.6,
                'recommended': 'Image with geolocation or live camera feed',
                'description': 'High-priority reports require strong evidence'
            },
            'VALIDATE': {
                'min_evidence_score': 0.4,
                'recommended': 'Image or detailed text description',
                'description': 'Medium-priority reports need moderate evidence'
            },
            'HOLD': {
                'min_evidence_score': 0.0,
                'recommended': 'Any evidence type accepted',
                'description': 'Low-priority reports will be verified before escalation'
            }
        }
        
        return requirements.get(priority_level, requirements['HOLD'])
    
    @staticmethod
    def validate_evidence_data(evidence_data: dict) -> tuple[bool, str]:
        """
        Validate evidence data structure
        
        Args:
            evidence_data: Dictionary containing evidence information
            
        Returns:
            tuple: (is_valid, error_message)
        """
        required_fields = ['type']
        
        # Check required fields
        for field in required_fields:
            if field not in evidence_data:
                return False, f"Missing required field: {field}"
        
        # Validate evidence type
        valid_types = ['camera', 'image', 'image_geo', 'text']
        if evidence_data['type'] not in valid_types:
            return False, f"Invalid evidence type. Must be one of: {', '.join(valid_types)}"
        
        # Validate camera evidence
        if evidence_data['type'] == 'camera':
            if 'stream_url' not in evidence_data and 'media_url' not in evidence_data:
                return False, "Camera evidence requires stream_url or media_url"
        
        # Validate geolocation if present
        if evidence_data.get('has_geolocation'):
            if 'latitude' not in evidence_data or 'longitude' not in evidence_data:
                return False, "Geolocation flag set but coordinates missing"
        
        return True, ""


# Example usage and testing
if __name__ == '__main__':
    analyzer = EvidenceAnalyzer()
    
    print("Evidence Analyzer Test Cases:")
    print("-" * 60)
    
    # Test Case 1: Live camera with geo
    print("Case 1: Live Camera Feed")
    score = analyzer.calculate_evidence_score('camera', has_geolocation=True)
    quality = analyzer.classify_evidence_quality(score)
    print(f"Evidence Score: {score} | Quality: {quality}")
    print()
    
    # Test Case 2: Image with metadata and geo
    print("Case 2: Image with Metadata + Geolocation")
    score = analyzer.calculate_evidence_score('image', has_metadata=True, has_geolocation=True)
    quality = analyzer.classify_evidence_quality(score)
    print(f"Evidence Score: {score} | Quality: {quality}")
    print()
    
    # Test Case 3: Plain image
    print("Case 3: Plain Image (no metadata)")
    score = analyzer.calculate_evidence_score('image', has_metadata=False, has_geolocation=False)
    quality = analyzer.classify_evidence_quality(score)
    print(f"Evidence Score: {score} | Quality: {quality}")
    print()
    
    # Test Case 4: Text only
    print("Case 4: Text Only")
    score = analyzer.calculate_evidence_score('text')
    quality = analyzer.classify_evidence_quality(score)
    print(f"Evidence Score: {score} | Quality: {quality}")
    print()
    
    # Test Case 5: Evidence validation
    print("Case 5: Evidence Validation")
    test_evidence = {
        'type': 'camera',
        'media_url': 'https://example.com/stream',
        'has_geolocation': True,
        'latitude': 8.524,
        'longitude': 76.936
    }
    is_valid, error = analyzer.validate_evidence_data(test_evidence)
    print(f"Valid: {is_valid} | Error: {error if error else 'None'}")
    print("-" * 60)
