# Quick Fix: Crisis Level Not Updating

## Problem
Crisis level stays at "medium" and doesn't update after the ML model runs.

## Root Cause
The frontend `forwardIncidentToCrisis` function isn't calling the backend severity calculation endpoint.

## Solution

### Step 1: Open `lib/firestore.ts`

### Step 2: Add Helper Function
Add this function near the top of the file (after imports):

```typescript
async function calculateAndUpdateSeverity(
  incidentId: string,
  description: string,
  zone: string,
  location: string,
  moderatorName: string
) {
  try {
    const response = await fetch('http://localhost:5000/api/forward/incident-to-crisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId,
        description,
        zone,
        location,
        moderatorName,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Crisis level updated to: ${data.crisis_level?.toUpperCase()}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error calculating severity:', error);
    return { success: false };
  }
}
```

### Step 3: Update forwardIncidentToCrisis
Find the `forwardIncidentToCrisis` function and add this **at the very beginning**:

```typescript
export async function forwardIncidentToCrisis(
  incident: IncidentReport,
  moderatorName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // ⭐ ADD THIS CODE ⭐
    await calculateAndUpdateSeverity(
      incident.id || 'unknown',
      incident.description,
      incident.zone || 'Unknown Zone',
      incident.location,
      moderatorName
    );
    // ⭐ END ⭐
  } catch (error) {
    console.error('Error forwarding incident to crisis:', error);
    return { success: false, message: 'Failed to forward incident to crisis' };
  }
}
    // ... rest of your existing code stays the same ...
```

### Step 4: Save and Test
1. Save `lib/firestore.ts`
2. The Next.js dev server will auto-reload
3. Forward an incident from moderator dashboard
4. Check browser console for: `✅ Crisis level updated to: CRITICAL`
5. Check authority dashboard - crisis level should be updated!

## Expected Console Output

**Browser Console:**
```
✅ Severity calculated and crisis level updated:
   Zone: Trivandrum
   Severity Score: 0.9
   Crisis Level: CRITICAL
   Emergency Type: FIRE
🎯 Crisis level updated to: CRITICAL
```

**Backend Console:**
```
📤 INCIDENT FORWARDED TO AUTHORITIES
Zone: Trivandrum
→ Severity Score: 0.900
→ Crisis Level: CRITICAL
✅ Updated crisis level for zone 'Trivandrum'
```

## Verification
1. Go to moderator dashboard
2. Forward an incident
3. Go to authority dashboard
4. Crisis level should show the ML-calculated level (not "medium")
