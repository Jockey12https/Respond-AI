"""
Emergency reporting API routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from models.database import db, User, Report, Validation
from models.twsm import TWSMCalculator
from models.reputation import ReputationManager
from models.aggregation import ReportAggregator

emergency_bp = Blueprint('emergency', __name__, url_prefix='/api/emergency')
twsm = TWSMCalculator()
aggregator = ReportAggregator()


@emergency_bp.route('/report', methods=['POST'])
def submit_report():
    """Submit a new emergency report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'description', 'evidence_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get or create user
        user = User.query.get(data['user_id'])
        if not user:
            user = User(
                id=data['user_id'],
                name=data.get('name', f"User {data['user_id']}"),
                trust_score=ReputationManager.get_initial_trust()
            )
            db.session.add(user)
            db.session.flush()
        
        # Extract location data
        location = data.get('location', {})
        latitude = location.get('lat')
        longitude = location.get('lng')
        
        # Calculate priority using TWSM
        priority_result = twsm.calculate_priority(
            description=data['description'],
            user_trust_score=user.trust_score,
            evidence_type=data['evidence_type'],
            has_metadata=data.get('has_metadata', False),
            has_geolocation=bool(latitude and longitude),
            latitude=latitude,
            longitude=longitude,
            population_density=data.get('population_density', 'medium'),
            weather_condition=data.get('weather_condition', 'normal'),
            is_disaster_zone=data.get('is_disaster_zone', False)
        )
        
        # Create report
        report = Report(
            user_id=user.id,
            description=data['description'],
            latitude=latitude,
            longitude=longitude,
            evidence_type=data['evidence_type'],
            has_metadata=data.get('has_metadata', False),
            media_url=data.get('media_url'),
            severity_score=priority_result['breakdown']['severity']['score'],
            trust_score=priority_result['breakdown']['trust']['score'],
            evidence_score=priority_result['breakdown']['evidence']['score'],
            context_risk=priority_result['breakdown']['context']['risk_multiplier'],
            final_priority=priority_result['final_priority'],
            action=priority_result['action']
        )
        
        db.session.add(report)
        
        # Update user stats
        user.total_reports += 1
        user.last_report_at = datetime.utcnow()
        
        db.session.commit()
        
        # Check for similar reports and aggregate
        recent_reports = Report.query.filter(
            Report.created_at >= datetime.utcnow().replace(hour=datetime.utcnow().hour - 1)
        ).all()
        
        report_dicts = [r.to_dict() for r in recent_reports]
        clusters = aggregator.cluster_reports(report_dicts)
        
        # Find cluster containing this report
        current_cluster = None
        for cluster in clusters:
            if any(r['id'] == report.id for r in cluster):
                current_cluster = cluster
                break
        
        aggregated_info = None
        if current_cluster and len(current_cluster) > 1:
            aggregated_info = aggregator.aggregate_cluster(current_cluster)
        
        return jsonify({
            'success': True,
            'report': report.to_dict(),
            'priority_breakdown': priority_result,
            'action_details': twsm.get_action_description(priority_result['action']),
            'aggregation': aggregated_info
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@emergency_bp.route('/reports', methods=['GET'])
def get_reports():
    """Get all reports with optional filtering"""
    try:
        # Query parameters
        action = request.args.get('action')  # DISPATCH, VALIDATE, HOLD
        status = request.args.get('status')  # PENDING, VALIDATED, DISPATCHED, FALSE_ALARM
        limit = request.args.get('limit', 50, type=int)
        
        # Build query
        query = Report.query
        
        if action:
            query = query.filter(Report.action == action.upper())
        
        if status:
            query = query.filter(Report.status == status.upper())
        
        # Order by priority (highest first) and creation time (newest first)
        query = query.order_by(Report.final_priority.desc(), Report.created_at.desc())
        
        reports = query.limit(limit).all()
        
        return jsonify({
            'success': True,
            'count': len(reports),
            'reports': [r.to_dict() for r in reports]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emergency_bp.route('/report/<int:report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report by ID"""
    try:
        report = Report.query.get(report_id)
        
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        return jsonify({
            'success': True,
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emergency_bp.route('/validate/<int:report_id>', methods=['POST'])
def validate_report(report_id):
    """Community validation of a report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'user_id' not in data or 'is_valid' not in data:
            return jsonify({'error': 'Missing required fields: user_id, is_valid'}), 400
        
        # Check if report exists
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Check if user exists
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user already validated this report
        existing = Validation.query.filter_by(
            report_id=report_id,
            user_id=data['user_id']
        ).first()
        
        if existing:
            return jsonify({'error': 'User already validated this report'}), 400
        
        # Create validation
        validation = Validation(
            report_id=report_id,
            user_id=data['user_id'],
            is_valid=data['is_valid'],
            comment=data.get('comment')
        )
        
        db.session.add(validation)
        
        # Count validations
        total_validations = Validation.query.filter_by(report_id=report_id).count() + 1
        positive_validations = Validation.query.filter_by(
            report_id=report_id,
            is_valid=True
        ).count() + (1 if data['is_valid'] else 0)
        
        # If enough validations (e.g., 3+), update report status
        if total_validations >= 3:
            validation_ratio = positive_validations / total_validations
            
            if validation_ratio >= 0.66:  # 2/3 positive
                report.status = 'VALIDATED'
                report.validated_at = datetime.utcnow()
                
                # Update reporter's trust positively
                reporter = User.query.get(report.user_id)
                if reporter:
                    reporter.verified_reports += 1
                    reporter.trust_score = ReputationManager.update_trust_positive(
                        reporter.trust_score,
                        report.severity_score
                    )
            
            elif validation_ratio <= 0.33:  # 2/3 negative
                report.status = 'FALSE_ALARM'
                
                # Update reporter's trust negatively
                reporter = User.query.get(report.user_id)
                if reporter:
                    reporter.false_reports += 1
                    reporter.trust_score = ReputationManager.update_trust_negative(
                        reporter.trust_score
                    )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'validation': validation.to_dict(),
            'report_status': report.status,
            'validation_stats': {
                'total': total_validations,
                'positive': positive_validations,
                'negative': total_validations - positive_validations,
                'ratio': round(positive_validations / total_validations, 2)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@emergency_bp.route('/priority/<int:report_id>', methods=['GET'])
def get_priority_breakdown(report_id):
    """Get detailed priority score breakdown for a report"""
    try:
        report = Report.query.get(report_id)
        
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        breakdown = {
            'report_id': report.id,
            'final_priority': report.final_priority,
            'action': report.action,
            'breakdown': {
                'severity': report.severity_score,
                'trust': report.trust_score,
                'evidence': report.evidence_score,
                'context_risk': report.context_risk
            },
            'calculation': f"{report.severity_score} × {report.trust_score} × {report.evidence_score} × {report.context_risk} = {report.final_priority}",
            'action_details': twsm.get_action_description(report.action)
        }
        
        return jsonify({
            'success': True,
            'priority_breakdown': breakdown
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
