export type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'completed' | 'locked';

export type StepKey = 'diagnosis' | 'job_analysis' | 'ceo_diagnosis' | 'performance' | 'compensation' | 'hr_policy_os';

export interface StepInfo {
    key: StepKey;
    label: string;
    stepNumber: number;
}

export const STEP_ORDER: StepKey[] = ['diagnosis', 'job_analysis', 'ceo_diagnosis', 'performance', 'compensation', 'hr_policy_os'];

export const STEP_LABELS: Record<StepKey, string> = {
    diagnosis: 'Step 1: Diagnosis (Company info.)',
    job_analysis: 'Step 2: Job Analysis',
    ceo_diagnosis: 'Step 3: CEO Diagnosis',
    performance: 'Step 4: Performance.Man.',
    compensation: 'Step 5: C&B',
    hr_policy_os: 'Step 6: HR Policy OS',
};
