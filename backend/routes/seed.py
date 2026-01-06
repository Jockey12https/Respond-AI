"""
Seed data endpoint - Creates mock user reports for demonstration
"""
from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import random
from models.database import db, User, Report
from models.twsm import TWSMCalculator
from models.reputation import ReputationManager

seed_bp = Blueprint('seed', __name__, url_prefix='/api/seed')
twsm = TWSMCalculator()


# Mock user data with varying trust levels
MOCK_USERS = [
    {"id": "user_trusted_1", "name": "Rajesh Kumar", "trust": 0.85, "verified": 17, "total": 20},
    {"id": "user_trusted_2", "name": "Priya Sharma", "trust": 0.80, "verified": 16, "total": 20},
    {"id": "user_medium_1", "name": "Amit Patel", "trust": 0.55, "verified": 11, "total": 20},
    {"id": "user_medium_2", "name": "Sneha Reddy", "trust": 0.50, "verified": 10, "total": 20},
    {"id": "user_new_1", "name": "Vikram Singh", "trust": 0.30, "verified": 3, "total": 10},
    {"id": "user_new_2", "name": "Ananya Das", "trust": 0.25, "verified": 2, "total": 8},
    {"id": "user_low_1", "name": "Rohit Verma", "trust": 0.15, "verified": 1, "total": 7},
]

# Mock crisis reports in Kerala
MOCK_REPORTS = [
    {
        "location": "Thiruvananthapuram",
        "lat": 8.5241,
        "lng": 76.9366,
        "description": "Fire and smoke visible, building on fire with people trapped!",
        "evidence_type": "camera",
        "has_metadata": True,
        "population_density": "high",
        "weather": "normal"
    },
    {
        "location": "Kochi",
        "lat": 9.9312,
        "lng": 76.2673,
        "description": "Severe flooding in residential area, water level rising rapidly",
        "evidence_type": "image_geo",
        "has_metadata": True,
        "population_density": "high",
        "weather": "severe"
    },
    {
        "location": "Kozhikode",
        "lat": 11.2588,
        "lng": 75.7804,
        "description": "Landslide reported, road blocked, several houses damaged",
        "evidence_type": "image",
        "has_metadata": True,
        "population_density": "medium",
        "weather": "moderate"
    },
    {
        "location": "Thrissur",
        "lat": 10.5276,
        "lng": 76.2144,
        "description": "Accident on highway, multiple vehicles involved, injuries reported",
        "evidence_type": "image",
        "has_metadata": False,
        "population_density": "medium",
        "weather": "normal"
    },
    {
        "location": "Kannur",
        "lat": 11.8745,
        "lng": 75.3704,
        "description": "Minor fire incident in market area, smoke visible",
        "evidence_type": "text",
        "has_metadata": False,
        "population_density": "medium",
        "weather": "normal"
    },
    {
        "location": "Kollam",
        "lat": 8.8932,
        "lng": 76.6141,
        "description": "Possible gas leak reported in industrial area",
        "evidence_type": "text",
        "has_metadata": False,
        "population_density": "low",
        "weather": "normal"
    },
    {
        "location": "Alappuzha",
        "lat": 9.4981,
        "lng": 76.3388,
        "description": "Heavy rain causing waterlogging, some areas flooded",
        "evidence_type": "image",
        "has_metadata": True,
        "population_density": "medium",
        "weather": "severe"
    },
]


@seed_bp.route('/mock-reports', methods=['POST'])
def create_mock_reports():
    """Create mock user reports with TWSM classification"""
    try:
        # Clear existing data
        Report.query.delete()
        User.query.delete()
        db.session.commit()
        
        # Create mock users
        created_users = []
        for user_data in MOCK_USERS:
            user = User(
                id=user_data['id'],
                name=user_data['name'],
                trust_score=user_data['trust'],
                total_reports=user_data['total'],
                verified_reports=user_data['verified']
            )
            db.session.add(user)
            created_users.append(user)
        
        db.session.flush()
        
        # Create mock reports with TWSM classification
        created_reports = []
        for report_data in MOCK_REPORTS:
            # Randomly assign a user to each report
            user = random.choice(created_users)
            
            # Calculate priority using TWSM
            priority_result = twsm.calculate_priority(
                description=report_data['description'],
                user_trust_score=user.trust_score,
                evidence_type=report_data['evidence_type'],
                has_metadata=report_data.get('has_metadata', False),
                has_geolocation=True,
                latitude=report_data['lat'],
                longitude=report_data['lng'],
                population_density=report_data.get('population_density', 'medium'),
                weather_condition=report_data.get('weather', 'normal')
            )
            
            # Create report
            report = Report(
                user_id=user.id,
                description=report_data['description'],
                latitude=report_data['lat'],
                longitude=report_data['lng'],
                evidence_type=report_data['evidence_type'],
                has_metadata=report_data.get('has_metadata', False),
                severity_score=priority_result['breakdown']['severity']['score'],
                trust_score=priority_result['breakdown']['trust']['score'],
                evidence_score=priority_result['breakdown']['evidence']['score'],
                context_risk=priority_result['breakdown']['context']['risk_multiplier'],
                final_priority=priority_result['final_priority'],
                action=priority_result['action'],
                status='PENDING'
            )
            
            db.session.add(report)
            created_reports.append({
                'location': report_data['location'],
                'user': user.name,
                'priority': priority_result['final_priority'],
                'action': priority_result['action'],
                'breakdown': priority_result['breakdown']
            })
        
        # Update user stats
        for user in created_users:
            user.last_report_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Created {len(created_reports)} mock reports from {len(created_users)} users',
            'users_created': len(created_users),
            'reports_created': len(created_reports),
            'reports': created_reports
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@seed_bp.route('/status', methods=['GET'])
def get_seed_status():
    """Check if mock data exists"""
    try:
        user_count = User.query.count()
        report_count = Report.query.count()
        
        return jsonify({
            'success': True,
            'has_data': user_count > 0 and report_count > 0,
            'users': user_count,
            'reports': report_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
