import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface CurrentHrStatus {
    id?: number;
    dedicated_hr_team?: boolean | null;
    labor_union_present?: boolean | null;
    labor_relations_stability?: string | null;
    evaluation_system_status?: string | null;
    compensation_system_status?: string | null;
    evaluation_system_issues?: string | null;
    job_rank_levels?: number | null;
    job_title_levels?: number | null;
}

interface Project {
    id: number;
    status: string;
    current_hr_status?: CurrentHrStatus | null;
    workforce?: { id?: number } | null;
    business_profile?: { id?: number } | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

// Options matching backend validation rules
const stabilityOptions = [
    { value: 'stable', label: 'Stable' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'unstable', label: 'Unstable' },
];

const systemStatusOptions = [
    { value: 'none', label: 'Not established' },
    { value: 'informal', label: 'Partially established' },
    { value: 'basic', label: 'Well-established (Basic)' },
    { value: 'advanced', label: 'Well-established (Advanced)' },
];

export default function CurrentHr({ company, project }: PageProps) {
    const currentHr = project.current_hr_status;

    const form = useForm({
        dedicated_hr_team: currentHr?.dedicated_hr_team || false,
        labor_union_present: currentHr?.labor_union_present || false,
        labor_relations_stability: currentHr?.labor_relations_stability || '',
        evaluation_system_status: currentHr?.evaluation_system_status || '',
        compensation_system_status: currentHr?.compensation_system_status || '',
        evaluation_system_issues: currentHr?.evaluation_system_issues || '',
        job_rank_levels: currentHr?.job_rank_levels?.toString() || '',
        job_title_levels: currentHr?.job_title_levels?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert job_rank_levels and job_title_levels to integers if they're strings
        const jobRankLevels = form.data.job_rank_levels ? parseInt(form.data.job_rank_levels.toString()) : null;
        const jobTitleLevels = form.data.job_title_levels ? parseInt(form.data.job_title_levels.toString()) : null;
        
        // Update form data with converted values
        form.setData('job_rank_levels', jobRankLevels);
        form.setData('job_title_levels', jobTitleLevels);
        
        // Post the form
        form.post(`/diagnosis/${project.id}/current-hr`, {
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // Data will be automatically updated via Inertia
            },
        });
    };

    const stepStatus = {
        'company-info': true,
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(currentHr),
        'culture': Boolean(project.culture),
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
                <Head title="Current HR - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/workforce`}
                    />

                    <DiagnosisProgressBar
                        stepName="Current HR"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={5}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="current-hr"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Current HR System Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="dedicatedHrTeam"
                                                checked={form.data.dedicated_hr_team}
                                                onCheckedChange={(checked) => form.setData('dedicated_hr_team', checked === true)}
                                            />
                                            <Label htmlFor="dedicatedHrTeam" className="cursor-pointer">
                                                Dedicated HR Team Present
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="laborUnion"
                                                checked={form.data.labor_union_present}
                                                onCheckedChange={(checked) => form.setData('labor_union_present', checked === true)}
                                            />
                                            <Label htmlFor="laborUnion" className="cursor-pointer">
                                                Labor Union Present
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="evaluationStatus">Evaluation System Status</Label>
                                            <Select
                                                value={form.data.evaluation_system_status}
                                                onValueChange={(value) => form.setData('evaluation_system_status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {systemStatusOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.evaluation_system_status && (
                                                <p className="text-xs text-destructive">{form.errors.evaluation_system_status}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="evaluationIssues">Evaluation System Issues (HR Manager Only)</Label>
                                            <Textarea
                                                id="evaluationIssues"
                                                value={form.data.evaluation_system_issues}
                                                onChange={(e) => form.setData('evaluation_system_issues', e.target.value)}
                                                placeholder="Describe any issues with the current evaluation system..."
                                                rows={4}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                This information is confidential and will not be shown verbatim to the CEO.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="jobRankLevels">Number of Job Rank Levels</Label>
                                            <Input
                                                id="jobRankLevels"
                                                type="number"
                                                value={form.data.job_rank_levels}
                                                onChange={(e) => form.setData('job_rank_levels', e.target.value)}
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="laborStability">Labor Relations Stability</Label>
                                            <Select
                                                value={form.data.labor_relations_stability}
                                                onValueChange={(value) => form.setData('labor_relations_stability', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stability level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stabilityOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.labor_relations_stability && (
                                                <p className="text-xs text-destructive">{form.errors.labor_relations_stability}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="compensationStatus">Compensation System Status</Label>
                                            <Select
                                                value={form.data.compensation_system_status}
                                                onValueChange={(value) => form.setData('compensation_system_status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {systemStatusOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.compensation_system_status && (
                                                <p className="text-xs text-destructive">{form.errors.compensation_system_status}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="jobTitleLevels">Number of Job Title Levels</Label>
                                            <Input
                                                id="jobTitleLevels"
                                                type="number"
                                                value={form.data.job_title_levels}
                                                onChange={(e) => form.setData('job_title_levels', e.target.value)}
                                                placeholder="e.g., 7"
                                            />
                                        </div>
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
