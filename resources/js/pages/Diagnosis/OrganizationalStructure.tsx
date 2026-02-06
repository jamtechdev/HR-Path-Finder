import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Network, BriefcaseBusiness, Upload, AlertTriangle, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface Project {
    id: number;
    status: string;
    organizational_charts?: { id?: number } | null;
    organization_design?: {
        structure_types?: string[];
    } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

const structureTypes = [
    { value: 'functional', label: 'Functional' },
    { value: 'divisional', label: 'Divisional' },
    { value: 'project_matrix', label: 'Project/Matrix' },
    { value: 'hq_subsidiary', label: 'HQ-Subsidiary' },
    { value: 'no_clearly_defined', label: 'No Clearly Defined Structure' },
];

export default function OrganizationalStructure({ company, project }: PageProps) {
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

    // Get stored structure types data
    const storedStructure = getStoredData('organizational-structure', {});
    const existingTypes = project?.organization_design?.structure_types || storedStructure.structure_types || [];
    const [selectedTypes, setSelectedTypes] = useState<string[]>(existingTypes);

    const form = useForm({
        structure_types: selectedTypes,
    });

    // Save to localStorage whenever selectedTypes change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedTypes.length > 0) {
                saveToLocalStorage('organizational-structure', { structure_types: selectedTypes });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedTypes]);

    const toggleStructureType = (value: string) => {
        const updated = selectedTypes.includes(value)
            ? selectedTypes.filter(t => t !== value)
            : [...selectedTypes, value];
        setSelectedTypes(updated);
        form.setData('structure_types', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTypes.length === 0) {
            alert('Please select at least one organizational structure type.');
            return;
        }

        // Save to localStorage
        saveToLocalStorage('organizational-structure', { structure_types: selectedTypes });
        
        // Navigate to next step
        router.visit(`${basePath}/hr-issues`);
    };

    // Calculate step completion status from localStorage
    const checkStepComplete = (key: string): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                return data.length > 0;
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
        'organizational-structure': selectedTypes.length > 0,
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
                    <Head title="Organizational Structure - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/organizational-charts`}
                        />

                        <DiagnosisProgressBar
                            stepName="Organizational Structure"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={8}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="organizational-structure"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                        <Card>
                            <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Select Organizational Structure Type(s) *</h3>
                                    <p className="text-sm text-muted-foreground">You can select multiple types</p>
                                    <div className="space-y-3">
                                        {structureTypes.map((type) => (
                                            <div key={type.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={type.value}
                                                    checked={selectedTypes.includes(type.value)}
                                                    onCheckedChange={() => toggleStructureType(type.value)}
                                                />
                                                <Label
                                                    htmlFor={type.value}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {type.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {form.errors.structure_types && (
                                        <p className="text-xs text-destructive">{form.errors.structure_types}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/organizational-charts`)}
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
