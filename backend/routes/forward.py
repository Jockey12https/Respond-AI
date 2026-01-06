"""
Endpoint to calculate severity when forwarding incidents to authorities
"""
from flask import Blueprint, jsonify, request
from models.severity import SeverityCalculator, get_crisis_level
from models.firebase_integration import FirebaseIntegration

forward_bp = Blueprint('forward', __name__, url_prefix='/api/forward')


@forward_bp.route('/incident-to-crisis', methods=['POST'])
def forward_incident_with_severity():
    """
    Calculate severity and update crisis when forwarding an incident
    
    Request Body:
        {
            "incidentId": "incident123",
            "description": "Incident description",
            "zone": "Trivandrum",
            "location": "City Center",
            "moderatorName": "John Doe"
        }
        
    Returns:
        JSON response with severity calculation and update status
    """
    try:
        data = request.get_json()
        
        incident_id = data.get('incidentId')
        description = data.get('description', '')
        zone = data.get('zone')
        location = data.get('location', 'Unknown')
        moderator_name = data.get('moderatorName', 'Unknown')
        
        if not description or not zone:
            return jsonify({
                'success': False,
                'error': 'Description and zone are required'
            }), 400
        
        # Calculate severity
        severity_calculator = SeverityCalculator()
        severity_score = severity_calculator.calculate(description)
        crisis_level = get_crisis_level(severity_score)
        emergency_type = severity_calculator.classify_emergency_type(description)
        
        # Print to console
        print(f"\n{'='*80}")
        print(f"📤 INCIDENT FORWARDED TO AUTHORITIES")
        print(f"{'='*80}")
        print(f"Incident ID: {incident_id}")
        print(f"Location: {location}")
        print(f"Zone: {zone}")
        print(f"Description: {description[:80]}...")
        print(f"Forwarded by: {moderator_name}")
        print(f"\n🤖 ML SEVERITY ANALYSIS:")
        print(f"  → Severity Score: {severity_score:.3f}")
        print(f"  → Crisis Level: {crisis_level.upper()}")
        print(f"  → Emergency Type: {emergency_type}")
        print(f"{'='*80}\n")
        
        # Update crisis level in Firebase
        success = FirebaseIntegration.update_crisis_level(
            zone=zone,
            crisis_level=crisis_level,
            severity_score=severity_score
        )
        
        if success:
            return jsonify({
                'success': True,
                'incidentId': incident_id,
                'zone': zone,
                'severity_score': severity_score,
                'crisis_level': crisis_level,
                'emergency_type': emergency_type,
                'message': f'Crisis level updated to {crisis_level.upper()}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update crisis level in Firebase',
                'severity_score': severity_score,
                'crisis_level': crisis_level
            }), 500
            
    except Exception as e:
        print(f"Error in forward_incident_with_severity: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
