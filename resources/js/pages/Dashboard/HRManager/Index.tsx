import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Calendar, CheckCircle2, Target, DollarSign, Building2, UserPlus, Mail, X, Award, Sparkles, Clock, ArrowRight, Lock } from 'lucide-react';
import ProgressTracker from '@/components/Dashboard/HRManager/ProgressTracker';
import StepCard from '@/components/Dashboard/HRManager/StepCard';
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
}

// All 6 steps matching sidebar: Diagnosis, Job Analysis, Performance, Compensation, TREE, Conclusion
const STEP_CONFIG = [
    {
        id: 'diagnosis' as StepKey,
        step: 1,
        title: 'Diagnosis',
        desc: 'Input company information, business profile, workforce details, and organizational culture.',
        icon: CheckCircle2,
    },
    {
        id: 'job_analysis' as StepKey,
        step: 2,
        title: 'Job Analysis',
        desc: 'Define job roles, responsibilities, competencies, and organizational mapping.',
        icon: Building2,
    },
    {
        id: 'performance' as StepKey,
        step: 3,
        title: 'Performance System',
        desc: 'Design evaluation units, performance management methods, and assessment structures.',
        icon: Target,
    },
    {
        id: 'compensation' as StepKey,
        step: 4,
        title: 'Compensation System',
        desc: 'Define compensation structure, differentiation methods, and incentive components.',
        icon: DollarSign,
    },
    {
        id: 'tree' as StepKey,
        step: 5,
        title: 'TREE',
        desc: 'Talent Review, Evaluation, and Enhancement system.',
        icon: TrendingUp,
    },
    {
        id: 'conclusion' as StepKey,
        step: 6,
        title: 'Conclusion',
        desc: 'Final review, approval, and system implementation summary.',
        icon: Award,
    },
];

