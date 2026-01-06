"""
User management API routes
"""
from flask import Blueprint, request, jsonify
from models.database import db, User, Report
from models.reputation import ReputationManager

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


@user_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user profile"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<user_id>/trust', methods=['GET'])
def get_trust_details(user_id):
    """Get detailed trust score information"""
    try:
        # User.id is the primary key (Firebase UID)
        user = User.query.get(user_id)
        
        if not user:
            # Return default trust score for new users
            return jsonify({
                'success': True,
                'trust': {
                    'user_id': user_id,
                    'trust_score': 0.5,
                    'total_reports': 0,
                    'verified_reports': 0,
                    'false_reports': 0,
                    'verification_ratio': 0.0,
                    'last_report_date': None,
                    'trust_trend': 'stable'
                }
            }), 200
        
        # Calculate verification ratio
        verification_ratio = user.verified_reports / max(user.total_reports, 1)
        
        # Determine trust trend
        trust_trend = 'stable'
        if user.trust_score >= 0.7:
            trust_trend = 'improving'
        elif user.trust_score < 0.4:
            trust_trend = 'declining'
        
        return jsonify({
            'success': True,
            'trust': {
                'user_id': user.id,
                'trust_score': round(user.trust_score, 3),
                'total_reports': user.total_reports,
                'verified_reports': user.verified_reports,
                'false_reports': user.false_reports,
                'verification_ratio': round(verification_ratio, 3),
                'last_report_date': user.last_report_at.isoformat() if user.last_report_at else None,
                'trust_trend': trust_trend
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching trust score: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<user_id>/reports', methods=['GET'])
def get_user_reports(user_id):
    """Get all reports submitted by a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        limit = request.args.get('limit', 20, type=int)
        
        reports = Report.query.filter_by(user_id=user_id)\
            .order_by(Report.created_at.desc())\
            .limit(limit)\
            .all()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'count': len(reports),
            'reports': [r.to_dict() for r in reports]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/create', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        
        if 'user_id' not in data:
            return jsonify({'error': 'Missing required field: user_id'}), 400
        
        # Check if user already exists
        existing = User.query.get(data['user_id'])
        if existing:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create user
        user = User(
            id=data['user_id'],
            name=data.get('name', f"User {data['user_id']}"),
            trust_score=ReputationManager.get_initial_trust()
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
