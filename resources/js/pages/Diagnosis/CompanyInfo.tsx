import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    is_public?: boolean;
    public_listing_status?: string;
    logo_path?: string;
    brand_name?: string;
    foundation_date?: string;
}

interface Diagnosis {
    id: number;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories?: IndustrySubCategory[];
}

interface IndustrySubCategory {
    id: number;
    name: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
    };
    company: Company;
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    industryCategories?: IndustryCategory[];
    hqLocations?: string[]; // Admin-configurable locations
}

export default function CompanyInfo({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    industryCategories = [],
    hqLocations = [],
}: Props) {
    // Format registration number for display (convert "291" to "291-00-00000" format if needed)
    const formatRegistrationNumber = (value: string): string => {
        if (!value) return '';
        // If already in correct format, return as is
        if (/^\d{3}-\d{2}-\d{5}$/.test(value)) {
            return value;
        }
        // If it's just digits, try to format it
        const digits = value.replace(/\D/g, '');
        if (digits.length >= 3) {
            // Format as 000-00-00000
            const part1 = digits.substring(0, 3);
            const part2 = digits.substring(3, 5) || '00';
            const part3 = digits.substring(5, 10) || '00000';
            return `${part1}-${part2}-${part3}`.substring(0, 13);
        }
        return value;
    };

    const [selectedSecondaryIndustries, setSelectedSecondaryIndustries] = useState<string[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_path || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const secondaryIndustryOptions = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Consulting'];

    const { data, setData, post, processing, errors } = useForm<{
        company_name: string;
        registration_number: string;
        hq_location: string;
        is_public: boolean;
        industry_category: string;
        industry_subcategory: string;
        industry_other: string;
        brand_name: string;
        foundation_date: string;
        logo: File | null;
    }>({
        company_name: company.name || '',
        registration_number: formatRegistrationNumber(company.registration_number || ''),
        hq_location: company.hq_location || '',
        is_public: company.is_public ?? false,
        industry_category: diagnosis?.industry_category || '',
        industry_subcategory: diagnosis?.industry_subcategory || '',
        industry_other: diagnosis?.industry_other || '',
        brand_name: company.brand_name || '',
        foundation_date: company.foundation_date || '',
        logo: null,
    });

    // Removed auto-save - only save on review and submit

    // Load existing logo if available
    useEffect(() => {
        if (company.logo_path) {
            // If logo_path is a full URL, use it directly
            if (company.logo_path.startsWith('http') || company.logo_path.startsWith('/')) {
                setLogoPreview(company.logo_path);
            } else {
                // Otherwise, construct the storage URL
                setLogoPreview(`/storage/${company.logo_path}`);
            }
        }
    }, [company.logo_path]);

    // Validate registration number format (000-00-00000 or digits only)
    const validateRegistrationNumber = (value: string): boolean => {
        if (!value) return true; // Allow empty for optional fields
        // Accept format: 000-00-00000 or 3-10 digits
        const regex = /^(\d{3}-\d{2}-\d{5}|\d{3,10})$/;
        return regex.test(value);
    };

    // Handle file upload
    const handleFileChange = (file: File) => {
        // Validate file type
        if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
            alert('Please upload a PNG or JPG image file.');
            return;
        }
        
        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB.');
            return;
        }

        setData('logo', file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Head title={`Company Info - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Company Basic Information"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                nextRoute="workforce"
                formData={{
                    ...data,
                    is_public: data.is_public,
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card className="shadow-lg border-border/50">
                    <CardContent className="p-8">
                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Company Name */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="company_name" className="text-sm font-medium text-foreground">
                                        Company Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Enter company name"
                                        className={cn(
                                            "h-10 bg-background",
                                            errors.company_name && 'border-destructive'
                                        )}
                                        required
                                    />
                                    {errors.company_name && (
                                        <p className="text-sm text-destructive">{errors.company_name}</p>
                                    )}
                                </div>

                                {/* Foundation Date */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="foundation_date" className="text-sm font-medium text-foreground">
                                        Foundation Date <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="foundation_date"
                                            type="date"
                                            value={data.foundation_date}
                                            onChange={(e) => setData('foundation_date', e.target.value)}
                                            className={cn(
                                                "h-10 bg-background pr-10",
                                                errors.foundation_date && 'border-destructive'
                                            )}
                                            required
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                    {errors.foundation_date && (
                                        <p className="text-sm text-destructive">{errors.foundation_date}</p>
                                    )}
                                </div>

                                {/* Primary Industry */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="industry_category" className="text-sm font-medium text-foreground">
                                        Primary Industry <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.industry_category}
                                        onValueChange={(value) => {
                                            setData('industry_category', value);
                                            setData('industry_subcategory', '');
                                            setData('industry_other', '');
                                        }}
                                    >
                                        <SelectTrigger className={cn(
                                            "h-10 bg-background",
                                            errors.industry_category && 'border-destructive'
                                        )}>
                                            <SelectValue placeholder="Select primary industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industryCategories.length > 0 ? (
                                                industryCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.name}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled>No industries available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.industry_category && (
                                        <p className="text-sm text-destructive">{errors.industry_category}</p>
                                    )}
                                </div>

                                {/* Sub Industry Category - Show only when primary industry is selected */}
                                {data.industry_category && (() => {
                                    const selectedCategory = industryCategories.find(
                                        cat => cat.name === data.industry_category
                                    );
                                    const subCategories = selectedCategory?.subCategories || [];
                                    
                                    return subCategories.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="industry_subcategory" className="text-sm font-medium text-foreground">
                                                Sub Industry Category <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.industry_subcategory}
                                                onValueChange={(value) => {
                                                    setData('industry_subcategory', value);
                                                    if (value !== 'Others') {
                                                        setData('industry_other', '');
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={cn(
                                                    "h-10 bg-background",
                                                    errors.industry_subcategory && 'border-destructive'
                                                )}>
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
                                            {errors.industry_subcategory && (
                                                <p className="text-sm text-destructive">{errors.industry_subcategory}</p>
                                            )}
                                            
                                            {/* Show "Others" text input if "Others" is selected */}
                                            {data.industry_subcategory === 'Others' && (
                                                <div className="mt-2">
                                                    <Input
                                                        value={data.industry_other}
                                                        onChange={(e) => setData('industry_other', e.target.value)}
                                                        placeholder="Please specify"
                                                        className="h-10 bg-background"
                                                        required
                                                    />
                                                    {errors.industry_other && (
                                                        <p className="text-sm text-destructive mt-1">{errors.industry_other}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Registration Number */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="registration_number" className="text-sm font-medium text-foreground">
                                        Registration Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="registration_number"
                                        value={data.registration_number}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Auto-format: 000-00-00000
                                            const formatted = value
                                                .replace(/\D/g, '')
                                                .replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
                                                .slice(0, 13);
                                            setData('registration_number', formatted);
                                        }}
                                        placeholder="000-00-00000"
                                        className={cn(
                                            "h-10 bg-background",
                                            errors.registration_number && 'border-destructive'
                                        )}
                                        required
                                        maxLength={13}
                                    />
                                    {errors.registration_number && (
                                        <p className="text-sm text-destructive">{errors.registration_number}</p>
                                    )}
                                    {data.registration_number && !validateRegistrationNumber(data.registration_number) && (
                                        <p className="text-sm text-amber-600">Format: 000-00-00000</p>
                                    )}
                                </div>

                                {/* Brand Name */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="brand_name" className="text-sm font-medium text-foreground">
                                        Brand Name
                                    </Label>
                                    <Input
                                        id="brand_name"
                                        value={data.brand_name}
                                        onChange={(e) => setData('brand_name', e.target.value)}
                                        placeholder="Enter brand name (if different)"
                                        className="h-10 bg-background"
                                    />
                                </div>

                                {/* HQ Location */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="hq_location" className="text-sm font-medium text-foreground">
                                        HQ Location <span className="text-destructive">*</span>
                                    </Label>
                                    {hqLocations.length > 0 ? (
                                        <Select
                                            value={data.hq_location}
                                            onValueChange={(value) => setData('hq_location', value)}
                                        >
                                            <SelectTrigger className={cn(
                                                "h-10 bg-background",
                                                errors.hq_location && 'border-destructive'
                                            )}>
                                                <SelectValue placeholder="City, Country" />
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
                                            id="hq_location"
                                            value={data.hq_location}
                                            onChange={(e) => setData('hq_location', e.target.value)}
                                            placeholder="City, Country"
                                            className={cn(
                                                "h-10 bg-background",
                                                errors.hq_location && 'border-destructive'
                                            )}
                                            required
                                        />
                                    )}
                                    {errors.hq_location && (
                                        <p className="text-sm text-destructive">{errors.hq_location}</p>
                                    )}
                                </div>

                                {/* Public Listing Status */}
                                <div className="flex flex-col gap-3">
                                    <Label className="text-sm font-medium text-foreground">
                                        Public Listing Status <span className="text-destructive">*</span>
                                    </Label>
                                    <RadioGroup
                                        value={data.is_public ? 'yes' : 'no'}
                                        onValueChange={(value) => setData('is_public', value === 'yes')}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="public-yes" />
                                            <Label htmlFor="public-yes" className="font-normal cursor-pointer">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="public-no" />
                                            <Label htmlFor="public-no" className="font-normal cursor-pointer">No</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.is_public && (
                                        <p className="text-sm text-destructive">{errors.is_public}</p>
                                    )}
                                </div>

                                {/* Secondary Industries */}
                                <div className="flex flex-col gap-3">
                                    <Label className="text-sm font-medium text-foreground">
                                        Secondary Industries
                                    </Label>
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
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                    )}
                                                >
                                                    {industry}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Logo Upload Section */}
                          <div className="flex flex-col gap-3">
                            <Label className="text-sm font-medium text-foreground">
                                Company Logo
                            </Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const files = e.dataTransfer.files;
                                if (files.length > 0) {
                                    handleFileChange(files[0]);
                                }
                                }}
                                className={cn(
                                "border-2 border-dashed rounded-lg  text-center cursor-pointer transition-all duration-200",
                                "hover:border-primary/50 hover:bg-muted/30",
                                logoPreview ? "border-primary/30 bg-muted/20" : "border-border bg-muted/10 p-12"
                                )}
                            >
                                <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                    handleFileChange(e.target.files[0]);
                                    }
                                }}
                                className="hidden"
                                />
                                {logoPreview ? (
                                <div className="relative">
                                    <div className="flex justify-center">
                                    <img
                                        src={logoPreview}
                                        alt="Company logo"
                                        className="w-full max-h-[184px] object-cover rounded-lg"
                                    />
                                    </div>
                                    <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLogoPreview(null);
                                        setData('logo', null);
                                        if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="absolute top-2 right-2 text-sm text-destructive hover:underline inline-flex items-center gap-1"
                                    >
                                    <X className="w-4 h-4" />
                                    </button>
                                </div>
                                ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-center">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG up to 2MB
                                    </p>
                                    </div>
                                </div>
                                )}
                            </div>
                            </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
