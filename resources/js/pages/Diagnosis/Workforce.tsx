import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Upload } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface Workforce {
    id?: number;
    headcount_year_minus_2?: number | null;
    headcount_year_minus_1?: number | null;
    headcount_current?: number | null;
    total_employees?: number | null;
    contract_employees?: number | null;
    org_chart_path?: string | null;
    expected_workforce_1_year?: number | null;
    expected_workforce_2_years?: number | null;
    expected_workforce_3_years?: number | null;
    average_tenure_active?: number | null;
    average_tenure_leavers?: number | null;
    average_age_active?: number | null;
    male_employees?: number | null;
    female_employees?: number | null;
    total_leaders_above_team_leader?: number | null;
    leaders_percentage?: number | null;
}

interface Project {
    id: number;
    status: string;
    workforce?: Workforce | null;
    business_profile?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

export default function Workforce({ company, project }: PageProps) {
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
            // Don't store File objects
            const dataToStore = { ...data };
            if (dataToStore.org_chart) delete dataToStore.org_chart;
            localStorage.setItem(`diagnosis_form_${key}`, JSON.stringify(dataToStore));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // Get stored workforce data
    const storedWorkforce = getStoredData('workforce', {});
    const workforce = project?.workforce || storedWorkforce;
    
    const [totalEmployees, setTotalEmployees] = useState<number>(
        storedWorkforce.total_employees || workforce?.total_employees || 50
    );
    const [contractEmployees, setContractEmployees] = useState<number>(
        storedWorkforce.contract_employees || workforce?.contract_employees || 0
    );

    const form = useForm({
        headcount_year_minus_2: storedWorkforce.headcount_year_minus_2?.toString() || workforce?.headcount_year_minus_2?.toString() || '',
        headcount_year_minus_1: storedWorkforce.headcount_year_minus_1?.toString() || workforce?.headcount_year_minus_1?.toString() || '',
        headcount_current: storedWorkforce.headcount_current?.toString() || workforce?.headcount_current?.toString() || '',
        total_employees: totalEmployees.toString(),
        contract_employees: contractEmployees.toString(),
        expected_workforce_1_year: storedWorkforce.expected_workforce_1_year?.toString() || workforce?.expected_workforce_1_year?.toString() || '',
        expected_workforce_2_years: storedWorkforce.expected_workforce_2_years?.toString() || workforce?.expected_workforce_2_years?.toString() || '',
        expected_workforce_3_years: storedWorkforce.expected_workforce_3_years?.toString() || workforce?.expected_workforce_3_years?.toString() || '',
        average_tenure_active: storedWorkforce.average_tenure_active?.toString() || workforce?.average_tenure_active?.toString() || '',
        average_tenure_leavers: storedWorkforce.average_tenure_leavers?.toString() || workforce?.average_tenure_leavers?.toString() || '',
        average_age_active: storedWorkforce.average_age_active?.toString() || workforce?.average_age_active?.toString() || '',
        male_employees: storedWorkforce.male_employees?.toString() || workforce?.male_employees?.toString() || '',
        female_employees: storedWorkforce.female_employees?.toString() || workforce?.female_employees?.toString() || '',
        total_leaders_above_team_leader: storedWorkforce.total_leaders_above_team_leader?.toString() || workforce?.total_leaders_above_team_leader?.toString() || '',
        leaders_percentage: storedWorkforce.leaders_percentage?.toString() || workforce?.leaders_percentage?.toString() || '',
        org_chart: null as File | null,
    });

    // State for org chart preview
    const [orgChartPreview, setOrgChartPreview] = React.useState<string | null>(null);

    // Load existing org chart preview on mount
    React.useEffect(() => {
        if (workforce?.org_chart_path && !form.data.org_chart) {
            const chartUrl = workforce.org_chart_path.startsWith('http') || workforce.org_chart_path.startsWith('/')
                ? workforce.org_chart_path
                : `/storage/${workforce.org_chart_path}`;
            setOrgChartPreview(chartUrl);
        }
    }, [workforce?.org_chart_path, form.data.org_chart]);

    // Handle org chart preview when file is selected
    React.useEffect(() => {
        if (form.data.org_chart) {
            const file = form.data.org_chart;
            // Only show preview for image files, not PDFs
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setOrgChartPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setOrgChartPreview(null);
            }
        } else if (!workforce?.org_chart_path) {
            setOrgChartPreview(null);
        }
    }, [form.data.org_chart, workforce?.org_chart_path]);

