# Quick Setup: Firebase Credentials for Backend

## Issue
The test shows: `❌ Firebase connection failed! Make sure FIREBASE_CREDENTIALS_PATH is set in .env`

## Solution

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file (e.g., `firebase-credentials.json`)

### Step 2: Add Credentials to Backend

**Option A: Place in backend folder (Recommended)**
```bash
# Copy the JSON file to backend folder
cp /path/to/firebase-credentials.json c:\Users\S J JITHIN\Downloads\Respond-AI\backend\firebase-credentials.json
```

**Option B: Use any location**
Just note the full path to the file.

### Step 3: Update .env File

Add this line to `backend/.env` (create the file if it doesn't exist):

```bash
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

Or if using Option B with full path:
```bash
FIREBASE_CREDENTIALS_PATH=C:\path\to\your\firebase-credentials.json
```

### Step 4: Test Connection

```bash
cd backend
python test_firebase_sync.py --test-only --limit 3
```

You should see:
```
✅ Firebase connected successfully!
✅ Found X incidents
```

---

## Alternative: Use Default Credentials

If you're already authenticated with Firebase CLI, you can skip the credentials file:

```bash
firebase login
```

Then the backend will use your default credentials automatically.

---

## Once Connected

After Firebase is connected, you can:

1. **Test with sample data:**
   ```bash
   python test_firebase_sync.py --test-only
   ```

2. **Sync to Firebase (dry run):**
   ```bash
   python test_firebase_sync.py
   ```

3. **Actually update Firebase:**
   ```bash
   python test_firebase_sync.py --sync-all
   ```

4. **Sync specific zone:**
   ```bash
   python test_firebase_sync.py --zone "South Kerala Zone" --sync-all
   ```
