"""
Database models for TWSM system
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    """User model with trust/reputation tracking"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(200))
    trust_score = db.Column(db.Float, default=0.5)  # Initial trust: 0.5
    total_reports = db.Column(db.Integer, default=0)
    verified_reports = db.Column(db.Integer, default=0)
    false_reports = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_report_at = db.Column(db.DateTime)
    
    # Relationships
    reports = db.relationship('Report', backref='reporter', lazy=True)
    validations = db.relationship('Validation', backref='validator', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'trust_score': round(self.trust_score, 3),
            'total_reports': self.total_reports,
            'verified_reports': self.verified_reports,
            'false_reports': self.false_reports,
            'verification_ratio': round(self.verified_reports / max(self.total_reports, 1), 3),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_report_at': self.last_report_at.isoformat() if self.last_report_at else None
        }


class Report(db.Model):
    """Emergency report model"""
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Location data
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Evidence data
    evidence_type = db.Column(db.String(50))  # camera, image_geo, image, text
    has_metadata = db.Column(db.Boolean, default=False)
    media_url = db.Column(db.String(500))
    
    # Scoring components
    severity_score = db.Column(db.Float)
    trust_score = db.Column(db.Float)
    evidence_score = db.Column(db.Float)
    context_risk = db.Column(db.Float)
    final_priority = db.Column(db.Float)
    
    # Classification
    action = db.Column(db.String(50))  # HOLD, VALIDATE, DISPATCH
    status = db.Column(db.String(50), default='PENDING')  # PENDING, VALIDATED, DISPATCHED, FALSE_ALARM
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    validated_at = db.Column(db.DateTime)
    dispatched_at = db.Column(db.DateTime)
    
    # Relationships
    validations = db.relationship('Validation', backref='report', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'description': self.description,
            'location': {
                'lat': self.latitude,
                'lng': self.longitude
            } if self.latitude and self.longitude else None,
            'evidence': {
                'type': self.evidence_type,
                'has_metadata': self.has_metadata,
                'media_url': self.media_url
            },
            'scores': {
                'severity': round(self.severity_score, 3) if self.severity_score else None,
                'trust': round(self.trust_score, 3) if self.trust_score else None,
                'evidence': round(self.evidence_score, 3) if self.evidence_score else None,
                'context_risk': round(self.context_risk, 3) if self.context_risk else None,
                'final_priority': round(self.final_priority, 3) if self.final_priority else None
            },
            'action': self.action,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'validated_at': self.validated_at.isoformat() if self.validated_at else None,
            'dispatched_at': self.dispatched_at.isoformat() if self.dispatched_at else None,
            'validation_count': len(self.validations)
        }


class Validation(db.Model):
    """Community validation of reports"""
    __tablename__ = 'validations'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    is_valid = db.Column(db.Boolean, nullable=False)  # True = confirms, False = disputes
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'user_id': self.user_id,
            'is_valid': self.is_valid,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Action(db.Model):
    """Authority actions taken on reports"""
    __tablename__ = 'actions'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    authority_type = db.Column(db.String(100))  # POLICE, FIRE, MEDICAL, etc.
    action_taken = db.Column(db.Text)
    outcome = db.Column(db.String(50))  # RESOLVED, FALSE_ALARM, ONGOING
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'authority_type': self.authority_type,
            'action_taken': self.action_taken,
            'outcome': self.outcome,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