export default function HrManagerDashboard({ user, activeProject, company, progress, ceoPhilosophyStatus }: Props) {
    const stepStatuses = activeProject?.step_statuses ?? {};
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        if (company) {
            post(`/companies/${company.id}/invite-ceo`, {
                onSuccess: () => {
                    reset();
                    setShowInviteDialog(false);
                },
            });
        }
    };
    
    // Determine step states with proper unlock logic
    const getStepState = (stepKey: StepKey): 'current' | 'locked' | 'completed' => {
        // If no project, only Step 1 (Diagnosis) is available
        if (!activeProject) {
            return stepKey === 'diagnosis' ? 'current' : 'locked';
        }
        
        const stepIndex = STEP_CONFIG.findIndex(s => s.id === stepKey);
        const status = stepStatuses[stepKey] as StepStatus | undefined;
        const diagnosisStatus = stepStatuses['diagnosis'] as StepStatus | undefined;
        const isDiagnosisSubmitted = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // If step is actually completed (submitted/approved/locked), it's completed
        if (status && ['submitted', 'approved', 'locked', 'completed'].includes(status)) {
            return 'completed';
        }
        
        // Check if this is the current step (in progress or not started)
        // But only if CEO survey is completed OR diagnosis is not yet submitted
        if (!isDiagnosisSubmitted || isCeoSurveyCompleted) {
            if (progress.currentStepKey === stepKey) {
                return 'current';
            }
        }
        
        // Check if previous steps are completed to unlock this step
        // Only unlock if CEO survey is completed
        if (isCeoSurveyCompleted && stepIndex > 0) {
            let allPreviousCompleted = true;
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = STEP_CONFIG[i];
                const prevStatus = stepStatuses[prevStep.id] as StepStatus | undefined;
                if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) {
                    allPreviousCompleted = false;
                    break;
                }
            }
            // If all previous steps are completed and this step is not started, it's current
            if (allPreviousCompleted && (!status || status === 'not_started')) {
                return 'current';
            }
        }
        
        // All other steps are locked
        return 'locked';
    };
    
    // Check if steps should be visually locked
    const isStepActuallyLocked = (stepKey: StepKey): boolean => {
        if (!activeProject) {
            return stepKey !== 'diagnosis';
        }
        
        const diagnosisStatus = stepStatuses['diagnosis'] as StepStatus | undefined;
        const isDiagnosisSubmitted = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // If diagnosis is submitted but CEO survey not done, all steps except diagnosis are locked
        if (isDiagnosisSubmitted && !isCeoSurveyCompleted && stepKey !== 'diagnosis') {
            return true;
        }
        
        // Otherwise use normal lock logic
        const state = getStepState(stepKey);
        return state === 'locked';
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
                return `/hr-manager/job-analysis/${activeProject.id}/intro`;
            case 'performance':
                return `/hr-manager/performance-system/${activeProject.id}/overview`;
            case 'compensation':
                return `/hr-manager/compensation-system/${activeProject.id}/overview`;
            case 'tree':
                return `/hr-manager/tree/${activeProject.id}/overview`;
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
        const step = STEP_CONFIG.find(s => s.id === progress.currentStepKey);
        return step ? `Step ${step.step}` : 'Step 1';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-muted/30">
                    <Head title="HR Manager Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="space-y-8">
                            {/* Welcome Section */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {user.name}</h1>
                                    <p className="text-muted-foreground text-lg">
                                        {activeProject 
                                            ? `Continue building ${activeProject.company.name}'s HR system.`
                                            : 'Start building your company\'s HR system.'}
                                    </p>
                                </div>
                                {activeProject && (
                                    <Badge variant="outline" className="text-sm px-4 py-2">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Active Project
                                    </Badge>
                                )}
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
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Progress</p>
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
                                                {company && !company.hasCeo && (
                                                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-green-500/30 hover:bg-green-500/10">
                                                                <UserPlus className="w-4 h-4 text-green-600" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Invite CEO</DialogTitle>
                                                                <DialogDescription>
                                                                    Invite a CEO to join {company.name} and complete the survey.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={handleInviteCeo} className="space-y-4">
                                                                <div>
                                                                    <Label htmlFor="ceo-email">CEO Email Address</Label>
                                                                    <Input
                                                                        id="ceo-email"
                                                                        type="email"
                                                                        value={data.email}
                                                                        onChange={(e) => setData('email', e.target.value)}
                                                                        placeholder="ceo@example.com"
                                                                        required
                                                                        className={errors.email ? 'border-red-500' : ''}
                                                                    />
                                                                    {errors.email && (
                                                                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setShowInviteDialog(false);
                                                                            reset();
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button type="submit" disabled={processing}>
                                                                        {processing ? 'Sending...' : 'Send Invitation'}
                                                                    </Button>
                                                                </div>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">CEO Survey</p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {ceoPhilosophyStatus === 'completed' 
                                                        ? 'Completed' 
                                                        : ceoPhilosophyStatus === 'in_progress'
                                                        ? 'In Progress'
                                                        : 'Not Started'}
                                                </p>
                                                {ceoPhilosophyStatus === 'completed' && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <span className="text-xs text-green-600">Verified</span>
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
                                                    Active
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Current Step</p>
                                                <p className="text-2xl font-bold text-foreground">{getCurrentStepName()}</p>
                                                {progress.currentStepKey && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {STEP_CONFIG.find(s => s.id === progress.currentStepKey)?.title}
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
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Steps Remaining</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {progress.total - progress.completed}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {progress.completed === progress.total ? 'All completed!' : 'Keep going!'}
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
                                        <h3 className="text-2xl font-bold mb-2">Get Started</h3>
                                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                            Start your HR system design journey by creating a new project and completing the Diagnosis step.
                                        </p>
                                        <Link href="/hr-manager/diagnosis">
                                            <Button size="lg" className="gap-2">
                                                Start Diagnosis
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* HR System Design Progress Bar */}
                            {activeProject && (
                                <ProgressTracker
                                    stepCards={STEP_CONFIG}
                                    stepStatuses={stepStatuses}
                                    getStepState={getStepState}
                                />
                            )}

                            {/* Design Steps Section - Enhanced Layout */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-foreground">Design Steps</h2>
                                        <p className="text-muted-foreground mt-1">
                                            {ceoPhilosophyStatus === 'completed' 
                                                ? 'Complete each step to unlock the next one'
                                                : ceoPhilosophyStatus === 'in_progress'
                                                ? 'Waiting for CEO to complete the survey...'
                                                : 'Complete each step to unlock the next one'}
                                        </p>
                                    </div>
                                    {activeProject && (
                                        <Badge variant="outline" className="text-sm px-4 py-2">
                                            {progress.completed} of {progress.total} completed
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
                                                    <p className="font-medium text-foreground">Waiting for CEO Survey</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Diagnosis has been submitted. All steps are ready but locked until CEO completes the Management Philosophy Survey.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {STEP_CONFIG.map((step) => {
                                        const state = getStepState(step.id);
                                        // If no project, Step 1 is 'not_started', others are 'locked'
                                        const status = activeProject 
                                            ? (stepStatuses[step.id] || 'not_started') as StepStatus
                                            : (step.id === 'diagnosis' ? 'not_started' : 'locked') as StepStatus;
                                        const route = getStepRoute(step.id);
                                        const isActuallyLocked = isStepActuallyLocked(step.id);
                                        const isCompleted = state === 'completed';
                                        const isCurrent = state === 'current';
                                        
                                        return (
                                            <Card 
                                                key={step.id}
                                                className={cn(
                                                    "relative overflow-hidden transition-all duration-300",
                                                    isActuallyLocked
                                                        ? "opacity-60 border-muted/50 bg-muted/20" 
                                                        : isCurrent
                                                        ? "border-primary/50 shadow-lg ring-2 ring-primary/10"
                                                        : isCompleted
                                                        ? "border-green-500/30 shadow-md hover:shadow-lg"
                                                        : "hover:shadow-lg border-border"
                                                )}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
                                                )}
                                                {isCompleted && (
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-green-500/80 to-green-500/60"></div>
                                                )}
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-5">
                                                        {/* Icon */}
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                            isCompleted
                                                                ? "bg-green-500/10 text-green-600 border-2 border-green-500/20"
                                                                : isCurrent
                                                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                                                : isActuallyLocked
                                                                ? "bg-muted/60 text-muted-foreground/60"
                                                                : "bg-muted/40 text-muted-foreground"
                                                        )}>
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                                                            ) : isActuallyLocked ? (
                                                                <Lock className="w-7 h-7" />
                                                            ) : (
                                                                <step.icon className={cn(
                                                                    "w-7 h-7",
                                                                    isCurrent && "text-primary-foreground"
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
                                                                        isCompleted && "border-green-500/30 text-green-600 bg-green-500/10",
                                                                        isCurrent && "border-primary/30 text-primary bg-primary/10",
                                                                        isActuallyLocked && "border-muted text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Step {step.step}
                                                                </Badge>
                                                                {isCompleted && (
                                                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Completed
                                                                    </Badge>
                                                                )}
                                                                {isCurrent && !isCompleted && (
                                                                    <Badge className="bg-primary/10 text-primary border-primary/30">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        In Progress
                                                                    </Badge>
                                                                )}
                                                                {isActuallyLocked && (
                                                                    <Badge variant="outline" className="border-muted text-muted-foreground">
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        Locked
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h3 className="font-bold text-xl mb-2 text-foreground">{step.title}</h3>
                                                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                                                            
                                                            {!isActuallyLocked && (
                                                                <Link href={route}>
                                                                    <Button 
                                                                        variant={isCompleted ? "outline" : "default"}
                                                                        className={cn(
                                                                            "gap-2",
                                                                            isCompleted && "border-green-500/30 text-green-600 hover:bg-green-500/10"
                                                                        )}
                                                                    >
                                                                        {isCompleted ? 'Review' : 'Continue'}
                                                                        <ArrowRight className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {isActuallyLocked && (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Lock className="w-4 h-4" />
                                                                    <span>
                                                                        {ceoPhilosophyStatus !== 'completed' && stepStatuses['diagnosis'] === 'submitted'
                                                                            ? 'Waiting for CEO survey completion'
                                                                            : 'Complete previous steps to unlock'}
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
                                                {activeProject ? 'Ready to continue?' : 'Ready to start?'}
                                            </p>
                                            <p className="text-sm opacity-90 mt-1">
                                                {activeProject 
                                                    ? 'Pick up where you left off and complete your HR system design.'
                                                    : 'Begin your HR system design by starting with the Diagnosis step.'}
                                            </p>
                                        </div>
                                        <Link href={getCurrentStepRoute()}>
                                            <Button variant="secondary" size="lg" className="whitespace-nowrap">
                                                {activeProject ? `Continue ${getCurrentStepName()}` : 'Start Step 1'} →
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
