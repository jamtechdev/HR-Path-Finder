import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Briefcase,
    Building2,
    Check,
    ChevronLeft,
    FileText,
    MessageSquare,
    Settings,
    Upload,
    Users,
    ArrowRight,
} from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import StepFooter from '@/components/StepFooter';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { RangeField } from '@/components/Diagnosis/RangeField';

const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
const primaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Other'];

type StepId =
    | 'overview'
    | 'company'
    | 'business'
    | 'workforce'
    | 'current-hr'
    | 'culture'
    | 'confidential'
    | 'review';

interface Company {
    id: number;
    name: string;
    brand_name?: string;
    foundation_date?: string;
    hq_location?: string;
    industry?: string;
    secondary_industries?: string[];
    latitude?: string;
    longitude?: string;
    logo_path?: string;
    image_path?: string;
}

interface BusinessProfile {
    annual_revenue?: number;
    operational_margin_rate?: number;
    annual_human_cost?: number;
    business_type?: string;
}

interface Workforce {
    headcount_year_minus_2?: number;
    headcount_year_minus_1?: number;
    headcount_current?: number;
    total_employees?: number;
    contract_employees?: number;
    org_chart_path?: string;
}

interface CurrentHr {
    dedicated_hr_team?: boolean;
    labor_union_present?: boolean;
    labor_relations_stability?: string;
    evaluation_system_status?: string;
    compensation_system_status?: string;
    evaluation_system_issues?: string;
    job_rank_levels?: number;
    job_title_levels?: number;
}

interface Culture {
    work_format?: string;
    decision_making_style?: string;
    core_values?: string[];
}

interface Confidential {
    notes?: string;
}

interface CompanyWithRelations extends Company {
    diagnosis_status?: string;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHr | null;
    culture?: Culture | null;
    confidential_note?: Confidential | null;
}

interface PageProps {
    company?: CompanyWithRelations | null;
}

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

const coreValueSuggestions = [
    'Innovation',
    'Customer Focus',
    'Integrity',
    'Excellence',
    'Teamwork',
    'Agility',
    'Accountability',
    'Respect',
    'Growth',
    'Sustainability',
];

// Format KRW in billions
function formatKrwBillions(value: number): string {
    if (value === 0) return '₩0.0B';
    return `₩${(value / 1000).toFixed(1)}B`;
}

// Format people count
function formatPeople(value: number): string {
    return `${value} people`;
}

// Convert number to number (handle string inputs)
function toNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

