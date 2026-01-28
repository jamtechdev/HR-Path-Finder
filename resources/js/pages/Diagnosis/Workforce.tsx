import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Upload } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface Workforce {
    id?: number;
    headcount_year_minus_2?: number | null;
    headcount_year_minus_1?: number | null;
    headcount_current?: number | null;
    total_employees?: number | null;
    contract_employees?: number | null;
    org_chart_path?: string | null;
}

interface Project {
    id: number;
    status: string;
    workforce?: Workforce | null;
    business_profile?: { id?: number } | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

export default function Workforce({ company, project }: PageProps) {
    const workforce = project.workforce;
    
    const [totalEmployees, setTotalEmployees] = useState<number>(
        workforce?.total_employees || 50
    );
    const [contractEmployees, setContractEmployees] = useState<number>(
        workforce?.contract_employees || 0
    );

    const form = useForm({
        headcount_year_minus_2: workforce?.headcount_year_minus_2?.toString() || '',
        headcount_year_minus_1: workforce?.headcount_year_minus_1?.toString() || '',
        headcount_current: workforce?.headcount_current?.toString() || '',
        total_employees: totalEmployees.toString(),
        contract_employees: contractEmployees.toString(),
        org_chart: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData('total_employees', totalEmployees.toString());
        form.setData('contract_employees', contractEmployees.toString());
        form.post(`/diagnosis/${project.id}/workforce`, {
            forceFormData: true,
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // Data will be automatically updated via Inertia
            },
        });
    };
    
    const contractPercentage = totalEmployees > 0 
        ? Math.round((contractEmployees / totalEmployees) * 100) 
        : 0;

    const stepStatus = {
        'company-info': true,
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(workforce),
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
                <Head title="Workforce - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref={`/diagnosis/${project.id}/business-profile`}
                    />

                    <DiagnosisProgressBar
                        stepName="Workforce"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={4}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="workforce"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Workforce Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="headcountYearMinus2">Headcount (Year -2)</Label>
                                        <Input
                                            id="headcountYearMinus2"
                                            type="number"
                                            value={form.data.headcount_year_minus_2}
                                            onChange={(e) => form.setData('headcount_year_minus_2', e.target.value)}
                                            placeholder="Enter headcount"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="headcountYearMinus1">Headcount (Year -1)</Label>
                                        <Input
                                            id="headcountYearMinus1"
                                            type="number"
                                            value={form.data.headcount_year_minus_1}
                                            onChange={(e) => form.setData('headcount_year_minus_1', e.target.value)}
                                            placeholder="Enter headcount"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="headcountCurrent">Headcount (Current) *</Label>
                                        <Input
                                            id="headcountCurrent"
                                            type="number"
                                            value={form.data.headcount_current}
                                            onChange={(e) => form.setData('headcount_current', e.target.value)}
                                            placeholder="Enter current headcount"
                                            required
                                        />
                                        {form.errors.headcount_current && (
                                            <p className="text-xs text-destructive">{form.errors.headcount_current}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Total Employees Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="totalEmployees">Current Total Employees *</Label>
                                        <span className="text-lg font-semibold text-primary">
                                            {totalEmployees} people
                                        </span>
                                    </div>
                                    <Slider
                                        id="totalEmployees"
                                        value={[totalEmployees]}
                                        onValueChange={(values) => setTotalEmployees(values[0])}
                                        max={10000}
                                        step={1}
                                        className="w-full"
                                    />
                                    {form.errors.total_employees && (
                                        <p className="text-xs text-destructive">{form.errors.total_employees}</p>
                                    )}
                                </div>

                                {/* Contract Employees Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="contractEmployees">Contract Employees</Label>
                                        <span className="text-lg font-semibold text-primary">
                                            {contractEmployees} ({contractPercentage}%)
                                        </span>
                                    </div>
                                    <Slider
                                        id="contractEmployees"
                                        value={[contractEmployees]}
                                        onValueChange={(values) => setContractEmployees(values[0])}
                                        max={totalEmployees}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orgChart">Organization Chart</Label>
                                    <label
                                        htmlFor="orgChart"
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                    >
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 5MB</p>
                                        {form.data.org_chart && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {form.data.org_chart.name}
                                            </p>
                                        )}
                                        {workforce?.org_chart_path && !form.data.org_chart && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Current chart uploaded.
                                            </p>
                                        )}
                                    </label>
                                    <Input
                                        id="orgChart"
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        className="hidden"
                                        onChange={(e) => form.setData('org_chart', e.target.files?.[0] || null)}
                                    />
                                    {form.errors.org_chart && (
                                        <p className="text-xs text-destructive">{form.errors.org_chart}</p>
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
