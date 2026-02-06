export type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'completed' | 'locked';

export type StepKey = 'diagnosis' | 'organization' | 'performance' | 'compensation';

export interface StepInfo {
    key: StepKey;
    label: string;
    stepNumber: number;
}

export const STEP_ORDER: StepKey[] = ['diagnosis', 'organization', 'performance', 'compensation'];

export const STEP_LABELS: Record<StepKey, string> = {
    diagnosis: 'Step 1: Diagnosis',
    organization: 'Step 2: Organization',
    performance: 'Step 3: Performance',
    compensation: 'Step 4: Compensation',
};