export default function CreateCompany() {
    const { props } = usePage<PageProps>();
    const existingCompany = props.company;

    // Determine initial state based on existing data
    // Always show overview page when diagnosis has started, regardless of completion status
    const getInitialTab = (): StepId => {
        // Check URL for explicit tab parameter first
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam && ['overview', 'company', 'business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'].includes(tabParam)) {
                return tabParam as StepId;
            }
        }
        
        // If diagnosis has started (company exists), always show overview
        if (existingCompany) {
            return 'overview';
        }
        
        // No existing data, show overview
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState<StepId>(getInitialTab());
    const [hasStarted, setHasStarted] = useState(!!existingCompany);
    const [companyId, setCompanyId] = useState<number | null>(existingCompany?.id || null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [orgChartPreview, setOrgChartPreview] = useState<string | null>(null);
    
    const companyForm = useForm({
        name: existingCompany?.name || '',
        brand_name: existingCompany?.brand_name || '',
        foundation_date: existingCompany?.foundation_date || '',
        hq_location: existingCompany?.hq_location || '',
        industry: existingCompany?.industry || '',
        secondary_industries: existingCompany?.secondary_industries || [] as string[],
        logo: null as File | null,
        image: null as File | null,
        latitude: existingCompany?.latitude || '',
        longitude: existingCompany?.longitude || '',
    });

    const businessForm = useForm({
        annual_revenue: existingCompany?.business_profile?.annual_revenue?.toString() || '0',
        operational_margin_rate: existingCompany?.business_profile?.operational_margin_rate?.toString() || '0',
        annual_human_cost: existingCompany?.business_profile?.annual_human_cost?.toString() || '0',
        business_type: existingCompany?.business_profile?.business_type || '',
    });

    const workforceForm = useForm({
        headcount_year_minus_2: existingCompany?.workforce?.headcount_year_minus_2?.toString() || '',
        headcount_year_minus_1: existingCompany?.workforce?.headcount_year_minus_1?.toString() || '',
        headcount_current: existingCompany?.workforce?.headcount_current?.toString() || '',
        total_employees: existingCompany?.workforce?.total_employees?.toString() || '0',
        contract_employees: existingCompany?.workforce?.contract_employees?.toString() || '0',
        org_chart: null as File | null,
    });

    const currentHrForm = useForm({
        dedicated_hr_team: existingCompany?.current_hr_status?.dedicated_hr_team ?? false,
        labor_union_present: existingCompany?.current_hr_status?.labor_union_present ?? false,
        labor_relations_stability: existingCompany?.current_hr_status?.labor_relations_stability || '',
        evaluation_system_status: existingCompany?.current_hr_status?.evaluation_system_status || '',
        compensation_system_status: existingCompany?.current_hr_status?.compensation_system_status || '',
        evaluation_system_issues: existingCompany?.current_hr_status?.evaluation_system_issues || '',
        job_rank_levels: existingCompany?.current_hr_status?.job_rank_levels?.toString() || '',
        job_title_levels: existingCompany?.current_hr_status?.job_title_levels?.toString() || '',
    });

    const [coreValueInput, setCoreValueInput] = useState('');
    const cultureForm = useForm({
        work_format: existingCompany?.culture?.work_format || '',
        decision_making_style: existingCompany?.culture?.decision_making_style || '',
        core_values: existingCompany?.culture?.core_values || [] as string[],
    });

    const confidentialForm = useForm({
        notes: existingCompany?.confidential_note?.notes || '',
    });

    const submitForm = useForm({});

    // Check if all required fields are completed for submission
    const isAllStepsComplete = useMemo(() => {
        // Check Company Info - all fields required
        const companyName = existingCompany?.name || companyForm.data.name;
        const companyFoundationDate = existingCompany?.foundation_date || companyForm.data.foundation_date;
        const companyHqLocation = existingCompany?.hq_location || companyForm.data.hq_location;
        const companyIndustry = existingCompany?.industry || companyForm.data.industry;
        const companyComplete = !!(companyName && companyFoundationDate && companyHqLocation && companyIndustry);
        
        // Check Business Profile - annual_revenue and business_type required
        const businessRevenue = existingCompany?.business_profile?.annual_revenue || toNumber(businessForm.data.annual_revenue);
        const businessType = existingCompany?.business_profile?.business_type || businessForm.data.business_type;
        const businessComplete = !!(businessRevenue > 0 && businessType);
        
        // Check Workforce - total_employees required
        const workforceTotal = existingCompany?.workforce?.total_employees || toNumber(workforceForm.data.total_employees);
        const workforceComplete = !!(workforceTotal > 0);
        
        // Check Current HR - labor_relations_stability, evaluation_system_status, compensation_system_status required
        const hrStability = existingCompany?.current_hr_status?.labor_relations_stability || currentHrForm.data.labor_relations_stability;
        const hrEvaluation = existingCompany?.current_hr_status?.evaluation_system_status || currentHrForm.data.evaluation_system_status;
        const hrCompensation = existingCompany?.current_hr_status?.compensation_system_status || currentHrForm.data.compensation_system_status;
        const currentHrComplete = !!(hrStability && hrEvaluation && hrCompensation);
        
        // Check Culture - work_format, decision_making_style, and core_values required
        const cultureWorkFormat = existingCompany?.culture?.work_format || cultureForm.data.work_format;
        const cultureDecisionStyle = existingCompany?.culture?.decision_making_style || cultureForm.data.decision_making_style;
        const cultureCoreValues = existingCompany?.culture?.core_values || cultureForm.data.core_values;
        const cultureComplete = !!(cultureWorkFormat && cultureDecisionStyle && cultureCoreValues && cultureCoreValues.length > 0);
        
        return companyComplete && businessComplete && workforceComplete && currentHrComplete && cultureComplete;
    }, [
        existingCompany,
        companyForm.data, businessForm.data, workforceForm.data, currentHrForm.data, cultureForm.data
    ]);

    // Save current step to localStorage
    useEffect(() => {
        if (activeTab !== 'overview') {
            localStorage.setItem('company_create_active_tab', activeTab);
        }
    }, [activeTab]);

    // Sync companyId when data is loaded
    useEffect(() => {
        if (existingCompany?.id && !companyId) {
            setCompanyId(existingCompany.id);
        }
    }, [existingCompany, companyId]);

    // Always show overview when diagnosis has started
    useEffect(() => {
        // If diagnosis has started (company/project exists), always show overview unless URL specifies otherwise
        if (existingCompany) {
            // Check URL for explicit tab parameter
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const tabParam = urlParams.get('tab');
                if (!tabParam || tabParam === 'overview') {
                    setActiveTab('overview');
                    // Clear localStorage to prevent restoring old tab
                    localStorage.removeItem('company_create_active_tab');
                }
            }
        } else {
            // Only restore from localStorage if no existing data
            const savedTab = localStorage.getItem('company_create_active_tab') as StepId;
            if (savedTab && ['company', 'business'].includes(savedTab)) {
                setActiveTab(savedTab);
                setHasStarted(true);
            }
        }
    }, [existingCompany]);

    // Handle image preview for logo
    useEffect(() => {
        if (companyForm.data.logo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(companyForm.data.logo);
        } else {
            setLogoPreview(null);
        }
    }, [companyForm.data.logo]);

    // Handle image preview for company image
    useEffect(() => {
        if (companyForm.data.image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(companyForm.data.image);
        } else {
            setImagePreview(null);
        }
    }, [companyForm.data.image]);

    // Handle image preview for organization chart (only for images, not PDFs)
    useEffect(() => {
        if (workforceForm.data.org_chart) {
            const file = workforceForm.data.org_chart;
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
        } else {
            setOrgChartPreview(null);
        }
    }, [workforceForm.data.org_chart]);

    const saveCompanyInfo = () => {
        if (companyId) {
            // Update existing company
            router.post(`/diagnosis/${companyId}/company-info`, companyForm.data, {
            forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Reload page to get updated data
                    router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
                },
            });
        } else {
            // Create new company with step_wise flag to stay on the page
            const formData = { ...companyForm.data, step_wise: true };
            router.post('/hr-manager/companies', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Reload page to get the new company/project data
                    router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
                },
            });
        }
    };

    const saveBusinessProfile = () => {
        if (!companyId) {
            // Need to create company first
            saveCompanyInfo();
            return;
        }

        const businessData = {
            annual_revenue: toNumber(businessForm.data.annual_revenue),
            operational_margin_rate: toNumber(businessForm.data.operational_margin_rate),
            annual_human_cost: toNumber(businessForm.data.annual_human_cost),
            business_type: businessForm.data.business_type,
        };

        router.post(`/diagnosis/${companyId}/business-profile`, businessData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
            },
        });
    };

    const saveWorkforce = () => {
        if (!companyId) return;

        const workforceData = {
            headcount_year_minus_2: toNumber(workforceForm.data.headcount_year_minus_2),
            headcount_year_minus_1: toNumber(workforceForm.data.headcount_year_minus_1),
            headcount_current: toNumber(workforceForm.data.headcount_current),
            total_employees: toNumber(workforceForm.data.total_employees),
            contract_employees: toNumber(workforceForm.data.contract_employees),
            org_chart: workforceForm.data.org_chart,
        };

        router.post(`/diagnosis/${companyId}/workforce`, workforceData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
            },
        });
    };

    const saveCurrentHr = () => {
        if (!companyId) return;

        const currentHrData = {
            dedicated_hr_team: currentHrForm.data.dedicated_hr_team,
            labor_union_present: currentHrForm.data.labor_union_present,
            labor_relations_stability: currentHrForm.data.labor_relations_stability,
            evaluation_system_status: currentHrForm.data.evaluation_system_status,
            compensation_system_status: currentHrForm.data.compensation_system_status,
            evaluation_system_issues: currentHrForm.data.evaluation_system_issues,
            job_rank_levels: toNumber(currentHrForm.data.job_rank_levels),
            job_title_levels: toNumber(currentHrForm.data.job_title_levels),
        };

        router.post(`/diagnosis/${companyId}/current-hr`, currentHrData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
            },
        });
    };

    const saveCulture = () => {
        if (!companyId) return;

        const cultureData = {
            work_format: cultureForm.data.work_format,
            decision_making_style: cultureForm.data.decision_making_style,
            core_values: cultureForm.data.core_values,
        };

        router.post(`/diagnosis/${companyId}/culture`, cultureData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
            },
        });
    };

    const saveConfidential = () => {
        if (!companyId) return;

        const confidentialData = {
            notes: confidentialForm.data.notes,
        };

        router.post(`/diagnosis/${companyId}/confidential`, confidentialData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['company', 'project', 'businessProfile', 'workforce', 'currentHr', 'culture', 'confidential'] });
            },
        });
    };

    const addCoreValue = (value: string) => {
        if (!value.trim()) return;
        if (cultureForm.data.core_values.length >= 5) return;
        if (cultureForm.data.core_values.includes(value.trim())) return;
        cultureForm.setData('core_values', [...cultureForm.data.core_values, value.trim()]);
    };

    const removeCoreValue = (value: string) => {
        cultureForm.setData('core_values', cultureForm.data.core_values.filter(v => v !== value));
    };

    const toggleSecondaryIndustry = (industry: string) => {
        if (companyForm.data.secondary_industries.includes(industry)) {
            companyForm.setData(
                'secondary_industries',
                companyForm.data.secondary_industries.filter((item) => item !== industry)
            );
            return;
        }
        companyForm.setData('secondary_industries', [...companyForm.data.secondary_industries, industry]);
    };

    const tabs: { id: StepId; name: string; icon: typeof FileText }[] = [
        { id: 'overview', name: 'Overview', icon: FileText },
        { id: 'company', name: 'Company Info', icon: Building2 },
        { id: 'business', name: 'Business Profile', icon: Briefcase },
        { id: 'workforce', name: 'Workforce', icon: Users },
        { id: 'current-hr', name: 'Current HR', icon: Settings },
        { id: 'culture', name: 'Culture', icon: MessageSquare },
        { id: 'confidential', name: 'Confidential', icon: FileText },
        { id: 'review', name: 'Review & Submit', icon: Check },
    ];

    const tabOrder: StepId[] = ['overview', 'company', 'business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'];
    const currentTabIndex = tabOrder.indexOf(activeTab);
    const totalSteps = tabs.length;
    const activeStepNumber = currentTabIndex + 1;
    const progressPercent = Math.round((activeStepNumber / totalSteps) * 100);
    
    const completedTabs = useMemo(() => {
        const completed = new Set<StepId>();
        if (hasStarted) {
            completed.add('overview');
        }
        // Check company info completion
        const companyComplete = (existingCompany?.name && existingCompany?.foundation_date && existingCompany?.hq_location && existingCompany?.industry) ||
            (companyForm.data.name && companyForm.data.foundation_date && companyForm.data.hq_location && companyForm.data.industry);
        if (companyComplete) {
            completed.add('company');
        }
        // Check business profile completion
        const businessComplete = (existingCompany?.business_profile?.annual_revenue && existingCompany?.business_profile?.business_type) ||
            (toNumber(businessForm.data.annual_revenue) > 0 && businessForm.data.business_type);
        if (businessComplete) {
            completed.add('business');
        }
        // Check workforce completion
        const workforceComplete = (existingCompany?.workforce?.total_employees !== undefined && existingCompany?.workforce?.total_employees !== null) ||
            (toNumber(workforceForm.data.total_employees) > 0);
        if (workforceComplete) {
            completed.add('workforce');
        }
        // Check current HR completion
        const currentHrComplete = (existingCompany?.current_hr_status?.dedicated_hr_team !== undefined && existingCompany?.current_hr_status?.labor_relations_stability) ||
            (currentHrForm.data.dedicated_hr_team !== undefined && currentHrForm.data.labor_relations_stability);
        if (currentHrComplete) {
            completed.add('current-hr');
        }
        // Check culture completion
        const cultureComplete = (existingCompany?.culture?.work_format && existingCompany?.culture?.decision_making_style && existingCompany?.culture?.core_values?.length) ||
            (cultureForm.data.work_format && cultureForm.data.decision_making_style && cultureForm.data.core_values.length > 0);
        if (cultureComplete) {
            completed.add('culture');
        }
        // Check confidential completion (optional, but if filled, mark as complete)
        const confidentialComplete = existingCompany?.confidential_note?.notes || confidentialForm.data.notes;
        if (confidentialComplete) {
            completed.add('confidential');
        }
        return completed;
    }, [hasStarted, existingCompany,
        companyForm.data, businessForm.data, workforceForm.data, currentHrForm.data, cultureForm.data, confidentialForm.data]);
    
    const lockedTabs = useMemo(() => {
        const locked = new Set<StepId>();
        if (!hasStarted) {
            // Lock all tabs except overview
            ['business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'].forEach(tab => {
                locked.add(tab as StepId);
            });
            return locked;
        }
        
        // Check completion status step by step
        const companyComplete = completedTabs.has('company');
        const businessComplete = completedTabs.has('business');
        const workforceComplete = completedTabs.has('workforce');
        const currentHrComplete = completedTabs.has('current-hr');
        const cultureComplete = completedTabs.has('culture');
        
        // Lock business if company not complete
        if (!companyComplete) {
            locked.add('business');
        }
        // Lock workforce if business not complete
        if (!businessComplete) {
            locked.add('workforce');
        }
        // Lock current-hr if workforce not complete
        if (!workforceComplete) {
            locked.add('current-hr');
        }
        // Lock culture if current-hr not complete
        if (!currentHrComplete) {
            locked.add('culture');
        }
        // Lock confidential if culture not complete
        if (!cultureComplete) {
            locked.add('confidential');
        }
        // Lock review if confidential not complete
        if (!completedTabs.has('confidential')) {
            locked.add('review');
        }
        
        return locked;
    }, [hasStarted, completedTabs]);

    const handleStartSetup = () => {
        setHasStarted(true);
        setActiveTab('company');
        localStorage.setItem('company_create_active_tab', 'company');
    };

    const handleBack = () => {
        if (currentTabIndex > 0) {
            const prevTab = tabOrder[currentTabIndex - 1];
            setActiveTab(prevTab);
            localStorage.setItem('company_create_active_tab', prevTab);
        }
    };

    const handleNext = () => {
        if (activeTab === 'company') {
            if (!isCompanyFormValid) return;
            saveCompanyInfo();
            setHasStarted(true);
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'business') {
            if (!isBusinessFormValid) return;
            saveBusinessProfile();
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'workforce') {
            if (!workforceForm.data.total_employees || toNumber(workforceForm.data.total_employees) === 0) return;
            saveWorkforce();
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'current-hr') {
            if (!currentHrForm.data.labor_relations_stability || !currentHrForm.data.evaluation_system_status || !currentHrForm.data.compensation_system_status) return;
            saveCurrentHr();
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'culture') {
            if (!cultureForm.data.work_format || !cultureForm.data.decision_making_style || cultureForm.data.core_values.length === 0) return;
            saveCulture();
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'confidential') {
            saveConfidential();
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        } else if (activeTab === 'review') {
            if (!companyId) return;
            submitForm.post(`/diagnosis/${companyId}/submit`, {
                onSuccess: () => {
                    router.visit('/hr-manager/dashboard');
                },
            });
        } else if (currentTabIndex < tabOrder.length - 1) {
            const nextTab = tabOrder[currentTabIndex + 1];
            if (nextTab && !lockedTabs.has(nextTab)) {
                setActiveTab(nextTab);
                localStorage.setItem('company_create_active_tab', nextTab);
            }
        }
    };

    const canGoBack = currentTabIndex > 0;
    const canGoNext = currentTabIndex < tabOrder.length - 1;
    const isCompanyFormValid = companyForm.data.name && companyForm.data.foundation_date && companyForm.data.hq_location && companyForm.data.industry;
    const isBusinessFormValid = businessForm.data.business_type && toNumber(businessForm.data.annual_revenue) > 0;
    const isWorkforceFormValid = workforceForm.data.total_employees && toNumber(workforceForm.data.total_employees) > 0;
    const isCurrentHrFormValid = currentHrForm.data.labor_relations_stability && currentHrForm.data.evaluation_system_status && currentHrForm.data.compensation_system_status;
    const isCultureFormValid = cultureForm.data.work_format && cultureForm.data.decision_making_style && cultureForm.data.core_values.length > 0;
    
    const isNextDisabled = 
        companyForm.processing || 
        businessForm.processing ||
        workforceForm.processing ||
        currentHrForm.processing ||
        cultureForm.processing ||
        confidentialForm.processing ||
        (activeTab === 'company' && !isCompanyFormValid) ||
        (activeTab === 'business' && !isBusinessFormValid) ||
        (activeTab === 'workforce' && !isWorkforceFormValid) ||
        (activeTab === 'current-hr' && !isCurrentHrFormValid) ||
        (activeTab === 'culture' && !isCultureFormValid);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
            <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
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
                                    <span
                                        key={`status-${hasStarted}`}
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                            hasStarted
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {existingCompany?.diagnosis_status === 'completed' 
                                            ? 'Completed' 
                                            : hasStarted 
                                            ? 'In Progress' 
                                            : 'Not Started'}
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
                                    {tabs.find((tab) => tab.id === activeTab)?.name || 'Overview'}
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
                            const isActive = tab.id === activeTab;
                            const isComplete = completedTabs.has(tab.id);
                            const locked = lockedTabs.has(tab.id);
                            const TabIcon = isComplete ? Check : tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    disabled={locked}
                                    onClick={() => !locked && setActiveTab(tab.id)}
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

                    {activeTab === 'overview' && (
                        <Card>
                            <CardContent className="p-8 text-center space-y-6">
                                {/* Blue Icon */}
                                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>

                                {/* Title and Description */}
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-2">Create New Company</h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Start by providing your company's basic information. This will help us set up your HR project and begin the diagnosis process.
                                    </p>
                                </div>

                                {/* Step Tags */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Company Info
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Business Profile
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Workforce
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Current HR
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Culture
                                    </Badge>
                                </div>

                                {/* Start Button */}
                                <Button 
                                    onClick={handleStartSetup}
                                    size="lg"
                                    className="h-11 has-[>svg]:px-8 cursor-pointer"
                                >
                                    Start Company Setup
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'company' && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                Company Basic Information
                            </h3>
                        </div>
                        <div className="p-6 pt-0 space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name *</Label>
                                        <Input
                                            id="companyName"
                                            value={companyForm.data.name}
                                            onChange={(e) => companyForm.setData('name', e.target.value)}
                                            placeholder="Enter company name"
                                            required
                                        />
                                        {companyForm.errors.name && <p className="text-xs text-destructive">{companyForm.errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brandName">Brand Name</Label>
                                        <Input
                                            id="brandName"
                                            value={companyForm.data.brand_name}
                                            onChange={(e) => companyForm.setData('brand_name', e.target.value)}
                                            placeholder="Enter brand name (if different)"
                                        />
                                        {companyForm.errors.brand_name && (
                                            <p className="text-xs text-destructive">{companyForm.errors.brand_name}</p>
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
                                            onChange={(e) => companyForm.setData('foundation_date', e.target.value)}
                                            required
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
                                            onChange={(e) => companyForm.setData('hq_location', e.target.value)}
                                            placeholder="City, Country"
                                            required
                                        />
                                        {companyForm.errors.hq_location && (
                                            <p className="text-xs text-destructive">{companyForm.errors.hq_location}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Primary Industry *</Label>
                                        <Select
                                            value={companyForm.data.industry}
                                            onValueChange={(value) => companyForm.setData('industry', value)}
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
                                            <p className="text-xs text-destructive">{companyForm.errors.industry}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary Industries</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {secondaryIndustryOptions.map((industry) => {
                                                const selected = companyForm.data.secondary_industries.includes(industry);
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
                                    {logoPreview || existingCompany?.logo_path ? (
                                        <div className="relative">
                                            <img 
                                                src={logoPreview || existingCompany.logo_path || ''} 
                                                alt="Logo preview" 
                                                className="w-full h-48 object-contain border-2 border-border rounded-lg p-4 bg-muted/20"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    companyForm.setData('logo', null);
                                                    setLogoPreview(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                    <label
                                        htmlFor="logo"
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                    >
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                    </label>
                                    )}
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            companyForm.setData('logo', file);
                                        }}
                                    />
                                    {companyForm.errors.logo && <p className="text-xs text-destructive">{companyForm.errors.logo}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Company Image</Label>
                                    {imagePreview || existingCompany?.image_path ? (
                                        <div className="relative">
                                            <img 
                                                src={imagePreview || existingCompany.image_path || ''} 
                                                alt="Company image preview" 
                                                className="w-full h-64 object-cover border-2 border-border rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    companyForm.setData('image', null);
                                                    setImagePreview(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                    <label
                                        htmlFor="image"
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                    >
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                    </label>
                                    )}
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            companyForm.setData('image', file);
                                        }}
                                    />
                                    {companyForm.errors.image && <p className="text-xs text-destructive">{companyForm.errors.image}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={companyForm.data.latitude}
                                            onChange={(e) => companyForm.setData('latitude', e.target.value)}
                                            placeholder="e.g., 28.6139"
                                        />
                                        {companyForm.errors.latitude && (
                                            <p className="text-xs text-destructive">{companyForm.errors.latitude}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={companyForm.data.longitude}
                                            onChange={(e) => companyForm.setData('longitude', e.target.value)}
                                            placeholder="e.g., 77.2090"
                                        />
                                        {companyForm.errors.longitude && (
                                            <p className="text-xs text-destructive">{companyForm.errors.longitude}</p>
                                        )}
                                    </div>
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
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                    <RangeField
                                        label="Annual Revenue (KRW)"
                                        value={toNumber(businessForm.data.annual_revenue)}
                                        min={0}
                                        max={10000}
                                        step={0.1}
                                        displayValue={formatKrwBillions(toNumber(businessForm.data.annual_revenue) * 1000)}
                                        onValueChange={(value) => businessForm.setData('annual_revenue', value.toString())}
                                    />
                                    {businessForm.errors.annual_revenue && (
                                        <p className="text-xs text-destructive">{businessForm.errors.annual_revenue}</p>
                                    )}

                                    <RangeField
                                        label="Operational Margin Rate (%)"
                                        value={toNumber(businessForm.data.operational_margin_rate)}
                                        min={0}
                                        max={100}
                                        step={1}
                                        displayValue={`${toNumber(businessForm.data.operational_margin_rate)}%`}
                                        onValueChange={(value) => businessForm.setData('operational_margin_rate', value.toString())}
                                    />
                                    {businessForm.errors.operational_margin_rate && (
                                        <p className="text-xs text-destructive">{businessForm.errors.operational_margin_rate}</p>
                                    )}

                                    <RangeField
                                        label="Annual Human Cost (KRW)"
                                        value={toNumber(businessForm.data.annual_human_cost)}
                                        min={0}
                                        max={10}
                                        step={0.1}
                                        displayValue={formatKrwBillions(toNumber(businessForm.data.annual_human_cost) * 1000)}
                                        onValueChange={(value) => businessForm.setData('annual_human_cost', value.toString())}
                                    />
                                    {businessForm.errors.annual_human_cost && (
                                        <p className="text-xs text-destructive">{businessForm.errors.annual_human_cost}</p>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Business Type *</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {businessTypeOptions.map((option) => {
                                                const isSelected = businessForm.data.business_type === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => businessForm.setData('business_type', option.value)}
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
                                            <p className="text-xs text-destructive">{businessForm.errors.business_type}</p>
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
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Headcount (Year -2)</Label>
                                            <Input
                                                type="number"
                                                placeholder="2 years ago"
                                                value={workforceForm.data.headcount_year_minus_2}
                                                onChange={(e) => workforceForm.setData('headcount_year_minus_2', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Headcount (Year -1)</Label>
                                            <Input
                                                type="number"
                                                placeholder="1 year ago"
                                                value={workforceForm.data.headcount_year_minus_1}
                                                onChange={(e) => workforceForm.setData('headcount_year_minus_1', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Headcount (Current)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Current year"
                                                value={workforceForm.data.headcount_current}
                                                onChange={(e) => workforceForm.setData('headcount_current', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <RangeField
                                        label="Current Total Employees"
                                        value={toNumber(workforceForm.data.total_employees)}
                                        min={0}
                                        max={1000}
                                        step={1}
                                        displayValue={formatPeople(toNumber(workforceForm.data.total_employees))}
                                        onValueChange={(value) => {
                                            const nextTotal = value;
                                            workforceForm.setData('total_employees', nextTotal.toString());
                                            if (toNumber(workforceForm.data.contract_employees) > nextTotal) {
                                                workforceForm.setData('contract_employees', nextTotal.toString());
                                            }
                                        }}
                                    />

                                    <RangeField
                                        label="Contract Employees"
                                        value={toNumber(workforceForm.data.contract_employees)}
                                        min={0}
                                        max={Math.max(1, toNumber(workforceForm.data.total_employees))}
                                        step={1}
                                        displayValue={`${toNumber(workforceForm.data.contract_employees)} (${Math.round((toNumber(workforceForm.data.contract_employees) / Math.max(1, toNumber(workforceForm.data.total_employees))) * 100)}%)`}
                                        onValueChange={(value) => workforceForm.setData('contract_employees', value.toString())}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="orgChart">Organization Chart</Label>
                                        <label
                                            htmlFor="orgChart"
                                            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block relative"
                                        >
                                            {orgChartPreview || (existingCompany?.workforce?.org_chart_path && (existingCompany.workforce.org_chart_path.endsWith('.png') || existingCompany.workforce.org_chart_path.endsWith('.jpg') || existingCompany.workforce.org_chart_path.endsWith('.jpeg'))) ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={orgChartPreview || existingCompany.workforce?.org_chart_path || ''}
                                                        alt="Organization Chart Preview"
                                                        className="max-h-64 mx-auto rounded-lg object-contain"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {workforceForm.data.org_chart?.name || 'Current organization chart'}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            workforceForm.setData('org_chart', null);
                                                            setOrgChartPreview(null);
                                                        }}
                                                        className="mt-2"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : workforceForm.data.org_chart || existingCompany?.workforce?.org_chart_path ? (
                                                <div className="space-y-2">
                                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {workforceForm.data.org_chart?.name || 'Organization chart uploaded'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {workforceForm.data.org_chart?.type === 'application/pdf' ? 'PDF file' : 'File uploaded'}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            workforceForm.setData('org_chart', null);
                                                            setOrgChartPreview(null);
                                                        }}
                                                        className="mt-2"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Upload organization chart (optional)
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 5MB</p>
                                                </>
                                            )}
                                        </label>
                                        <Input
                                            id="orgChart"
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                workforceForm.setData('org_chart', file);
                                            }}
                                        />
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
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="dedicatedHrTeam"
                                                checked={currentHrForm.data.dedicated_hr_team}
                                                onCheckedChange={(checked) => currentHrForm.setData('dedicated_hr_team', checked === true)}
                                            />
                                            <Label htmlFor="dedicatedHrTeam">Dedicated HR Team Present</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="laborUnion"
                                                checked={currentHrForm.data.labor_union_present}
                                                onCheckedChange={(checked) => currentHrForm.setData('labor_union_present', checked === true)}
                                            />
                                            <Label htmlFor="laborUnion">Labor Union Present</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Labor Relations Stability</Label>
                                        <Select
                                            value={currentHrForm.data.labor_relations_stability}
                                            onValueChange={(value) => currentHrForm.setData('labor_relations_stability', value)}
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
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Evaluation System Status</Label>
                                            <Select
                                                value={currentHrForm.data.evaluation_system_status}
                                                onValueChange={(value) => currentHrForm.setData('evaluation_system_status', value)}
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
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Compensation System Status</Label>
                                            <Select
                                                value={currentHrForm.data.compensation_system_status}
                                                onValueChange={(value) => currentHrForm.setData('compensation_system_status', value)}
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
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Evaluation System Issues (HR Manager Only)</Label>
                                        <Textarea
                                            value={currentHrForm.data.evaluation_system_issues}
                                            onChange={(e) => currentHrForm.setData('evaluation_system_issues', e.target.value)}
                                            placeholder="Describe any issues with the current evaluation system..."
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This information is confidential and will not be shown verbatim to the CEO.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Number of Job Rank Levels</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 5"
                                                value={currentHrForm.data.job_rank_levels}
                                                onChange={(e) => currentHrForm.setData('job_rank_levels', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Number of Job Title Levels</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 7"
                                                value={currentHrForm.data.job_title_levels}
                                                onChange={(e) => currentHrForm.setData('job_title_levels', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'culture' && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                    Organizational Culture & Work Style
                                </h3>
                            </div>
                            <div className="p-6 pt-0 space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Work Format</Label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {workFormatOptions.map((option) => {
                                                const isSelected = cultureForm.data.work_format === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => cultureForm.setData('work_format', option.value)}
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
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Decision-Making Style</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {decisionStyleOptions.map((option) => {
                                                const isSelected = cultureForm.data.decision_making_style === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => cultureForm.setData('decision_making_style', option.value)}
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
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Core Value Keywords (Select up to 5)</Label>
                                        {cultureForm.data.core_values.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
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
                                        )}
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                            <Input
                                                value={coreValueInput}
                                                onChange={(e) => setCoreValueInput(e.target.value)}
                                                placeholder="Add a core value"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addCoreValue(coreValueInput);
                                                        setCoreValueInput('');
                                                    }
                                                }}
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
                                                const isSelected = cultureForm.data.core_values.includes(value);
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
                                        <p className="text-xs text-muted-foreground">
                                            Selected: {cultureForm.data.core_values.length}/5
                                        </p>
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
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Describe Internal HR Challenges and Pain Points</Label>
                                        <Textarea
                                            value={confidentialForm.data.notes}
                                            onChange={(e) => confidentialForm.setData('notes', e.target.value)}
                                            placeholder="Describe any internal HR challenges, employee relations issues, compensation concerns, or organizational pain points that should inform the HR system design..."
                                            className="min-h-[160px]"
                                        />
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
                                                <span>{existingCompany?.name || companyForm.data.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Industry:</span>
                                                <span>{existingCompany?.industry || companyForm.data.industry || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>HQ Location:</span>
                                                <span>{existingCompany?.hq_location || companyForm.data.hq_location || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <p className="text-sm font-semibold mb-3">Business Profile</p>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span>Business Type:</span>
                                                <span>
                                                    {(existingCompany?.business_profile?.business_type || businessForm.data.business_type)
                                                        ? (existingCompany?.business_profile?.business_type || businessForm.data.business_type).toUpperCase()
                                                        : '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Annual Revenue:</span>
                                                <span>
                                                    {(existingCompany?.business_profile?.annual_revenue || toNumber(businessForm.data.annual_revenue) > 0)
                                                        ? formatKrwBillions(toNumber(existingCompany?.business_profile?.annual_revenue || businessForm.data.annual_revenue) * 1000)
                                                        : '₩0.0B'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <p className="text-sm font-semibold mb-3">Workforce</p>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span>Total Employees:</span>
                                                <span>{existingCompany?.workforce?.total_employees || workforceForm.data.total_employees || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Contract Employees:</span>
                                                <span>{existingCompany?.workforce?.contract_employees || workforceForm.data.contract_employees || '0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <p className="text-sm font-semibold mb-3">Culture</p>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span>Work Format:</span>
                                                <span>{existingCompany?.culture?.work_format || cultureForm.data.work_format || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Decision Style:</span>
                                                <span>{existingCompany?.culture?.decision_making_style || cultureForm.data.decision_making_style || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Core Values:</span>
                                                <span>{(existingCompany?.culture?.core_values || cultureForm.data.core_values || []).join(', ') || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                                    <p className="text-sm text-primary font-medium">
                                        Important: After submission, Step 1 will be locked and the CEO Management Philosophy Survey will be unlocked. You will also be able to proceed to Step 2: Organization Design.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Footer with Back/Next buttons */}
                    {activeTab !== 'review' && (
                        <StepFooter
                            onBack={handleBack}
                            onNext={handleNext}
                            canGoBack={canGoBack}
                            canGoNext={canGoNext}
                            isNextDisabled={isNextDisabled}
                            nextLabel="Next"
                            showFooter={activeTab !== 'overview'}
                        />
                    )}
                    
                    {/* Submit button for Review tab */}
                    {activeTab === 'review' && (
                        <div className="pt-4 border-t space-y-4">
                            {submitForm.errors.diagnosis && (
                                <p className="text-sm text-destructive">{submitForm.errors.diagnosis}</p>
                            )}
                            <Button
                                className="w-full h-11"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNext();
                                }}
                                disabled={!companyId || submitForm.processing || !isAllStepsComplete}
                            >
                                {submitForm.processing ? 'Submitting...' : 'Submit & Lock Step 1'}
                                <Check className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
