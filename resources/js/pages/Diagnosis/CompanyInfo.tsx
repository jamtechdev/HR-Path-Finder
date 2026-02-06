import React from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Building2, Upload, ArrowRight, ArrowLeft, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
    brand_name?: string | null;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    industry_sub_category?: string | null;
    secondary_industries?: string[] | null;
    registration_number?: string | null;
    public_listing_status?: boolean | null;
    logo_path?: string | null;
}

interface BusinessProfile {
    id?: number;
}

interface Workforce {
    id?: number;
}

interface CurrentHrStatus {
    id?: number;
}

interface Culture {
    id?: number;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    id?: number;
}

interface Project {
    id: number;
    status: string;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
    auth?: {
        user: AuthUser | null;
    };
}

const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
const primaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Other'];

export default function CompanyInfo({ company, project }: PageProps) {
    // Get base path
    const basePath = '/hr-manager/diagnosis';
    
    // Load from localStorage or use company data
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
            if (dataToStore.logo) delete dataToStore.logo;
            if (dataToStore.image) delete dataToStore.image;
            localStorage.setItem(`diagnosis_form_${key}`, JSON.stringify(dataToStore));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // Get initial values from localStorage or company
    const storedCompany = getStoredData('company', {});
    const foundationDate = storedCompany.foundation_date || (company?.foundation_date ? company.foundation_date.slice(0, 10) : '');
    const secondaryIndustries = storedCompany.secondary_industries || (Array.isArray(company?.secondary_industries) ? company.secondary_industries : []);

    const form = useForm({
        name: storedCompany.name || company?.name || '',
        brand_name: storedCompany.brand_name || company?.brand_name || '',
        foundation_date: foundationDate,
        hq_location: storedCompany.hq_location || company?.hq_location || '',
        industry: storedCompany.industry || company?.industry || '',
        industry_sub_category: storedCompany.industry_sub_category || company?.industry_sub_category || '',
        secondary_industries: secondaryIndustries,
        registration_number: storedCompany.registration_number || company?.registration_number || '',
        public_listing_status: storedCompany.public_listing_status !== undefined ? storedCompany.public_listing_status : (company?.public_listing_status ?? null),
        logo: null as File | null,
    });

    // State for logo preview
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

    // Load existing logo preview on mount
    React.useEffect(() => {
        if (company?.logo_path && !form.data.logo) {
            const logoUrl = company.logo_path.startsWith('http') || company.logo_path.startsWith('/')
                ? company.logo_path
                : `/storage/${company.logo_path}`;
            setLogoPreview(logoUrl);
        }
    }, [company?.logo_path]);

    // Handle logo preview when file is selected
    React.useEffect(() => {
        if (form.data.logo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(form.data.logo);
        } else if (!company?.logo_path) {
            setLogoPreview(null);
        }
    }, [form.data.logo]);

    // Save to localStorage whenever form data changes
    React.useEffect(() => {
        const timer = setTimeout(() => {
            saveToLocalStorage('company', form.data);
        }, 500); // Debounce saves
        return () => clearTimeout(timer);
    }, [form.data]);

    const status: 'not_started' | 'in_progress' | 'submitted' = 'not_started';

    const toggleSecondaryIndustry = (industry: string) => {
        const current = form.data.secondary_industries;
        if (current.includes(industry)) {
            form.setData('secondary_industries', current.filter((item) => item !== industry));
        } else {
            form.setData('secondary_industries', [...current, industry]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Save to localStorage
        saveToLocalStorage('company', form.data);
        
        // Navigate to next step
        router.visit(`${basePath}/business-profile`);
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
        'company-info': Boolean(
            form.data.name &&
            form.data.registration_number &&
            form.data.hq_location &&
            form.data.public_listing_status !== null &&
            form.data.industry &&
            form.data.industry_sub_category
        ),
        'business-profile': checkStepComplete('business-profile'),
        'workforce': checkStepComplete('workforce'),
        'current-hr': checkStepComplete('current-hr'),
        'culture': checkStepComplete('culture'),
        'confidential': checkStepComplete('confidential'),
        'review': false,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length + 1; // +1 for current step
    const totalSteps = 7;

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
                    <Head title="Company Info - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/overview`}
                        />

                    <DiagnosisProgressBar
                        stepName="Company Info"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                        currentStep={2}
                    />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="company-info"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={null}
                    />

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Task 1: Basic Company Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Task 1: Basic Company Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Company Information</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Company Name *</Label>
                                            <Input
                                                id="companyName"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                placeholder="Enter company name"
                                            />
                                            {form.errors.name && (
                                                <p className="text-xs text-destructive">{form.errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registrationNumber">Registration Number *</Label>
                                            <Input
                                                id="registrationNumber"
                                                value={form.data.registration_number}
                                                onChange={(e) => form.setData('registration_number', e.target.value)}
                                                placeholder="Enter official registration number"
                                            />
                                            {form.errors.registration_number && (
                                                <p className="text-xs text-destructive">{form.errors.registration_number}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="hqLocation">HQ Location *</Label>
                                            <Input
                                                id="hqLocation"
                                                value={form.data.hq_location}
                                                onChange={(e) => form.setData('hq_location', e.target.value)}
                                                placeholder="City, Country"
                                            />
                                            {form.errors.hq_location && (
                                                <p className="text-xs text-destructive">{form.errors.hq_location}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="publicListingStatus">Public Listing Status *</Label>
                                            <Select
                                                value={form.data.public_listing_status === null ? '' : form.data.public_listing_status ? 'yes' : 'no'}
                                                onValueChange={(value) => form.setData('public_listing_status', value === 'yes' ? true : value === 'no' ? false : null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.errors.public_listing_status && (
                                                <p className="text-xs text-destructive">{form.errors.public_listing_status}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brandName">Brand Name</Label>
                                        <Input
                                            id="brandName"
                                            value={form.data.brand_name}
                                            onChange={(e) => form.setData('brand_name', e.target.value)}
                                            placeholder="Enter brand name (if different)"
                                        />
                                        {form.errors.brand_name && (
                                            <p className="text-xs text-destructive">{form.errors.brand_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Task 2: Industry Information */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold">Task 2: Industry Information</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="foundationDate">Foundation Date *</Label>
                                            <Input
                                                id="foundationDate"
                                                type="date"
                                                value={form.data.foundation_date}
                                                onChange={(e) => form.setData('foundation_date', e.target.value)}
                                            />
                                            {form.errors.foundation_date && (
                                                <p className="text-xs text-destructive">{form.errors.foundation_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="industry">Major Category *</Label>
                                            <Select
                                                value={form.data.industry}
                                                onValueChange={(value) => form.setData('industry', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select major category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {primaryIndustryOptions.map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.industry && (
                                                <p className="text-xs text-destructive">{form.errors.industry}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="industrySubCategory">Sub Category *</Label>
                                            <Input
                                                id="industrySubCategory"
                                                value={form.data.industry_sub_category}
                                                onChange={(e) => form.setData('industry_sub_category', e.target.value)}
                                                placeholder="e.g., Electronics, Automotive, Semi-conductors"
                                            />
                                            {form.errors.industry_sub_category && (
                                                <p className="text-xs text-destructive">{form.errors.industry_sub_category}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">Admin can adjust industries via admin page</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Secondary Industries</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {secondaryIndustryOptions.map((industry) => {
                                                    const selected = form.data.secondary_industries.includes(industry);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={industry}
                                                            onClick={() => toggleSecondaryIndustry(industry)}
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                                                                selected
                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                    : 'text-foreground hover:bg-accent'
                                                            }`}
                                                        >
                                                            {industry}
                                                        </button>
                                                    );
                                                })}
                                            </div>
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
                                        {form.data.logo && !logoPreview && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {form.data.logo.name}
                                            </p>
                                        )}
                                        {company?.logo_path && !form.data.logo && !logoPreview && (
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
                                            form.setData('logo', file);
                                            if (!file) {
                                                // Restore existing logo preview if file is cleared
                                                if (company?.logo_path) {
                                                    const logoUrl = company.logo_path.startsWith('http') || company.logo_path.startsWith('/')
                                                        ? company.logo_path
                                                        : `/storage/${company.logo_path}`;
                                                    setLogoPreview(logoUrl);
                                                } else {
                                                    setLogoPreview(null);
                                                }
                                            }
                                        }}
                                    />
                                    {form.errors.logo && (
                                        <p className="text-xs text-destructive">{form.errors.logo}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => router.visit(`${basePath}/overview`)}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                    >
                                        {form.processing ? 'Saving...' : 'Next'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
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
