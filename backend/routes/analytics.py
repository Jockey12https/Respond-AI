"""
Analytics API routes
"""
from flask import Blueprint, jsonify
from sqlalchemy import func
from models.database import db, Report, User, Validation

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get system-wide statistics"""
    try:
        # Report statistics
        total_reports = Report.query.count()
        dispatch_count = Report.query.filter_by(action='DISPATCH').count()
        validate_count = Report.query.filter_by(action='VALIDATE').count()
        hold_count = Report.query.filter_by(action='HOLD').count()
        
        # Status statistics
        pending_count = Report.query.filter_by(status='PENDING').count()
        validated_count = Report.query.filter_by(status='VALIDATED').count()
        false_alarm_count = Report.query.filter_by(status='FALSE_ALARM').count()
        
        # Average priority
        avg_priority = db.session.query(func.avg(Report.final_priority)).scalar() or 0
        
        # User statistics
        total_users = User.query.count()
        avg_trust = db.session.query(func.avg(User.trust_score)).scalar() or 0
        
        # Validation statistics
        total_validations = Validation.query.count()
        positive_validations = Validation.query.filter_by(is_valid=True).count()
        
        return jsonify({
            'success': True,
            'reports': {
                'total': total_reports,
                'by_action': {
                    'dispatch': dispatch_count,
                    'validate': validate_count,
                    'hold': hold_count
                },
                'by_status': {
                    'pending': pending_count,
                    'validated': validated_count,
                    'false_alarm': false_alarm_count
                },
                'average_priority': round(avg_priority, 3)
            },
            'users': {
                'total': total_users,
                'average_trust': round(avg_trust, 3)
            },
            'validations': {
                'total': total_validations,
                'positive': positive_validations,
                'negative': total_validations - positive_validations,
                'positive_ratio': round(positive_validations / max(total_validations, 1), 3)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/model-performance', methods=['GET'])
def get_model_performance():
    """Get TWSM model performance metrics"""
    try:
        # Get validated reports to measure accuracy
        validated_reports = Report.query.filter(
            Report.status.in_(['VALIDATED', 'FALSE_ALARM'])
        ).all()
        
        if not validated_reports:
            return jsonify({
                'success': True,
                'message': 'Not enough validated reports for performance analysis',
                'metrics': None
            }), 200
        
        # Calculate accuracy metrics
        true_positives = 0  # High priority correctly validated
        false_positives = 0  # High priority but false alarm
        true_negatives = 0  # Low priority correctly identified
        false_negatives = 0  # Low priority but was actually valid
        
        for report in validated_reports:
            is_high_priority = report.action == 'DISPATCH'
            is_valid = report.status == 'VALIDATED'
            
            if is_high_priority and is_valid:
                true_positives += 1
            elif is_high_priority and not is_valid:
                false_positives += 1
            elif not is_high_priority and not is_valid:
                true_negatives += 1
            elif not is_high_priority and is_valid:
                false_negatives += 1
        
        total = len(validated_reports)
        accuracy = (true_positives + true_negatives) / total if total > 0 else 0
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        return jsonify({
            'success': True,
            'metrics': {
                'total_validated_reports': total,
                'accuracy': round(accuracy, 3),
                'precision': round(precision, 3),
                'recall': round(recall, 3),
                'f1_score': round(f1_score, 3),
                'confusion_matrix': {
                    'true_positives': true_positives,
                    'false_positives': false_positives,
                    'true_negatives': true_negatives,
                    'false_negatives': false_negatives
                }
            },
            'interpretation': {
                'accuracy': 'Percentage of correct classifications',
                'precision': 'Of reports marked as high-priority, how many were actually valid',
                'recall': 'Of all valid emergencies, how many were correctly identified',
                'f1_score': 'Harmonic mean of precision and recall'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/emergency-types', methods=['GET'])
def get_emergency_types():
    """Get distribution of emergency types"""
    try:
        from models.severity import SeverityCalculator
        
        reports = Report.query.all()
        
        type_counts = {}
        for report in reports:
            emergency_type = SeverityCalculator.classify_emergency_type(report.description)
            type_counts[emergency_type] = type_counts.get(emergency_type, 0) + 1
        
        return jsonify({
            'success': True,
            'total_reports': len(reports),
            'distribution': type_counts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/severity-preview', methods=['POST'])
def calculate_severity_preview():
    """Calculate severity preview for real-time frontend analysis"""
    try:
        from flask import request
        from models.severity import SeverityCalculator, get_crisis_level
        
        data = request.get_json()
        description = data.get('description', '')
        
        if not description or len(description.strip()) < 5:
            return jsonify({
                'error': 'Description too short for analysis'
            }), 400
        
        # Calculate severity
        severity_score = SeverityCalculator.calculate(description)
        emergency_type = SeverityCalculator.classify_emergency_type(description)
        crisis_level = get_crisis_level(severity_score)
        
        # Find keywords that were detected
        from config import SEVERITY_KEYWORDS
        description_lower = description.lower()
        keywords_found = []
        
        for level, data in SEVERITY_KEYWORDS.items():
            for keyword in data['keywords']:
                if keyword in description_lower and keyword not in keywords_found:
                    keywords_found.append(keyword)
        
        return jsonify({
            'severity_score': severity_score,
            'emergency_type': emergency_type,
            'crisis_level': crisis_level,
            'keywords_found': keywords_found[:5],  # Limit to 5 keywords
            'confidence': 0.85  # Static confidence for now
        }), 200
        
    except Exception as e:
        print(f"Error in severity preview: {str(e)}")
        return jsonify({'error': str(e)}), 500
