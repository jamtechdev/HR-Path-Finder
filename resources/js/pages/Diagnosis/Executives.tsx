import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Plus, X, UserCog, BriefcaseBusiness, Upload, Network, AlertTriangle } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface Executive {
    id?: number;
    position_title: string;
    number_of_executives: number;
    is_custom?: boolean;
}

interface Project {
    id: number;
    status: string;
    executives?: Executive[];
    business_profile?: { id?: number } | null;
    workforce?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

const commonExecutiveTitles = ['CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CHRO', 'CCO', 'CSO'];

export default function Executives({ company, project }: PageProps) {
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

    // Get stored executives data
    const storedExecutives = getStoredData('executives', []);
    const existingExecutives = project?.executives || storedExecutives;
    
    const [executives, setExecutives] = useState<Executive[]>(
        existingExecutives.length > 0
            ? existingExecutives
            : [{ position_title: '', number_of_executives: 1, is_custom: false }]
    );

    const form = useForm({
        executives: executives,
    });

    // Save to localStorage whenever executives change
    useEffect(() => {
        const timer = setTimeout(() => {
            const validExecutives = executives.filter(e => e.position_title.trim() !== '');
            if (validExecutives.length > 0) {
                saveToLocalStorage('executives', validExecutives);
            }
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [executives]);

    const addExecutive = () => {
        const newExecutives = [...executives, { position_title: '', number_of_executives: 1, is_custom: false }];
        setExecutives(newExecutives);
        form.setData('executives', newExecutives);
    };

    const removeExecutive = (index: number) => {
        const newExecutives = executives.filter((_, i) => i !== index);
        setExecutives(newExecutives);
        form.setData('executives', newExecutives);
    };

    const updateExecutive = (index: number, field: keyof Executive, value: any) => {
        const updated = [...executives];
        updated[index] = { ...updated[index], [field]: value };
        setExecutives(updated);
    };

    const selectCommonTitle = (index: number, title: string) => {
        const updated = [...executives];
        updated[index] = { ...updated[index], position_title: title, is_custom: false };
        setExecutives(updated);
        form.setData('executives', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate executives
        const validExecutives = executives.filter(e => e.position_title.trim() !== '');
        if (validExecutives.length === 0) {
            alert('Please add at least one executive position.');
            return;
        }

        // Save to localStorage
        saveToLocalStorage('executives', validExecutives);
        
        // Navigate to next step
        router.visit(`${basePath}/job-grades`);
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
        'executives': executives.length > 0 && executives.some(e => e.position_title.trim() !== ''),
        'job-grades': checkStepComplete('job-grades'),
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

    const totalExecutives = executives.reduce((sum, e) => sum + (e.number_of_executives || 0), 0);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Executives - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/workforce`}
                        />

                        <DiagnosisProgressBar
                            stepName="Executives"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={5}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="executives"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">Total Number of Executives</h3>
                                            <p className="text-sm text-muted-foreground">Total: {totalExecutives} executives</p>
                                        </div>
                                        <Button type="button" onClick={addExecutive} variant="outline" size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Position
                                        </Button>
                                    </div>

                                    {executives.map((executive, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Position Title *</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={executive.position_title || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...executives];
                                                                    updated[index] = { ...updated[index], position_title: e.target.value, is_custom: true };
                                                                    setExecutives(updated);
                                                                    form.setData('executives', updated);
                                                                }}
                                                                placeholder="e.g., CEO, CTO, CFO, or custom title"
                                                                required
                                                            />
                                                            {executives.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeExecutive(index)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {commonExecutiveTitles.map((title) => (
                                                                <button
                                                                    type="button"
                                                                    key={title}
                                                                    onClick={() => selectCommonTitle(index, title)}
                                                                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                                        executive.position_title === title
                                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                                            : 'hover:bg-accent'
                                                                    }`}
                                                                >
                                                                    {title}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Number of Executives per Position *</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={executive.number_of_executives || 1}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 1;
                                                                const updated = [...executives];
                                                                updated[index] = { ...updated[index], number_of_executives: value };
                                                                setExecutives(updated);
                                                                form.setData('executives', updated);
                                                            }}
                                                            required
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
                                        onClick={() => router.visit(`${basePath}/workforce`)}
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
