# Quick Fix: Using Firestore REST API

The Firebase Admin SDK requires **service account credentials** (a JSON key file), which is different from the client-side Firebase config you have.

## Two Options:

### **Option 1: Get Service Account Key (Recommended for Production)**

1. Go to [Firebase Console](https://console.firebase.google.com/project/respond-ai/settings/serviceaccounts/adminsdk)
2. Click "Generate New Private Key"
3. Save as `backend/firebase-service-account.json`
4. Add to `backend/.env`:
   ```
   FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
   ```

### **Option 2: Use Firestore REST API (Quick Test)**

I can create a version that uses the Firestore REST API with your existing credentials. This works for testing but has rate limits.

---

## For Now: Testing Without Real Firebase

You can still test the severity calculation without Firebase:

```bash
cd backend

# Test severity calculation (no Firebase needed)
python -c "from models.severity import SeverityCalculator, get_crisis_level; calc = SeverityCalculator(); score = calc.calculate('Major fire emergency'); print(f'Score: {score}, Level: {get_crisis_level(score)}')"

# Test API endpoint (no Firebase needed)
python test_api.py
```

The ML model works perfectly - it just needs Firebase credentials to read/write data.

---

## What Works Now:

✅ Severity calculation ML model
✅ Crisis level mapping
✅ API endpoints (`/api/firebase/test-severity`)
✅ All backend code

## What Needs Firebase Credentials:

❌ Reading incidents from Firestore
❌ Updating crises in Firestore
❌ Syncing data

**Recommendation:** Get the service account key (Option 1) - it takes 2 minutes and enables full functionality!
