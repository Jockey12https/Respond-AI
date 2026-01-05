import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Kerala Regional Authorities and District Mapping
export const KERALA_AUTHORITIES = {
    "North Kerala": ["Kasaragod", "Kannur", "Kozhikode", "Wayanad"],
    "South Kerala": ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha"],
    "East Kerala": ["Idukki", "Kottayam"],
    "West Kerala": ["Thrissur", "Palakkad", "Malappuram", "Ernakulam"]
} as const;

// Get all authority names
export const getAuthorityNames = (): string[] => {
    return Object.keys(KERALA_AUTHORITIES);
};

// Get districts for a specific authority
export const getDistrictsForAuthority = (authorityName: string): readonly string[] => {
    return KERALA_AUTHORITIES[authorityName as keyof typeof KERALA_AUTHORITIES] || [];
};

// Get authority name for a given district
export const getAuthorityForDistrict = (district: string): string | null => {
    for (const [authority, districts] of Object.entries(KERALA_AUTHORITIES)) {
        if (districts.includes(district)) {
            return authority;
        }
    }
    return null;
};

export interface IncidentReport {
    id?: string;
    userId: string;
    userEmail: string;
    userName: string;
    incidentType: string;
    severity?: string; // Made optional
    location: string;
    description: string;
    contactNumber: string;
    lat?: number;
    lng?: number;
    zone?: string; // Auto-detected zone from coordinates
    status: "pending" | "verified" | "resolved";
    createdAt: string;
}

export interface CrisisData {
    id?: string;
    incidentId?: string; // Link to original incident
    location: string;
    lat: number;
    lng: number;
    priority: string;
    crisisType: string;
    affectedPeople: number;
    zone: string; // District name
    authorityName: string; // Regional authority (North/South/East/West Kerala)
    zoneModerator: string;
    crisisLevel: string;
    status: string;
    description: string;
    createdAt?: string;
}

export interface SeverityScore {
    id?: string;
    incidentId: string;
    severityScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    confidence: number;
    factors: string[];
    modelVersion: string;
    createdAt: string;
}

export interface AuthorityAlert {
    id?: string;
    authorityId: string;
    authorityName: string;
    zone: string;
    title: string;
    message: string;
    type: "critical" | "warning" | "info";
    createdAt: string;
    expiresAt?: string;
}

export interface AuthorityInstruction {
    id?: string;
    authorityId: string;
    authorityName: string;
    zone: string;
    moderatorId: string;
    title: string;
    instructions: string;
    priority: "critical" | "high" | "medium";
    status: "pending" | "acknowledged" | "completed";
    createdAt: string;
    acknowledgedAt?: string;
}

export interface Broadcast {
    id?: string;
    moderatorId: string;
    moderatorName: string;
    zone: string;
    message: string;
    type: "alert" | "warning" | "info";
    recipientCount: number;
    createdAt: string;
}

