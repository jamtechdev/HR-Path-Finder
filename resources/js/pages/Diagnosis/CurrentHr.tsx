import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, BriefcaseBusiness, Upload, Network, AlertTriangle, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
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
import { diagnosisTabs } from '@/config/diagnosisTabs';

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
    company?: Company | null;
    project?: Project | null;
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
    const basePath = '/hr-manager/diagnosis';
    
    // Load from localStorage or use project data
    const getStoredData = (key: string, defaultValue: any) => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
        return defaultValue;
    };

    // Save to localStorage
    const saveToLocalStorage = (key: string, data: any) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(`diagnosis_form_${key}`, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // Get stored current HR data
    const storedCurrentHr = getStoredData('current-hr', {});
    const currentHr = project?.current_hr_status || storedCurrentHr;

    const form = useForm({
        dedicated_hr_team: currentHr?.dedicated_hr_team ?? storedCurrentHr?.dedicated_hr_team ?? false,
        labor_union_present: currentHr?.labor_union_present ?? storedCurrentHr?.labor_union_present ?? false,
        labor_relations_stability: currentHr?.labor_relations_stability || storedCurrentHr?.labor_relations_stability || '',
        evaluation_system_status: currentHr?.evaluation_system_status || storedCurrentHr?.evaluation_system_status || '',
        compensation_system_status: currentHr?.compensation_system_status || storedCurrentHr?.compensation_system_status || '',
        evaluation_system_issues: currentHr?.evaluation_system_issues || storedCurrentHr?.evaluation_system_issues || '',
        job_rank_levels: currentHr?.job_rank_levels?.toString() || storedCurrentHr?.job_rank_levels?.toString() || '',
        job_title_levels: currentHr?.job_title_levels?.toString() || storedCurrentHr?.job_title_levels?.toString() || '',
    });

    // Save to localStorage whenever form data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                dedicated_hr_team: form.data.dedicated_hr_team,
                labor_union_present: form.data.labor_union_present,
                labor_relations_stability: form.data.labor_relations_stability,
                evaluation_system_status: form.data.evaluation_system_status,
                compensation_system_status: form.data.compensation_system_status,
                evaluation_system_issues: form.data.evaluation_system_issues,
                job_rank_levels: form.data.job_rank_levels ? parseInt(form.data.job_rank_levels.toString()) : null,
                job_title_levels: form.data.job_title_levels ? parseInt(form.data.job_title_levels.toString()) : null,
            };
            saveToLocalStorage('current-hr', dataToSave);
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [form.data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert job_rank_levels and job_title_levels to integers if they're strings
        const jobRankLevels = form.data.job_rank_levels ? parseInt(form.data.job_rank_levels.toString()) : null;
        const jobTitleLevels = form.data.job_title_levels ? parseInt(form.data.job_title_levels.toString()) : null;
        
        // Save to localStorage with converted values
        const dataToSave = {
            dedicated_hr_team: form.data.dedicated_hr_team,
            labor_union_present: form.data.labor_union_present,
            labor_relations_stability: form.data.labor_relations_stability,
            evaluation_system_status: form.data.evaluation_system_status,
            compensation_system_status: form.data.compensation_system_status,
            evaluation_system_issues: form.data.evaluation_system_issues,
            job_rank_levels: jobRankLevels,
            job_title_levels: jobTitleLevels,
        };
        saveToLocalStorage('current-hr', dataToSave);
        
        // Navigate to next step
        router.visit(`${basePath}/culture`);
    };

    // Calculate step completion status from localStorage
    const checkStepComplete = (key: string): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                return data.length > 0 && data.some((item: any) => Object.values(item).some(v => v !== null && v !== ''));
            }
            return Object.keys(data).length > 0 && Object.values(data).some(v => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));
        } catch {
            return false;
        }
    };

    const stepStatus = {
        'company-info': checkStepComplete('company'),
        'business-profile': checkStepComplete('business-profile'),
        'workforce': checkStepComplete('workforce'),
        'executives': checkStepComplete('executives'),
        'job-grades': checkStepComplete('job-grades'),
        'organizational-charts': checkStepComplete('organizational-charts'),
        'organizational-structure': checkStepComplete('organizational-structure'),
        'hr-issues': checkStepComplete('hr-issues'),
        'current-hr': Boolean(
            form.data.dedicated_hr_team !== undefined &&
            form.data.labor_union_present !== undefined &&
            form.data.evaluation_system_status &&
            form.data.compensation_system_status
        ),
        'culture': checkStepComplete('culture'),
        'confidential': checkStepComplete('confidential'),
        'review': false,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'executives', 'job-grades', 'organizational-charts', 'organizational-structure', 'hr-issues', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 12;

    const status: 'not_started' | 'in_progress' | 'submitted' = 'not_started';

    // Use shared tabs configuration
    const tabs = diagnosisTabs;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
            <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                <Head title="Current HR - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                            backHref={`${basePath}/hr-issues`}
                    />

                    <DiagnosisProgressBar
                        stepName="Current HR"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                            currentStep={10}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="current-hr"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                            projectId={null}
                    />

                    <Card>
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
                                        onClick={() => router.visit(`${basePath}/hr-issues`)}
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
            </SidebarInset>
        </SidebarProvider>
    );
}
