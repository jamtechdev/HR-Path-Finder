import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, CheckCircle2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    annual_revenue?: string | null;
    operational_margin_rate?: string | null;
    business_type?: string | null;
}

interface Workforce {
    id?: number;
    headcount_current?: number | null;
    total_employees?: number | null;
}

interface CurrentHrStatus {
    id?: number;
    dedicated_hr_team?: boolean | null;
    evaluation_system_status?: string | null;
}

interface Culture {
    id?: number;
    work_format?: string | null;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    id?: number;
    notes?: string | null;
}

interface Project {
    id: number;
    status: string;
    company: Company;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

export default function Review({ company, project }: PageProps) {
    const form = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/diagnosis/${project.id}/submit`, {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect to dashboard after successful submission
                router.visit('/hr-manager/dashboard');
            },
        });
    };

    const stepStatus = {
        'company-info': true,
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(project.current_hr_status),
        'culture': Boolean(project.culture),
        'confidential': Boolean(project.confidential_note),
        'review': true,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 7;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        project.status === 'not_started' ? 'not_started' : 
        project.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/diagnosis` },
        { id: 'company-info' as TabId, name: 'Company Info', icon: Building2, route: `/diagnosis/${project.id}/company-info` },
        { id: 'business-profile' as TabId, name: 'Business Profile', icon: Briefcase, route: `/diagnosis/${project.id}/business-profile` },
        { id: 'workforce' as TabId, name: 'Workforce', icon: Users, route: `/diagnosis/${project.id}/workforce` },
        { id: 'current-hr' as TabId, name: 'Current HR', icon: Settings, route: `/diagnosis/${project.id}/current-hr` },
        { id: 'culture' as TabId, name: 'Culture', icon: MessageSquare, route: `/diagnosis/${project.id}/culture` },
        { id: 'confidential' as TabId, name: 'Confidential', icon: FileText, route: `/diagnosis/${project.id}/confidential` },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: `/diagnosis/${project.id}/review` },
    ];

    const sections = [
        {
            id: 'company-info',
            title: 'Company Info',
            icon: Building2,
            completed: stepStatus['company-info'],
            data: {
                'Company Name': company.name,
                'Foundation Date': company.foundation_date,
                'HQ Location': company.hq_location,
                'Industry': company.industry,
            },
        },
        {
            id: 'business-profile',
            title: 'Business Profile',
            icon: Briefcase,
            completed: stepStatus['business-profile'],
            data: project.business_profile ? {
                'Annual Revenue': project.business_profile.annual_revenue,
                'Operational Margin': project.business_profile.operational_margin_rate,
                'Business Type': project.business_profile.business_type,
            } : {},
        },
        {
            id: 'workforce',
            title: 'Workforce',
            icon: Users,
            completed: stepStatus['workforce'],
            data: project.workforce ? {
                'Current Headcount': project.workforce.headcount_current,
                'Total Employees': project.workforce.total_employees,
            } : {},
        },
        {
            id: 'current-hr',
            title: 'Current HR',
            icon: Settings,
            completed: stepStatus['current-hr'],
            data: project.current_hr_status ? {
                'Dedicated HR Team': project.current_hr_status.dedicated_hr_team ? 'Yes' : 'No',
                'Evaluation System': project.current_hr_status.evaluation_system_status,
            } : {},
        },
        {
            id: 'culture',
            title: 'Culture',
            icon: MessageSquare,
            completed: stepStatus['culture'],
            data: project.culture ? {
                'Work Format': project.culture.work_format,
                'Core Values': project.culture.core_values?.join(', ') || 'None',
            } : {},
        },
        {
            id: 'confidential',
            title: 'Confidential',
            icon: FileText,
            completed: stepStatus['confidential'],
            data: project.confidential_note ? {
                'Notes': project.confidential_note.notes || 'None',
            } : {},
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Review & Submit - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/confidential`}
                    />

                    <DiagnosisProgressBar
                        stepName="Review & Submit"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={8}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="review"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Review & Submit Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div key={section.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-5 h-5 text-muted-foreground" />
                                                <h3 className="font-semibold">{section.title}</h3>
                                            </div>
                                            {section.completed ? (
                                                <Badge className="bg-success/10 text-success">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Incomplete</Badge>
                                            )}
                                        </div>
                                        {section.completed && Object.keys(section.data).length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-3 mt-3">
                                                {Object.entries(section.data).map(([key, value]) => (
                                                    <div key={key}>
                                                        <p className="text-xs text-muted-foreground">{key}</p>
                                                        <p className="text-sm font-medium">{value || 'N/A'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No data provided</p>
                                        )}
                                    </div>
                                );
                            })}

                            <form onSubmit={handleSubmit} className="pt-4">
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={form.processing} size="lg">
                                        {form.processing ? 'Submitting...' : 'Submit & Lock Step'}
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
