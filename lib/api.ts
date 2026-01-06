/**
 * API Service for TWSM Backend
 * Handles all communication with the Flask backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Location {
    lat: number;
    lng: number;
}

export interface Report {
    id: number;
    user_id: string;
    description: string;
    location: Location | null;
    evidence: {
        type: string;
        has_metadata: boolean;
        media_url?: string;
    };
    scores: {
        severity: number;
        trust: number;
        evidence: number;
        context_risk: number;
        final_priority: number;
    };
    action: 'DISPATCH' | 'VALIDATE' | 'HOLD';
    status: string;
    created_at: string;
    validation_count: number;
}

export interface User {
    id: string;
    name: string;
    trust_score: number;
    total_reports: number;
    verified_reports: number;
    false_reports: number;
    verification_ratio: number;
}

export interface Stats {
    reports: {
        total: number;
        by_action: {
            dispatch: number;
            validate: number;
            hold: number;
        };
        average_priority: number;
    };
    users: {
        total: number;
        average_trust: number;
    };
}

export interface TrustScore {
    user_id: string;
    trust_score: number;
    total_reports: number;
    verified_reports: number;
    false_reports: number;
    verification_ratio: number;
    last_report_date?: string;
    trust_trend?: 'improving' | 'stable' | 'declining';
}

export interface SeverityPreview {
    severity_score: number;
    emergency_type: string;
    crisis_level: 'critical' | 'high' | 'medium' | 'low';
    keywords_found: string[];
    confidence: number;
}

export interface ModelPerformance {
    total_reports: number;
    accuracy_rate: number;
    average_response_time: number;
    dispatch_accuracy: number;
    false_positive_rate: number;
    false_negative_rate: number;
}

export interface ContextRisk {
    risk_multiplier: number;
    population_density: string;
    time_of_day: string;
    weather_condition: string;
    is_disaster_zone: boolean;
    factors: {
        population_factor: number;
        time_factor: number;
        weather_factor: number;
    };
}

export interface ReportCluster {
    cluster_id: string;
    location: Location;
    report_count: number;
    combined_priority: number;
    emergency_type: string;
    reports: Report[];
}

export interface CrisisData {
    id: number;
    location: string;
    lat: number;
    lng: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    crisisType: string;
    affectedPeople: number;
    zone: string;
    zoneModerator: string;
    crisisLevel: string;
    status: string;
    description: string;
    finalPriority: number;
    action: string;
    reportedBy: string;
}

class TWSMAPIService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Seed mock data for testing
     */
    async seedMockReports(): Promise<any> {
        const response = await fetch(`${this.baseURL}/api/seed/mock-reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to seed data: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Submit a new emergency report
     */
    async submitReport(reportData: {
        user_id: string;
        description: string;
        evidence_type: string;
        location?: Location;
        has_metadata?: boolean;
        population_density?: string;
        weather_condition?: string;
    }): Promise<{ report: Report; priority_breakdown: any }> {
        const response = await fetch(`${this.baseURL}/api/emergency/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit report: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get all reports with optional filtering
     */
    async getReports(filters?: {
        action?: 'DISPATCH' | 'VALIDATE' | 'HOLD';
        status?: string;
        limit?: number;
    }): Promise<Report[]> {
        const params = new URLSearchParams();
        if (filters?.action) params.append('action', filters.action);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const url = `${this.baseURL}/api/emergency/reports${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reports;
    }

    /**
     * Get a specific report by ID
     */
    async getReport(reportId: number): Promise<Report> {
        const response = await fetch(`${this.baseURL}/api/emergency/report/${reportId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch report: ${response.statusText}`);
        }

        const data = await response.json();
        return data.report;
    }

    /**
     * Validate a report (community validation)
     */
    async validateReport(
        reportId: number,
        userId: string,
        isValid: boolean,
        comment?: string
    ): Promise<any> {
        const response = await fetch(`${this.baseURL}/api/emergency/validate/${reportId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                is_valid: isValid,
                comment,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to validate report: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get user profile
     */
    async getUser(userId: string): Promise<User> {
        const response = await fetch(`${this.baseURL}/api/user/${userId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const data = await response.json();
        return data.user;
    }

    /**
     * Get system statistics
     */
    async getStats(): Promise<Stats> {
        const response = await fetch(`${this.baseURL}/api/analytics/stats`);

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create a new user
     */
    async createUser(userId: string, name: string): Promise<User> {
        const response = await fetch(`${this.baseURL}/api/user/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                name,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create user: ${response.statusText}`);
        }

        const data = await response.json();
        return data.user;
    }

    /**
     * Get user trust score and reputation details
     */
    async getUserTrustScore(userId: string): Promise<TrustScore> {
        const response = await fetch(`${this.baseURL}/api/user/${userId}/trust`);

        if (!response.ok) {
            throw new Error(`Failed to fetch trust score: ${response.statusText}`);
        }

        const data = await response.json();
        return data.trust;
    }

    /**
     * Calculate severity preview for a description (real-time)
     */
    async calculateSeverityPreview(description: string): Promise<SeverityPreview> {
        const response = await fetch(`${this.baseURL}/api/analytics/severity-preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
        });

        if (!response.ok) {
            throw new Error(`Failed to calculate severity: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get ML model performance metrics
     */
    async getModelPerformance(): Promise<ModelPerformance> {
        const response = await fetch(`${this.baseURL}/api/analytics/model-performance`);

        if (!response.ok) {
            throw new Error(`Failed to fetch model performance: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get context risk analysis for a location and time
     */
    async getContextRisk(
        location: Location,
        populationDensity: string = 'medium',
        weatherCondition: string = 'normal',
        timeOfDay?: Date
    ): Promise<ContextRisk> {
        const params = new URLSearchParams({
            lat: location.lat.toString(),
            lng: location.lng.toString(),
            population_density: populationDensity,
            weather_condition: weatherCondition,
        });

        if (timeOfDay) {
            params.append('time', timeOfDay.toISOString());
        }

        const response = await fetch(`${this.baseURL}/api/analytics/context-risk?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch context risk: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get aggregated report clusters
     */
    async getReportAggregations(zone?: string): Promise<ReportCluster[]> {
        const params = new URLSearchParams();
        if (zone) params.append('zone', zone);

        const response = await fetch(`${this.baseURL}/api/analytics/aggregations?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch aggregations: ${response.statusText}`);
        }

        const data = await response.json();
        return data.clusters || [];
    }

    /**
     * Convert Report to CrisisData for map display
     */
    convertToCrisisData(report: Report): CrisisData {
        const getPriorityLevel = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
            if (score >= 0.7) return 'critical';
            if (score >= 0.5) return 'high';
            if (score >= 0.3) return 'medium';
            return 'low';
        };

        const getCrisisType = (description: string): string => {
            const desc = description.toLowerCase();
            if (desc.includes('fire') || desc.includes('smoke')) return 'Fire';
            if (desc.includes('flood')) return 'Flood';
            if (desc.includes('landslide')) return 'Landslide';
            if (desc.includes('accident')) return 'Accident';
            if (desc.includes('gas')) return 'Gas Leak';
            return 'Other';
        };

        const getZone = (lat: number): string => {
            if (lat < 9.5) return 'South Kerala Zone';
            if (lat < 11) return 'Central Kerala Zone';
            return 'North Kerala Zone';
        };

        const getZoneModerator = (zone: string): string => {
            const moderators: Record<string, string> = {
                'South Kerala Zone': 'Dr. Suresh Kumar',
                'Central Kerala Zone': 'Mrs. Lakshmi Menon',
                'North Kerala Zone': 'Mr. Rajesh Nair',
            };
            return moderators[zone] || 'Zone Moderator';
        };

        const getLocationName = (lat: number, lng: number): string => {
            const cities = [
                { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
                { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
                { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
                { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
                { name: 'Kannur', lat: 11.8745, lng: 75.3704 },
                { name: 'Kollam', lat: 8.8932, lng: 76.6141 },
                { name: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
            ];

            let closest = cities[0];
            let minDist = Infinity;

            for (const city of cities) {
                const dist = Math.sqrt(
                    Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    closest = city;
                }
            }

            return closest.name;
        };

        const location = report.location || { lat: 0, lng: 0 };
        const zone = getZone(location.lat);

        return {
            id: report.id,
            location: getLocationName(location.lat, location.lng),
            lat: location.lat,
            lng: location.lng,
            priority: getPriorityLevel(report.scores.final_priority),
            crisisType: getCrisisType(report.description),
            affectedPeople: Math.floor(Math.random() * 5000) + 500,
            zone,
            zoneModerator: getZoneModerator(zone),
            crisisLevel: report.action,
            status: report.status.toLowerCase(),
            description: report.description,
            finalPriority: report.scores.final_priority,
            action: report.action,
            reportedBy: report.user_id,
        };
    }

    /**
     * Map TWSM action to priority level for UI
     */
    mapActionToPriority(action: string): 'critical' | 'high' | 'medium' | 'low' {
        switch (action) {
            case 'DISPATCH':
                return 'critical';
            case 'VALIDATE':
                return 'high';
            case 'HOLD':
                return 'medium';
            default:
                return 'low';
        }
    }

    /**
     * Get color for priority level
     */
    getPriorityColor(action: string): string {
        switch (action) {
            case 'DISPATCH':
                return '#dc2626'; // red
            case 'VALIDATE':
                return '#f97316'; // orange
            case 'HOLD':
                return '#eab308'; // yellow
            default:
                return '#6b7280'; // gray
        }
    }
}

// Export singleton instance
export const twsmAPI = new TWSMAPIService();
export default twsmAPI;
