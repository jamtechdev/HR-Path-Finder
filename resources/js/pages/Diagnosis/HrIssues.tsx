import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Plus, X, AlertTriangle, BriefcaseBusiness, Upload, Network, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface HrIssue {
    id?: number;
    issue_type: string;
    is_custom?: boolean;
    description?: string | null;
}

interface Project {
    id: number;
    status: string;
    hr_issues?: HrIssue[];
    organizational_structure?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

const commonHrIssues = ['Recruitment', 'Retention', 'Evaluation', 'Leadership', 'Upskilling', 'Compensation', 'Work-Life Balance', 'Diversity & Inclusion'];

export default function HrIssues({ company, project }: PageProps) {
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

    // Get stored HR issues data
    const storedIssues = getStoredData('hr-issues', []);
    const existingIssues = Array.isArray(project?.hr_issues) ? project.hr_issues : (Array.isArray(storedIssues) ? storedIssues : []);
    
    const [hrIssues, setHrIssues] = useState<HrIssue[]>(
        existingIssues.length > 0
            ? existingIssues
            : [{ issue_type: '', is_custom: false, description: '' }]
    );

    const form = useForm({
        hr_issues: hrIssues,
    });

    // Save to localStorage whenever hrIssues change
    useEffect(() => {
        const timer = setTimeout(() => {
            const validIssues = hrIssues.filter(i => i.issue_type.trim() !== '');
            if (validIssues.length > 0) {
                saveToLocalStorage('hr-issues', validIssues);
            }
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [hrIssues]);

    const addHrIssue = () => {
        const newIssues = [...hrIssues, { issue_type: '', is_custom: false, description: '' }];
        setHrIssues(newIssues);
        form.setData('hr_issues', newIssues);
    };

    const removeHrIssue = (index: number) => {
        const newIssues = hrIssues.filter((_, i) => i !== index);
        setHrIssues(newIssues);
        form.setData('hr_issues', newIssues);
    };

    const updateHrIssue = (index: number, field: keyof HrIssue, value: any) => {
        const updated = [...hrIssues];
        updated[index] = { ...updated[index], [field]: value };
        setHrIssues(updated);
        form.setData('hr_issues', updated);
    };

    const selectCommonIssue = (index: number, issueType: string) => {
        const updated = [...hrIssues];
        updated[index] = { ...updated[index], issue_type: issueType, is_custom: false };
        setHrIssues(updated);
        form.setData('hr_issues', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate HR issues
        const validIssues = hrIssues.filter(i => i.issue_type.trim() !== '');
        if (validIssues.length === 0) {
            alert('Please add at least one HR/Org issue.');
            return;
        }

        // Save to localStorage
        saveToLocalStorage('hr-issues', validIssues);
        
        // Navigate to next step
        router.visit(`${basePath}/current-hr`);
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
        'hr-issues': hrIssues.length > 0 && hrIssues.some(i => i.issue_type.trim() !== ''),
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
                    <Head title="HR Issues - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/organizational-structure`}
                        />

                        <DiagnosisProgressBar
                            stepName="Key HR/Org Issues"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={9}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="hr-issues"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                        <Card>
                            <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Select Key Issues</h3>
                                        <Button type="button" onClick={addHrIssue} variant="outline" size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Issue
                                        </Button>
                                    </div>

                                    {hrIssues.map((issue, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Issue Type *</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={issue.issue_type || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...hrIssues];
                                                                    updated[index] = { ...updated[index], issue_type: e.target.value, is_custom: true };
                                                                    setHrIssues(updated);
                                                                    form.setData('hr_issues', updated);
                                                                }}
                                                                placeholder="e.g., Recruitment, Retention, Evaluation"
                                                                required
                                                            />
                                                            {hrIssues.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeHrIssue(index)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {commonHrIssues.map((issueType) => (
                                                                <button
                                                                    type="button"
                                                                    key={issueType}
                                                                    onClick={() => selectCommonIssue(index, issueType)}
                                                                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                                        issue.issue_type === issueType
                                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                                            : 'hover:bg-accent'
                                                                    }`}
                                                                >
                                                                    {issueType}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Additional Description (Optional)</Label>
                                                        <Textarea
                                                            value={issue.description || ''}
                                                            onChange={(e) => {
                                                                const updated = [...hrIssues];
                                                                updated[index] = { ...updated[index], description: e.target.value };
                                                                setHrIssues(updated);
                                                                form.setData('hr_issues', updated);
                                                            }}
                                                            placeholder="Add more details about this issue (optional)"
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
                                        onClick={() => router.visit(`${basePath}/organizational-structure`)}
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
