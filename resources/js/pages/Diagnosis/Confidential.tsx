import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, BriefcaseBusiness, Upload, Network, AlertTriangle, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    company?: Company | null;
    project?: Project | null;
}

export default function Confidential({ company, project }: PageProps) {
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

    // Get stored confidential note data
    const storedConfidential = getStoredData('confidential', {});
    const confidentialNote = project?.confidential_note || storedConfidential;

    const form = useForm({
        notes: confidentialNote?.notes || storedConfidential?.notes || storedConfidential?.confidential_note || '',
    });

    // Save to localStorage whenever form data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                notes: form.data.notes,
                confidential_note: form.data.notes, // Also save as confidential_note for consistency
            };
            if (dataToSave.notes) {
                saveToLocalStorage('confidential', dataToSave);
            }
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [form.data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Save to localStorage
        const dataToSave = {
            notes: form.data.notes,
            confidential_note: form.data.notes, // Also save as confidential_note for consistency
        };
        saveToLocalStorage('confidential', dataToSave);
        
        // Navigate to next step
        router.visit(`${basePath}/review`);
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
        'culture': checkStepComplete('culture'),
        'confidential': Boolean(form.data.notes && form.data.notes.trim() !== ''),
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
                    <Head title="Confidential - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/culture`}
                        />

                        <DiagnosisProgressBar
                            stepName="Confidential"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={12}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="confidential"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
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
                                        onClick={() => router.visit(`${basePath}/culture`)}
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