// Incident Reports
export const createIncidentReport = async (report: Omit<IncidentReport, "id" | "createdAt" | "status">) => {
    try {
        // Auto-detect zone/district from coordinates
        const zone = report.lat && report.lng
            ? await detectZoneFromCoordinates(report.lat, report.lng)
            : "Unknown District";

        const docRef = await addDoc(collection(db, "incidents"), {
            ...report,
            zone, // Add detected district
            status: "pending",
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating incident report:", error);
        return { success: false, error: "Failed to submit report" };
    }
};

export const getUserIncidents = async (userId: string) => {
    try {
        const q = query(
            collection(db, "incidents"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const incidents: IncidentReport[] = [];
        querySnapshot.forEach((doc) => {
            incidents.push({ id: doc.id, ...doc.data() } as IncidentReport);
        });
        return incidents;
    } catch (error) {
        console.error("Error fetching incidents:", error);
        return [];
    }
};

export const getAllIncidents = async () => {
    try {
        const q = query(
            collection(db, "incidents"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const incidents: IncidentReport[] = [];
        querySnapshot.forEach((doc) => {
            incidents.push({ id: doc.id, ...doc.data() } as IncidentReport);
        });
        return incidents;
    } catch (error) {
        console.error("Error fetching all incidents:", error);
        return [];
    }
};

// Get incidents by zone for moderators (only pending incidents)
export const getIncidentsByZone = async (zone: string) => {
    try {
        const q = query(
            collection(db, "incidents"),
            where("zone", "==", zone),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const incidents: IncidentReport[] = [];
        querySnapshot.forEach((doc) => {
            incidents.push({ id: doc.id, ...doc.data() } as IncidentReport);
        });
        return incidents;
    } catch (error) {
        console.error("Error fetching incidents by zone:", error);
        return [];
    }
};

// Update incident status
export const updateIncidentStatus = async (incidentId: string, status: "pending" | "verified" | "resolved") => {
    try {
        await updateDoc(doc(db, "incidents", incidentId), {
            status: status
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating incident status:", error);
        return { success: false, error: "Failed to update incident status" };
    }
};

// Crisis Data
export const createCrisisData = async (crisis: Omit<CrisisData, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "crises"), {
            ...crisis,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating crisis:", error);
        return { success: false, error: "Failed to create crisis" };
    }
};

export const getAllCrises = async () => {
    try {
        const q = query(collection(db, "crises"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const crises: CrisisData[] = [];
        querySnapshot.forEach((doc) => {
            crises.push({ id: doc.id, ...doc.data() } as CrisisData);
        });
        return crises;
    } catch (error) {
        console.error("Error fetching crises:", error);
        return [];
    }
};

export const getVerifiedCrises = async () => {
    try {
        const q = query(
            collection(db, "crises"),
            where("status", "==", "verified"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const crises: CrisisData[] = [];
        querySnapshot.forEach((doc) => {
            crises.push({ id: doc.id, ...doc.data() } as CrisisData);
        });
        return crises;
    } catch (error) {
        console.error("Error fetching verified crises:", error);
        return [];
    }
};

// Delete crisis from Firebase
export const deleteCrisis = async (crisisId: string) => {
    try {
        await deleteDoc(doc(db, "crises", crisisId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting crisis:", error);
        return { success: false, error: "Failed to delete crisis" };
    }
};

// District Detection - Extract district name from coordinates using reverse geocoding
export const detectZoneFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();

        // Extract district from address components
        // OpenStreetMap returns district in various fields depending on location
        const district = data.address?.state_district ||
            data.address?.county ||
            data.address?.district ||
            data.address?.city ||
            "Unknown District";

        // Clean up the district name (remove "District" suffix if present)
        const cleanDistrict = district.replace(/ District$/i, '').trim();

        return cleanDistrict;
    } catch (error) {
        console.error("Error detecting district from coordinates:", error);
        // Fallback to latitude-based zones if API fails
        if (lat >= 11.0) {
            return "North Kerala";
        } else if (lat >= 9.5) {
            return "Central Kerala";
        } else {
            return "South Kerala";
        }
    }
};

// Forward incident to crisis (for moderator forwarding to authorities)
export const forwardIncidentToCrisis = async (
    incident: IncidentReport,
    moderatorName: string,
    moderatorAuthorityName: string // Regional authority name
) => {
    console.log("🚀 forwardIncidentToCrisis called with:", { incident, moderatorName, moderatorAuthorityName });
    try {
        const priority = incident.severity === "critical" ? "critical" : incident.severity === "high" ? "high" : "medium";

        // Automatically detect zone/district from coordinates
        const detectedZone = await detectZoneFromCoordinates(incident.lat || 0, incident.lng || 0);

        const crisisData: Omit<CrisisData, "id" | "createdAt"> = {
            incidentId: incident.id,
            location: incident.location,
            lat: incident.lat || 0,
            lng: incident.lng || 0,
            priority: priority,
            crisisType: incident.incidentType,
            affectedPeople: 0,
            zone: detectedZone,
            authorityName: moderatorAuthorityName,
            zoneModerator: moderatorName,
            crisisLevel: incident.severity || "medium",
            status: "verified",
            description: incident.description
        };

        const result = await createCrisisData(crisisData);
        return result;
    } catch (error) {
        console.error("Error forwarding incident to crisis:", error);
        return { success: false, error: "Failed to forward incident" };
    }
};

// Severity Scores (Mock for now - will be replaced with ML model)
export const getSeverityScore = async (incidentId: string) => {
    try {
        const q = query(
            collection(db, "severityScores"),
            where("incidentId", "==", incidentId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as SeverityScore;
        }
        // Return mock data if no score exists
        return {
            incidentId,
            severityScore: Math.floor(Math.random() * 100),
            riskLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any,
            confidence: 0.85,
            factors: ["Location", "Type", "Description"],
            modelVersion: "mock-v1",
            createdAt: new Date().toISOString()
        } as SeverityScore;
    } catch (error) {
        console.error("Error fetching severity score:", error);
        return null;
    }
};

// Authority Instructions System

export const createAuthorityInstruction = async (instruction: Omit<AuthorityInstruction, "id" | "createdAt" | "status">) => {
    try {
        const docRef = await addDoc(collection(db, "instructions"), {
            ...instruction,
            status: "pending",
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating instruction:", error);
        return { success: false, error: "Failed to create instruction" };
    }
};

export const getInstructionsByZone = async (zone: string) => {
    try {
        const q = query(
            collection(db, "instructions"),
            where("zone", "==", zone),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AuthorityInstruction[];
    } catch (error) {
        console.error("Error fetching zone instructions:", error);
        return [];
    }
};

// Legacy/Other Instructions
export const getAuthorityInstructions = async (moderatorId: string) => {
    try {
        const q = query(
            collection(db, "authorityInstructions"),
            where("moderatorId", "==", moderatorId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const instructions: AuthorityInstruction[] = [];
        querySnapshot.forEach((doc) => {
            instructions.push({ id: doc.id, ...doc.data() } as AuthorityInstruction);
        });
        return instructions;
    } catch (error) {
        console.error("Error fetching instructions:", error);
        return [];
    }
};

export const acknowledgeInstruction = async (instructionId: string) => {
    try {
        const docRef = doc(db, "instructions", instructionId);
        await updateDoc(docRef, {
            status: "acknowledged",
            acknowledgedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error acknowledging instruction:", error);
        return { success: false };
    }
};

// Authority Alerts (For Users)
export const createAuthorityAlert = async (alert: Omit<AuthorityAlert, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "alerts"), {
            ...alert,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating authority alert:", error);
        return { success: false, error };
    }
};

export const getAlertsByZone = async (zone: string) => {
    try {
        const q = query(
            collection(db, "alerts"),
            where("zone", "==", zone),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AuthorityAlert[];
    } catch (error) {
        console.error("Error fetching authority alerts:", error);
        return [];
    }
};

// Broadcasts
export const createBroadcast = async (broadcast: Omit<Broadcast, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "broadcasts"), {
            ...broadcast,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating broadcast:", error);
        return { success: false, error: "Failed to send broadcast" };
    }
};

export const getBroadcastHistory = async (moderatorId: string) => {
    try {
        const q = query(
            collection(db, "broadcasts"),
            where("moderatorId", "==", moderatorId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const broadcasts: Broadcast[] = [];
        querySnapshot.forEach((doc) => {
            broadcasts.push({ id: doc.id, ...doc.data() } as Broadcast);
        });
        return broadcasts;
    } catch (error) {
        console.error("Error fetching broadcast history:", error);
        return [];
    }
};

// Get broadcasts by zone for users
export const getBroadcastsByZone = async (zone: string) => {
    try {
        const q = query(
            collection(db, "broadcasts"),
            where("zone", "==", zone),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const broadcasts: Broadcast[] = [];
        querySnapshot.forEach((doc) => {
            broadcasts.push({ id: doc.id, ...doc.data() } as Broadcast);
        });
        return broadcasts;
    } catch (error) {
        console.error("Error fetching broadcasts by zone:", error);
        return [];
    }
};

// Authority Profiles
export interface AuthorityProfile {
    id?: string;
    userId: string;
    authorityName: string;
    email: string;
    name: string;
    createdAt: string;
}

export const createAuthorityProfile = async (profile: Omit<AuthorityProfile, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "authorities"), {
            ...profile,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating authority profile:", error);
        return { success: false, error: "Failed to create authority profile" };
    }
};

export const getAllAuthorities = async () => {
    try {
        const q = query(collection(db, "authorities"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const authorities: AuthorityProfile[] = [];
        querySnapshot.forEach((doc) => {
            authorities.push({ id: doc.id, ...doc.data() } as AuthorityProfile);
        });
        return authorities;
    } catch (error) {
        console.error("Error fetching authorities:", error);
        return [];
    }
};

export const getAuthorityByUserId = async (userId: string) => {
    try {
        const q = query(
            collection(db, "authorities"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as AuthorityProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching authority profile:", error);
        return null;
    }
};

// Moderator Profiles
export interface ModeratorProfile {
    id?: string;
    userId: string;
    moderatorName: string;
    email: string;
    name: string;
    zone: string; // District name (e.g., "Ernakulam")
    authorityId: string; // ID of parent authority
    authorityName: string; // Regional authority name (e.g., "West Kerala")
    createdAt: string;
}

export const createModeratorProfile = async (profile: Omit<ModeratorProfile, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "moderators"), {
            ...profile,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating moderator profile:", error);
        return { success: false, error: "Failed to create moderator profile" };
    }
};

export const getModeratorByUserId = async (userId: string) => {
    try {
        const q = query(
            collection(db, "moderators"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as ModeratorProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching moderator profile:", error);
        return null;
    }
};



