import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { useState } from 'react';

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
    company: Company;
    project: Project;
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
    const businessProfile = project.business_profile;
    
    // Initialize slider values (in billions)
    // If businessProfile exists, convert stored numeric values back to billions for display
    const [annualRevenue, setAnnualRevenue] = useState<number>(
        businessProfile?.annual_revenue ? parseFloat(businessProfile.annual_revenue.toString()) / 1000 : 0
    );
    const [operationalMargin, setOperationalMargin] = useState<number>(
        businessProfile?.operational_margin_rate ? parseFloat(businessProfile.operational_margin_rate.toString()) : 0
    );
    const [annualHumanCost, setAnnualHumanCost] = useState<number>(
        businessProfile?.annual_human_cost ? parseFloat(businessProfile.annual_human_cost.toString()) / 1000 : 0
    );

    const form = useForm({
        annual_revenue: businessProfile?.annual_revenue || (annualRevenue * 1000).toString(),
        operational_margin_rate: businessProfile?.operational_margin_rate || operationalMargin.toString(),
        annual_human_cost: businessProfile?.annual_human_cost || (annualHumanCost * 1000).toString(),
        business_type: businessProfile?.business_type || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert slider values to numeric values (not formatted strings)
        // annual_revenue and annual_human_cost are stored in billions, so multiply by 1000
        const annualRevenueValue = annualRevenue * 1000; // Convert billions to actual value
        const annualHumanCostValue = annualHumanCost * 1000; // Convert billions to actual value
        
        // Convert business_type to lowercase for backend validation
        const businessTypeValue = form.data.business_type.toLowerCase();
        
        // Update form data with numeric values
        form.setData('annual_revenue', annualRevenueValue.toString());
        form.setData('operational_margin_rate', operationalMargin.toString());
        form.setData('annual_human_cost', annualHumanCostValue.toString());
        form.setData('business_type', businessTypeValue);
        
        form.post(`/diagnosis/${project.id}/business-profile`, {
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // Data will be automatically updated via Inertia
            },
        });
    };

    const stepStatus = {
        'company-info': true,
        'business-profile': Boolean(businessProfile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(project.current_hr_status),
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
                <Head title="Business Profile - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/company-info`}
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
                        projectId={project.id}
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
