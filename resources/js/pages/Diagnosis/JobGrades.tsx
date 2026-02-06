import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Plus, X, BriefcaseBusiness, Upload, Network, AlertTriangle, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface JobGrade {
    id?: number;
    grade_name: string;
    grade_order?: number | null;
    promotion_rules?: string | null;
    promotion_to_grade?: string | null;
}

interface Project {
    id: number;
    status: string;
    job_grades?: JobGrade[];
    executives?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

const commonJobGrades = ['Associate', 'Assistant Manager', 'Manager', 'Senior Manager', 'Director', 'Senior Director', 'VP', 'SVP', 'EVP'];

export default function JobGrades({ company, project }: PageProps) {
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

    // Get stored job grades data
    const storedJobGrades = getStoredData('job-grades', []);
    const existingJobGrades = project?.job_grades || storedJobGrades;
    
    const [jobGrades, setJobGrades] = useState<JobGrade[]>(
        existingJobGrades.length > 0
            ? existingJobGrades
            : [{ grade_name: '', grade_order: null, promotion_rules: '', promotion_to_grade: '' }]
    );

    const form = useForm({
        job_grades: jobGrades,
    });

    // Save to localStorage whenever jobGrades change
    useEffect(() => {
        const timer = setTimeout(() => {
            const validGrades = jobGrades.filter(g => g.grade_name.trim() !== '');
            if (validGrades.length > 0) {
                saveToLocalStorage('job-grades', validGrades);
            }
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [jobGrades]);

    const addJobGrade = () => {
        const nextOrder = jobGrades.length > 0 
            ? Math.max(...jobGrades.map(g => g.grade_order || 0)) + 1 
            : 1;
        const newJobGrades = [...jobGrades, { grade_name: '', grade_order: nextOrder, promotion_rules: '', promotion_to_grade: '' }];
        setJobGrades(newJobGrades);
        form.setData('job_grades', newJobGrades);
    };

    const removeJobGrade = (index: number) => {
        const newJobGrades = jobGrades.filter((_, i) => i !== index);
        setJobGrades(newJobGrades);
        form.setData('job_grades', newJobGrades);
    };

    const updateJobGrade = (index: number, field: keyof JobGrade, value: any) => {
        const updated = [...jobGrades];
        updated[index] = { ...updated[index], [field]: value };
        setJobGrades(updated);
        form.setData('job_grades', updated);
    };

    const selectCommonGrade = (index: number, gradeName: string) => {
        updateJobGrade(index, 'grade_name', gradeName);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate job grades
        const validGrades = jobGrades.filter(g => g.grade_name.trim() !== '');
        if (validGrades.length === 0) {
            alert('Please add at least one job grade.');
            return;
        }

        // Save to localStorage
        saveToLocalStorage('job-grades', validGrades);
        
        // Navigate to next step
        router.visit(`${basePath}/organizational-charts`);
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
        'job-grades': jobGrades.length > 0 && jobGrades.some(g => g.grade_name.trim() !== ''),
        'organizational-charts': checkStepComplete('organizational-charts'),
        'organizational-structure': checkStepComplete('organizational-structure'),
        'hr-issues': checkStepComplete('hr-issues'),
        'current-hr': checkStepComplete('current-hr'),
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
                    <Head title="Job Grades - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/executives`}
                        />

                        <DiagnosisProgressBar
                            stepName="Job Grade System"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={6}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="job-grades"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Task 6: Job Grade System</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Grade Names</h3>
                                        <Button type="button" onClick={addJobGrade} variant="outline" size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Grade
                                        </Button>
                                    </div>

                                    {jobGrades.map((grade, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Grade Name *</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={grade.grade_name}
                                                                onChange={(e) => updateJobGrade(index, 'grade_name', e.target.value)}
                                                                placeholder="e.g., Associate, Assistant Manager, Manager"
                                                                required
                                                            />
                                                            {jobGrades.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeJobGrade(index)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {commonJobGrades.map((gradeName) => (
                                                                <button
                                                                    type="button"
                                                                    key={gradeName}
                                                                    onClick={() => selectCommonGrade(index, gradeName)}
                                                                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                                        grade.grade_name === gradeName
                                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                                            : 'hover:bg-accent'
                                                                    }`}
                                                                >
                                                                    {gradeName}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Grade Order</Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={grade.grade_order || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value ? parseInt(e.target.value) : null;
                                                                    const updated = [...jobGrades];
                                                                    updated[index] = { ...updated[index], grade_order: value };
                                                                    setJobGrades(updated);
                                                                    form.setData('job_grades', updated);
                                                                }}
                                                                placeholder="Order/level (optional)"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Promotion To Grade</Label>
                                                            <Select
                                                                value={grade.promotion_to_grade ? grade.promotion_to_grade : 'none'}
                                                                onValueChange={(value) => updateJobGrade(index, 'promotion_to_grade', value === 'none' ? '' : value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select next grade" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">None</SelectItem>
                                                                    {jobGrades
                                                                        .filter((g, i) => i !== index && g.grade_name.trim() !== '')
                                                                        .map((g, idx) => (
                                                                            <SelectItem key={idx} value={g.grade_name}>
                                                                                {g.grade_name}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Promotion Rules</Label>
                                                        <Textarea
                                                            value={grade.promotion_rules || ''}
                                                            onChange={(e) => updateJobGrade(index, 'promotion_rules', e.target.value)}
                                                            placeholder="Describe promotion rules for this grade (optional)"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/executives`)}
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
