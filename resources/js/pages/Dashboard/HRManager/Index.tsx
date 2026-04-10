import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { TrendingUp, Users, Calendar, CheckCircle2, Target, DollarSign, Building2, UserPlus, Mail, X, Award, Sparkles, Clock, ArrowRight, Lock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressTracker from '@/components/Dashboard/HRManager/ProgressTracker';
import StepCard from '@/components/Dashboard/HRManager/StepCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import ProfessionalWorkflow from '@/components/Workflow/ProfessionalWorkflow';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { StepKey, StepStatus } from '@/types/workflow';

interface User {
    name: string;
    email: string;
}

interface ActiveProject {
    id: number;
    company: {
        id: number;
        name: string;
    };
    status: string;
    step_statuses: Record<string, string>;
}

interface Progress {
    completed: number;
    total: number;
    currentStepNumber: number;
    currentStepKey: string | null;
    currentStepStatus: string;
}

interface Props {
    user: User;
    activeProject: ActiveProject | null;
    company: {
        id: number;
        name: string;
        hasCeo: boolean;
    } | null;
    progress: Progress;
    ceoPhilosophyStatus: 'not_started' | 'in_progress' | 'completed';
    canSwitchToCeo?: boolean;
}

export default function HrManagerDashboard({ user, activeProject, company, progress, ceoPhilosophyStatus, canSwitchToCeo }: Props) {
    const { t } = useTranslation();
    const stepStatuses = activeProject?.step_statuses ?? {};
    const stepConfig = [
        {
            id: 'diagnosis' as StepKey,
            step: 1,
            title: t('steps.diagnosis'),
            desc: t('hr_dashboard.steps.diagnosis_desc'),
            icon: CheckCircle2,
        },
        {
            id: 'job_analysis' as StepKey,
            step: 2,
            title: t('steps.job_analysis'),
            desc: t('hr_dashboard.steps.job_analysis_desc'),
            icon: Building2,
        },
        {
            id: 'performance' as StepKey,
            step: 3,
            title: t('steps.performance'),
            desc: t('hr_dashboard.steps.performance_desc'),
            icon: Target,
        },
        {
            id: 'compensation' as StepKey,
            step: 4,
            title: t('steps.compensation'),
            desc: t('hr_dashboard.steps.compensation_desc'),
            icon: DollarSign,
        },
        {
            id: 'hr_policy_os' as StepKey,
            step: 5,
            title: t('steps.hr_policy_os'),
            desc: t('hr_dashboard.steps.final_dashboard_desc'),
            icon: Award,
        },
    ];

    const roleSwitchForm = useForm({
        company_id: company?.id || null,
    });

    
    // Determine step states with proper unlock logic
    const getStepState = (stepKey: StepKey): 'current' | 'locked' | 'completed' => {
        // If no project, only Step 1 (Diagnosis) is available
        if (!activeProject) {
            return stepKey === 'diagnosis' ? 'current' : 'locked';
        }
        
        const stepIndex = stepConfig.findIndex(s => s.id === stepKey);
        const status = stepStatuses[stepKey] as StepStatus | undefined;
        const diagnosisStatus = stepStatuses['diagnosis'] as StepStatus | undefined;
        const isDiagnosisSubmitted = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // For diagnosis step: completed only if submitted AND CEO survey is done
        if (stepKey === 'diagnosis') {
            if (isDiagnosisSubmitted && isCeoSurveyCompleted) {
                return 'completed';
            }
            if (isDiagnosisSubmitted && !isCeoSurveyCompleted) {
                return 'current'; // Waiting for CEO survey
            }
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
        } else {
            // For other steps: completed if approved/locked/completed
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
        }
        
        // If this step is currently active (user is on this page), it's current
        if (progress.currentStepKey === stepKey) {
            return 'current';
        }
        
        // If step is submitted by HR, it's accessible (not locked) but not completed until CEO approves
        if (status === 'submitted') {
            return 'current'; // Allow HR to view their submitted work
        }
        
        // Check if this is the first step and it's not started yet
        if (stepIndex === 0 && (!status || status === 'not_started')) {
            return 'current';
        }
        
        // Check if previous steps are approved/completed to unlock this step
        // Only unlock if CEO survey is completed (for step 2+)
        if (stepIndex > 0) {
            if (!isCeoSurveyCompleted) {
                return 'locked'; // Step 2+ locked until CEO survey
            }
            
            // Check if all previous steps are submitted/approved/locked to unlock this step
            // Allow progression after submission (submitted status) while CEO approval is pending
            let allPreviousVerified = true;
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = stepConfig[i];
                const prevStatus = stepStatuses[prevStep.id] as StepStatus | undefined;
                
                // For diagnosis, must be submitted/approved/locked to unlock next step
                if (prevStep.id === 'diagnosis') {
                    const prevDiagnosisStatus = stepStatuses['diagnosis'] as StepStatus | undefined;
                    // Must be submitted, approved, or locked to unlock next step
                    if (!prevDiagnosisStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevDiagnosisStatus)) {
                        allPreviousVerified = false;
                        break;
                    }
                } else {
                    // For other steps, must be submitted/approved/locked to unlock next step
                    // This allows HR to continue after submission while CEO approval is pending
                    if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) {
                        allPreviousVerified = false;
                        break;
                    }
                }
            }
            
            // If all previous verified and this step is in_progress or not_started, it's current
            if (allPreviousVerified) {
                if (!status || status === 'not_started' || status === 'in_progress') {
                    return 'current';
                }
            } else {
                return 'locked';
            }
        }
        
        // All other steps are locked
        return 'locked';
    };
    
    // Check if steps should be visually locked
    // Steps are locked until previous step is VERIFIED (approved/locked)
    const isStepActuallyLocked = (stepKey: StepKey): boolean => {
        if (!activeProject) {
            return stepKey !== 'diagnosis';
        }
        
        const status = stepStatuses[stepKey] as StepStatus | undefined;
        const stepIndex = stepConfig.findIndex(s => s.id === stepKey);
        
        // If step is currently active, it should NOT be locked (user can be on it)
        if (progress.currentStepKey === stepKey) {
            return false;
        }
        
        // If step is submitted, it should NOT be locked (accessible for review/view)
        if (status === 'submitted') {
            return false; // Submitted steps are accessible for HR to view
        }
        
        // If step is verified (approved/locked), it should NOT be locked
        if (status && ['approved', 'locked', 'completed'].includes(status)) {
            return false; // Verified steps are accessible
        }
        
        // First step is never locked
        if (stepIndex === 0) {
            return false;
        }
        
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // If CEO survey not done, all steps except diagnosis are locked
        if (!isCeoSurveyCompleted && stepKey !== 'diagnosis') {
            return true;
        }
        
        // Check if all previous steps are SUBMITTED, APPROVED, or LOCKED to unlock this step
        // This allows HR to continue working after submission while CEO approval is pending
        for (let i = 0; i < stepIndex; i++) {
            const prevStep = stepConfig[i];
            const prevStatus = stepStatuses[prevStep.id] as StepStatus | undefined;
            
            // Previous step must be SUBMITTED, APPROVED, or LOCKED to unlock next step
            // SUBMITTED status allows progression while waiting for CEO approval
            if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) {
                return true; // Locked because previous step is not submitted/verified
            }
        }
        
        // If all previous steps are verified, this step is unlocked
        return false;
    };

    // Get step routes - matching sidebar routes
    const getStepRoute = (stepKey: StepKey): string => {
        // If no project, Step 1 (Diagnosis) goes to diagnosis page which will check/create project
        if (!activeProject) {
            if (stepKey === 'diagnosis') {
                return '/hr-manager/diagnosis';
            }
            return '#';
        }
        
        switch (stepKey) {
            case 'diagnosis':
                return `/hr-manager/diagnosis/${activeProject.id}/overview`;
            case 'job_analysis':
                return `/hr-manager/job-analysis/${activeProject.id}/overview`;
            case 'performance':
                return `/hr-manager/performance-system/${activeProject.id}/overview`;
            case 'compensation':
                return `/hr-manager/compensation-system/${activeProject.id}/overview`;
            case 'hr_policy_os':
                return `/hr-manager/tree/${activeProject.id}`;
            case 'tree':
                return `/hr-manager/tree/${activeProject.id}`;
            case 'conclusion':
                return `/hr-manager/conclusion/${activeProject.id}`;
            default:
                return '#';
        }
    };

    // Get current step route for continue button
    const getCurrentStepRoute = (): string => {
        if (!activeProject) {
            return '/hr-manager/diagnosis'; // Step 1 (Diagnosis) when no project
        }
        if (!progress.currentStepKey) return '#';
        return getStepRoute(progress.currentStepKey as StepKey);
    };

    // Get current step display name
    const getCurrentStepName = (): string => {
        if (!activeProject) return 'Step 1';
        if (!progress.currentStepKey) return 'Step 1';
        const step = stepConfig.find(s => s.id === progress.currentStepKey);
        return step ? t('hr_dashboard.step_n', { n: step.step }) : t('hr_dashboard.step_n', { n: 1 });
    };

    return (
        <AppLayout>
            <Head title={t('hr_dashboard.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="space-y-8">
                            {/* Welcome Section */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{t('hr_dashboard.welcome_back', { name: user.name })}</h1>
                                    <p className="text-muted-foreground text-lg">
                                        {activeProject 
                                            ? t('hr_dashboard.continue_building', { company: activeProject.company.name })
                                            : t('hr_dashboard.start_building')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {canSwitchToCeo && (
                                        <Button 
                                            onClick={() => {
                                                roleSwitchForm.setData('company_id', company?.id || null);
                                                roleSwitchForm.post('/role/switch-to-ceo', {
                                                    onSuccess: () => {
                                                        // Will redirect to CEO dashboard
                                                    },
                                                });
                                            }}
                                            disabled={roleSwitchForm.processing}
                                            className="bg-purple-800 hover:bg-purple-700 text-white shadow-md ml-2"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            {roleSwitchForm.processing ? t('admin_ui.header.menu.switching') : t('hr_dashboard.switch_to_ceo_role')}
                                        </Button>
                                    )}
                                </div>
                            </div>


                            {/* Summary Cards - Enhanced UI */}
                            {activeProject && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Progress Card */}
                                    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        <CardContent className="p-6 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                                                    <TrendingUp className="w-7 h-7 text-primary" />
                                                </div>
                                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                                    {Math.round((progress.completed / progress.total) * 100)}%
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">{t('hr_dashboard.overall_progress')}</p>
                                                <p className="text-3xl font-bold text-foreground mb-2">
                                                    {progress.completed}<span className="text-xl text-muted-foreground">/{progress.total}</span>
                                                </p>
                                                <Progress 
                                                    value={(progress.completed / progress.total) * 100} 
                                                    className="h-2"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* CEO Survey Card */}
                                    <Card className="relative overflow-hidden border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        <CardContent className="p-6 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center shadow-md">
                                                    <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
                                                </div>
                                                {company && company.hasCeo && (
                                                    <Badge variant="outline" className="border-green-500/30 text-green-600">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        {t('hr_dashboard.ceo_assigned')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">{t('hr_dashboard.ceo_survey')}</p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {ceoPhilosophyStatus === 'completed' 
                                                        ? t('hr_dashboard.status.completed')
                                                        : ceoPhilosophyStatus === 'in_progress'
                                                        ? t('hr_dashboard.status.in_progress')
                                                        : t('hr_dashboard.status.not_started')}
                                                </p>
                                                {ceoPhilosophyStatus === 'completed' && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <span className="text-xs text-green-600">{t('hr_dashboard.verified')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Current Step Card */}
                                    <Card className="relative overflow-hidden border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        <CardContent className="p-6 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-md">
                                                    <Clock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                                                    {t('hr_dashboard.status.active')}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">{t('hr_dashboard.current_step')}</p>
                                                <p className="text-2xl font-bold text-foreground">{getCurrentStepName()}</p>
                                                {progress.currentStepKey && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {stepConfig.find(s => s.id === progress.currentStepKey)?.title}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Completion Time Card */}
                                    <Card className="relative overflow-hidden border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        <CardContent className="p-6 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-md">
                                                    <Award className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">{t('hr_dashboard.steps_remaining')}</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {progress.total - progress.completed}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {progress.completed === progress.total ? t('hr_dashboard.all_completed') : t('hr_dashboard.keep_going')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* No Project State */}
                            {!activeProject && (
                                <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                                    <CardContent className="p-12 text-center">
                                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">{t('hr_dashboard.get_started')}</h3>
                                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                            {t('hr_dashboard.get_started_desc')}
                                        </p>
                                        <Link href="/hr-manager/diagnosis">
                                            <Button size="lg" className="gap-2">
                                                {t('hr_dashboard.start_diagnosis')}
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* HR System Design Progress Bar */}
                            {activeProject && (
                                <ProgressTracker
                                    stepCards={stepConfig}
                                    stepStatuses={stepStatuses}
                                    getStepState={getStepState}
                                />
                            )}

                            {/* Design Steps Section - Enhanced Layout */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t('hr_dashboard.design_steps')}</h2>
                                        <p className="text-muted-foreground mt-1">
                                            {ceoPhilosophyStatus === 'completed' 
                                                ? t('hr_dashboard.unlock_next')
                                                : ceoPhilosophyStatus === 'in_progress'
                                                ? t('hr_dashboard.waiting_for_ceo_survey')
                                                : t('hr_dashboard.unlock_next')}
                                        </p>
                                    </div>
                                    {activeProject && (
                                        <Badge variant="outline" className="text-sm px-4 py-2">
                                            {t('hr_dashboard.completed_of_total', { completed: progress.completed, total: progress.total })}
                                        </Badge>
                                    )}
                                </div>
                                
                                {/* CEO Survey Pending Notice */}
                                {activeProject && stepStatuses['diagnosis'] === 'submitted' && ceoPhilosophyStatus !== 'completed' && (
                                    <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-yellow-600" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{t('hr_dashboard.waiting_for_ceo_survey_title')}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('hr_dashboard.waiting_for_ceo_survey_desc')}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {stepConfig.map((step) => {
                                        const state = getStepState(step.id);
                                        // If no project, Step 1 is 'not_started', others are 'locked'
                                        const status = activeProject 
                                            ? (stepStatuses[step.id] || 'not_started') as StepStatus
                                            : (step.id === 'diagnosis' ? 'not_started' : 'locked') as StepStatus;
                                        const route = getStepRoute(step.id);
                                        const isActuallyLocked = isStepActuallyLocked(step.id);
                                        const isCompleted = state === 'completed';
                                        const isCurrent = state === 'current';
                                        
                                        // Determine button label - "View" for submitted/completed steps, "Continue" for current
                                        const getButtonLabel = () => {
                                            if (status === 'submitted' || isCompleted) {
                                                return step.id === 'diagnosis' ? t('buttons.view') + ' \u2192' : t('buttons.review') + ' \u2192';
                                            }
                                            return t('buttons.continue') + ' \u2192';
                                        };
                                        
                                        return (
                                            <Card 
                                                key={step.id}
                                                className={cn(
                                                    "relative overflow-hidden transition-all duration-300",
                                                    isActuallyLocked
                                                        ? "opacity-60 border-muted/50 bg-muted/20" 
                                                        : isCurrent
                                                        ? "border-green-800/50 shadow-xl ring-2 ring-green-800/20 bg-green-50/30 dark:bg-green-950/10"
                                                        : isCompleted
                                                        ? "border-green-200/50 shadow-sm hover:shadow-md"
                                                        : "hover:shadow-lg border-border"
                                                )}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-800 via-green-800 to-green-800"></div>
                                                )}
                                                {isCompleted && !isCurrent && (
                                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-200/80 to-green-200"></div>
                                                )}
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-5">
                                                        {/* Icon */}
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                            isCurrent
                                                                ? "bg-green-800 text-white border-2 border-green-800 shadow-lg scale-105"
                                                                : isCompleted
                                                                ? "bg-green-100/50 text-green-500 border-2 border-green-200/50"
                                                                : isActuallyLocked
                                                                ? "bg-muted/60 text-muted-foreground/60"
                                                                : "bg-muted/40 text-muted-foreground"
                                                        )}>
                                                            {isCurrent ? (
                                                                <CheckCircle2 className="w-7 h-7 text-white" />
                                                            ) : isCompleted || status === 'submitted' ? (
                                                                <CheckCircle2 className="w-7 h-7 text-green-500" />
                                                            ) : isActuallyLocked ? (
                                                                <Lock className="w-7 h-7" />
                                                            ) : (
                                                                <step.icon className={cn(
                                                                    "w-7 h-7",
                                                                    isCurrent && "text-white"
                                                                )} />
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={cn(
                                                                        "text-xs",
                                                                        isCurrent && "border-green-500/40 text-green-700 bg-green-100 dark:bg-green-900/30",
                                                                        isCompleted && !isCurrent && "border-green-800 text-green-600 bg-green-50",
                                                                        isActuallyLocked && "border-muted text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {t('hr_dashboard.step_n', { n: step.step })}
                                                                </Badge>
                                                                {isCurrent && (
                                                                    <Badge className="bg-green-800 text-white border-green-800 shadow-md">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        {t('hr_dashboard.current_step')}
                                                                    </Badge>
                                                                )}
                                                                {isCompleted && !isCurrent && (
                                                                    <Badge className="border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        {t('hr_dashboard.status.completed')}
                                                                    </Badge>
                                                                )}
                                                                {status === 'submitted' && !isCurrent && !isCompleted && (
                                                                    <Badge className="border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        {t('hr_dashboard.status.submitted')}
                                                                    </Badge>
                                                                )}
                                                                {!isCurrent && !isCompleted && status !== 'submitted' && !isActuallyLocked && (
                                                                    <Badge className="bg-primary/10 text-primary border-primary/30">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {t('hr_dashboard.status.in_progress')}
                                                                    </Badge>
                                                                )}
                                                                {isActuallyLocked && (
                                                                    <Badge variant="outline" className="border-muted text-muted-foreground">
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        {t('hr_dashboard.status.locked')}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h3 className={cn(
                                                                "font-bold text-xl mb-2",
                                                                isCurrent ? "text-green-700 dark:text-green-400" : "text-foreground"
                                                            )}>
                                                                {step.title}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                                                            
                                                            {!isActuallyLocked && (
                                                                <Link href={route}>
                                                                    <Button 
                                                                        variant={isCurrent ? "default" : isCompleted ? "outline" : "default"}
                                                                        className={cn(
                                                                            "gap-2",
                                                                            isCurrent && "bg-green-800 hover:bg-green-600 text-white shadow-md",
                                                                            isCompleted && !isCurrent && "border-green-300 text-green-600 hover:text-green-600 hover:bg-green-50"
                                                                        )}
                                                                    >
                                                                        {getButtonLabel()}
                                                                        <ArrowRight className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {isActuallyLocked && (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Lock className="w-4 h-4" />
                                                                    <span>
                                                                        {ceoPhilosophyStatus !== 'completed' && stepStatuses['diagnosis'] === 'submitted'
                                                                            ? t('hr_dashboard.waiting_for_ceo_survey_completion')
                                                                            : t('hr_dashboard.complete_previous_unlock')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom Banner - Show if project exists and has current step, or if no project (show Step 1) */}
                            {((activeProject && progress.currentStepKey) || !activeProject) && (
                                <Card className="bg-primary text-primary-foreground border-primary shadow-lg">
                                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-lg">
                                                {activeProject ? t('hr_dashboard.ready_continue') : t('hr_dashboard.ready_start')}
                                            </p>
                                            <p className="text-sm opacity-90 mt-1">
                                                {activeProject 
                                                    ? t('hr_dashboard.ready_continue_desc')
                                                    : t('hr_dashboard.ready_start_desc')}
                                            </p>
                                        </div>
                                        <Link href={getCurrentStepRoute()}>
                                            <Button variant="secondary" size="lg" className="whitespace-nowrap">
                                                {activeProject ? t('hr_dashboard.continue_step', { step: getCurrentStepName() }) : t('hr_dashboard.start_step_1')} →
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
        </AppLayout>
    );
}
