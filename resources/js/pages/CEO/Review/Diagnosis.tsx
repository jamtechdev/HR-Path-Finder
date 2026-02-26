import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';
import { History, Save, CheckCircle2, Plus, X, FileText } from 'lucide-react';

interface Diagnosis {
    id: number;
    status: string;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    expected_headcount_2y?: number;
    expected_headcount_3y?: number;
    average_tenure_active?: number;
    average_tenure_leavers?: number;
    average_age?: number;
    gender_male?: number;
    gender_female?: number;
    gender_ratio?: number;
    total_executives?: number;
    executive_positions?: Array<{ role: string; count: number }> | Record<string, number>;
    leadership_count?: number;
    leadership_percentage?: number;
    job_grade_names?: string[];
    promotion_years?: Record<string, number | null>;
    org_structure_types?: string[];
    organizational_charts?: Record<string, string>;
    hr_issues?: string[];
    custom_hr_issues?: string;
    job_categories?: string[];
    job_functions?: string[];
    [key: string]: any;
}

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    is_public?: boolean;
    public_listing_status?: string;
    brand_name?: string;
    foundation_date?: string;
    logo_path?: string;
}

interface ReviewLog {
    id: number;
    field_name: string;
    original_value: string;
    modified_value: string;
    created_at: string;
    modifier: {
        name: string;
    };
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories: Array<{ id: number; name: string }>;
}

interface HrIssue {
    id: number;
    name: string;
    category: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
    };
    diagnosis?: Diagnosis;
    company: Company;
    reviewLogs?: ReviewLog[];
    industryCategories?: IndustryCategory[];
    hqLocations?: string[];
    hrIssues?: HrIssue[];
}

const STRUCTURE_TYPES = [
    { value: 'functional', label: 'Functional' },
    { value: 'divisional', label: 'Divisional Structure' },
    { value: 'matrix', label: 'Project / Matrix Organization' },
    { value: 'hq_subsidiary', label: 'HQ–Subsidiary Structure' },
    { value: 'no_defined', label: 'No Clearly Defined Structure' },
];

