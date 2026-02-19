import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Calendar, CheckCircle2, Target, DollarSign, Building2, UserPlus, Mail, X, Award, Sparkles, Clock, ArrowRight, Lock, Copy, Eye, EyeOff } from 'lucide-react';
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

// All 5 steps matching sidebar: Diagnosis, Job Analysis, Performance, Compensation, HR Policy OS
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
        id: 'hr_policy_os' as StepKey,
        step: 5,
        title: 'HR Policy OS',
        desc: 'HR Policy Manual, System Handbook, Implementation Roadmap, and Analytics Blueprint.',
        icon: Award,
    },
];

export default function HrManagerDashboard({ user, activeProject, company, progress, ceoPhilosophyStatus }: Props) {
    const stepStatuses = activeProject?.step_statuses ?? {};
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCustomPassword, setShowCustomPassword] = useState(false);
    const [ceoCredentials, setCeoCredentials] = useState<{name: string; email: string; password: string} | null>(null);
    
    const { flash } = usePage().props as any;
    const [createImmediately, setCreateImmediately] = useState(false);
    const [useCustomPassword, setUseCustomPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        hr_project_id: activeProject?.id || null,
        create_immediately: false,
    });

    // Check for CEO credentials in flash message
    useEffect(() => {
        if (flash?.ceo_password && flash?.ceo_email && flash?.ceo_name) {
            setCeoCredentials({
                name: flash.ceo_name,
                email: flash.ceo_email,
                password: flash.ceo_password,
            });
            setShowPasswordDialog(true);
        }
    }, [flash]);

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        if (company) {
            // Update hr_project_id before submitting
            setData('hr_project_id', activeProject?.id || null);
            setData('create_immediately', createImmediately);
            // Only send password if using custom password
            if (!useCustomPassword) {
                setData('password', '');
            }
            post(`/companies/${company.id}/invite-ceo`, {
                onSuccess: () => {
                    reset();
                    setCreateImmediately(false);
                    setUseCustomPassword(false);
                    setShowCustomPassword(false);
                    setShowInviteDialog(false);
                },
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
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
            
            // Check if all previous steps are approved/completed to unlock this step
            let allPreviousCompleted = true;
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = STEP_CONFIG[i];
                const prevStatus = stepStatuses[prevStep.id] as StepStatus | undefined;
                
                // For diagnosis, need both submitted and CEO survey done
                if (prevStep.id === 'diagnosis') {
                    const prevDiagnosisStatus = stepStatuses['diagnosis'] as StepStatus | undefined;
                    const prevIsSubmitted = prevDiagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(prevDiagnosisStatus);
                    if (!prevIsSubmitted || !isCeoSurveyCompleted) {
                        allPreviousCompleted = false;
                        break;
                    }
                } else {
                    // For other steps (including performance), must be APPROVED by CEO to unlock next step
                    // Step 4 (compensation) requires Step 3 (performance) to be approved
                    if (!prevStatus || !['approved', 'locked', 'completed'].includes(prevStatus)) {
                        allPreviousCompleted = false;
                        break;
                    }
                }
            }
            
            // If all previous approved/completed and this step is in_progress or not_started, it's current
            if (allPreviousCompleted) {
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
    const isStepActuallyLocked = (stepKey: StepKey): boolean => {
        if (!activeProject) {
            return stepKey !== 'diagnosis';
        }
        
        // If step is submitted or completed, it should NOT be locked (accessible for review/view)
        const status = stepStatuses[stepKey] as StepStatus | undefined;
        if (status && ['submitted', 'approved', 'locked', 'completed'].includes(status)) {
            return false; // Submitted/completed steps are accessible for HR to view
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
        <AppLayout>
            <Head title="HR Manager Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="space-y-8">
                            {/* Welcome Section */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {user.name}</h1>
                                    <p className="text-muted-foreground text-lg">
                                        {activeProject 
                                            ? `Continue building ${activeProject.company.name}'s HR system.`
                                            : 'Start building your company\'s HR system.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {activeProject && (
                                        <Badge variant="outline" className="text-sm px-4 py-2">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Active Project
                                        </Badge>
                                    )}
                                    {company && !company.hasCeo && (
                                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-green-800 hover:bg-green-700 text-white shadow-md">
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Invite CEO for Project
                                                </Button>
                                            </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Create & Invite CEO for HR Project</DialogTitle>
                                                        <DialogDescription>
                                                            {activeProject 
                                                                ? `Create a CEO account or invite a CEO to join ${company.name} and complete the Management Philosophy Survey for this HR project.`
                                                                : `Create a CEO account or invite a CEO to join ${company.name}. Once you create a project, the CEO will be assigned to it.`}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={handleInviteCeo} className="space-y-4">
                                                        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                            <Checkbox
                                                                id="create-immediately"
                                                                checked={createImmediately}
                                                                onCheckedChange={(checked) => {
                                                                    setCreateImmediately(checked === true);
                                                                    if (!checked) {
                                                                        setData('name', '');
                                                                    }
                                                                }}
                                                            />
                                                            <Label htmlFor="create-immediately" className="text-sm font-medium cursor-pointer">
                                                                Create CEO account immediately (will send welcome email with credentials)
                                                            </Label>
                                                        </div>

                                                        {createImmediately && (
                                                            <>
                                                                <div>
                                                                    <Label htmlFor="ceo-name">CEO Name *</Label>
                                                                    <Input
                                                                        id="ceo-name"
                                                                        type="text"
                                                                        value={data.name}
                                                                        onChange={(e) => setData('name', e.target.value)}
                                                                        placeholder="John Doe"
                                                                        required={createImmediately}
                                                                        className={errors.name ? 'border-red-500' : ''}
                                                                    />
                                                                    {errors.name && (
                                                                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                                    <Checkbox
                                                                        id="use-custom-password"
                                                                        checked={useCustomPassword}
                                                                        onCheckedChange={(checked) => {
                                                                            setUseCustomPassword(checked === true);
                                                                            if (!checked) {
                                                                                setData('password', '');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor="use-custom-password" className="text-sm font-medium cursor-pointer">
                                                                        Set custom password (leave unchecked to auto-generate)
                                                                    </Label>
                                                                </div>
                                                                {useCustomPassword && (
                                                                    <div>
                                                                        <Label htmlFor="ceo-password">Password *</Label>
                                                                        <div className="relative">
                                                                            <Input
                                                                                id="ceo-password"
                                                                                type={showCustomPassword ? "text" : "password"}
                                                                                value={data.password}
                                                                                onChange={(e) => setData('password', e.target.value)}
                                                                                placeholder="Minimum 8 characters"
                                                                                required={useCustomPassword}
                                                                                minLength={8}
                                                                                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setShowCustomPassword(!showCustomPassword)}
                                                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                                            >
                                                                                {showCustomPassword ? (
                                                                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                                                ) : (
                                                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                        {errors.password && (
                                                                            <p className="text-sm text-destructive mt-1">{errors.password}</p>
                                                                        )}
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Password must be at least 8 characters long.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        <div>
                                                            <Label htmlFor="ceo-email">CEO Email Address *</Label>
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
                                                            {activeProject && (
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    {createImmediately 
                                                                        ? `CEO account will be created and linked to the active HR project for ${company.name}.`
                                                                        : `This invitation will be linked to the active HR project for ${company.name}.`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setShowInviteDialog(false);
                                                                    reset();
                                                                    setCreateImmediately(false);
                                                                    setUseCustomPassword(false);
                                                                    setShowCustomPassword(false);
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                                                {processing 
                                                                    ? (createImmediately ? 'Creating...' : 'Sending...') 
                                                                    : (createImmediately ? 'Create & Assign CEO' : 'Send Invitation')}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>

                            {/* Password Display Dialog */}
                            {ceoCredentials && (
                                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                CEO Account Created Successfully
                                            </DialogTitle>
                                            <DialogDescription>
                                                The CEO account has been created and assigned to {company?.name}. Please save these credentials securely.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="p-4 bg-muted rounded-lg space-y-3">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground uppercase">Name</Label>
                                                    <p className="text-sm font-medium mt-1">{ceoCredentials.name}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-sm font-medium flex-1">{ceoCredentials.email}</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(ceoCredentials.email)}
                                                            className="h-7 px-2"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground uppercase">Password</Label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex-1 flex items-center gap-2 p-2 bg-background border rounded-md">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                value={ceoCredentials.password}
                                                                readOnly
                                                                className="border-0 p-0 h-auto font-mono text-sm bg-transparent"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(ceoCredentials.password)}
                                                            className="h-7 px-2"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                                    <strong>Important:</strong> A welcome email with these credentials has been sent to the CEO. 
                                                    Please ensure they receive this information securely.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => {
                                                    setShowPasswordDialog(false);
                                                    setCeoCredentials(null);
                                                    setShowPassword(false);
                                                }}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}

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
                                                {company && company.hasCeo && (
                                                    <Badge variant="outline" className="border-green-500/30 text-green-600">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        CEO Assigned
                                                    </Badge>
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
                                        
                                        // Determine button label - "View" for submitted/completed steps, "Continue" for current
                                        const getButtonLabel = () => {
                                            if (status === 'submitted' || isCompleted) {
                                                return step.id === 'diagnosis' ? 'View →' : 'Review →';
                                            }
                                            return 'Continue →';
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
                                                                    Step {step.step}
                                                                </Badge>
                                                                {isCurrent && (
                                                                    <Badge className="bg-green-800 text-white border-green-800 shadow-md">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Current Step
                                                                    </Badge>
                                                                )}
                                                                {isCompleted && !isCurrent && (
                                                                    <Badge className="bg-green-50 text-green-600 border-green-200">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Completed
                                                                    </Badge>
                                                                )}
                                                                {status === 'submitted' && !isCurrent && !isCompleted && (
                                                                    <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Submitted
                                                                    </Badge>
                                                                )}
                                                                {!isCurrent && !isCompleted && status !== 'submitted' && !isActuallyLocked && (
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
                                                                            isCompleted && !isCurrent && "border-green-300 text-green-600 hover:bg-green-50"
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
        </AppLayout>
    );
}
