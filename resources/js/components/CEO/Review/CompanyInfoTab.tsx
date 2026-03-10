import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReadOnlyField } from './ReadOnlyField';

interface Company {
    id: number;
    name: string;
    logo_path?: string;
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories: Array<{ id: number; name: string }>;
}

interface CompanyInfoTabProps {
    company: Company;
    data: any;
    setData: (key: string, value: any) => void;
    industryCategories: IndustryCategory[];
    hqLocations: string[];
    readOnly?: boolean;
}

export default function CompanyInfoTab({
    company,
    data,
    setData,
    industryCategories,
    hqLocations,
    readOnly = false,
}: CompanyInfoTabProps) {
    const selectedIndustryCategory = industryCategories.find(cat => cat.name === data.industry_category);
    const subCategories = selectedIndustryCategory?.subCategories || [];

    if (readOnly) {
        return (
            <div className="space-y-6">
                <Card className="shadow-md">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                        <CardTitle className="text-xl">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Company Name" value={company.name} />
                            <ReadOnlyField label="Foundation Date" value={data.foundation_date || '—'} />
                            <ReadOnlyField label="Business Registration Number" value={data.registration_number || '—'} />
                            <ReadOnlyField label="Brand Name" value={data.brand_name || '—'} />
                            <ReadOnlyField label="HQ Location" value={data.hq_location || '—'} />
                            <ReadOnlyField label="Public Listing Status" value={data.is_public ? 'Yes' : 'No'} />
                        </div>
                        {company.logo_path && (
                            <div className="mt-6 pt-6 border-t">
                                <Label className="text-sm font-semibold mb-3 block">Company Logo</Label>
                                <img
                                    src={company.logo_path.startsWith('/') ? company.logo_path : `/storage/${company.logo_path}`}
                                    alt="Company Logo"
                                    className="w-24 h-24 object-contain border-2 border-border rounded-lg p-3 bg-muted shadow-sm"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-md">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                        <CardTitle className="text-xl">Industry Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Major Industry Category" value={data.industry_category || '—'} />
                            <ReadOnlyField label="Sub Industry Category" value={data.industry_subcategory || '—'} />
                            {data.industry_subcategory === 'Others' && data.industry_other && (
                                <ReadOnlyField label="Other (specify)" value={data.industry_other} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Company Name</Label>
                            <Input value={company.name} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Foundation Date</Label>
                            <Input 
                                type="date"
                                value={data.foundation_date || ''} 
                                onChange={(e) => setData('foundation_date', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Business Registration Number</Label>
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
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Brand Name</Label>
                            <Input 
                                value={data.brand_name || ''} 
                                onChange={(e) => setData('brand_name', e.target.value)}
                                placeholder="Enter brand name (if different)"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">HQ Location</Label>
                            {hqLocations.length > 0 ? (
                                <Select
                                    value={data.hq_location || ''}
                                    onValueChange={(value) => setData('hq_location', value)}
                                >
                                    <SelectTrigger className="h-11">
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
                                    className="h-11"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Public Listing Status</Label>
                            <RadioGroup
                                value={data.is_public ? 'yes' : 'no'}
                                onValueChange={(value) => setData('is_public', value === 'yes')}
                                className="flex gap-6 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="public-yes" />
                                    <Label htmlFor="public-yes" className="cursor-pointer font-normal">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="public-no" />
                                    <Label htmlFor="public-no" className="cursor-pointer font-normal">No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    
                    {/* Company Logo */}
                    {company.logo_path && (
                        <div className="mt-6 pt-6 border-t">
                            <Label className="text-sm font-semibold mb-3 block">Company Logo</Label>
                            <div className="inline-block">
                                <img 
                                    src={company.logo_path.startsWith('/') ? company.logo_path : `/storage/${company.logo_path}`}
                                    alt="Company Logo"
                                    className="w-24 h-24 object-contain border-2 border-border rounded-lg p-3 bg-muted shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Industry Classification</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Major Industry Category</Label>
                            <Select
                                value={data.industry_category || ''}
                                onValueChange={(value) => {
                                    setData('industry_category', value);
                                    setData('industry_subcategory', '');
                                }}
                            >
                                <SelectTrigger className="h-11">
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
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Sub Industry Category</Label>
                            <Select
                                value={data.industry_subcategory || ''}
                                onValueChange={(value) => setData('industry_subcategory', value)}
                                disabled={!data.industry_category}
                            >
                                <SelectTrigger className="h-11" disabled={!data.industry_category}>
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
                                    className="mt-3 h-11"
                                    value={data.industry_other || ''}
                                    onChange={(e) => setData('industry_other', e.target.value)}
                                    placeholder="Please specify"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
