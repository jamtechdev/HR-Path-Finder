import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    ArrowLeft,
    Briefcase,
    Building2,
    Check,
    ChevronLeft,
    FileText,
    MessageSquare,
    Settings,
    Upload,
    Users,
} from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Company {
    id: number;
    name: string;
    brand_name?: string | null;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    secondary_industries?: string[] | null;
    logo_path?: string | null;
}

interface BusinessProfile {
    annual_revenue?: number | null;
    operational_margin_rate?: number | null;
    annual_human_cost?: number | null;
    business_type?: string | null;
}

interface Workforce {
    headcount_year_minus_2?: number | null;
    headcount_year_minus_1?: number | null;
    headcount_current?: number | null;
    total_employees?: number | null;
    contract_employees?: number | null;
    org_chart_path?: string | null;
}

interface CurrentHrStatus {
    dedicated_hr_team?: boolean | null;
    labor_union_present?: boolean | null;
    labor_relations_stability?: string | null;
    evaluation_system_status?: string | null;
    compensation_system_status?: string | null;
    evaluation_system_issues?: string | null;
    job_rank_levels?: number | null;
    job_title_levels?: number | null;
}

interface Culture {
    work_format?: string | null;
    decision_making_style?: string | null;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    notes?: string | null;
}

interface Project {
    id: number;
    status: string;
    current_step?: string | null;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
const primaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Other'];
const coreValueSuggestions = [
    'Innovation',
    'Customer Focus',
    'Integrity',
    'Excellence',
    'Teamwork',
    'Agility',
    'Accountability',
    'Growth',
    'Sustainability',
];

const formatKrwBillions = (value: number) => `₩${value.toFixed(1)}B`;
const formatPeople = (value: number) => `${value} people`;
const toNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const businessTypeOptions = [
    { value: 'b2b', label: 'B2B' },
    { value: 'b2c', label: 'B2C' },
    { value: 'b2b2c', label: 'B2B2C' },
];

const workFormatOptions = [
    { value: 'on_site', label: 'Fully On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Fully Remote' },
    { value: 'flexible', label: 'Flexible' },
];

const decisionStyleOptions = [
    { value: 'top_down', label: 'Top-down' },
    { value: 'collaborative', label: 'Collaborative' },
    { value: 'consensus', label: 'Consensus-driven' },
    { value: 'decentralized', label: 'Decentralized' },
];

const stepOrder = [
    'company',
    'business',
    'workforce',
    'current-hr',
    'culture',
    'confidential',
    'review',
] as const;

type StepId = 'overview' | (typeof stepOrder)[number];

export default function DiagnosisStep({ company, project }: PageProps) {
    const foundationDate = company.foundation_date ? company.foundation_date.slice(0, 10) : '';
    const secondaryIndustries = Array.isArray(company.secondary_industries) ? company.secondary_industries : [];
    const cultureValues = Array.isArray(project.culture?.core_values) ? project.culture?.core_values : [];
    const page = usePage();

    const companyForm = useForm({
        name: company.name || '',
        brand_name: company.brand_name || '',
        foundation_date: foundationDate,
        hq_location: company.hq_location || '',
        industry: company.industry || '',
        secondary_industries: secondaryIndustries,
        logo: null as File | null,
    });

    const businessForm = useForm({
        annual_revenue: project.business_profile?.annual_revenue?.toString() || '',
        operational_margin_rate: project.business_profile?.operational_margin_rate?.toString() || '',
        annual_human_cost: project.business_profile?.annual_human_cost?.toString() || '',
        business_type: project.business_profile?.business_type || '',
    });

    const workforceForm = useForm({
        headcount_year_minus_2: project.workforce?.headcount_year_minus_2?.toString() || '',
        headcount_year_minus_1: project.workforce?.headcount_year_minus_1?.toString() || '',
        headcount_current: project.workforce?.headcount_current?.toString() || '',
        total_employees: project.workforce?.total_employees?.toString() || '',
        contract_employees: project.workforce?.contract_employees?.toString() || '',
        org_chart: null as File | null,
    });

    const currentHrForm = useForm({
        dedicated_hr_team: project.current_hr_status?.dedicated_hr_team ?? false,
        labor_union_present: project.current_hr_status?.labor_union_present ?? false,
        labor_relations_stability: project.current_hr_status?.labor_relations_stability || '',
        evaluation_system_status: project.current_hr_status?.evaluation_system_status || '',
        compensation_system_status: project.current_hr_status?.compensation_system_status || '',
        evaluation_system_issues: project.current_hr_status?.evaluation_system_issues || '',
        job_rank_levels: project.current_hr_status?.job_rank_levels ?? null,
        job_title_levels: project.current_hr_status?.job_title_levels ?? null,
    });

    const cultureForm = useForm({
        work_format: project.culture?.work_format || '',
        decision_making_style: project.culture?.decision_making_style || '',
        core_values: cultureValues,
    });

    const confidentialForm = useForm({
        notes: project.confidential_note?.notes || '',
    });

    const submitForm = useForm({});
    const submitErrors = submitForm.errors as Record<string, string>;
    const [coreValueInput, setCoreValueInput] = useState('');

    const stepStatus = useMemo(() => {
        const companyComplete = Boolean(
            company.name &&
                company.foundation_date &&
                company.hq_location &&
                company.industry
        );
        const businessComplete = Boolean(project.business_profile);
        const workforceComplete = Boolean(project.workforce);
        const currentHrComplete = Boolean(project.current_hr_status);
        const cultureComplete = Boolean(project.culture && (project.culture.core_values || []).length > 0);
        const confidentialComplete = Boolean(project.confidential_note);
        const submitted = Boolean(project.current_step && project.current_step !== 'diagnosis');

        return {
            company: companyComplete,
            business: businessComplete,
            workforce: workforceComplete,
            'current-hr': currentHrComplete,
            culture: cultureComplete,
            confidential: confidentialComplete,
            review: submitted,
        };
    }, [company, project]);

    const totalSteps = stepOrder.length;
    const completedCount = stepOrder.filter((step) => stepStatus[step]).length;
    const hasStarted = project.status !== 'not_started' || completedCount > 0;

    const tabFromQuery = useMemo(() => {
        const resolveFromQuery = (query: string) => {
            const tab = new URLSearchParams(query).get('tab');
            if (!tab) {
                return null;
            }
            if (tab === 'overview') {
                return 'overview';
            }
            if (stepOrder.includes(tab as (typeof stepOrder)[number])) {
                return tab as StepId;
            }
            return null;
        };

        if (typeof window !== 'undefined') {
            const fromLocation = resolveFromQuery(window.location.search.replace('?', ''));
            if (fromLocation) {
                return fromLocation;
            }
        }

        const query = page.url.split('?')[1] ?? '';
        return resolveFromQuery(query);
    }, [page.url]);

    const [activeTab, setActiveTab] = useState<StepId>(() => {
        return tabFromQuery ?? 'overview';
    });

    useEffect(() => {
        const nextTab = tabFromQuery ?? 'overview';
        setActiveTab((current) => (current === nextTab ? current : nextTab));
    }, [page.url, tabFromQuery]);

    const setTab = (tabId: StepId) => {
        setActiveTab(tabId);
        if (typeof window === 'undefined') {
            return;
        }
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url.toString());
    };

