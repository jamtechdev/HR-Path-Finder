import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Company {
    id: number;
    name: string;
    brand_name?: string | null;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    secondary_industries?: string[] | null;
    logo_path?: string | null;
    diagnosis_status?: string;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company?: Company;
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

// Simple function to get active tab from URL path
function getActiveTabFromRoute(): StepId {
    if (typeof window === 'undefined') return 'overview';
    
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const tabFromPath = pathParts[1]; // After 'diagnosis'
    
    // Valid tabs
    const validTabs: StepId[] = ['overview', 'company', 'business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'];
    
    if (tabFromPath && validTabs.includes(tabFromPath as StepId)) {
        return tabFromPath as StepId;
    }
    
    // Default to overview
    return 'overview';
}

export default function DiagnosisStep({ company }: PageProps) {
    // Ensure company has default values to prevent undefined errors
    const safeCompany: Company = (company && typeof company === 'object' && company.id !== undefined) ? {
        id: company.id ?? 0,
        name: company.name ?? '',
        brand_name: company.brand_name ?? null,
        foundation_date: company.foundation_date ?? null,
        hq_location: company.hq_location ?? null,
        industry: company.industry ?? null,
        secondary_industries: company.secondary_industries ?? [],
        logo_path: company.logo_path ?? null,
        diagnosis_status: company.diagnosis_status ?? 'not_started',
        business_profile: company.business_profile ?? null,
        workforce: company.workforce ?? null,
        current_hr_status: company.current_hr_status ?? null,
        culture: company?.culture ?? null,
        confidential_note: company?.confidential_note ?? null,
    } : {
        id: 0,
        name: '',
        brand_name: null,
        foundation_date: null,
        hq_location: null,
        industry: null,
        secondary_industries: [],
        logo_path: null,
        diagnosis_status: 'not_started',
        business_profile: null,
        workforce: null,
        current_hr_status: null,
        culture: null,
        confidential_note: null,
    };
    
    const foundationDate = safeCompany.foundation_date ? safeCompany.foundation_date.slice(0, 10) : '';
    const secondaryIndustries = Array.isArray(safeCompany.secondary_industries) ? safeCompany.secondary_industries : [];
    const cultureValues = Array.isArray(safeCompany.culture?.core_values) ? safeCompany.culture?.core_values : [];
    const page = usePage();

    // Load form data from localStorage or use safeCompany data
    const getStoredFormData = (key: string, defaultValue: any) => {
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

    // Save form data to localStorage
    const saveFormData = (key: string, data: any) => {
        if (typeof window === 'undefined') return;
        try {
            // Don't store File objects
            const dataToStore = { ...data };
            if (dataToStore.logo) delete dataToStore.logo;
            if (dataToStore.image) delete dataToStore.image;
            if (dataToStore.org_chart) delete dataToStore.org_chart;
            localStorage.setItem(`diagnosis_form_${key}`, JSON.stringify(dataToStore));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // State for logo and banner image previews
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [orgChartPreview, setOrgChartPreview] = useState<string | null>(null);

    // Load existing logo preview on mount
    useEffect(() => {
        if (safeCompany?.logo_path && !companyForm.data.logo) {
            const logoUrl = safeCompany.logo_path.startsWith('http') || safeCompany.logo_path.startsWith('/')
                ? safeCompany.logo_path
                : `/storage/${safeCompany.logo_path}`;
            setLogoPreview(logoUrl);
        }
    }, [safeCompany?.logo_path]);

    // Load existing banner preview on mount
    useEffect(() => {
        if (safeCompany?.image_path && !companyForm.data.image) {
            const bannerUrl = safeCompany.image_path.startsWith('http') || safeCompany.image_path.startsWith('/')
                ? safeCompany.image_path
                : `/storage/${safeCompany.image_path}`;
            setBannerPreview(bannerUrl);
        }
    }, [safeCompany?.image_path]);

    // Load existing org chart preview on mount
    useEffect(() => {
        if (safeCompany?.workforce?.org_chart_path && !workforceForm.data.org_chart) {
            const chartUrl = safeCompany.workforce.org_chart_path.startsWith('http') || safeCompany.workforce.org_chart_path.startsWith('/')
                ? safeCompany.workforce.org_chart_path
                : `/storage/${safeCompany.workforce.org_chart_path}`;
            setOrgChartPreview(chartUrl);
        }
    }, [safeCompany?.workforce?.org_chart_path]);

    // Handle logo preview when file is selected
    useEffect(() => {
        if (companyForm.data.logo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(companyForm.data.logo);
        } else if (!safeCompany?.logo_path) {
            setLogoPreview(null);
        }
    }, [companyForm.data.logo]);

    // Handle banner preview when file is selected
    useEffect(() => {
        if (companyForm.data.image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(companyForm.data.image);
        } else if (!safeCompany?.image_path) {
            setBannerPreview(null);
        }
    }, [companyForm.data.image]);

    // Handle org chart preview when file is selected
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
        } else if (!safeCompany?.workforce?.org_chart_path) {
            setOrgChartPreview(null);
        }
    }, [workforceForm.data.org_chart]);

    // Initialize forms with stored data or safeCompany data
    const companyForm = useForm({
        name: getStoredFormData('company', {}).name || safeCompany.name || '',
        brand_name: getStoredFormData('company', {}).brand_name || safeCompany.brand_name || '',
        foundation_date: getStoredFormData('company', {}).foundation_date || foundationDate,
        hq_location: getStoredFormData('company', {}).hq_location || safeCompany.hq_location || '',
        industry: getStoredFormData('company', {}).industry || safeCompany.industry || '',
        secondary_industries: getStoredFormData('company', {}).secondary_industries || secondaryIndustries,
        logo: null as File | null,
        image: null as File | null,
        latitude: getStoredFormData('company', {}).latitude || null,
        longitude: getStoredFormData('company', {}).longitude || null,
    });

    const businessForm = useForm({
        annual_revenue: getStoredFormData('business', {}).annual_revenue || safeCompany.business_profile?.annual_revenue?.toString() || '',
        operational_margin_rate: getStoredFormData('business', {}).operational_margin_rate || safeCompany.business_profile?.operational_margin_rate?.toString() || '',
        annual_human_cost: getStoredFormData('business', {}).annual_human_cost || safeCompany.business_profile?.annual_human_cost?.toString() || '',
        business_type: getStoredFormData('business', {}).business_type || safeCompany.business_profile?.business_type || '',
    });

    const workforceForm = useForm({
        headcount_year_minus_2: getStoredFormData('workforce', {}).headcount_year_minus_2 || safeCompany.workforce?.headcount_year_minus_2?.toString() || '',
        headcount_year_minus_1: getStoredFormData('workforce', {}).headcount_year_minus_1 || safeCompany.workforce?.headcount_year_minus_1?.toString() || '',
        headcount_current: getStoredFormData('workforce', {}).headcount_current || safeCompany.workforce?.headcount_current?.toString() || '',
        total_employees: getStoredFormData('workforce', {}).total_employees || safeCompany.workforce?.total_employees?.toString() || '',
        contract_employees: getStoredFormData('workforce', {}).contract_employees || safeCompany.workforce?.contract_employees?.toString() || '',
        org_chart: null as File | null,
    });

    const currentHrForm = useForm({
        dedicated_hr_team: getStoredFormData('currentHr', {}).dedicated_hr_team ?? safeCompany.current_hr_status?.dedicated_hr_team ?? false,
        labor_union_present: getStoredFormData('currentHr', {}).labor_union_present ?? safeCompany.current_hr_status?.labor_union_present ?? false,
        labor_relations_stability: getStoredFormData('currentHr', {}).labor_relations_stability || safeCompany.current_hr_status?.labor_relations_stability || '',
        evaluation_system_status: getStoredFormData('currentHr', {}).evaluation_system_status || safeCompany.current_hr_status?.evaluation_system_status || '',
        compensation_system_status: getStoredFormData('currentHr', {}).compensation_system_status || safeCompany.current_hr_status?.compensation_system_status || '',
        evaluation_system_issues: getStoredFormData('currentHr', {}).evaluation_system_issues || safeCompany.current_hr_status?.evaluation_system_issues || '',
        job_rank_levels: getStoredFormData('currentHr', {}).job_rank_levels ?? safeCompany.current_hr_status?.job_rank_levels ?? null,
        job_title_levels: getStoredFormData('currentHr', {}).job_title_levels ?? safeCompany.current_hr_status?.job_title_levels ?? null,
    });

    const cultureForm = useForm({
        work_format: getStoredFormData('culture', {}).work_format || safeCompany.culture?.work_format || '',
        decision_making_style: getStoredFormData('culture', {}).decision_making_style || safeCompany.culture?.decision_making_style || '',
        core_values: getStoredFormData('culture', {}).core_values || cultureValues,
    });

    const confidentialForm = useForm({
        notes: getStoredFormData('confidential', {}).notes || safeCompany.confidential_note?.notes || '',
    });

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        saveFormData('company', companyForm.data);
    }, [companyForm.data]);

    useEffect(() => {
        saveFormData('business', businessForm.data);
    }, [businessForm.data]);

    useEffect(() => {
        saveFormData('workforce', workforceForm.data);
    }, [workforceForm.data]);

    useEffect(() => {
        saveFormData('currentHr', currentHrForm.data);
    }, [currentHrForm.data]);

    useEffect(() => {
        saveFormData('culture', cultureForm.data);
    }, [cultureForm.data]);

    useEffect(() => {
        saveFormData('confidential', confidentialForm.data);
    }, [confidentialForm.data]);

    const submitForm = useForm({});
    const submitErrors = submitForm.errors as Record<string, string>;
    const [coreValueInput, setCoreValueInput] = useState('');
    const isSubmittingRef = useRef(false);

    const stepStatus = useMemo(() => {
        // Check completion based on FORM DATA (local state) to show green checkmarks as user fills form
        // This allows real-time feedback without saving to database
        
        // Check company info completion - all required fields must be filled
        const companyComplete = Boolean(
            companyForm.data.name &&
                companyForm.data.foundation_date &&
                companyForm.data.hq_location &&
                companyForm.data.industry
        );
        
        // Check business profile completion - must have business_type and annual_revenue
        const businessComplete = Boolean(
            businessForm.data.business_type &&
            businessForm.data.annual_revenue &&
            parseFloat(businessForm.data.annual_revenue) > 0
        );
        
        // Check workforce completion - must have total_employees
        const workforceComplete = Boolean(
            workforceForm.data.total_employees &&
            parseInt(workforceForm.data.total_employees) > 0
        );
        
        // Check current HR completion - must have dedicated_hr_team and labor_relations_stability
        const currentHrComplete = Boolean(
            currentHrForm.data.dedicated_hr_team !== null &&
            currentHrForm.data.dedicated_hr_team !== undefined &&
            currentHrForm.data.labor_relations_stability
        );
        
        // Check culture completion - must have work_format, decision_making_style, and at least one core value
        const cultureComplete = Boolean(
            cultureForm.data.work_format &&
            cultureForm.data.decision_making_style &&
            (cultureForm.data.core_values || []).length > 0
        );
        
        // Confidential is optional but if filled, mark as complete
        const confidentialComplete = Boolean(confidentialForm.data.notes && confidentialForm.data.notes.trim().length > 0);
        
        // Review is complete when diagnosis is submitted
        const submitted = safeCompany?.diagnosis_status === 'completed';

        return {
            company: companyComplete,
            business: businessComplete,
            workforce: workforceComplete,
            'current-hr': currentHrComplete,
            culture: cultureComplete,
            confidential: confidentialComplete,
            review: submitted,
        };
    }, [companyForm.data, businessForm.data, workforceForm.data, currentHrForm.data, cultureForm.data, confidentialForm.data, safeCompany?.diagnosis_status]);

    // Get initial tab from URL path, always default to 'overview'
    const [activeTab, setActiveTab] = useState<StepId>(() => {
        // Always get from URL path first, ignore backend activeTab prop
        // This ensures URL is the source of truth
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const tabFromPath = pathParts[1]; // After 'diagnosis'
            
            const validTabs: StepId[] = ['overview', 'company', 'business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'];
            
            if (tabFromPath && validTabs.includes(tabFromPath as StepId)) {
                return tabFromPath as StepId;
            }
        }
        
        // Always default to 'overview'
        return 'overview';
    });

    const totalSteps = stepOrder.length;
    const completedCount = stepOrder.filter((step) => stepStatus?.[step]).length;
    // Only consider started if not on overview page and status is in_progress or completed
    const hasStarted = activeTab !== 'overview' && (safeCompany.diagnosis_status !== 'not_started' || completedCount > 0);

    // Update active tab when URL path changes - ensure it always matches URL
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        
        // If accessing /diagnosis without tab, redirect to /diagnosis/overview
        if (pathParts[0] === 'diagnosis' && !pathParts[1]) {
            window.history.replaceState({}, '', '/diagnosis/overview');
            setActiveTab('overview');
            return;
        }
        
        // Get current tab from URL
        const currentTab = getActiveTabFromRoute();
        
        // Always sync activeTab with URL - URL is the source of truth
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    }, [page.url]);
    
    // Listen to browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const currentTab = getActiveTabFromRoute();
            setActiveTab(currentTab);
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Simple navigation - just update URL path and state
    const navigateToStep = (stepId: StepId) => {
        // Allow navigation even without company - company will be created on final submit
        // Update URL without page reload using path-based routing
        const newUrl = `/diagnosis/${stepId}`;
        window.history.pushState({}, '', newUrl);
        
        // Update active tab state
        setActiveTab(stepId);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Progress should be 0% on overview page, start from 1 when on company-info
    const activeStepNumber =
        activeTab === 'overview'
            ? 0
            : stepOrder.indexOf(activeTab as (typeof stepOrder)[number]) + 1;
    // Show 0% progress on overview page, actual progress on other tabs
    const progressPercent = activeTab === 'overview' ? 0 : Math.round((activeStepNumber / totalSteps) * 100);
    const activeIndex = activeTab === 'overview' 
        ? -1 
        : stepOrder.indexOf(activeTab as (typeof stepOrder)[number]);
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

    // DISABLED: Save functions - Data is only saved on final submit
    // These functions are kept for reference but should not be called
    // All data stays in local state until final submit
    const saveCompanyInfo = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const saveBusinessProfile = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const saveWorkforce = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const saveCurrentHr = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const saveCulture = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const saveConfidential = () => {
        // Disabled - data only saved on final submit
        return;
    };

    // DISABLED: Legacy submit functions - Data is only saved on final submit
    // These functions are kept for reference but should not be called
    const submitCompanyInfo = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitBusinessProfile = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitWorkforce = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitCurrentHr = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitCulture = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitConfidential = () => {
        // Disabled - data only saved on final submit
        return;
    };

    const submitDiagnosis = () => {
        // Prevent double-click submission
        if (isSubmittingRef.current || submitForm.processing) {
            return;
        }
        
        isSubmittingRef.current = true;
        
        // Collect all form data and set it in submitForm
        submitForm.setData({
            // Company Info
            name: companyForm.data.name,
            brand_name: companyForm.data.brand_name,
            foundation_date: companyForm.data.foundation_date,
            hq_location: companyForm.data.hq_location,
            industry: companyForm.data.industry,
            secondary_industries: companyForm.data.secondary_industries,
            latitude: companyForm.data.latitude,
            longitude: companyForm.data.longitude,
            logo: companyForm.data.logo,
            image: companyForm.data.image,
            
            // Business Profile
            annual_revenue: businessForm.data.annual_revenue,
            operational_margin_rate: businessForm.data.operational_margin_rate,
            annual_human_cost: businessForm.data.annual_human_cost,
            business_type: businessForm.data.business_type,
            
            // Workforce
            headcount_year_minus_2: workforceForm.data.headcount_year_minus_2,
            headcount_year_minus_1: workforceForm.data.headcount_year_minus_1,
            headcount_current: workforceForm.data.headcount_current,
            total_employees: workforceForm.data.total_employees,
            contract_employees: workforceForm.data.contract_employees,
            org_chart: workforceForm.data.org_chart,
            
            // Current HR
            dedicated_hr_team: currentHrForm.data.dedicated_hr_team,
            labor_union_present: currentHrForm.data.labor_union_present,
            labor_relations_stability: currentHrForm.data.labor_relations_stability,
            evaluation_system_status: currentHrForm.data.evaluation_system_status,
            compensation_system_status: currentHrForm.data.compensation_system_status,
            evaluation_system_issues: currentHrForm.data.evaluation_system_issues,
            job_rank_levels: currentHrForm.data.job_rank_levels,
            job_title_levels: currentHrForm.data.job_title_levels,
            
            // Culture
            work_format: cultureForm.data.work_format,
            decision_making_style: cultureForm.data.decision_making_style,
            core_values: cultureForm.data.core_values,
            
            // Confidential
            notes: confidentialForm.data.notes,
        });
        
        // Submit without company ID - backend will create company if it doesn't exist
        submitForm.post('/diagnosis/submit', {
            forceFormData: true,
            onSuccess: () => {
                // Clear localStorage after successful submission
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('diagnosis_form_company');
                    localStorage.removeItem('diagnosis_form_business');
                    localStorage.removeItem('diagnosis_form_workforce');
                    localStorage.removeItem('diagnosis_form_currentHr');
                    localStorage.removeItem('diagnosis_form_culture');
                    localStorage.removeItem('diagnosis_form_confidential');
                }
                isSubmittingRef.current = false;
            },
            onError: () => {
                isSubmittingRef.current = false;
            },
            onFinish: () => {
                isSubmittingRef.current = false;
            },
        });
    };

    const canGoBack = activeTab !== 'overview';
    const canGoNext = activeTab !== 'review';

    const handleBack = () => {
        if (!canGoBack) return;
        if (activeTab === 'company') {
            navigateToStep('overview');
            return;
        }
        if (activeIndex > 0) {
            const previousStep = stepOrder[activeIndex - 1];
            navigateToStep(previousStep);
        }
    };

    const handleStartDiagnosis = () => {
        // Simply navigate to company-info tab - no company creation needed
        // Company will be created on final submit
        navigateToStep('company');
    };

    const handleNext = () => {
        if (!canGoNext) return;
        
        // Only navigate to next step - DO NOT save data
        // Data will only be saved on final submit (review & submit step)
        switch (activeTab) {
            case 'overview':
                handleStartDiagnosis();
                break;
            case 'company':
                navigateToStep('business');
                break;
            case 'business':
                navigateToStep('workforce');
                break;
            case 'workforce':
                navigateToStep('current-hr');
                break;
            case 'current-hr':
                navigateToStep('culture');
                break;
            case 'culture':
                navigateToStep('confidential');
                break;
            case 'confidential':
                navigateToStep('review');
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

    // Simple tabs - all use same route with query parameter
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
        // Overview is NEVER locked - always accessible
        if (tabId === 'overview') {
            console.log('isTabLocked check for overview: false (always accessible)');
            return false;
        }
        const index = stepOrder.indexOf(tabId as (typeof stepOrder)[number]);
        if (index === -1) {
            console.log('isTabLocked check for', tabId, ': true (not in stepOrder)');
            return true;
        }
        if (index === 0) {
            console.log('isTabLocked check for', tabId, ': false (first step)');
            return false;
        }
        const locked = !stepOrder.slice(0, index).every((step) => stepStatus?.[step]);
        console.log('isTabLocked check for', tabId, ':', locked, 'stepStatus:', stepStatus);
        return locked;
    };

    const { errors } = page.props as { errors: Record<string, string> };
    const isSubmitted = safeCompany.diagnosis_status === 'completed';
    // On overview page, always show "Not Started" unless already submitted
    // On overview page, always show "Not Started" unless already submitted
    const statusLabel = isSubmitted 
        ? 'Completed' 
        : activeTab === 'overview' 
        ? 'Not Started' 
        : hasStarted 
        ? 'In Progress' 
        : 'Not Started';
    const statusClasses = isSubmitted
        ? 'bg-success/10 text-success'
        : activeTab === 'overview'
        ? 'bg-muted text-muted-foreground'
        : hasStarted
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-muted-foreground';

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
                    <DashboardHeader
                        title="Step 1: Diagnosis"
                        subtitle="Input company information and organizational context"
                        breadcrumbs={[
                            { title: 'Diagnosis' }
                        ]}
                    />
                    <div className="flex items-center gap-3 -mt-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses}`}>
                            {statusLabel}
                        </span>
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
                                    {activeTab === 'overview' ? '0' : activeStepNumber} of {totalSteps}
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
                                    : stepStatus?.[tab.id as (typeof stepOrder)[number]];
                            const TabIcon = isComplete ? Check : tab.icon;
                            
                            // Overview is always clickable - never locked
                            const isOverview = tab.id === 'overview';
                            const isClickable = isOverview || !locked;
                            const isDisabled = !isOverview && locked;

                            // Simple route with path-based routing
                            const tabRoute = `/diagnosis/${tab.id}`;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (isDisabled || !isClickable) {
                                            return;
                                        }
                                        navigateToStep(tab.id as StepId);
                                    }}
                                    disabled={isDisabled}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : isDisabled
                                            ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                                            : isComplete
                                            ? 'bg-success/10 text-success hover:bg-success/20'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                    aria-disabled={isDisabled}
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

                                    <Button className="h-11 has-[>svg]:px-8" onClick={handleStartDiagnosis}>
                                        Start Company Setup
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
                                            // Don't save during runtime - only validate locally
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

                                        <div className="grid md:grid-cols-2 gap-6">
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
                                                    {logoPreview && (
                                                        <div className="mt-4">
                                                            <img 
                                                                src={logoPreview}
                                                                alt="Logo preview"
                                                                className="w-full max-w-xs mx-auto h-32 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    if (logoPreview) {
                                                                        if (logoPreview.startsWith('data:')) {
                                                                            const newWindow = window.open();
                                                                            if (newWindow) {
                                                                                newWindow.document.write(`<img src="${logoPreview}" style="max-width: 100%; height: auto;" />`);
                                                                            }
                                                                        } else {
                                                                            window.open(logoPreview, '_blank');
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
                                                    {companyForm.data.logo && !logoPreview && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Selected: {companyForm.data.logo.name}
                                                        </p>
                                                    )}
                                                    {safeCompany?.logo_path && !companyForm.data.logo && !logoPreview && (
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
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        companyForm.setData('logo', file);
                                                        if (!file) {
                                                            // Restore existing logo preview if file is cleared
                                                            if (safeCompany?.logo_path) {
                                                                const logoUrl = safeCompany.logo_path.startsWith('http') || safeCompany.logo_path.startsWith('/')
                                                                    ? safeCompany.logo_path
                                                                    : `/storage/${safeCompany.logo_path}`;
                                                                setLogoPreview(logoUrl);
                                                            } else {
                                                                setLogoPreview(null);
                                                            }
                                                        }
                                                    }}
                                                />
                                                {companyForm.errors.logo && (
                                                    <p className="text-xs text-destructive">{companyForm.errors.logo}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="image">Banner Image</Label>
                                                <label
                                                    htmlFor="image"
                                                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                                >
                                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        PNG, JPG up to 2MB
                                                    </p>
                                                    {bannerPreview && (
                                                        <div className="mt-4">
                                                            <img 
                                                                src={bannerPreview}
                                                                alt="Banner preview"
                                                                className="w-full max-w-md mx-auto h-48 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    if (bannerPreview) {
                                                                        if (bannerPreview.startsWith('data:')) {
                                                                            const newWindow = window.open();
                                                                            if (newWindow) {
                                                                                newWindow.document.write(`<img src="${bannerPreview}" style="max-width: 100%; height: auto;" />`);
                                                                            }
                                                                        } else {
                                                                            window.open(bannerPreview, '_blank');
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
                                                    {companyForm.data.image && !bannerPreview && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Selected: {companyForm.data.image.name}
                                                        </p>
                                                    )}
                                                    {safeCompany?.image_path && !companyForm.data.image && !bannerPreview && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Current banner uploaded.
                                                        </p>
                                                    )}
                                                </label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        companyForm.setData('image', file);
                                                        if (!file) {
                                                            // Restore existing banner preview if file is cleared
                                                            if (safeCompany?.image_path) {
                                                                const bannerUrl = safeCompany.image_path.startsWith('http') || safeCompany.image_path.startsWith('/')
                                                                    ? safeCompany.image_path
                                                                    : `/storage/${safeCompany.image_path}`;
                                                                setBannerPreview(bannerUrl);
                                                            } else {
                                                                setBannerPreview(null);
                                                            }
                                                        }
                                                    }}
                                                />
                                                {companyForm.errors.image && (
                                                    <p className="text-xs text-destructive">{companyForm.errors.image}</p>
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
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            // Don't save during runtime - only validate locally
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
                                            // Don't save during runtime - only validate locally
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
                                                {workforceForm.data.org_chart && !orgChartPreview && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Selected: {workforceForm.data.org_chart.name}
                                                    </p>
                                                )}
                                                {safeCompany.workforce?.org_chart_path && !workforceForm.data.org_chart && !orgChartPreview && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Existing org chart uploaded.
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
                                                    workforceForm.setData('org_chart', file);
                                                    if (!file) {
                                                        // Restore existing chart preview if file is cleared
                                                        if (safeCompany?.workforce?.org_chart_path) {
                                                            const chartUrl = safeCompany.workforce.org_chart_path.startsWith('http') || safeCompany.workforce.org_chart_path.startsWith('/')
                                                                ? safeCompany.workforce.org_chart_path
                                                                : `/storage/${safeCompany.workforce.org_chart_path}`;
                                                            setOrgChartPreview(chartUrl);
                                                        } else {
                                                            setOrgChartPreview(null);
                                                        }
                                                    }
                                                }}
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
                                            // Don't save during runtime - only validate locally
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
                                            // Don't save during runtime - only validate locally
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
                                            // Don't save during runtime - only validate locally
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
                                <div className="flex flex-col space-y-1.5 p-6 border-b">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                        Review & Submit Diagnosis
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Please review all information before submitting. Once submitted, you can proceed to the next steps.
                                    </p>
                                </div>
                                <div className="p-6 pt-6 space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                <p className="text-base font-semibold">Company Information</p>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-start justify-between gap-4">
                                                    <span className="text-muted-foreground font-medium">Company Name:</span>
                                                    <span className="text-foreground font-semibold text-right">{companyForm.data.name || '-'}</span>
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <span className="text-muted-foreground font-medium">Industry:</span>
                                                    <span className="text-foreground font-semibold text-right">{companyForm.data.industry || '-'}</span>
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <span className="text-muted-foreground font-medium">HQ Location:</span>
                                                    <span className="text-foreground font-semibold text-right">{companyForm.data.hq_location || '-'}</span>
                                                </div>
                                                {companyForm.data.brand_name && (
                                                    <div className="flex items-start justify-between gap-4">
                                                        <span className="text-muted-foreground font-medium">Brand Name:</span>
                                                        <span className="text-foreground font-semibold text-right">{companyForm.data.brand_name}</span>
                                                    </div>
                                                )}
                                                {companyForm.data.foundation_date && (
                                                    <div className="flex items-start justify-between gap-4">
                                                        <span className="text-muted-foreground font-medium">Foundation Date:</span>
                                                        <span className="text-foreground font-semibold text-right">{companyForm.data.foundation_date}</span>
                                                    </div>
                                                )}
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
                                        className="w-full h-11 font-semibold"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            submitDiagnosis();
                                        }}
                                        disabled={submitForm.processing || isSubmittingRef.current}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        {submitForm.processing || isSubmittingRef.current ? 'Submitting...' : 'Submit Diagnosis'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back/Next Navigation Buttons */}
                    {activeTab !== 'review' && (
                        <div className="flex justify-between pt-4 border-t">
                            <Button 
                                variant="outline" 
                                onClick={handleBack} 
                                disabled={!canGoBack}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button 
                                onClick={handleNext} 
                                disabled={!canGoNext || isNextDisabled()}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}