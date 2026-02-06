import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface BusinessProfile {
    id?: number;
    annual_revenue?: string | null;
    operational_margin_rate?: string | null;
    annual_human_cost?: string | null;
    business_type?: string | null;
}

interface Project {
    id: number;
    status: string;
    business_profile?: BusinessProfile | null;
    workforce?: { id?: number } | null;
    current_hr_status?: { id?: number } | null;
    culture?: { id?: number } | null;
    confidential_note?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

const businessTypeOptions = [
    { value: 'b2b', label: 'B2B', description: 'Business to Business' },
    { value: 'b2c', label: 'B2C', description: 'Business to Consumer' },
    { value: 'b2b2c', label: 'B2B2C', description: 'Both' },
];

// Helper function to format KRW
const formatKRW = (value: number) => {
    if (value >= 1000) {
        return `₩${(value / 1000).toFixed(1)}B`;
    }
    return `₩${value.toFixed(1)}B`;
};

// Helper function to parse KRW
const parseKRW = (value: string) => {
    const num = parseFloat(value.replace(/[₩,B]/g, '')) || 0;
    return num * 1000; // Convert billions to actual value
};

export default function BusinessProfile({ company, project }: PageProps) {
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

    // Get stored business profile data
    const storedBusinessProfile = getStoredData('business-profile', {});
    const businessProfile = project?.business_profile || storedBusinessProfile;
    
    // Initialize slider values (in billions)
    const getInitialRevenue = () => {
        if (storedBusinessProfile.annual_revenue) {
            return parseFloat(storedBusinessProfile.annual_revenue.toString()) / 1000;
        }
        if (businessProfile?.annual_revenue) {
            return parseFloat(businessProfile.annual_revenue.toString()) / 1000;
        }
        return 0;
    };

    const getInitialMargin = () => {
        if (storedBusinessProfile.operational_margin_rate) {
            return parseFloat(storedBusinessProfile.operational_margin_rate.toString());
        }
        if (businessProfile?.operational_margin_rate) {
            return parseFloat(businessProfile.operational_margin_rate.toString());
        }
        return 0;
    };

    const getInitialHumanCost = () => {
        if (storedBusinessProfile.annual_human_cost) {
            return parseFloat(storedBusinessProfile.annual_human_cost.toString()) / 1000;
        }
        if (businessProfile?.annual_human_cost) {
            return parseFloat(businessProfile.annual_human_cost.toString()) / 1000;
        }
        return 0;
    };

    const [annualRevenue, setAnnualRevenue] = useState<number>(getInitialRevenue());
    const [operationalMargin, setOperationalMargin] = useState<number>(getInitialMargin());
    const [annualHumanCost, setAnnualHumanCost] = useState<number>(getInitialHumanCost());

    const form = useForm({
        annual_revenue: storedBusinessProfile.annual_revenue || businessProfile?.annual_revenue || (annualRevenue * 1000).toString(),
        operational_margin_rate: storedBusinessProfile.operational_margin_rate || businessProfile?.operational_margin_rate || operationalMargin.toString(),
        annual_human_cost: storedBusinessProfile.annual_human_cost || businessProfile?.annual_human_cost || (annualHumanCost * 1000).toString(),
        business_type: storedBusinessProfile.business_type || businessProfile?.business_type || '',
    });

    // Save to localStorage whenever form data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                annual_revenue: (annualRevenue * 1000).toString(),
                operational_margin_rate: operationalMargin.toString(),
                annual_human_cost: (annualHumanCost * 1000).toString(),
                business_type: form.data.business_type,
            };
            saveToLocalStorage('business-profile', dataToSave);
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [annualRevenue, operationalMargin, annualHumanCost, form.data.business_type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert slider values to numeric values
        const annualRevenueValue = annualRevenue * 1000;
        const annualHumanCostValue = annualHumanCost * 1000;
        const businessTypeValue = form.data.business_type.toLowerCase();
        
        // Save to localStorage
        const dataToSave = {
            annual_revenue: annualRevenueValue.toString(),
            operational_margin_rate: operationalMargin.toString(),
            annual_human_cost: annualHumanCostValue.toString(),
            business_type: businessTypeValue,
        };
        saveToLocalStorage('business-profile', dataToSave);
        
        // Navigate to next step
        router.visit(`${basePath}/workforce`);
    };

    // Calculate step completion status from localStorage
    const checkStepComplete = (key: string): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            return Object.keys(data).length > 0 && Object.values(data).some(v => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));
        } catch {
            return false;
        }
    };

    const stepStatus = {
        'company-info': checkStepComplete('company'),
        'business-profile': Boolean(
            form.data.annual_revenue &&
            form.data.operational_margin_rate &&
            form.data.annual_human_cost &&
            form.data.business_type
        ),
        'workforce': checkStepComplete('workforce'),
        'current-hr': checkStepComplete('current-hr'),
        'culture': checkStepComplete('culture'),
        'confidential': checkStepComplete('confidential'),
        'review': false,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 7;

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
                    <Head title="Business Profile - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/company-info`}
                        />

                        <DiagnosisProgressBar
                            stepName="Business Profile"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={3}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="business-profile"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Business Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Annual Revenue Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="annualRevenue">Annual Revenue (KRW) *</Label>
                                        <span className="text-lg font-semibold text-primary">
                                            {formatKRW(annualRevenue * 1000)}
                                        </span>
                                    </div>
                                    <Slider
                                        id="annualRevenue"
                                        value={[annualRevenue]}
                                        onValueChange={(values) => setAnnualRevenue(values[0])}
                                        max={10000}
                                        step={0.1}
                                        className="w-full"
                                    />
                                    {form.errors.annual_revenue && (
                                        <p className="text-xs text-destructive">{form.errors.annual_revenue}</p>
                                    )}
                                </div>

                                {/* Operational Margin Rate Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="operationalMargin">Operational Margin Rate (%) *</Label>
                                        <span className="text-lg font-semibold text-primary">
                                            {operationalMargin.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Slider
                                        id="operationalMargin"
                                        value={[operationalMargin]}
                                        onValueChange={(values) => setOperationalMargin(values[0])}
                                        max={100}
                                        step={0.1}
                                        className="w-full"
                                    />
                                    {form.errors.operational_margin_rate && (
                                        <p className="text-xs text-destructive">{form.errors.operational_margin_rate}</p>
                                    )}
                                </div>

                                {/* Annual Human Cost Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="annualHumanCost">Annual Human Cost (KRW) *</Label>
                                        <span className="text-lg font-semibold text-primary">
                                            {formatKRW(annualHumanCost * 1000)}
                                        </span>
                                    </div>
                                    <Slider
                                        id="annualHumanCost"
                                        value={[annualHumanCost]}
                                        onValueChange={(values) => setAnnualHumanCost(values[0])}
                                        max={5000}
                                        step={0.1}
                                        className="w-full"
                                    />
                                    {form.errors.annual_human_cost && (
                                        <p className="text-xs text-destructive">{form.errors.annual_human_cost}</p>
                                    )}
                                </div>

                                {/* Business Type Selection */}
                                <div className="space-y-3">
                                    <Label>Business Type *</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {businessTypeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => form.setData('business_type', option.value)}
                                                className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                                                    form.data.business_type?.toLowerCase() === option.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <div className="font-semibold text-lg mb-1">{option.label}</div>
                                                <div className="text-sm text-muted-foreground">{option.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.business_type && (
                                        <p className="text-xs text-destructive">{form.errors.business_type}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/company-info`)}
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
