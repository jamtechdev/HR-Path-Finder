import { useMemo } from 'react';
import type { StepStatuses, VerifiedSteps } from '@/types/dashboard';
import type { StepKey, StepStatus } from '@/types/workflow';
import { STEP_ORDER } from '@/types/workflow';

interface UseWorkflowVerificationProps {
    stepStatuses: StepStatuses;
    verifiedSteps: VerifiedSteps;
}

interface StepState {
    status: StepStatus;
    isVerified: boolean;
    isUnlocked: boolean;
    canProceed: boolean;
}

interface WorkflowVerification {
    steps: Record<StepKey, StepState>;
    allStepsComplete: boolean;
    allStepsVerified: boolean;
    getStepState: (step: StepKey) => StepState;
    isStepUnlocked: (step: StepKey) => boolean;
    canProceedToStep: (step: StepKey) => boolean;
}

export function useWorkflowVerification({
    stepStatuses,
    verifiedSteps,
}: UseWorkflowVerificationProps): WorkflowVerification {
    const steps = useMemo(() => {
        const stepStates: Record<StepKey, StepState> = {} as Record<StepKey, StepState>;

        STEP_ORDER.forEach((stepKey, index) => {
            const status = stepStatuses[stepKey] as StepStatus;
            const isVerified = verifiedSteps[stepKey];
            
            // First step is always unlocked
            let isUnlocked = index === 0;
            
            // For subsequent steps, check if previous step is completed or submitted
            if (index > 0) {
                const previousStep = STEP_ORDER[index - 1];
                const previousStatus = stepStatuses[previousStep] as StepStatus;
                isUnlocked = previousStatus === 'completed' || previousStatus === 'submitted';
            }

            stepStates[stepKey] = {
                status,
                isVerified,
                isUnlocked,
                canProceed: isUnlocked && (status === 'not_started' || status === 'in_progress'),
            };
        });

        return stepStates;
    }, [stepStatuses, verifiedSteps]);

    const allStepsComplete = useMemo(() => {
        return Object.values(stepStatuses).every(status =>
            status === 'submitted' || status === 'completed'
        );
    }, [stepStatuses]);

    const allStepsVerified = useMemo(() => {
        return Object.values(verifiedSteps).every(verified => verified === true);
    }, [verifiedSteps]);

    const getStepState = (step: StepKey): StepState => {
        return steps[step] || {
            status: 'not_started',
            isVerified: false,
            isUnlocked: false,
            canProceed: false,
        };
    };

    const isStepUnlocked = (step: StepKey): boolean => {
        return getStepState(step).isUnlocked;
    };

    const canProceedToStep = (step: StepKey): boolean => {
        return getStepState(step).canProceed;
    };

    return {
        steps,
        allStepsComplete,
        allStepsVerified,
        getStepState,
        isStepUnlocked,
        canProceedToStep,
    };
}
