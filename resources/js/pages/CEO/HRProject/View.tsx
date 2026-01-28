import { Head, router, usePage } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CheckCircle2, Clock, Lock, ArrowRight, FileText, Building2, Briefcase, Users, Settings, MessageSquare } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    industry?: string | null;
}

interface HrManager {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    status: string;
    company: Company;
    business_profile?: any;
    workforce?: any;
    current_hr_status?: any;
    culture?: any;
    confidential_note?: any;
}

interface PageProps {
    project: Project;
    hrManager: HrManager | null;
    stepStatuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
    ceoPhilosophyStatus: 'not_started' | 'submitted' | 'completed' | 'locked' | 'in_progress';
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
}

export default function CEOHRProjectView({
    project,
    hrManager,
    stepStatuses,
    ceoPhilosophyStatus,
    completedSteps,
    totalSteps,
    progressPercentage
}: PageProps) {
    const handleStartSurvey = () => {
        if (project?.id) {
            router.visit(`/hr-projects/${project.id}/ceo-philosophy`);
        }
    };

    const getStepIcon = (step: string, status: string) => {
        if (status === 'submitted') {
            return <CheckCircle2 className="w-5 h-5 text-success" />;
        } else if (status === 'in_progress') {
            return <Clock className="w-5 h-5 text-blue-500" />;
        } else {
            return <Lock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStepBadge = (status: string) => {
        if (status === 'submitted') {
            return <Badge className="bg-success/10 text-success"><CheckCircle2 className="w-3 h-3 mr-1" />Submitted</Badge>;
        } else if (status === 'in_progress') {
            return <Badge className="bg-blue-500/10 text-blue-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
        } else {
            return <Badge variant="outline"><Lock className="w-3 h-3 mr-1" />Not Started</Badge>;
        }
    };

    const steps = [
        {
            key: 'diagnosis',
            name: 'Step 1: Diagnosis',
            description: 'Company information, business profile, workforce details, and organizational culture',
            icon: FileText,
        },
        {
            key: 'organization',
            name: 'Step 2: Organization Design',
            description: 'Organization structure, job grades, titles, and managerial roles',
            icon: Building2,
        },
        {
            key: 'performance',
            name: 'Step 3: Performance System',
            description: 'Evaluation units, performance management methods, and assessment structures',
            icon: Briefcase,
        },
        {
            key: 'compensation',
            name: 'Step 4: Compensation System',
            description: 'Compensation structure, differentiation methods, and incentive components',
            icon: Users,
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />
            
            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="HR Project Details" />
                
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/ceo/dashboard')}
                                className="mb-4 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <h1 className="text-3xl font-display font-bold tracking-tight">
                                HR Project Details
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Review HR Manager progress and complete survey
                            </p>
                        </div>
                    </div>

                    {/* HR Manager Info Card */}
                    {hrManager && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <CardTitle>HR Manager Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                                        <p className="text-base font-semibold">{hrManager.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                                        <p className="text-base font-semibold">{hrManager.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Company</p>
                                        <p className="text-base font-semibold">{project.company.name}</p>
                                    </div>
                                    {project.company.industry && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                                            <p className="text-base font-semibold">{project.company.industry}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Progress Overview Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Overall Progress</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completed Steps</span>
                                    <span className="text-lg font-bold">{completedSteps} / {totalSteps}</span>
                                </div>
                                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    {progressPercentage}% Complete
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Steps Details Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Step Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {steps.map((step, index) => {
                                    const status = stepStatuses[step.key as keyof typeof stepStatuses];
                                    const Icon = step.icon;
                                    
                                    return (
                                        <div key={step.key} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="mt-1">
                                                        {getStepIcon(step.key, status)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-semibold text-base">{step.name}</h3>
                                                            {getStepBadge(status)}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Start Survey Card */}
                    {stepStatuses.diagnosis === 'submitted' && ceoPhilosophyStatus !== 'completed' && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <CardTitle>Management Philosophy Survey</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    HR Manager has completed Step 1: Diagnosis. Please complete the Management Philosophy Survey to verify and unlock Step 2.
                                </p>
                                <Button 
                                    onClick={handleStartSurvey} 
                                    size="lg" 
                                    className="w-full cursor-pointer"
                                >
                                    Start Survey
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Survey Completed Message */}
                    {ceoPhilosophyStatus === 'completed' && (
                        <Card className="border-success/20 bg-success/5">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                    <CardTitle>Survey Completed</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    ✓ Diagnosis verified. Step 2: Organization Design has been unlocked for HR Manager.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
