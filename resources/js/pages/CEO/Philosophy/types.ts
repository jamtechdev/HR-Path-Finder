export interface DiagnosisQuestion {
    id: number;
    question_text: string;
    question_type: string;
    options?: string[];
    metadata?: Record<string, unknown>;
}

export interface HrIssue {
    id: number;
    name: string;
    category: string;
}

export interface IntroText {
    content: string;
    title?: string;
}

/** Values that can be sent in form payloads (Inertia-compatible). */
export type VisionMissionValue = string | number | boolean | null | undefined;

export interface SurveyFormData {
    management_philosophy: Record<string, number>;
    vision_mission: Record<string, VisionMissionValue>;
    growth_stage: string;
    leadership: Record<string, number>;
    general: Record<string, number>;
    organizational_issues: (string | number)[];
    organizational_issues_other?: string;
    concerns: string;
}

export type SetSurveyData = <K extends keyof SurveyFormData>(key: K, value: SurveyFormData[K]) => void;

export interface StepConfig {
    id: string;
    name: string;
    nameKo: string;
    icon: string;
    desc: string;
    callout?: { title: string; body: string };
}

export interface GrowthStageConfig {
    id: string;
    icon: string;
    title: string;
    keyword: string;
    desc: string;
    detail: string;
    hrIssues: string[];
}

export interface VisionChunkConfig {
    icon: string;
    label: string;
    name: string;
    nameKo: string;
    desc: string;
    callout: { title: string; body: string };
}
