export interface StepStatuses {
    diagnosis: string;
    organization: string;
    performance: string;
    compensation: string;
}

export interface VerifiedSteps {
    diagnosis: boolean;
    organization: boolean;
    performance: boolean;
    compensation: boolean;
}

export interface Company {
    id: number;
    name: string;
    industry?: string | null;
    hq_location?: string | null;
    logo_path?: string | null;
}

export interface HrProject {
    id: number;
    company_id: number;
    company?: Company | null;
    status: string;
    current_step?: string | null;
    step_statuses?: StepStatuses;
}
