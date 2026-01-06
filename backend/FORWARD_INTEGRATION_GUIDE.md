# Integration Guide: Severity Scoring with Incident Forwarding

## What Was Implemented

### Backend Endpoint
**File:** `backend/routes/forward.py`

**Endpoint:** `POST /api/forward/incident-to-crisis`

**Purpose:** Calculate severity score when moderator forwards an incident to authorities.

**Request:**
```json
{
  "incidentId": "incident123",
  "description": "Major fire emergency",
  "zone": "Trivandrum",
  "location": "City Center",
  "moderatorName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "severity_score": 0.9,
  "crisis_level": "critical",
  "emergency_type": "FIRE",
  "message": "Crisis level updated to CRITICAL"
}
```

---

## How It Works

1. **Moderator forwards incident** → Calls backend endpoint
2. **Backend calculates severity** → Uses ML model on description
3. **Crisis level updated** → Saves to Firebase `crises` collection
4. **Authority sees update** → Dashboard shows new crisis level

---

## Frontend Integration

### Option 1: Modify Existing forwardIncidentToCrisis

Update your `lib/firestore.ts` (or wherever `forwardIncidentToCrisis` is defined) to call the backend API:

```typescript
export async function forwardIncidentToCrisis(
  incident: IncidentReport,
  moderatorName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Call backend to calculate severity and update crisis
    const severityResponse = await fetch('http://localhost:5000/api/forward/incident-to-crisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: incident.id,
        description: incident.description,
        zone: incident.zone,
        location: incident.location,
        moderatorName: moderatorName,
      }),
    });

    const severityData = await severityResponse.json();
    
    if (severityData.success) {
      console.log(`✅ Crisis level updated to ${severityData.crisis_level.toUpperCase()}`);
      console.log(`Severity score: ${severityData.severity_score}`);
    }

    // Then do your existing Firebase operations (create crisis record, etc.)
    // ... your existing code ...

    return { success: true };
  } catch (error) {
    console.error('Error forwarding incident:', error);
    return { success: false };
  }
}
```

### Option 2: Call Backend Separately

In `app/moderator/page.tsx`, update the forward button handler:

```typescript
onClick={async () => {
  if (incident.id && user) {
    // Call backend to calculate and update severity
    const severityResponse = await fetch('http://localhost:5000/api/forward/incident-to-crisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: incident.id,
        description: incident.description,
        zone: incident.zone || 'Unknown',
        location: incident.location,
        moderatorName: user.name,
      }),
    });

    const severityData = await severityResponse.json();
    
    if (severityData.success) {
      console.log(`Crisis level: ${severityData.crisis_level}`);
      
      // Then call existing forward function
      const result = await forwardIncidentToCrisis(incident, user.name);
      if (result.success) {
        setForwardedReports(prev => new Set(prev).add(incident.id!));
      }
    }
  }
}}
```

---

## Console Output

When an incident is forwarded, you'll see in the backend console:

```
================================================================================
📤 INCIDENT FORWARDED TO AUTHORITIES
================================================================================
Incident ID: inc123
Location: City Center
Zone: Trivandrum
Description: Major fire emergency with people trapped...
Forwarded by: John Doe

🤖 ML SEVERITY ANALYSIS:
  → Severity Score: 0.900
  → Crisis Level: CRITICAL
  → Emergency Type: FIRE
================================================================================

============================================================
📊 SEVERITY CALCULATION RESULT
============================================================
Zone: Trivandrum
Severity Score: 0.900
Crisis Level: CRITICAL
============================================================

✅ Updated crisis level for zone 'Trivandrum': critical (score: 0.9)
```

---

## Testing

```bash
# Test the endpoint
curl -X POST http://localhost:5000/api/forward/incident-to-crisis \
  -H "Content-Type: application/json" \
  -d '{
    "incidentId": "test123",
    "description": "Building collapse emergency",
    "zone": "Trivandrum",
    "location": "Downtown",
    "moderatorName": "Test Moderator"
  }'
```

---

## Result

✅ **Automatic Severity Calculation** when forwarding incidents
✅ **Crisis levels updated** in Firebase
✅ **Authority dashboard** shows calculated crisis levels
✅ **Console logging** for debugging
