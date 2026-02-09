import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Users, Calendar, CheckCircle2, Target, DollarSign, Building2, UserPlus, Mail, X, Award } from 'lucide-react';
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
    
    // Determine step states
    const getStepState = (stepKey: StepKey): 'current' | 'locked' | 'completed' => {
        // If no project, only Step 1 (Diagnosis) is available
        if (!activeProject) {
            return stepKey === 'diagnosis' ? 'current' : 'locked';
        }
        
        const stepIndex = STEP_CONFIG.findIndex(s => s.id === stepKey);
        const status = stepStatuses[stepKey] as StepStatus | undefined;
        
        // If step is completed (submitted/approved/locked), it's completed and enabled
        if (status && ['submitted', 'approved', 'locked', 'completed'].includes(status)) {
            return 'completed';
        }
        
        // Check if this is the current step (in progress or not started)
        if (progress.currentStepKey === stepKey) {
            return 'current';
        }
        
        // All other steps are locked (only completed and current steps are enabled)
        return 'locked';
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
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h1>
                                <p className="text-muted-foreground mt-2 text-base">
                                    Continue building your company's HR system.
                                </p>
                            </div>

                            {/* Summary Cards - Only show if project exists */}
                            {activeProject && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="w-7 h-7 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                                                <p className="text-2xl font-bold text-foreground">{progress.completed}/{progress.total}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-1">CEO Survey</p>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {ceoPhilosophyStatus === 'completed' 
                                                        ? 'Completed' 
                                                        : ceoPhilosophyStatus === 'in_progress'
                                                        ? 'In Progress'
                                                        : 'Not Started'}
                                                </p>
                                            </div>
                                            {company && !company.hasCeo && (
                                                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                            <UserPlus className="w-4 h-4" />
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
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Current Step</p>
                                                <p className="text-2xl font-bold text-foreground">{getCurrentStepName()}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* HR System Design Progress Bar */}
                            {activeProject && (
                                <ProgressTracker
                                    stepCards={STEP_CONFIG}
                                    stepStatuses={stepStatuses}
                                    getStepState={getStepState}
                                />
                            )}

                            {/* Design Steps Section - Modern Card Layout */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-foreground">Design Steps</h2>
                                <div className="space-y-4">
                                    {STEP_CONFIG.map((step) => {
                                        const state = getStepState(step.id);
                                        // If no project, Step 1 is 'not_started', others are 'locked'
                                        const status = activeProject 
                                            ? (stepStatuses[step.id] || 'not_started') as StepStatus
                                            : (step.id === 'diagnosis' ? 'not_started' : 'locked') as StepStatus;
                                        const route = getStepRoute(step.id);
                                        
                                        return (
                                            <StepCard
                                                key={step.id}
                                                step={step}
                                                state={state}
                                                status={status}
                                                isVerified={false}
                                                route={route}
                                            />
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
