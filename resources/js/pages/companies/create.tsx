import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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

export default function CreateCompany() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        brand_name: '',
        foundation_date: '',
        hq_location: '',
        industry: '',
        secondary_industries: [] as string[],
        logo: null as File | null,
        image: null as File | null,
        latitude: '',
        longitude: '',
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

    const activeTab: StepId = 'company';
    const totalSteps = 7;
    const activeStepNumber = 1;
    const progressPercent = Math.round((activeStepNumber / totalSteps) * 100);
    const completedTabs = new Set<StepId>(['overview']);
    const lockedTabs = new Set<StepId>([
        'business',
        'workforce',
        'current-hr',
        'culture',
        'confidential',
        'review',
    ]);
    const hasStarted = Boolean(
        data.name ||
            data.foundation_date ||
            data.hq_location ||
            data.industry ||
            data.secondary_industries.length
    );

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
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            hasStarted
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {hasStarted ? 'In Progress' : 'Not Started'}
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
                                <span className="text-sm font-medium">Company Info</span>
                                <span className="text-sm text-muted-foreground">1 of 7</span>
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

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                Company Basic Information
                            </h3>
                        </div>
                        <div className="p-6 pt-0 space-y-6">
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

                                <div className="space-y-2">
                                    <Label htmlFor="image">Company Image</Label>
                                    <label
                                        htmlFor="image"
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                    >
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                        {data.image && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Selected: {data.image.name}
                                            </p>
                                        )}
                                    </label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                    />
                                    {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            placeholder="e.g., 28.6139"
                                        />
                                        {errors.latitude && (
                                            <p className="text-xs text-destructive">{errors.latitude}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            placeholder="e.g., 77.2090"
                                        />
                                        {errors.longitude && (
                                            <p className="text-xs text-destructive">{errors.longitude}</p>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" disabled={processing} className="h-11 px-8">
                                    {processing ? 'Creating...' : 'Create Company & Start HR Project'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
