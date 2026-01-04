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
        location: { lat: 28.6139, lng: 77.2090, address: "Connaught Place, New Delhi" },
        description: "Building fire reported",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        severity: Severity.Critical,
    },
    {
        id: "2",
        type: IncidentType.Medical,
        location: { lat: 28.5355, lng: 77.3910, address: "Noida, Uttar Pradesh" },
        description: "Medical emergency assistance needed",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        severity: Severity.High,
    },
    {
        id: "3",
        type: IncidentType.Flood,
        location: { lat: 28.7041, lng: 77.1025, address: "Delhi University Area" },
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
        source: "India Meteorological Department",
    },
    {
        id: "a2",
        title: "Road Closure",
        message: "Ring Road closed due to ongoing incident. Use alternate routes.",
        severity: Severity.Medium,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        source: "Delhi Traffic Police",
    },
    {
        id: "a3",
        title: "Emergency Alert",
        message: "Active fire situation in Connaught Place area. Evacuate if in the vicinity.",
        severity: Severity.Critical,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: "Delhi Fire Service",
    },
];

export const mockMapMarkers: MapMarker[] = [
    {
        id: "m1",
        type: MarkerType.Hospital,
        location: { lat: 28.6280, lng: 77.2177 },
        name: "AIIMS Delhi",
        description: "24/7 Emergency Services",
        status: "Available",
    },
    {
        id: "m2",
        type: MarkerType.Hospital,
        location: { lat: 28.6692, lng: 77.4538 },
        name: "Max Hospital Patparganj",
        description: "Trauma Center",
        status: "Available",
    },
    {
        id: "m3",
        type: MarkerType.Emergency,
        location: { lat: 28.6139, lng: 77.2295 },
        name: "Parliament Street Police Station",
        description: "Emergency Response Unit",
    },
    {
        id: "m4",
        type: MarkerType.Emergency,
        location: { lat: 28.6304, lng: 77.2177 },
        name: "Delhi Fire Station - Central",
        description: "Fire & Rescue",
    },
    {
        id: "m5",
        type: MarkerType.Relief,
        location: { lat: 28.5244, lng: 77.1855 },
        name: "Emergency Relief Center Mehrauli",
        description: "Food, Water, Medical Supplies",
        status: "Open 24/7",
    },
    {
        id: "m6",
        type: MarkerType.Relief,
        location: { lat: 28.7041, lng: 77.1025 },
        name: "Temporary Shelter North Delhi",
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
