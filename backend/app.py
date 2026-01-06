"""
RESPOND.AI - Flask Backend with Trust-Weighted Severity Model (TWSM)
Main application file
"""
from flask import Flask, jsonify
from flask_cors import CORS
from models.database import db
import config

# Import blueprints
from routes.emergency import emergency_bp
from routes.user import user_bp
from routes.analytics import analytics_bp
from routes.seed import seed_bp
from routes.firebase_sync import firebase_sync_bp
from routes.forward import forward_bp


def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SECRET_KEY'] = config.SECRET_KEY
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(emergency_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(seed_bp)
    app.register_blueprint(firebase_sync_bp)
    app.register_blueprint(forward_bp)
    
    # Initialize Firebase
    from models.firebase_integration import FirebaseIntegration
    with app.app_context():
        FirebaseIntegration.initialize()
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'name': 'RESPOND.AI Backend',
            'version': '1.0.0',
            'model': 'Trust-Weighted Severity Model (TWSM)',
            'description': 'Emergency reporting system with intelligent priority calculation',
            'endpoints': {
                'emergency': '/api/emergency/*',
                'user': '/api/user/*',
                'analytics': '/api/analytics/*',
                'firebase': '/api/firebase/*'
            },
            'documentation': {
                'submit_report': 'POST /api/emergency/report',
                'get_reports': 'GET /api/emergency/reports',
                'validate_report': 'POST /api/emergency/validate/<id>',
                'get_user': 'GET /api/user/<id>',
                'get_stats': 'GET /api/analytics/stats',
                'sync_severity': 'POST /api/firebase/sync-severity',
                'test_severity': 'POST /api/firebase/test-severity'
            }
        })
    
    # Health check
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'model': 'TWSM'}), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    print("=" * 70)
    print("RESPOND.AI Backend - Trust-Weighted Severity Model (TWSM)")
    print("=" * 70)
    print(f"Server starting on http://localhost:{config.PORT}")
    print(f"Debug mode: {config.DEBUG}")
    print("=" * 70)
    app.run(host='0.0.0.0', port=config.PORT, debug=config.DEBUG)
