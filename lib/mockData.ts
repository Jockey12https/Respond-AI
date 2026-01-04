import {
    Alert,
    Incident,
    IncidentType,
    MapMarker,
    MarkerType,
    Severity,
    ZonalStatus,
    ZoneInfo,
} from "@/types";

export const mockIncidents: Incident[] = [
    {
        id: "1",
        type: IncidentType.Fire,
        location: { lat: 40.7128, lng: -74.006, address: "Downtown Area" },
        description: "Building fire reported",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        severity: Severity.Critical,
    },
    {
        id: "2",
        type: IncidentType.Medical,
        location: { lat: 40.7308, lng: -73.9973, address: "Central Park" },
        description: "Medical emergency assistance needed",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        severity: Severity.High,
    },
    {
        id: "3",
        type: IncidentType.Flood,
        location: { lat: 40.7489, lng: -73.9680, address: "East Side" },
        description: "Street flooding after heavy rain",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        severity: Severity.Medium,
    },
];

export const mockAlerts: Alert[] = [
    {
        id: "a1",
        title: "Severe Weather Warning",
        message: "Heavy rainfall expected in the next 2 hours. Stay indoors if possible.",
        severity: Severity.High,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        source: "National Weather Service",
    },
    {
        id: "a2",
        title: "Road Closure",
        message: "Main Street closed due to ongoing incident. Use alternate routes.",
        severity: Severity.Medium,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        source: "Traffic Authority",
    },
    {
        id: "a3",
        title: "Emergency Alert",
        message: "Active fire situation in downtown area. Evacuate if in the vicinity.",
        severity: Severity.Critical,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: "Fire Department",
    },
];

export const mockMapMarkers: MapMarker[] = [
    {
        id: "m1",
        type: MarkerType.Hospital,
        location: { lat: 40.7614, lng: -73.9776 },
        name: "Central Hospital",
        description: "24/7 Emergency Services",
        status: "Available",
    },
    {
        id: "m2",
        type: MarkerType.Hospital,
        location: { lat: 40.7282, lng: -73.9942 },
        name: "Downtown Medical Center",
        description: "Trauma Center",
        status: "Available",
    },
    {
        id: "m3",
        type: MarkerType.Emergency,
        location: { lat: 40.7580, lng: -73.9855 },
        name: "Police Station 19",
        description: "Emergency Response Unit",
    },
    {
        id: "m4",
        type: MarkerType.Emergency,
        location: { lat: 40.7489, lng: -73.9680 },
        name: "Fire Station 12",
        description: "Fire & Rescue",
    },
    {
        id: "m5",
        type: MarkerType.Relief,
        location: { lat: 40.7357, lng: -74.0059 },
        name: "Emergency Relief Center",
        description: "Food, Water, Medical Supplies",
        status: "Open 24/7",
    },
    {
        id: "m6",
        type: MarkerType.Relief,
        location: { lat: 40.7549, lng: -73.9840 },
        name: "Temporary Shelter",
        description: "Safe Haven for Displaced Residents",
        status: "Accepting Occupants",
    },
];

export const mockZoneInfo: ZoneInfo = {
    status: ZonalStatus.Alert,
    description: "Moderate risk level due to active weather conditions",
    lastUpdated: new Date(),
    instructions: [
        "Stay informed through official channels",
        "Prepare emergency supply kit",
        "Avoid unnecessary travel",
        "Report any suspicious activity or incidents",
    ],
};
