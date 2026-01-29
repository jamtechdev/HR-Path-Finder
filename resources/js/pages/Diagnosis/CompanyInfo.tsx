import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Building2, Upload, ArrowRight, ArrowLeft, Briefcase, Users, Settings, MessageSquare, FileText, Check, ArrowLeftCircle } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    company: Company;
    project: Project;
    auth?: {
        user: AuthUser | null;
    };
}

const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
const primaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Other'];

export default function CompanyInfo({ company, project }: PageProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const isCeo = user?.roles?.some(role => role.name === 'ceo') || false;
    
    const foundationDate = company.foundation_date ? company.foundation_date.slice(0, 10) : '';
    const secondaryIndustries = Array.isArray(company.secondary_industries) ? company.secondary_industries : [];

    const form = useForm({
        name: company.name || '',
        brand_name: company.brand_name || '',
        foundation_date: foundationDate,
        hq_location: company.hq_location || '',
        industry: company.industry || '',
        secondary_industries: secondaryIndustries,
        logo: null as File | null,
        redirect_to_ceo_survey: isCeo, // Add redirect parameter for CEO
    });

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        project.status === 'not_started' ? 'not_started' : 
        project.status === 'in_progress' ? 'in_progress' : 
        'submitted';

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
        form.post(`/diagnosis/${project.id}/company-info`, {
            forceFormData: true,
            preserveScroll: true,
            only: ['company', 'project'],
            onSuccess: () => {
                // If CEO, redirect will be handled by backend
                if (isCeo) {
                    // Backend will redirect to CEO Philosophy Survey
                } else {
                    // HR Manager: Navigate to next step (business-profile)
                    router.visit(`/diagnosis/${project.id}/business-profile`);
                }
            },
        });
    };

    const handleBackToSurvey = () => {
        router.visit(`/hr-projects/${project.id}/ceo-philosophy`);
    };

    // Calculate step completion status
    const stepStatus = {
        'company-info': Boolean(
            company.name &&
            company.foundation_date &&
            company.hq_location &&
            company.industry
        ),
        'business-profile': Boolean(project.business_profile),
        'workforce': Boolean(project.workforce),
        'current-hr': Boolean(project.current_hr_status),
        'culture': Boolean(project.culture && (project.culture.core_values || []).length > 0),
        'confidential': Boolean(project.confidential_note),
        'review': Boolean(project.status === 'submitted'),
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length + 1; // +1 for current step
    const totalSteps = 7;

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
                <Head title="Company Info - Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref="/diagnosis"
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
                        projectId={project.id}
                    />

                    {/* CEO Review Alert */}
                    {isCeo && (
                        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="flex items-center justify-between">
                                <span className="text-sm text-blue-900 dark:text-blue-100">
                                    You can review and modify the company information provided by the HR Manager before completing the Management Philosophy Survey.
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBackToSurvey}
                                    className="ml-4"
                                >
                                    <ArrowLeftCircle className="w-4 h-4 mr-2" />
                                    Back to Survey
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Company Basic Information</CardTitle>
                                {isCeo && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBackToSurvey}
                                    >
                                        <ArrowLeftCircle className="w-4 h-4 mr-2" />
                                        Back to Survey
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Primary Industry *</Label>
                                        <Select
                                            value={form.data.industry}
                                            onValueChange={(value) => form.setData('industry', value)}
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
                                        {form.errors.industry && (
                                            <p className="text-xs text-destructive">{form.errors.industry}</p>
                                        )}
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
                                        {form.data.logo && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {form.data.logo.name}
                                            </p>
                                        )}
                                        {company.logo_path && !form.data.logo && (
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
                                            form.setData('logo', e.target.files?.[0] || null)
                                        }
                                    />
                                    {form.errors.logo && (
                                        <p className="text-xs text-destructive">{form.errors.logo}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => router.visit('/diagnosis')}
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
        </div>
    );
}
