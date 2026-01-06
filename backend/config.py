"""
Configuration settings for TWSM (Trust-Weighted Severity Model)
"""

# Priority thresholds for action classification
PRIORITY_THRESHOLD_DISPATCH = 0.6  # Above this: Instant dispatch to authorities
PRIORITY_THRESHOLD_VALIDATE = 0.3  # Above this: Community validation needed
# Below 0.3: Hold for verification

# Trust score parameters
TRUST_MIN = 0.1  # Minimum trust score (even for new users)
TRUST_MAX = 1.0  # Maximum trust score
TRUST_INITIAL = 0.5  # Initial trust for new users
TRUST_POSITIVE_INCREMENT = 0.05  # Trust increase for verified reports
TRUST_NEGATIVE_DECREMENT = 0.1  # Trust decrease for false reports
TRUST_DECAY_RATE = 0.01  # Monthly trust decay rate

# Evidence strength scores
EVIDENCE_SCORES = {
    'camera': 1.0,      # Live camera feed with geolocation
    'image_geo': 0.8,   # Image with metadata/geolocation
    'image': 0.6,       # Image without metadata
    'text': 0.4         # Text only
}

# Context risk multipliers
CONTEXT_RISK_MIN = 0.5
CONTEXT_RISK_MAX = 1.5
CONTEXT_RISK_DEFAULT = 1.0

# Population density risk factors
POPULATION_DENSITY_HIGH = 1.2  # High density areas (>10000/km²)
POPULATION_DENSITY_MEDIUM = 1.0  # Medium density
POPULATION_DENSITY_LOW = 0.8  # Low density areas

# Time of day risk factors
TIME_RISK_NIGHT = 1.2  # 10 PM - 6 AM
TIME_RISK_DAY = 1.0    # 6 AM - 10 PM

# Weather risk factors
WEATHER_RISK_SEVERE = 1.3  # Severe weather alerts
WEATHER_RISK_MODERATE = 1.1  # Moderate weather
WEATHER_RISK_NORMAL = 1.0  # Normal weather

# Multi-report aggregation
AGGREGATION_BOOST_FACTOR = 0.1  # Boost per additional report
AGGREGATION_LOCATION_RADIUS = 0.5  # km - reports within this radius are considered same incident

# Severity keywords and weights
SEVERITY_KEYWORDS = {
    'critical': {
        'keywords': ['fire', 'explosion', 'shooting', 'terrorist', 'bomb', 'collapse', 'death', 'dying'],
        'score': 0.9
    },
    'high': {
        'keywords': ['flood', 'earthquake', 'accident', 'injured', 'smoke', 'panic', 'emergency'],
        'score': 0.7
    },
    'medium': {
        'keywords': ['damage', 'broken', 'stuck', 'lost', 'help', 'urgent'],
        'score': 0.5
    },
    'low': {
        'keywords': ['minor', 'small', 'issue', 'concern'],
        'score': 0.3
    }
}

# Database configuration
SQLALCHEMY_DATABASE_URI = 'sqlite:///twsm.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask configuration
SECRET_KEY = 'dev-secret-key-change-in-production'
DEBUG = True
PORT = 5000
