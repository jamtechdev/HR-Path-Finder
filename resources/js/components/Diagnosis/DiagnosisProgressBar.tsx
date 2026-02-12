import React from 'react';
import { Check, Circle } from 'lucide-react';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { TabId } from './DiagnosisTabs';
import { cn } from '@/lib/utils';

interface DiagnosisProgressBarProps {
    activeTab: TabId;
    stepStatuses: Record<string, string | boolean>;
    diagnosisStatus?: 'not_started' | 'in_progress' | 'submitted';
    projectId?: number | null;
}

export default function DiagnosisProgressBar({
    activeTab,
    stepStatuses,
    diagnosisStatus = 'not_started',
    projectId
}: DiagnosisProgressBarProps) {
    // Filter out overview tab for progress calculation
    const steps = diagnosisTabs.filter(tab => tab.id !== 'overview');
    const totalSteps = steps.length;
    
    // Calculate completed steps - use proper validation
    const completedSteps = steps.filter(step => {
        // Review tab is completed when diagnosis is submitted
        if (step.id === 'review') {
            return diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        }
        
        const status = stepStatuses[step.id];
        const isStatusCompleted = status && (
            status === true || 
            status === 'completed' ||
            status === 'submitted' || 
            status === 'approved' || 
            status === 'locked'
        );
        
        // For in_progress, we need to check if data actually exists
        // This will be handled by the validation function in DiagnosisTabs
        // For now, only count as completed if status is truly completed
        return isStatusCompleted;
    }).length;
    
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Get current step index
    const currentStepIndex = steps.findIndex(step => step.id === activeTab);
    const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;
    
    return (
        <div className="w-full space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                        Diagnosis Progress
                    </span>
                    <span className="text-muted-foreground">
                        {completedSteps} of {totalSteps} steps completed
                    </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                        className={cn(
                            "h-full transition-all duration-500 ease-out rounded-full",
                            completedSteps === totalSteps ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {steps.map((step, index) => {
                    // Review tab is completed when diagnosis is submitted
                    let isCompleted = false;
                    if (step.id === 'review') {
                        isCompleted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
                    } else {
                        const status = stepStatuses[step.id];
                        isCompleted = status && (
                            status === true || 
                            status === 'completed' ||
                            status === 'submitted' || 
                            status === 'approved' || 
                            status === 'locked'
                        );
                    }
                    const isActive = step.id === activeTab;
                    const isPast = index < currentStepIndex;
                    const allCompleted = completedSteps === totalSteps;
                    
                    return (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center gap-1 min-w-[60px] ${
                                isActive ? 'scale-110' : ''
                            } transition-transform`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted && allCompleted
                                        ? 'bg-green-500 border-green-600 text-white shadow-md'
                                        : isCompleted
                                        ? 'bg-green-100 border-green-300 text-green-600'
                                        : isActive
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : isPast
                                        ? 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-xs font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs text-center max-w-[60px] truncate ${
                                    isActive
                                        ? 'font-semibold text-primary'
                                        : isCompleted && allCompleted
                                        ? 'font-semibold text-green-700'
                                        : isCompleted
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
