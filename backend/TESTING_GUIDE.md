# Testing Severity Score Model with Firebase Data

## Prerequisites

1. ✅ Backend server running on `http://localhost:5000`
2. ✅ Firebase credentials configured
3. ✅ Firestore collections: `incidents`, `moderators`, `crises`

---

## Step-by-Step Testing Guide

### **Step 1: Verify Firebase Connection**

Check if Firebase is initialized:

```bash
cd backend
python -c "from models.firebase_integration import FirebaseIntegration; FirebaseIntegration.initialize(); print('Firebase connected!' if FirebaseIntegration.get_db() else 'Firebase not connected')"
```

---

### **Step 2: Check Your Incidents Data**

View incidents in your Firestore:

```bash
python -c "from models.firebase_integration import FirebaseIntegration; FirebaseIntegration.initialize(); incidents = FirebaseIntegration.fetch_incidents(limit=5); print(f'Found {len(incidents)} incidents'); [print(f\"- {i.get('description', 'No description')[:50]}... (Zone: {i.get('zone')})\") for i in incidents]"
```

This will show you the first 5 incidents from Firebase.

---

### **Step 3: Test Severity Calculation (No Database Update)**

Test the ML model without updating Firebase:

```bash
python test_firebase_sync.py --test-only
```

Or manually:

```bash
curl -X POST http://localhost:5000/api/firebase/test-severity \
  -H "Content-Type: application/json" \
  -d '{"description": "YOUR_INCIDENT_DESCRIPTION_HERE"}'
```

---

### **Step 4: Sync Severity Scores to Firebase**

**Option A: Sync All Incidents**
```bash
curl -X POST http://localhost:5000/api/firebase/sync-severity
```

**Option B: Sync Specific Zone**
```bash
curl -X POST "http://localhost:5000/api/firebase/sync-severity?zone=South%20Kerala%20Zone"
```

**Option C: Use Python Script**
```bash
python test_firebase_sync.py --sync-all
```

---

### **Step 5: Verify Updates in Firebase**

Check the updated crisis levels:

```bash
curl http://localhost:5000/api/firebase/severity-stats
```

Or check directly in Firebase Console:
1. Go to Firebase Console → Firestore Database
2. Navigate to `crises` collection
3. Check that `crisisLevel` and `severityScore` fields are updated

---

### **Step 6: View Statistics**

Get overall statistics:

```bash
python -c "import requests; import json; r = requests.get('http://localhost:5000/api/firebase/severity-stats'); print(json.dumps(r.json(), indent=2))"
```

---

## Quick Test Script

Run the automated test:

```bash
cd backend
python test_firebase_sync.py
```

This will:
1. ✅ Check Firebase connection
2. ✅ Fetch sample incidents
3. ✅ Calculate severity scores
4. ✅ Show what would be updated (without actually updating)
5. ✅ Display statistics

---

## Expected Output

After syncing, you should see:

```json
{
  "success": true,
  "processed": 15,
  "total_incidents": 20,
  "updated_zones": [
    "South Kerala Zone",
    "Central Kerala Zone",
    "North Kerala Zone"
  ]
}
```

---

## Troubleshooting

**Issue: "Firebase not initialized"**
- Check that `FIREBASE_CREDENTIALS_PATH` is set in `.env`
- Verify the credentials file exists

**Issue: "No incidents found"**
- Verify incidents exist in Firestore
- Check that incidents have `description` and `zone` fields

**Issue: "No crisis found for zone"**
- Ensure crises collection has documents with matching zone names
- Create crisis documents if they don't exist

---

## Next Steps

After testing:
1. Integrate into your frontend to call these endpoints
2. Set up automatic syncing (e.g., on incident creation)
3. Monitor severity statistics dashboard
