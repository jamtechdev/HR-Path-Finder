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
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

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
    company?: Company | null;
    project?: Project | null;
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

    // Get stored culture data
    const storedCulture = getStoredData('culture', {});
    const culture = project?.culture || storedCulture;
    const coreValues = culture?.core_values || storedCulture?.core_values || [];

    const form = useForm({
        work_format: culture?.work_format || storedCulture?.work_format || '',
        decision_making_style: culture?.decision_making_style || storedCulture?.decision_making_style || '',
        core_values: coreValues,
    });

    // Save to localStorage whenever form data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                work_format: form.data.work_format,
                decision_making_style: form.data.decision_making_style,
                core_values: form.data.core_values,
            };
            if (dataToSave.work_format || dataToSave.decision_making_style || dataToSave.core_values.length > 0) {
                saveToLocalStorage('culture', dataToSave);
            }
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [form.data]);

    const toggleCoreValue = (value: string) => {
        if (form.data.core_values.length >= 5 && !form.data.core_values.includes(value)) {
            return; // Max 5 values
        }
        const updated = form.data.core_values.includes(value)
            ? form.data.core_values.filter((v: string) => v !== value)
            : [...form.data.core_values, value];
        form.setData('core_values', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Save to localStorage
        const dataToSave = {
            work_format: form.data.work_format,
            decision_making_style: form.data.decision_making_style,
            core_values: form.data.core_values,
        };
        saveToLocalStorage('culture', dataToSave);
        
        // Navigate to next step
        router.visit(`${basePath}/confidential`);
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
        'current-hr': checkStepComplete('current-hr'),
        'culture': Boolean(form.data.work_format && form.data.decision_making_style),
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
                <Head title="Culture - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                            backHref={`${basePath}/current-hr`}
                    />

                    <DiagnosisProgressBar
                        stepName="Culture"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                            currentStep={11}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="culture"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                            projectId={null}
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
                                        onClick={() => router.visit(`${basePath}/current-hr`)}
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
