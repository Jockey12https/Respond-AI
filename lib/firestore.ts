import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

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
    status: "pending" | "verified" | "resolved";
    createdAt: string;
}

export interface CrisisData {
    id?: string;
    location: string;
    lat: number;
    lng: number;
    priority: "critical" | "high" | "medium";
    crisisType: string;
    affectedPeople: number;
    zone: string;
    zoneModerator: string;
    crisisLevel: string;
    status: string;
    description: string;
    createdAt: string;
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
        const docRef = await addDoc(collection(db, "incidents"), {
            ...report,
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
        const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
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

// Authority Instructions
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
        const docRef = collection(db, "authorityInstructions");
        await addDoc(docRef, {
            status: "acknowledged",
            acknowledgedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error acknowledging instruction:", error);
        return { success: false };
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