    const activeStepNumber =
        activeTab === 'overview'
            ? 0
            : stepOrder.indexOf(activeTab as (typeof stepOrder)[number]) + 1;
    const progressPercent = Math.round((activeStepNumber / totalSteps) * 100);
    const activeIndex = stepOrder.indexOf(activeTab as (typeof stepOrder)[number]);
    const totalEmployeesValue = toNumber(workforceForm.data.total_employees);
    const contractEmployeesValue = Math.min(
        totalEmployeesValue,
        toNumber(workforceForm.data.contract_employees)
    );
    const contractPercent =
        totalEmployeesValue === 0 ? 0 : Math.round((contractEmployeesValue / totalEmployeesValue) * 100);

    const toggleSecondaryIndustry = (industry: string) => {
        const current = companyForm.data.secondary_industries;
        if (current.includes(industry)) {
            companyForm.setData(
                'secondary_industries',
                current.filter((item) => item !== industry)
            );
            return;
        }
        companyForm.setData('secondary_industries', [...current, industry]);
    };

    const addCoreValue = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return;
        }
        if (cultureForm.data.core_values.length >= 5) {
            return;
        }
        if (cultureForm.data.core_values.includes(trimmed)) {
            return;
        }
        cultureForm.setData('core_values', [...cultureForm.data.core_values, trimmed]);
    };

    const removeCoreValue = (value: string) => {
        cultureForm.setData(
            'core_values',
            cultureForm.data.core_values.filter((item) => item !== value)
        );
    };

    const submitCompanyInfo = () => {
        companyForm.post(`/diagnosis/${project.id}/company-info`, {
            forceFormData: true,
            onSuccess: () => setTab('business'),
        });
    };

    const submitBusinessProfile = () => {
        businessForm.post(`/diagnosis/${project.id}/business-profile`, {
            onSuccess: () => setTab('workforce'),
        });
    };

    const submitWorkforce = () => {
        workforceForm.post(`/diagnosis/${project.id}/workforce`, {
            forceFormData: true,
            onSuccess: () => setTab('current-hr'),
        });
    };

    const submitCurrentHr = () => {
        currentHrForm.post(`/diagnosis/${project.id}/current-hr`, {
            onSuccess: () => setTab('culture'),
        });
    };

    const submitCulture = () => {
        cultureForm.post(`/diagnosis/${project.id}/culture`, {
            onSuccess: () => setTab('confidential'),
        });
    };

    const submitConfidential = () => {
        confidentialForm.post(`/diagnosis/${project.id}/confidential`, {
            onSuccess: () => setTab('review'),
        });
    };

    const submitDiagnosis = () => {
        submitForm.post(`/diagnosis/${project.id}/submit`);
    };

    const canGoBack = activeTab !== 'overview';
    const canGoNext = activeTab !== 'review';

    const handleBack = () => {
        if (!canGoBack) return;
        if (activeTab === 'company') {
            setTab('overview');
            return;
        }
        if (activeIndex > 0) {
            setTab(stepOrder[activeIndex - 1]);
        }
    };

    const handleNext = () => {
        if (!canGoNext) return;
        switch (activeTab) {
            case 'overview':
                setTab('company');
                break;
            case 'company':
                submitCompanyInfo();
                break;
            case 'business':
                submitBusinessProfile();
                break;
            case 'workforce':
                submitWorkforce();
                break;
            case 'current-hr':
                submitCurrentHr();
                break;
            case 'culture':
                submitCulture();
                break;
            case 'confidential':
                submitConfidential();
                break;
            default:
                break;
        }
    };

    const isNextDisabled = () => {
        switch (activeTab) {
            case 'company':
                return companyForm.processing;
            case 'business':
                return businessForm.processing;
            case 'workforce':
                return workforceForm.processing;
            case 'current-hr':
                return currentHrForm.processing;
            case 'culture':
                return cultureForm.processing;
            case 'confidential':
                return confidentialForm.processing;
            default:
                return false;
        }
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: FileText },
        { id: 'company', name: 'Company Info', icon: Building2 },
        { id: 'business', name: 'Business Profile', icon: Briefcase },
        { id: 'workforce', name: 'Workforce', icon: Users },
        { id: 'current-hr', name: 'Current HR', icon: Settings },
        { id: 'culture', name: 'Culture', icon: MessageSquare },
        { id: 'confidential', name: 'Confidential', icon: FileText },
        { id: 'review', name: 'Review & Submit', icon: Check },
    ];

    const isTabLocked = (tabId: StepId) => {
        if (tabId === 'overview') {
            return false;
        }
        const index = stepOrder.indexOf(tabId as (typeof stepOrder)[number]);
        if (index === -1) {
            return true;
        }
        if (index === 0) {
            return false;
        }
        return !stepOrder.slice(0, index).every((step) => stepStatus[step]);
    };

    const { errors } = page.props as { errors: Record<string, string> };
    const isSubmitted = Boolean(project.current_step && project.current_step !== 'diagnosis');
    const statusLabel = isSubmitted ? 'Submitted' : hasStarted ? 'In Progress' : 'Not Started';
    const statusClasses = isSubmitted
        ? 'bg-success/10 text-success'
        : hasStarted
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-muted-foreground';

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 1: Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-0.5"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-display font-bold tracking-tight">
                                        Step 1: Diagnosis
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    Input company information and organizational context
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium">
                                    {activeTab === 'overview'
                                        ? 'Overview'
                                        : tabs.find((tab) => tab.id === activeTab)?.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {activeStepNumber} of {totalSteps}
                                </span>
                            </div>
                            <div className="relative w-full overflow-hidden rounded-full bg-secondary h-2">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const locked = isTabLocked(tab.id as StepId);
                            const isActive = tab.id === activeTab;
                            const isComplete =
                                tab.id === 'overview'
                                    ? hasStarted
                                    : stepStatus[tab.id as (typeof stepOrder)[number]];
                            const TabIcon = isComplete ? Check : tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    disabled={locked}
                                    onClick={() => setTab(tab.id as StepId)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : locked
                                            ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                                            : isComplete
                                            ? 'bg-success/10 text-success hover:bg-success/20'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="animate-fade-in">
                        {activeTab === 'overview' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="p-8 text-center space-y-6">
                                    <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-display font-bold mb-2">
                                            Company Diagnosis
                                        </h2>
                                        <p className="text-muted-foreground max-w-lg mx-auto">
                                            In this step, you'll provide comprehensive information about your
                                            company, including business profile, workforce composition, current HR
                                            systems, and organizational culture. This data will serve as the
                                            foundation for designing your HR system.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3">
                                        {stepOrder.slice(0, 5).map((tag) => (
                                            <div
                                                key={tag}
                                                className="inline-flex items-center rounded-full border text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1"
                                            >
                                                {tabs.find((tab) => tab.id === tag)?.name}
                                            </div>
                                        ))}
                                    </div>

                                    <Button className="h-11 px-8" onClick={handleNext}>
                                        Start Diagnosis
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'company' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Company Basic Information
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitCompanyInfo();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName">Company Name *</Label>
                                                <Input
                                                    id="companyName"
                                                    value={companyForm.data.name}
                                                    onChange={(e) => companyForm.setData('name', e.target.value)}
                                                    placeholder="Enter company name"
                                                />
                                                {companyForm.errors.name && (
                                                    <p className="text-xs text-destructive">
                                                        {companyForm.errors.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="brandName">Brand Name</Label>
                                                <Input
                                                    id="brandName"
                                                    value={companyForm.data.brand_name}
                                                    onChange={(e) =>
                                                        companyForm.setData('brand_name', e.target.value)
                                                    }
                                                    placeholder="Enter brand name (if different)"
                                                />
                                                {companyForm.errors.brand_name && (
                                                    <p className="text-xs text-destructive">
                                                        {companyForm.errors.brand_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="foundationDate">Foundation Date *</Label>
                                                <Input
                                                    id="foundationDate"
                                                    type="date"
                                                    value={companyForm.data.foundation_date}
                                                    onChange={(e) =>
                                                        companyForm.setData('foundation_date', e.target.value)
                                                    }
                                                />
                                                {companyForm.errors.foundation_date && (
                                                    <p className="text-xs text-destructive">
                                                        {companyForm.errors.foundation_date}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hqLocation">HQ Location *</Label>
                                                <Input
                                                    id="hqLocation"
                                                    value={companyForm.data.hq_location}
                                                    onChange={(e) =>
                                                        companyForm.setData('hq_location', e.target.value)
                                                    }
                                                    placeholder="City, Country"
                                                />
                                                {companyForm.errors.hq_location && (
                                                    <p className="text-xs text-destructive">
                                                        {companyForm.errors.hq_location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="industry1">Primary Industry *</Label>
                                                <Select
                                                    value={companyForm.data.industry}
                                                    onValueChange={(value) =>
                                                        companyForm.setData('industry', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select primary industry" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {primaryIndustryOptions.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {companyForm.errors.industry && (
                                                    <p className="text-xs text-destructive">
                                                        {companyForm.errors.industry}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Secondary Industries</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {secondaryIndustryOptions.map((industry) => {
                                                        const selected = companyForm.data.secondary_industries.includes(
                                                            industry
                                                        );
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={industry}
                                                                onClick={() => toggleSecondaryIndustry(industry)}
                                                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                                                                    selected
                                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                                        : 'text-foreground'
                                                                }`}
                                                            >
                                                                {industry}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="logo">Company Logo</Label>
                                            <label
                                                htmlFor="logo"
                                                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                            >
                                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG up to 2MB
                                                </p>
                                                {companyForm.data.logo && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Selected: {companyForm.data.logo.name}
                                                    </p>
                                                )}
                                                {company.logo_path && !companyForm.data.logo && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Current logo uploaded.
                                                    </p>
                                                )}
                                            </label>
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    companyForm.setData('logo', e.target.files?.[0] || null)
                                                }
                                            />
                                            {companyForm.errors.logo && (
                                                <p className="text-xs text-destructive">{companyForm.errors.logo}</p>
                                            )}
                                        </div>

                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'business' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Business Profile
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitBusinessProfile();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="annualRevenue">Annual Revenue (KRW)</Label>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {formatKrwBillions(toNumber(businessForm.data.annual_revenue))}
                                                </span>
                                            </div>
                                            <input
                                                id="annualRevenue"
                                                type="range"
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={toNumber(businessForm.data.annual_revenue)}
                                                onChange={(e) =>
                                                    businessForm.setData('annual_revenue', e.target.value)
                                                }
                                                className="w-full accent-slider"
                                            />
                                            {businessForm.errors.annual_revenue && (
                                                <p className="text-xs text-destructive">
                                                    {businessForm.errors.annual_revenue}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="marginRate">Operational Margin Rate (%)</Label>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {toNumber(businessForm.data.operational_margin_rate)}%
                                                </span>
                                            </div>
                                            <input
                                                id="marginRate"
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={toNumber(businessForm.data.operational_margin_rate)}
                                                onChange={(e) =>
                                                    businessForm.setData('operational_margin_rate', e.target.value)
                                                }
                                                className="w-full accent-slider"
                                            />
                                            {businessForm.errors.operational_margin_rate && (
                                                <p className="text-xs text-destructive">
                                                    {businessForm.errors.operational_margin_rate}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="humanCost">Annual Human Cost (KRW)</Label>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {formatKrwBillions(toNumber(businessForm.data.annual_human_cost))}
                                                </span>
                                            </div>
                                            <input
                                                id="humanCost"
                                                type="range"
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={toNumber(businessForm.data.annual_human_cost)}
                                                onChange={(e) =>
                                                    businessForm.setData('annual_human_cost', e.target.value)
                                                }
                                                className="w-full accent-slider"
                                            />
                                            {businessForm.errors.annual_human_cost && (
                                                <p className="text-xs text-destructive">
                                                    {businessForm.errors.annual_human_cost}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Business Type *</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {businessTypeOptions.map((option) => {
                                                    const isSelected =
                                                        businessForm.data.business_type === option.value;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() =>
                                                                businessForm.setData('business_type', option.value)
                                                            }
                                                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                                    : 'border-border bg-card text-foreground hover:border-primary/40'
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {businessForm.errors.business_type && (
                                                <p className="text-xs text-destructive">
                                                    {businessForm.errors.business_type}
                                                </p>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'workforce' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Workforce Information
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitWorkforce();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label>Headcount (Year -2)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="2 years ago"
                                                    value={workforceForm.data.headcount_year_minus_2}
                                                    onChange={(e) =>
                                                        workforceForm.setData(
                                                            'headcount_year_minus_2',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {workforceForm.errors.headcount_year_minus_2 && (
                                                    <p className="text-xs text-destructive">
                                                        {workforceForm.errors.headcount_year_minus_2}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Headcount (Year -1)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="1 year ago"
                                                    value={workforceForm.data.headcount_year_minus_1}
                                                    onChange={(e) =>
                                                        workforceForm.setData(
                                                            'headcount_year_minus_1',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {workforceForm.errors.headcount_year_minus_1 && (
                                                    <p className="text-xs text-destructive">
                                                        {workforceForm.errors.headcount_year_minus_1}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Headcount (Current)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Current year"
                                                    value={workforceForm.data.headcount_current}
                                                    onChange={(e) =>
                                                        workforceForm.setData('headcount_current', e.target.value)
                                                    }
                                                />
                                                {workforceForm.errors.headcount_current && (
                                                    <p className="text-xs text-destructive">
                                                        {workforceForm.errors.headcount_current}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Current Total Employees</Label>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {formatPeople(totalEmployeesValue)}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1000}
                                                step={1}
                                                value={totalEmployeesValue}
                                                onChange={(e) => {
                                                    const nextTotal = Number(e.target.value);
                                                    workforceForm.setData('total_employees', e.target.value);
                                                    if (contractEmployeesValue > nextTotal) {
                                                        workforceForm.setData(
                                                            'contract_employees',
                                                            String(nextTotal)
                                                        );
                                                    }
                                                }}
                                                className="w-full accent-slider"
                                            />
                                            {workforceForm.errors.total_employees && (
                                                <p className="text-xs text-destructive">
                                                    {workforceForm.errors.total_employees}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Contract Employees</Label>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {contractEmployeesValue} ({contractPercent}%)
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={Math.max(1, totalEmployeesValue)}
                                                step={1}
                                                value={contractEmployeesValue}
                                                onChange={(e) =>
                                                    workforceForm.setData('contract_employees', e.target.value)
                                                }
                                                className="w-full accent-slider"
                                            />
                                            {workforceForm.errors.contract_employees && (
                                                <p className="text-xs text-destructive">
                                                    {workforceForm.errors.contract_employees}
                                                </p>
                                            )}
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
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PDF, PNG, JPG up to 5MB
                                                </p>
                                                {workforceForm.data.org_chart && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Selected: {workforceForm.data.org_chart.name}
                                                    </p>
                                                )}
                                                {project.workforce?.org_chart_path && !workforceForm.data.org_chart && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Existing org chart uploaded.
                                                    </p>
                                                )}
                                            </label>
                                            <Input
                                                id="orgChart"
                                                type="file"
                                                className="hidden"
                                                onChange={(e) =>
                                                    workforceForm.setData(
                                                        'org_chart',
                                                        e.target.files?.[0] || null
                                                    )
                                                }
                                            />
                                            {workforceForm.errors.org_chart && (
                                                <p className="text-xs text-destructive">
                                                    {workforceForm.errors.org_chart}
                                                </p>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'current-hr' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Current HR System Status
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitCurrentHr();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="dedicatedHrTeam"
                                                        checked={currentHrForm.data.dedicated_hr_team}
                                                        onCheckedChange={(checked) =>
                                                            currentHrForm.setData('dedicated_hr_team', checked === true)
                                                        }
                                                    />
                                                    <Label htmlFor="dedicatedHrTeam">
                                                        Dedicated HR Team Present
                                                    </Label>
                                                </div>
                                                {currentHrForm.errors.dedicated_hr_team && (
                                                    <p className="text-xs text-destructive">
                                                        {currentHrForm.errors.dedicated_hr_team}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="laborUnion"
                                                        checked={currentHrForm.data.labor_union_present}
                                                        onCheckedChange={(checked) =>
                                                            currentHrForm.setData('labor_union_present', checked === true)
                                                        }
                                                    />
                                                    <Label htmlFor="laborUnion">Labor Union Present</Label>
                                                </div>
                                                {currentHrForm.errors.labor_union_present && (
                                                    <p className="text-xs text-destructive">
                                                        {currentHrForm.errors.labor_union_present}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Labor Relations Stability</Label>
                                                <Select
                                                    value={currentHrForm.data.labor_relations_stability}
                                                    onValueChange={(value) =>
                                                        currentHrForm.setData('labor_relations_stability', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select stability level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="stable">Stable</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="unstable">Unstable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {currentHrForm.errors.labor_relations_stability && (
                                                    <p className="text-xs text-destructive">
                                                        {currentHrForm.errors.labor_relations_stability}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Evaluation System Status</Label>
                                                <Select
                                                    value={currentHrForm.data.evaluation_system_status}
                                                    onValueChange={(value) =>
                                                        currentHrForm.setData('evaluation_system_status', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="informal">Informal</SelectItem>
                                                        <SelectItem value="basic">Basic</SelectItem>
                                                        <SelectItem value="advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {currentHrForm.errors.evaluation_system_status && (
                                                    <p className="text-xs text-destructive">
                                                        {currentHrForm.errors.evaluation_system_status}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Compensation System Status</Label>
                                                <Select
                                                    value={currentHrForm.data.compensation_system_status}
                                                    onValueChange={(value) =>
                                                        currentHrForm.setData('compensation_system_status', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="informal">Informal</SelectItem>
                                                        <SelectItem value="basic">Basic</SelectItem>
                                                        <SelectItem value="advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {currentHrForm.errors.compensation_system_status && (
                                                    <p className="text-xs text-destructive">
                                                        {currentHrForm.errors.compensation_system_status}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Evaluation System Issues (HR Manager Only)</Label>
                                            <Textarea
                                                value={currentHrForm.data.evaluation_system_issues}
                                                onChange={(e) =>
                                                    currentHrForm.setData('evaluation_system_issues', e.target.value)
                                                }
                                                placeholder="Describe any issues with the current evaluation system..."
                                            />
                                            {currentHrForm.errors.evaluation_system_issues && (
                                                <p className="text-xs text-destructive">
                                                    {currentHrForm.errors.evaluation_system_issues}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                This information is confidential and will not be shown verbatim to the CEO.
                                            </p>
                                        </div>

                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'culture' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Culture & Values
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitCulture();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <Label>Work Format</Label>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {workFormatOptions.map((option) => {
                                                        const isSelected =
                                                            cultureForm.data.work_format === option.value;
                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() =>
                                                                    cultureForm.setData(
                                                                        'work_format',
                                                                        option.value
                                                                    )
                                                                }
                                                                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-border bg-card text-foreground hover:border-primary/40'
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {cultureForm.errors.work_format && (
                                                    <p className="text-xs text-destructive">
                                                        {cultureForm.errors.work_format}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label>Decision-Making Style</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {decisionStyleOptions.map((option) => {
                                                        const isSelected =
                                                            cultureForm.data.decision_making_style === option.value;
                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() =>
                                                                    cultureForm.setData(
                                                                        'decision_making_style',
                                                                        option.value
                                                                    )
                                                                }
                                                                className={`rounded-lg border px-4 py-4 text-sm font-semibold transition-colors text-left ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-border bg-card text-foreground hover:border-primary/40'
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {cultureForm.errors.decision_making_style && (
                                                    <p className="text-xs text-destructive">
                                                        {cultureForm.errors.decision_making_style}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Core Value Keywords (Select up to 5)</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {cultureForm.data.core_values.map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => removeCoreValue(value)}
                                                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary border-primary/20"
                                                    >
                                                        {value} ✕
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                                <Input
                                                    value={coreValueInput}
                                                    onChange={(e) => setCoreValueInput(e.target.value)}
                                                    placeholder="Add a core value"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        addCoreValue(coreValueInput);
                                                        setCoreValueInput('');
                                                    }}
                                                >
                                                    Add Value
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {coreValueSuggestions.map((value) => {
                                                    const isSelected =
                                                        cultureForm.data.core_values.includes(value);
                                                    return (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => addCoreValue(value)}
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                                                                isSelected
                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                    : 'text-foreground hover:border-primary/40'
                                                            }`}
                                                        >
                                                            {value}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {cultureForm.errors.core_values && (
                                                <p className="text-xs text-destructive">
                                                    {cultureForm.errors.core_values}
                                                </p>
                                            )}
                                        </div>

                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'confidential' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                            Internal HR Issues
                                        </h3>
                                        <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px]">
                                            Confidential
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                                        <p className="text-sm text-destructive">
                                            Confidentiality Notice: Information entered here will be used to inform HR
                                            system design recommendations but will never be shown verbatim to the CEO.
                                            This section is for HR Manager use only.
                                        </p>
                                    </div>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitConfidential();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label>Describe Internal HR Challenges and Pain Points</Label>
                                            <Textarea
                                                value={confidentialForm.data.notes}
                                                onChange={(e) => confidentialForm.setData('notes', e.target.value)}
                                                placeholder="Describe any internal HR challenges, employee relations issues, compensation concerns, or organizational pain points that should inform the HR system design..."
                                                className="min-h-[160px]"
                                            />
                                            {confidentialForm.errors.notes && (
                                                <p className="text-xs text-destructive">{confidentialForm.errors.notes}</p>
                                            )}
                                        </div>

                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'review' && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Review & Submit Diagnosis
                                    </h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Company Information</p>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Company Name:</span>
                                                    <span>{company.name || '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Industry:</span>
                                                    <span>{company.industry || '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>HQ Location:</span>
                                                    <span>{company.hq_location || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Business Profile</p>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Business Type:</span>
                                                    <span>
                                                        {project.business_profile?.business_type
                                                            ? project.business_profile.business_type.toUpperCase()
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Annual Revenue:</span>
                                                    <span>
                                                        {project.business_profile?.annual_revenue !== null &&
                                                        project.business_profile?.annual_revenue !== undefined
                                                            ? formatKrwBillions(
                                                                  toNumber(project.business_profile.annual_revenue)
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Workforce</p>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Total Employees:</span>
                                                    <span>{project.workforce?.total_employees ?? '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Contract Employees:</span>
                                                    <span>{project.workforce?.contract_employees ?? '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Current HR</p>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Evaluation System:</span>
                                                    <span>{project.current_hr_status?.evaluation_system_status ?? '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Compensation System:</span>
                                                    <span>{project.current_hr_status?.compensation_system_status ?? '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Culture</p>
                                            <div className="text-sm text-muted-foreground">
                                                {(project.culture?.core_values || []).length > 0
                                                    ? (project.culture?.core_values || []).join(', ')
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/40 p-4">
                                            <p className="text-sm font-semibold mb-3">Confidential</p>
                                            <div className="text-sm text-muted-foreground">
                                                {project.confidential_note?.notes || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {submitErrors.diagnosis && (
                                        <p className="text-sm text-destructive">{submitErrors.diagnosis}</p>
                                    )}

                                    {errors?.diagnosis && (
                                        <p className="text-sm text-destructive">{errors.diagnosis}</p>
                                    )}

                                    <Button
                                        className="w-full h-11"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            submitDiagnosis();
                                        }}
                                        disabled={submitForm.processing || !stepOrder
                                            .slice(0, 6)
                                            .every((step) => stepStatus[step])}
                                    >
                                        {submitForm.processing ? 'Submitting...' : 'Submit & Lock Step 1'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleBack} disabled={!canGoBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={!canGoNext || isNextDisabled()}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}