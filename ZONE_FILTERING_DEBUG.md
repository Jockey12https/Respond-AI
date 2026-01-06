# Debugging Incident Zone Filtering Issue

## Problem
Incidents submitted in Trivandrum are not showing up for the Trivandrum zone moderator.

## Root Cause Investigation

The moderator dashboard filters incidents by zone using:
```typescript
const incidentsList = moderatorZone
    ? await getIncidentsByZone(moderatorZone)
    : await getAllIncidents();
```

**Possible Issues:**

### 1. Zone Name Mismatch
The `zone` field in incidents might not match the moderator's zone exactly:
- Case sensitivity: "Trivandrum" vs "trivandrum"
- Naming: "Trivandrum" vs "Trivandrum Zone" vs "South Kerala - Trivandrum"

### 2. Zone Not Set on Incident Submission
When users submit incidents, the zone field might not be populated.

### 3. Firestore Query Issue
The `getIncidentsByZone()` function might have a bug in the query.

## Debug Steps

### Step 1: Check Firestore Data
1. Open Firebase Console
2. Go to Firestore Database
3. Check `moderators` collection:
   - Find the Trivandrum moderator
   - Note the exact `zone` field value
4. Check `incidents` collection:
   - Find incidents submitted in Trivandrum
   - Check if they have a `zone` field
   - Compare the zone value with moderator's zone

### Step 2: Run Debug Script
```bash
cd backend
python -c "from models.firebase_integration import FirebaseIntegration; FirebaseIntegration.initialize(); incidents = FirebaseIntegration.fetch_incidents(); print(f'Total incidents: {len(incidents)}'); [print(f\"Zone: '{i.get('zone', 'NO ZONE')}' | Location: {i.get('location')}\") for i in incidents[:10]]"
```

### Step 3: Check Zone Values
Look for:
- Incidents with no zone field
- Zone name variations
- Case sensitivity issues

## Quick Fix Options

### Option 1: Case-Insensitive Matching
Update the Firestore query to be case-insensitive.

### Option 2: Standardize Zone Names
Ensure all zones use the same naming convention.

### Option 3: Auto-Assign Zone
When submitting incidents, automatically assign zone based on location.

## Next Steps
Please provide the zone values from Firestore so I can implement the appropriate fix.
