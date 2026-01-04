// Incident Types
export interface Incident {
    id: string;
    type: IncidentType;
    location: Location;
    description: string;
    timestamp: Date;
    severity: Severity;
}

export enum IncidentType {
    Fire = "Fire",
    Flood = "Flood",
    Accident = "Accident",
    Medical = "Medical",
    Other = "Other",
}

export enum Severity {
    Low = "Low",
    Medium = "Medium",
    High = "High",
    Critical = "Critical",
}

export interface Location {
    lat: number;
    lng: number;
    address?: string;
}

// Alert Types
export interface Alert {
    id: string;
    title: string;
    message: string;
    severity: Severity;
    timestamp: Date;
    source: string;
}

// Map Marker Types
export interface MapMarker {
    id: string;
    type: MarkerType;
    location: Location;
    name: string;
    description?: string;
    status?: string;
}

export enum MarkerType {
    Hospital = "Hospital",
    Emergency = "Emergency",
    Relief = "Relief",
    Unsafe = "Unsafe",
    SafeRoute = "SafeRoute",
}

// Zonal Status Types
export enum ZonalStatus {
    Normal = "Normal",
    Alert = "Alert",
    Emergency = "Emergency",
    Restricted = "Restricted",
}

export interface ZoneInfo {
    status: ZonalStatus;
    description: string;
    lastUpdated: Date;
    instructions: string[];
}

// View Types
export type ViewType = "report" | "sos" | "alerts" | "map" | "status";
