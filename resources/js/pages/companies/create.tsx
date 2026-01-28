import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';

const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
const primaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting', 'Other'];

export default function CreateCompany() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        brand_name: '',
        foundation_date: '',
        hq_location: '',
        industry: '',
        secondary_industries: [] as string[],
        logo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/companies', data, {
            forceFormData: true,
        });
    };

    const toggleSecondaryIndustry = (industry: string) => {
        if (data.secondary_industries.includes(industry)) {
            setData(
                'secondary_industries',
                data.secondary_industries.filter((item) => item !== industry)
            );
            return;
        }
        setData('secondary_industries', [...data.secondary_industries, industry]);
    };

    const totalSteps = 7;
    const completedSteps = 1; // Company Info is step 1
    const hasStarted = Boolean(
        data.name ||
            data.foundation_date ||
            data.hq_location ||
            data.industry ||
            data.secondary_industries.length
    );

    // Status based on form data
    const status: 'not_started' | 'in_progress' | 'submitted' = hasStarted ? 'in_progress' : 'not_started';

    // Step status for tabs (all false since we're creating)
    const stepStatus = {
        'company-info': false,
        'business-profile': false,
        'workforce': false,
        'current-hr': false,
        'culture': false,
        'confidential': false,
        'review': false,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'current-hr', 'culture', 'confidential', 'review'] as const;

    // Tabs configuration
    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/diagnosis` },
        { id: 'company-info' as TabId, name: 'Company Info', icon: Building2, route: '/companies/create' },
        { id: 'business-profile' as TabId, name: 'Business Profile', icon: Briefcase, route: '#' },
        { id: 'workforce' as TabId, name: 'Workforce', icon: Users, route: '#' },
        { id: 'current-hr' as TabId, name: 'Current HR', icon: Settings, route: '#' },
        { id: 'culture' as TabId, name: 'Culture', icon: MessageSquare, route: '#' },
        { id: 'confidential' as TabId, name: 'Confidential', icon: FileText, route: '#' },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: '#' },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />
            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 1: Diagnosis" />
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
                                />

                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="company-info"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Company Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name *</Label>
                                        <Input
                                            id="companyName"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter company name"
                                            required
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brandName">Brand Name</Label>
                                        <Input
                                            id="brandName"
                                            value={data.brand_name}
                                            onChange={(e) => setData('brand_name', e.target.value)}
                                            placeholder="Enter brand name (if different)"
                                        />
                                        {errors.brand_name && (
                                            <p className="text-xs text-destructive">{errors.brand_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="foundationDate">Foundation Date *</Label>
                                        <Input
                                            id="foundationDate"
                                            type="date"
                                            value={data.foundation_date}
                                            onChange={(e) => setData('foundation_date', e.target.value)}
                                            required
                                        />
                                        {errors.foundation_date && (
                                            <p className="text-xs text-destructive">
                                                {errors.foundation_date}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hqLocation">HQ Location *</Label>
                                        <Input
                                            id="hqLocation"
                                            value={data.hq_location}
                                            onChange={(e) => setData('hq_location', e.target.value)}
                                            placeholder="City, Country"
                                            required
                                        />
                                        {errors.hq_location && (
                                            <p className="text-xs text-destructive">{errors.hq_location}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Primary Industry *</Label>
                                        <Select
                                            value={data.industry}
                                            onValueChange={(value) => setData('industry', value)}
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
                                        {errors.industry && (
                                            <p className="text-xs text-destructive">{errors.industry}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary Industries</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {secondaryIndustryOptions.map((industry) => {
                                                const selected = data.secondary_industries.includes(industry);
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
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                        {data.logo && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {data.logo.name}
                                            </p>
                                        )}
                                    </label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                    />
                                    {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/diagnosis')}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating...' : 'Next'}
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
