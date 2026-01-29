import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface Culture {
    id?: number;
    work_format?: string | null;
    decision_making_style?: string | null;
    core_values?: string[] | null;
}

interface Project {
    id: number;
    status: string;
    culture?: Culture | null;
    current_hr_status?: { id?: number } | null;
    workforce?: { id?: number } | null;
    business_profile?: { id?: number } | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

// Options matching backend validation rules
const workFormatOptions = [
    { value: 'on_site', label: 'Fully On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Fully Remote' },
    { value: 'flexible', label: 'Flexible' },
];

const decisionMakingOptions = [
    { value: 'top_down', label: 'Top-down' },
    { value: 'collaborative', label: 'Collaborative' },
    { value: 'consensus', label: 'Consensus-driven' },
    { value: 'decentralized', label: 'Decentralized' },
];

const coreValueKeywords = [
    'Innovation', 'Customer Focus', 'Integrity', 'Excellence', 'Teamwork',
    'Agility', 'Accountability', 'Respect', 'Growth', 'Sustainability'
];

export default function Culture({ company, project }: PageProps) {
    const culture = project.culture;
    const coreValues = culture?.core_values || [];

    const form = useForm({
        work_format: culture?.work_format || '',
        decision_making_style: culture?.decision_making_style || '',
        core_values: coreValues,
    });

    const toggleCoreValue = (value: string) => {
        if (form.data.core_values.length >= 5 && !form.data.core_values.includes(value)) {
            return; // Max 5 values
        }
        if (form.data.core_values.includes(value)) {
            form.setData('core_values', form.data.core_values.filter((v) => v !== value));
        } else {
            form.setData('core_values', [...form.data.core_values, value]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/diagnosis/${project.id}/culture`, {
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // Navigate to next step (confidential)
                router.visit(`/diagnosis/${project.id}/confidential`);
            },
        });
    };

    // Calculate step status - a step is completed if it has data
    const stepStatus = {
        'company-info': Boolean(company?.name && company?.industry),
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(project.current_hr_status),
        'culture': Boolean(culture && culture.work_format && culture.decision_making_style && coreValues.length > 0),
        'confidential': Boolean(project.confidential_note),
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
                <Head title="Culture - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/current-hr`}
                    />

                    <DiagnosisProgressBar
                        stepName="Culture"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={6}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="culture"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Organizational Culture & Work Style</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Work Format */}
                                <div className="space-y-3">
                                    <Label>Work Format</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {workFormatOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => form.setData('work_format', option.value)}
                                                className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${
                                                    form.data.work_format === option.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.work_format && (
                                        <p className="text-xs text-destructive">{form.errors.work_format}</p>
                                    )}
                                </div>

                                {/* Decision Making Style */}
                                <div className="space-y-3">
                                    <Label>Decision-Making Style</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {decisionMakingOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => form.setData('decision_making_style', option.value)}
                                                className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${
                                                    form.data.decision_making_style === option.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.decision_making_style && (
                                        <p className="text-xs text-destructive">{form.errors.decision_making_style}</p>
                                    )}
                                </div>

                                {/* Core Value Keywords */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Core Value Keywords (Select up to 5)</Label>
                                        <span className="text-sm text-muted-foreground">
                                            Selected: {form.data.core_values.length}/5
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {coreValueKeywords.map((keyword) => {
                                            const isSelected = form.data.core_values.includes(keyword);
                                            return (
                                                <button
                                                    key={keyword}
                                                    type="button"
                                                    onClick={() => toggleCoreValue(keyword)}
                                                    disabled={!isSelected && form.data.core_values.length >= 5}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {keyword}
                                                </button>
                                            );
                                        })}
                                    </div>
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
