import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface ConfidentialNote {
    id?: number;
    notes?: string | null;
}

interface Project {
    id: number;
    status: string;
    confidential_note?: ConfidentialNote | null;
    culture?: { id?: number } | null;
    current_hr_status?: { id?: number } | null;
    workforce?: { id?: number } | null;
    business_profile?: { id?: number } | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

export default function Confidential({ company, project }: PageProps) {
    const confidentialNote = project.confidential_note;

    const form = useForm({
        notes: confidentialNote?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/diagnosis/${project.id}/confidential`, {
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // Navigate to next step (review)
                router.visit(`/diagnosis/${project.id}/review`);
            },
        });
    };

    const stepStatus = {
        'company-info': true,
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(project.current_hr_status),
        'culture': Boolean(project.culture),
        'confidential': Boolean(confidentialNote),
        'review': false,
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

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Confidential - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/culture`}
                    />

                    <DiagnosisProgressBar
                        stepName="Confidential"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={7}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="confidential"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl">Internal HR Issues</CardTitle>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                                    Confidential
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4">
                                    <p className="text-sm font-semibold text-destructive mb-2">Confidentiality Notice:</p>
                                    <p className="text-sm text-destructive/90">
                                        Information entered here will be used to inform HR system design recommendations but will never be shown verbatim to the CEO. This section is for HR Manager use only.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Describe Internal HR Challenges and Pain Points</Label>
                                    <Textarea
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        placeholder="Describe any internal HR challenges, employee relations issues, compensation concerns, or organizational pain points that should inform the HR system design..."
                                        rows={10}
                                        className="resize-none"
                                    />
                                    {form.errors.notes && (
                                        <p className="text-xs text-destructive">{form.errors.notes}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Saving...' : 'Next'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
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
