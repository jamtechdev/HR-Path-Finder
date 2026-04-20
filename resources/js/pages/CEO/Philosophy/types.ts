export interface DiagnosisQuestion {
    id: number;
    question_text: string;
    question_type: string;
    options?: string[];
    metadata?: QuestionMetadata;
}

export interface QuestionMetadata {
    [key: string]: unknown;
    title?: string;
    title_ko?: string;
    description?: string;
    description_ko?: string;
    icon?: string;
    option_a?: string;
    option_b?: string;
    option_a_label?: string;
    option_a_label_ko?: string;
    option_b_label?: string;
    option_b_label_ko?: string;
    scenario?: string;
    scenario_ko?: string;
    callout_title?: string;
    callout_title_ko?: string;
    callout_body?: string;
    callout_body_ko?: string;
    keyword_presets?: string[];
    keyword_presets_ko?: string[];
    unit?: string;
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
    titleKo: string;
    keyword: string;
    keywordKo: string;
    desc: string;
    descKo: string;
    detail: string;
    detailKo: string;
    hrIssues: string[];
    hrIssuesKo: string[];
}

export interface VisionChunkConfig {
    icon: string;
    label: string;
    name: string;
    nameKo: string;
    desc: string;
    callout: { title: string; body: string };
}