    // Save to localStorage whenever form data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                ...form.data,
                total_employees: totalEmployees,
                contract_employees: contractEmployees,
            };
            saveToLocalStorage('workforce', dataToSave);
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [form.data, totalEmployees, contractEmployees]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update form data with slider values
        form.setData('total_employees', totalEmployees.toString());
        form.setData('contract_employees', contractEmployees.toString());
        
        // Save to localStorage
        const dataToSave = {
            ...form.data,
            total_employees: totalEmployees,
            contract_employees: contractEmployees,
        };
        saveToLocalStorage('workforce', dataToSave);
        
        // Navigate to next step (executives)
        router.visit(`${basePath}/executives`);
    };
    
    const contractPercentage = totalEmployees > 0 
        ? Math.round((contractEmployees / totalEmployees) * 100) 
        : 0;

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
        'business-profile': checkStepComplete('business-profile'),
        'workforce': Boolean(
            form.data.headcount_current &&
            form.data.total_employees &&
            form.data.expected_workforce_1_year &&
            form.data.expected_workforce_2_years &&
            form.data.expected_workforce_3_years
        ),
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
                    <Head title="Workforce - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/business-profile`}
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
                            projectId={null}
                        />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Task 3: Workforce Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Present Workforce */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Present Workforce (Current Employees)</h3>
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
                                            <Label htmlFor="headcountCurrent">Present Workforce (Current Employees) *</Label>
                                        <Input
                                            id="headcountCurrent"
                                            type="number"
                                            value={form.data.headcount_current}
                                            onChange={(e) => form.setData('headcount_current', e.target.value)}
                                                placeholder="Enter current number of employees"
                                            required
                                        />
                                        {form.errors.headcount_current && (
                                            <p className="text-xs text-destructive">{form.errors.headcount_current}</p>
                                        )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expected Workforce */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Expected Workforce</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="expectedWorkforce1Year">Expected Workforce After 1 Year *</Label>
                                            <Input
                                                id="expectedWorkforce1Year"
                                                type="number"
                                                value={form.data.expected_workforce_1_year}
                                                onChange={(e) => form.setData('expected_workforce_1_year', e.target.value)}
                                                placeholder="Enter expected number"
                                                required
                                            />
                                            {form.errors.expected_workforce_1_year && (
                                                <p className="text-xs text-destructive">{form.errors.expected_workforce_1_year}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expectedWorkforce2Years">Expected Workforce After 2 Years *</Label>
                                            <Input
                                                id="expectedWorkforce2Years"
                                                type="number"
                                                value={form.data.expected_workforce_2_years}
                                                onChange={(e) => form.setData('expected_workforce_2_years', e.target.value)}
                                                placeholder="Enter expected number"
                                                required
                                            />
                                            {form.errors.expected_workforce_2_years && (
                                                <p className="text-xs text-destructive">{form.errors.expected_workforce_2_years}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expectedWorkforce3Years">Expected Workforce After 3 Years *</Label>
                                            <Input
                                                id="expectedWorkforce3Years"
                                                type="number"
                                                value={form.data.expected_workforce_3_years}
                                                onChange={(e) => form.setData('expected_workforce_3_years', e.target.value)}
                                                placeholder="Enter expected number"
                                                required
                                            />
                                            {form.errors.expected_workforce_3_years && (
                                                <p className="text-xs text-destructive">{form.errors.expected_workforce_3_years}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Average Tenure */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Average Tenure</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="averageTenureActive">Average Tenure of Active Employees *</Label>
                                            <Input
                                                id="averageTenureActive"
                                                type="number"
                                                step="0.1"
                                                value={form.data.average_tenure_active}
                                                onChange={(e) => form.setData('average_tenure_active', e.target.value)}
                                                placeholder="Enter average tenure in years"
                                                required
                                            />
                                            {form.errors.average_tenure_active && (
                                                <p className="text-xs text-destructive">{form.errors.average_tenure_active}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="averageTenureLeavers">Average Tenure of Leavers *</Label>
                                            <Input
                                                id="averageTenureLeavers"
                                                type="number"
                                                step="0.1"
                                                value={form.data.average_tenure_leavers}
                                                onChange={(e) => form.setData('average_tenure_leavers', e.target.value)}
                                                placeholder="Enter average tenure in years"
                                                required
                                            />
                                            {form.errors.average_tenure_leavers && (
                                                <p className="text-xs text-destructive">{form.errors.average_tenure_leavers}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Average Age */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Average Age</h3>
                                    <div className="grid md:grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="averageAgeActive">Average Age of Active Employees *</Label>
                                            <Input
                                                id="averageAgeActive"
                                                type="number"
                                                step="0.1"
                                                value={form.data.average_age_active}
                                                onChange={(e) => form.setData('average_age_active', e.target.value)}
                                                placeholder="Enter average age"
                                                required
                                            />
                                            {form.errors.average_age_active && (
                                                <p className="text-xs text-destructive">{form.errors.average_age_active}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gender Breakdown */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Gender Breakdown</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="maleEmployees">Number of Male Employees *</Label>
                                            <Input
                                                id="maleEmployees"
                                                type="number"
                                                value={form.data.male_employees}
                                                onChange={(e) => form.setData('male_employees', e.target.value)}
                                                placeholder="Enter number of male employees"
                                                required
                                            />
                                            {form.errors.male_employees && (
                                                <p className="text-xs text-destructive">{form.errors.male_employees}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="femaleEmployees">Number of Female Employees *</Label>
                                            <Input
                                                id="femaleEmployees"
                                                type="number"
                                                value={form.data.female_employees}
                                                onChange={(e) => form.setData('female_employees', e.target.value)}
                                                placeholder="Enter number of female employees"
                                                required
                                            />
                                            {form.errors.female_employees && (
                                                <p className="text-xs text-destructive">{form.errors.female_employees}</p>
                                            )}
                                        </div>
                                    </div>
                                    {form.data.male_employees && form.data.female_employees && (
                                        <div className="text-sm text-muted-foreground">
                                            Gender Ratio: {Math.round((parseInt(form.data.male_employees) / (parseInt(form.data.male_employees) + parseInt(form.data.female_employees))) * 100)}% Male, {Math.round((parseInt(form.data.female_employees) / (parseInt(form.data.male_employees) + parseInt(form.data.female_employees))) * 100)}% Female (Calculated automatically)
                                        </div>
                                    )}
                                </div>

                                {/* Task 5: Leadership Information */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Task 5: Leadership Information (Above Team Leader Level)</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalLeadersAboveTeamLeader">Total Number of Leaders Above Team Leader *</Label>
                                            <Input
                                                id="totalLeadersAboveTeamLeader"
                                                type="number"
                                                value={form.data.total_leaders_above_team_leader}
                                                onChange={(e) => {
                                                    form.setData('total_leaders_above_team_leader', e.target.value);
                                                    // Calculate percentage automatically
                                                    const total = parseInt(e.target.value) || 0;
                                                    const currentEmployees = parseInt(form.data.headcount_current) || 1;
                                                    const percentage = currentEmployees > 0 ? ((total / currentEmployees) * 100).toFixed(2) : '0';
                                                    form.setData('leaders_percentage', percentage);
                                                }}
                                                placeholder="Enter total number"
                                                required
                                            />
                                            {form.errors.total_leaders_above_team_leader && (
                                                <p className="text-xs text-destructive">{form.errors.total_leaders_above_team_leader}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="leadersPercentage">Percentage of Total Workforce</Label>
                                            <Input
                                                id="leadersPercentage"
                                                type="number"
                                                step="0.01"
                                                value={form.data.leaders_percentage}
                                                readOnly
                                                placeholder="Calculated automatically"
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">Calculated automatically</p>
                                        </div>
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
                                        {orgChartPreview && (
                                            <div className="mt-4">
                                                <img 
                                                    src={orgChartPreview}
                                                    alt="Organization chart preview"
                                                    className="w-full max-w-md mx-auto h-48 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => {
                                                        if (orgChartPreview) {
                                                            if (orgChartPreview.startsWith('data:')) {
                                                                const newWindow = window.open();
                                                                if (newWindow) {
                                                                    newWindow.document.write(`<img src="${orgChartPreview}" style="max-width: 100%; height: auto;" />`);
                                                                }
                                                            } else {
                                                                window.open(orgChartPreview, '_blank');
                                                            }
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {form.data.org_chart && !orgChartPreview && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {form.data.org_chart.name}
                                            </p>
                                        )}
                                        {workforce?.org_chart_path && !form.data.org_chart && !orgChartPreview && (
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
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            form.setData('org_chart', file);
                                            if (!file) {
                                                // Restore existing chart preview if file is cleared
                                                if (workforce?.org_chart_path) {
                                                    const chartUrl = workforce.org_chart_path.startsWith('http') || workforce.org_chart_path.startsWith('/')
                                                        ? workforce.org_chart_path
                                                        : `/storage/${workforce.org_chart_path}`;
                                                    setOrgChartPreview(chartUrl);
                                                } else {
                                                    setOrgChartPreview(null);
                                                }
                                            }
                                        }}
                                    />
                                    {form.errors.org_chart && (
                                        <p className="text-xs text-destructive">{form.errors.org_chart}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/business-profile`)}
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
