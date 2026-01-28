import { Head, Link, router } from '@inertiajs/react';
import { Building2, Briefcase, Users, Settings, MessageSquare, FileText, ArrowRight, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';

interface Company {
    id: number;
    name: string;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
}

interface BusinessProfile {
    id?: number;
}

interface Workforce {
    id?: number;
}

interface CurrentHrStatus {
    id?: number;
}

interface Culture {
    id?: number;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    id?: number;
}

interface Project {
    id: number;
    status: string;
    current_step?: string | null;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
    stepStatuses?: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
}

const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;

export default function DiagnosisOverview({ company, project, stepStatuses }: PageProps) {
    // Always show Overview page - no redirects
    // Use actual project or null
    const currentProject = project;

    // Determine status from step_statuses if available, otherwise from project status
    const diagnosisStatus = stepStatuses?.diagnosis || (currentProject?.status === 'in_progress' ? 'in_progress' : (currentProject?.status === 'submitted' ? 'submitted' : 'not_started'));
    
    const status: 'not_started' | 'in_progress' | 'submitted' = 
        diagnosisStatus === 'in_progress' ? 'in_progress' :
        diagnosisStatus === 'submitted' ? 'submitted' :
        'not_started';

    // Calculate step completion status - handle null company/project
    const stepStatus = {
        'company-info': Boolean(
            company?.name &&
            company?.foundation_date &&
            company?.hq_location &&
            company?.industry
        ),
        'business-profile': Boolean(project?.business_profile),
        'workforce': Boolean(project?.workforce),
        'current-hr': Boolean(project?.current_hr_status),
        'culture': Boolean(project?.culture && (project.culture.core_values || []).length > 0),
        'confidential': Boolean(project?.confidential_note),
        'review': Boolean(project?.current_step && project.current_step !== 'diagnosis'),
    };

    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 7; // Overview + 6 steps + Review
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    const handleStartDiagnosis = () => {
        // If project exists, call continueStep which will automatically redirect to company-info
        if (currentProject?.id) {
            router.post(`/diagnosis/${currentProject.id}/continue`);
        } else {
            // First reload to trigger auto-creation
            router.reload({
                only: ['company', 'project'],
                onSuccess: (page) => {
                    // After reload, check if project was created
                    const project = (page.props as any).project;
                    if (project?.id) {
                        // Project created, call continue which will automatically redirect to company-info
                        router.post(`/diagnosis/${project.id}/continue`);
                    }
                }
            });
        }
    };

    const handleContinue = () => {
        if (currentProject?.id) {
            // Call continueStep to set status to in_progress
            router.post(`/diagnosis/${currentProject.id}/continue`);
        } else {
            handleStartDiagnosis();
        }
    };

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/diagnosis` },
        { id: 'company-info' as TabId, name: 'Company Info', icon: Building2, route: currentProject?.id ? `/diagnosis/${currentProject.id}/company-info` : '#' },
        { id: 'business-profile' as TabId, name: 'Business Profile', icon: Briefcase, route: currentProject?.id ? `/diagnosis/${currentProject.id}/business-profile` : '#' },
        { id: 'workforce' as TabId, name: 'Workforce', icon: Users, route: currentProject?.id ? `/diagnosis/${currentProject.id}/workforce` : '#' },
        { id: 'current-hr' as TabId, name: 'Current HR', icon: Settings, route: currentProject?.id ? `/diagnosis/${currentProject.id}/current-hr` : '#' },
        { id: 'culture' as TabId, name: 'Culture', icon: MessageSquare, route: currentProject?.id ? `/diagnosis/${currentProject.id}/culture` : '#' },
        { id: 'confidential' as TabId, name: 'Confidential', icon: FileText, route: currentProject?.id ? `/diagnosis/${currentProject.id}/confidential` : '#' },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: currentProject?.id ? `/diagnosis/${currentProject.id}/review` : '#' },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 1: Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref="/hr-manager/dashboard"
                    />

                    <DiagnosisProgressBar
                        stepName="Overview"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="overview"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={currentProject?.id}
                    />

                    {/* Overview Card - Matching HTML Structure */}
                    <Card>
                        <CardContent className="p-8 text-center space-y-6">
                            {/* Blue Icon */}
                            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>

                            {/* Title and Description */}
                            <div>
                                <h2 className="text-2xl font-display font-bold mb-2">Company Diagnosis</h2>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    {status === 'in_progress' 
                                        ? 'You have started the Diagnosis process. Complete all sections below and submit when ready.'
                                        : status === 'submitted'
                                        ? 'Diagnosis has been completed and submitted. Waiting for CEO verification to unlock Step 2.'
                                        : 'In this step, you\'ll provide comprehensive information about your company, including business profile, workforce composition, current HR systems, and organizational culture. This data will serve as the foundation for designing your HR system.'}
                                </p>
                            </div>

                            {/* Step Tags - Using Badge Component with secondary variant */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Company Info
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Business Profile
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Workforce
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Current HR
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Culture
                                </Badge>
                            </div>

                            {/* Start Diagnosis Button */}
                            {status === 'submitted' ? (
                                <div className="pt-4">
                                    <Badge className="bg-success/10 text-success border-success/20 px-4 py-1.5">
                                        Submitted - Waiting for CEO Verification
                                    </Badge>
                                </div>
                            ) : (
                                <Button 
                                    onClick={handleStartDiagnosis}
                                    size="lg"
                                    className="h-11 px-8 cursor-pointer"
                                >
                                    Start Diagnosis
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