export default function CeoReviewDiagnosis({ 
    project, 
    diagnosis, 
    company, 
    reviewLogs = [],
    industryCategories = [],
    hqLocations = [],
    hrIssues = [],
}: Props) {
    const [activeTab, setActiveTab] = useState('company-info');
    const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];
    
    const { data, setData, post, processing, errors } = useForm({
        ...diagnosis,
        registration_number: diagnosis?.registration_number || company.registration_number || '',
        hq_location: diagnosis?.hq_location || company.hq_location || '',
        is_public: company.is_public ?? false,
        brand_name: company.brand_name || '',
        foundation_date: company.foundation_date || '',
        secondary_industries: diagnosis?.secondary_industries || [],
    });

    // Initialize selected secondary industries from diagnosis data
    const [selectedSecondaryIndustries, setSelectedSecondaryIndustries] = useState<string[]>(
        diagnosis?.secondary_industries || []
    );

    // Update form data when diagnosis or company props change (after save/reload)
    useEffect(() => {
        if (diagnosis) {
            // Update all diagnosis fields
            Object.keys(diagnosis).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                    setData(key as any, diagnosis[key as keyof typeof diagnosis]);
                }
            });
        }
        
        // Update company-related fields
        setData('registration_number', diagnosis?.registration_number || company.registration_number || '');
        setData('hq_location', diagnosis?.hq_location || company.hq_location || '');
        setData('is_public', company.is_public ?? false);
        setData('brand_name', company.brand_name || '');
        setData('foundation_date', company.foundation_date || '');
        setData('secondary_industries', diagnosis?.secondary_industries || []);
        
        // Update secondary industries state
        setSelectedSecondaryIndustries(diagnosis?.secondary_industries || []);
    }, [diagnosis, company]);

    // Update form data when secondary industries change
    useEffect(() => {
        setData('secondary_industries', selectedSecondaryIndustries);
    }, [selectedSecondaryIndustries]);

    // Calculate gender ratio
    useEffect(() => {
        const total = (data.gender_male || 0) + (data.gender_female || 0);
        if (total > 0) {
            const ratio = ((data.gender_male || 0) / total) * 100;
            setData('gender_ratio', Math.round(ratio * 100) / 100);
        }
    }, [data.gender_male, data.gender_female]);

    // Calculate leadership percentage
    useEffect(() => {
        if (data.present_headcount && data.leadership_count) {
            const percentage = (data.leadership_count / data.present_headcount) * 100;
            setData('leadership_percentage', Math.round(percentage * 100) / 100);
        }
    }, [data.present_headcount, data.leadership_count]);

    // Handle executive positions
    const [executivePositions, setExecutivePositions] = useState<Array<{ role: string; count: number }>>(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                return diagnosis.executive_positions;
            } else {
                return Object.entries(diagnosis.executive_positions).map(([role, count]) => ({
                    role,
                    count: count as number,
                }));
            }
        }
        return [];
    });

    // Update executive positions when diagnosis changes (after save/reload)
    useEffect(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                setExecutivePositions(diagnosis.executive_positions);
            } else {
                setExecutivePositions(
                    Object.entries(diagnosis.executive_positions).map(([role, count]) => ({
                        role,
                        count: count as number,
                    }))
                );
            }
        } else {
            setExecutivePositions([]);
        }
    }, [diagnosis]);

    useEffect(() => {
        setData('executive_positions', executivePositions);
    }, [executivePositions]);

    const handleSave = () => {
        post(`/ceo/review/diagnosis/${project.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                // Reload diagnosis, company, and reviewLogs to get updated data
                router.reload({ 
                    only: ['diagnosis', 'company', 'reviewLogs'],
                    preserveState: false 
                });
            },
        });
    };

    const handleConfirm = () => {
        post(`/ceo/review/diagnosis/${project.id}/confirm`, {
            onSuccess: () => {
                router.visit(`/ceo/philosophy/survey/${project.id}`);
            },
        });
    };

    const selectedIndustryCategory = industryCategories.find(cat => cat.name === data.industry_category);
    const subCategories = selectedIndustryCategory?.subCategories || [];

    // Group HR issues by category
    const issuesByCategory = hrIssues.reduce((acc, issue) => {
        if (!acc[issue.category]) {
            acc[issue.category] = [];
        }
        acc[issue.category].push(issue);
        return acc;
    }, {} as Record<string, HrIssue[]>);

    const categoryLabels: Record<string, string> = {
        recruitment_retention: 'Recruitment / Retention',
        organization: 'Organization',
        culture_leadership: 'Culture / Leadership',
        evaluation_compensation: 'Evaluation / Compensation',
        upskilling: 'Upskilling',
        others: 'Others',
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Review Diagnosis - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Review HR Diagnosis Inputs</h1>
                                <p className="text-muted-foreground">
                                    Review and edit the diagnosis data submitted by your HR Manager. All changes will be logged.
                                </p>
                            </div>
                            {diagnosis && (
                                <Badge variant={diagnosis.status === 'submitted' ? 'default' : 'secondary'}>
                                    {diagnosis.status}
                                </Badge>
                            )}
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="company-info">Company Info</TabsTrigger>
                                <TabsTrigger value="workforce">Workforce</TabsTrigger>
                                <TabsTrigger value="executives">Executives</TabsTrigger>
                                <TabsTrigger value="leaders">Leaders</TabsTrigger>
                                <TabsTrigger value="job-grades">Job Grades</TabsTrigger>
                                <TabsTrigger value="organizational-charts">Org Charts</TabsTrigger>
                                <TabsTrigger value="organizational-structure">Org Structure</TabsTrigger>
                                <TabsTrigger value="job-structure">Job Structure</TabsTrigger>
                                <TabsTrigger value="hr-issues">HR Issues</TabsTrigger>
                                <TabsTrigger value="history">Change History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="company-info" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Company Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Company Name</Label>
                                                <Input value={company.name} disabled />
                                            </div>
                                            <div>
                                                <Label>Foundation Date</Label>
                                                <Input 
                                                    type="date"
                                                    value={data.foundation_date || ''} 
                                                    onChange={(e) => setData('foundation_date', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Business Registration Number</Label>
                                                <Input 
                                                    value={data.registration_number || ''} 
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const formatted = value
                                                            .replace(/\D/g, '')
                                                            .replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
                                                            .slice(0, 13);
                                                        setData('registration_number', formatted);
                                                    }}
                                                    placeholder="000-00-00000"
                                                    maxLength={13}
                                                />
                                            </div>
                                            <div>
                                                <Label>Brand Name</Label>
                                                <Input 
                                                    value={data.brand_name || ''} 
                                                    onChange={(e) => setData('brand_name', e.target.value)}
                                                    placeholder="Enter brand name (if different)"
                                                />
                                            </div>
                                            <div>
                                                <Label>HQ Location</Label>
                                                {hqLocations.length > 0 ? (
                                                    <Select
                                                        value={data.hq_location || ''}
                                                        onValueChange={(value) => setData('hq_location', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select HQ location" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {hqLocations.map((location) => (
                                                                <SelectItem key={location} value={location}>
                                                                    {location}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input 
                                                        value={data.hq_location || ''} 
                                                        onChange={(e) => setData('hq_location', e.target.value)}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <Label>Public Listing Status</Label>
                                                <RadioGroup
                                                    value={data.is_public ? 'yes' : 'no'}
                                                    onValueChange={(value) => setData('is_public', value === 'yes')}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id="public-yes" />
                                                        <Label htmlFor="public-yes" className="cursor-pointer">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id="public-no" />
                                                        <Label htmlFor="public-no" className="cursor-pointer">No</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                        
                                        {/* Company Logo */}
                                        {company.logo_path && (
                                            <div className="mt-4">
                                                <Label>Company Logo</Label>
                                                <div className="mt-2">
                                                    <img 
                                                        src={company.logo_path.startsWith('/') ? company.logo_path : `/storage/${company.logo_path}`}
                                                        alt="Company Logo"
                                                        className="w-20 h-20 object-contain border rounded-lg p-2 bg-muted"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Industry Classification</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Major Industry Category</Label>
                                                <Select
                                                    value={data.industry_category || ''}
                                                    onValueChange={(value) => {
                                                        setData('industry_category', value);
                                                        setData('industry_subcategory', '');
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select industry" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {industryCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.name}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Sub Industry Category</Label>
                                                <Select
                                                    value={data.industry_subcategory || ''}
                                                    onValueChange={(value) => setData('industry_subcategory', value)}
                                                    disabled={!data.industry_category}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select subcategory" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subCategories.map((sub) => (
                                                            <SelectItem key={sub.id} value={sub.name}>
                                                                {sub.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {data.industry_subcategory === 'Others' && (
                                                    <Input
                                                        className="mt-2"
                                                        value={data.industry_other || ''}
                                                        onChange={(e) => setData('industry_other', e.target.value)}
                                                        placeholder="Please specify"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Secondary Industries */}
                                        <div className="space-y-2">
                                            <Label>Secondary Industries</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {secondaryIndustryOptions.map((industry) => {
                                                    const isSelected = selectedSecondaryIndustries.includes(industry);
                                                    return (
                                                        <button
                                                            key={industry}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedSecondaryIndustries(
                                                                        selectedSecondaryIndustries.filter(i => i !== industry)
                                                                    );
                                                                } else {
                                                                    setSelectedSecondaryIndustries([
                                                                        ...selectedSecondaryIndustries,
                                                                        industry
                                                                    ]);
                                                                }
                                                            }}
                                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }`}
                                                        >
                                                            {industry}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="workforce" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Workforce Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Current Workforce Size (Active employees)</Label>
                                                <Input 
                                                    type="number"
                                                    value={data.present_headcount || ''} 
                                                    onChange={(e) => setData('present_headcount', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Workforce Forecast</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label>After 1 year</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.expected_headcount_1y || ''} 
                                                        onChange={(e) => setData('expected_headcount_1y', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>After 2 years</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.expected_headcount_2y || ''} 
                                                        onChange={(e) => setData('expected_headcount_2y', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>After 3 years</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.expected_headcount_3y || ''} 
                                                        onChange={(e) => setData('expected_headcount_3y', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Average Tenure</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Active employees (years)</Label>
                                                    <Input 
                                                        type="number"
                                                        step="0.1"
                                                        value={data.average_tenure_active || ''} 
                                                        onChange={(e) => setData('average_tenure_active', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Leavers (years)</Label>
                                                    <Input 
                                                        type="number"
                                                        step="0.1"
                                                        value={data.average_tenure_leavers || ''} 
                                                        onChange={(e) => setData('average_tenure_leavers', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Average Age (years)</Label>
                                            <Input 
                                                type="number"
                                                step="0.1"
                                                value={data.average_age || ''} 
                                                onChange={(e) => setData('average_age', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Gender Composition</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Male (count)</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.gender_male || ''} 
                                                        onChange={(e) => setData('gender_male', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Female (count)</Label>
                                                    <Input 
                                                        type="number"
                                                        value={data.gender_female || ''} 
                                                        onChange={(e) => setData('gender_female', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            {data.gender_ratio !== undefined && data.gender_ratio !== null && (
                                                <div className="mt-2 p-2 bg-muted rounded">
                                                    <p className="text-sm">
                                                        <strong>Male %:</strong> {Number(data.gender_ratio).toFixed(2)}% | 
                                                        <strong> Female %:</strong> {(100 - Number(data.gender_ratio)).toFixed(2)}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="executives" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Executives</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Total Executives</Label>
                                            <Input 
                                                type="number"
                                                value={data.total_executives || ''} 
                                                onChange={(e) => setData('total_executives', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Executive Positions</Label>
                                            {executivePositions.map((pos, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Position name"
                                                        value={pos.role}
                                                        onChange={(e) => {
                                                            const updated = [...executivePositions];
                                                            updated[index].role = e.target.value;
                                                            setExecutivePositions(updated);
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Count"
                                                        value={pos.count || ''}
                                                        onChange={(e) => {
                                                            const updated = [...executivePositions];
                                                            updated[index].count = parseInt(e.target.value) || 0;
                                                            setExecutivePositions(updated);
                                                        }}
                                                        className="w-24"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setExecutivePositions(executivePositions.filter((_, i) => i !== index))}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExecutivePositions([...executivePositions, { role: '', count: 1 }])}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Position
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="leaders" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Leaders</CardTitle>
                                        <CardDescription>Excludes executives</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Total Leaders</Label>
                                            <Input 
                                                type="number"
                                                value={data.leadership_count || ''} 
                                                onChange={(e) => setData('leadership_count', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        {data.leadership_percentage !== undefined && data.leadership_percentage !== null && (
                                            <div className="p-2 bg-muted rounded">
                                                <p className="text-sm">
                                                    <strong>Leaders Ratio:</strong> {Number(data.leadership_percentage).toFixed(2)}%
                                                    ({data.leadership_count || 0} leaders / {data.present_headcount || 0} workforce)
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="job-grades" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Job Grade System</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Grade Names</Label>
                                            {data.job_grade_names?.map((grade, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        value={grade}
                                                        onChange={(e) => {
                                                            const updated = [...(data.job_grade_names || [])];
                                                            updated[index] = e.target.value;
                                                            setData('job_grade_names', updated);
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Promotion years"
                                                        value={data.promotion_years?.[grade] || ''}
                                                        onChange={(e) => {
                                                            const updated = { ...(data.promotion_years || {}) };
                                                            updated[grade] = e.target.value ? parseInt(e.target.value) : null;
                                                            setData('promotion_years', updated);
                                                        }}
                                                        className="w-32"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updated = [...(data.job_grade_names || [])];
                                                            updated.splice(index, 1);
                                                            setData('job_grade_names', updated);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = [...(data.job_grade_names || []), ''];
                                                    setData('job_grade_names', updated);
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Grade
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="organizational-charts" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organizational Charts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            {['2023.12', '2024.12', '2025.12'].map((year) => {
                                                const chartPath = data.organizational_charts?.[year];
                                                const chartUrl = chartPath ? (chartPath.startsWith('/') ? chartPath : `/storage/${chartPath}`) : '';
                                                const isImage = chartPath && (chartPath.endsWith('.png') || chartPath.endsWith('.jpg') || chartPath.endsWith('.jpeg'));
                                                const isPdf = chartPath && chartPath.endsWith('.pdf');
                                                
                                                return (
                                                    <div key={year} className="space-y-2">
                                                        <Label>{year}</Label>
                                                        {chartUrl ? (
                                                            <div className="border rounded-lg p-4">
                                                                {isImage ? (
                                                                    <img 
                                                                        src={chartUrl} 
                                                                        alt={`Chart ${year}`}
                                                                        className="max-w-full h-auto max-h-64 object-contain"
                                                                    />
                                                                ) : isPdf ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                                                        <a href={chartUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                                            View PDF
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <a href={chartUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                                        View File
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No file uploaded</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="organizational-structure" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organizational Structure</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Structure Type (Multi-select)</Label>
                                            {STRUCTURE_TYPES.map((type) => (
                                                <div key={type.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`structure-${type.value}`}
                                                        checked={data.org_structure_types?.includes(type.value) || false}
                                                        onCheckedChange={(checked) => {
                                                            const current = data.org_structure_types || [];
                                                            if (checked) {
                                                                setData('org_structure_types', [...current, type.value]);
                                                            } else {
                                                                setData('org_structure_types', current.filter(t => t !== type.value));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`structure-${type.value}`} className="cursor-pointer">
                                                        {type.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="job-structure" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Job Structure</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Job Categories</Label>
                                            <Textarea 
                                                value={Array.isArray(data.job_categories) ? data.job_categories.join(', ') : ''} 
                                                onChange={(e) => setData('job_categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                                placeholder="Enter job categories separated by commas"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label>Job Functions</Label>
                                            <Textarea 
                                                value={Array.isArray(data.job_functions) ? data.job_functions.join(', ') : ''} 
                                                onChange={(e) => setData('job_functions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                                placeholder="Enter job functions separated by commas"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="hr-issues" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key HR / Organizational Issues</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {Object.entries(issuesByCategory).map(([category, issues]) => (
                                            <div key={category}>
                                                <Label className="text-sm font-semibold mb-2 block">
                                                    {categoryLabels[category] || category}
                                                </Label>
                                                <div className="space-y-2">
                                                    {issues.map((issue) => (
                                                        <div key={issue.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`issue-${issue.id}`}
                                                                checked={data.hr_issues?.includes(issue.id.toString()) || false}
                                                                onCheckedChange={(checked) => {
                                                                    const current = data.hr_issues || [];
                                                                    if (checked) {
                                                                        setData('hr_issues', [...current, issue.id.toString()]);
                                                                    } else {
                                                                        setData('hr_issues', current.filter(id => id !== issue.id.toString()));
                                                                    }
                                                                }}
                                                            />
                                                            <Label htmlFor={`issue-${issue.id}`} className="cursor-pointer">
                                                                {issue.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <div>
                                            <Label>Additional Issues (Free Text)</Label>
                                            <Textarea 
                                                value={data.custom_hr_issues || ''} 
                                                onChange={(e) => setData('custom_hr_issues', e.target.value)}
                                                rows={4}
                                                placeholder="Add any additional HR or organizational issues not listed above"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <History className="w-5 h-5" />
                                            Change History
                                        </CardTitle>
                                        <CardDescription>
                                            All modifications made during CEO review are logged here.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {reviewLogs.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-8">No changes recorded yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {reviewLogs.map((log) => (
                                                    <div key={log.id} className="p-4 border rounded-lg">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="font-medium">{log.field_name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Modified by {log.modifier.name} on {new Date(log.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Original:</p>
                                                                <p className="text-sm bg-red-50 p-2 rounded break-words">{log.original_value || '(empty)'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Modified:</p>
                                                                <p className="text-sm bg-green-50 p-2 rounded break-words">{log.modified_value || '(empty)'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handleSave}
                                disabled={processing}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            {diagnosis?.status === 'submitted' && (
                                <Button
                                    onClick={handleConfirm}
                                    disabled={processing}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Confirm & Proceed to Survey
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
