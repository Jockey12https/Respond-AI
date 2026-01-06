# Severity Score Model - Quick Reference

## API Endpoints

### Test Severity (No Database Update)
```bash
POST http://localhost:5000/api/firebase/test-severity
Content-Type: application/json

{
  "description": "Your incident description here"
}
```

### Sync All Incidents
```bash
POST http://localhost:5000/api/firebase/sync-severity
```

### Sync Specific Zone
```bash
POST http://localhost:5000/api/firebase/sync-severity?zone=South%20Kerala%20Zone
```

### Get Statistics
```bash
GET http://localhost:5000/api/firebase/severity-stats
```

## Crisis Level Mapping

| Severity Score | Crisis Level |
|----------------|--------------|
| 0.8 - 1.0      | critical     |
| 0.6 - 0.79     | high         |
| 0.4 - 0.59     | medium       |
| 0.0 - 0.39     | low          |

## Data Flow

```
Incident (Firestore)
  ├─ description: "Fire emergency..."
  └─ zone: "South Kerala Zone"
       ↓
Backend ML Model
  ├─ Calculates severity score: 0.9
  └─ Maps to crisis level: "critical"
       ↓
Crisis (Firestore)
  ├─ zone: "South Kerala Zone"
  ├─ crisisLevel: "critical"
  └─ severityScore: 0.9
```

## Files Created

- `backend/models/firebase_integration.py` - Firebase operations
- `backend/models/severity.py` - Enhanced with `get_crisis_level()`
- `backend/routes/firebase_sync.py` - API endpoints
- `backend/test_severity.py` - Test script

## Environment Setup

Add to `.env`:
```
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
```

## Testing

```bash
cd backend
python test_severity.py
```
