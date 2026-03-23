import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Upload, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { DiagnosisFieldShell } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tr } from '@/config/diagnosisTranslations';
import { loadAllTabDrafts } from '@/lib/diagnosisDraftStorage';
import { setLogoDraftFile } from '@/lib/diagnosisFileDrafts';
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
    industry_category_other?: string;
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
    /** When true, render only inner content (no FormLayout/Head). Used when embedded in CEO review. */
    embedMode?: boolean;
    /** When true, all inputs are disabled (view-only). */
    readOnly?: boolean;
    /** When embedMode, optional form data from parent (CEO page) so one Save submits all. */
    embedData?: Record<string, unknown>;
    embedSetData?: (key: string, value: unknown) => void;
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
    embedMode = false,
    readOnly = false,
    embedData,
    embedSetData,
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

    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_path || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const draftHydrated = useRef(false);

    const internalForm = useForm<{
        company_name: string;
        registration_number: string;
        hq_location: string;
        is_public: boolean;
        industry_category: string;
        industry_subcategory: string;
        industry_other: string;
        industry_category_other: string;
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
        industry_category_other: diagnosis?.industry_category_other || '',
        brand_name: company.brand_name || '',
        foundation_date: company.foundation_date || '',
        logo: null,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v as never) : internalForm.setData;
    const errors = internalForm.errors;

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

    useEffect(() => {
        if (draftHydrated.current || !projectId || readOnly || embedMode) return;
        draftHydrated.current = true;
        const p = loadAllTabDrafts(projectId)['company-info'];
        if (!p) return;
        Object.entries(p).forEach(([k, v]) => {
            if (v === undefined || v === null || k === 'logo') return;
            setData(k as keyof typeof internalForm.data, v as never);
        });
    }, [projectId, readOnly, embedMode, setData]);

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
            alert(tr('fileTypeError'));
            return;
        }
        
        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert(tr('fileSizeError'));
            return;
        }

        setData('logo', file);
        if (projectId) setLogoDraftFile(projectId, file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const primaryIndustryFilled =
        (data.industry_category && data.industry_category !== 'Others') ||
        (data.industry_category === 'Others' && !!data.industry_category_other?.trim());
    const subIndustryFilled =
        !data.industry_category ||
        data.industry_category === 'Others' ||
        (!!data.industry_subcategory?.trim() && (data.industry_subcategory !== 'Others' || !!data.industry_other?.trim()));
    const requiredFields = [
        !!data.company_name?.trim(),
        !!data.registration_number?.trim(),
        !!data.foundation_date?.trim(),
        primaryIndustryFilled,
        subIndustryFilled,
        !!data.hq_location?.trim(),
        data.is_public !== undefined && data.is_public !== null,
    ];
    const requiredCount = requiredFields.filter(Boolean).length;
    const completionPct = Math.round((requiredCount / requiredFields.length) * 100);

    const cardContent = (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm',
                embedMode ? 'max-w-4xl mx-auto' : 'w-full'
            )}
        >
            {/* Hero strip */}
            <div className="bg-[#1e293b] px-6 py-5 flex flex-wrap items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-500/20 p-3 rounded-lg text-teal-400">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="4" y="3" width="16" height="18" rx="2" />
                            <path d="M8 7h8M8 11h8M8 15h5" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold leading-snug">{tr('companyInfoHeroTitle')}</h2>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {tr('companyInfoHeroDesc')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    {data.company_name && (
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full text-xs border border-gray-600 max-w-[120px] truncate">
                            {data.company_name}
                        </span>
                    )}
                    {data.industry_category && (
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full text-xs border border-gray-600">
                            {data.industry_category}
                        </span>
                    )}
                    {data.hq_location && (
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full text-xs border border-gray-600">
                            {data.hq_location}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-8 space-y-10">
                {/* 두 개 컬럼 영역 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Left: 회사 식별 정보 */}
                    <div className="space-y-6">
                        <h3 className="text-gray-500 font-bold text-sm mb-1">{tr('companyIdentitySection')}</h3>

                        {/* Company Name */}
                        <div>
                            <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="company_name">
                                {tr('companyNameLabel')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                placeholder={tr('companyNamePlaceholder')}
                                className={cn(
                                    'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 px-3 text-sm focus-visible:ring-2 focus-visible:ring-teal-500',
                                    errors.company_name && 'border-red-500'
                                )}
                                required
                                disabled={readOnly}
                            />
                            {errors.company_name && (
                                <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>
                            )}
                        </div>

                        {/* Registration Number */}
                        <div>
                            <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="registration_number">
                                {tr('registrationNumberLabel')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="registration_number"
                                value={data.registration_number}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const formatted = value
                                        .replace(/\D/g, '')
                                        .replace(/(\\d{3})(\\d{2})(\\d{5})/, '$1-$2-$3')
                                        .slice(0, 13);
                                    setData('registration_number', formatted);
                                }}
                                placeholder="618-02-72032"
                                className={cn(
                                    'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 px-3 text-sm',
                                    errors.registration_number && 'border-red-500'
                                )}
                                required
                                maxLength={13}
                                disabled={readOnly}
                            />
                            {errors.registration_number && (
                                <p className="mt-1 text-xs text-red-500">{errors.registration_number}</p>
                            )}
                            {data.registration_number && !validateRegistrationNumber(data.registration_number) && (
                                <p className="mt-1 text-xs text-amber-600">{tr('registrationNumberFormatHint')}</p>
                            )}
                        </div>

                        {/* Brand Name */}
                        <div>
                            <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="brand_name">
                                {tr('brandNameLabel')}
                            </Label>
                            <Input
                                id="brand_name"
                                value={data.brand_name}
                                onChange={(e) => setData('brand_name', e.target.value)}
                                placeholder="패스파인더hr"
                                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm"
                                disabled={readOnly}
                            />
                        </div>

                        {/* Foundation Date + Public Listing row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="foundation_date">
                                    {tr('foundationDateLabel')} <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="foundation_date"
                                        type="date"
                                        value={data.foundation_date}
                                        onChange={(e) => setData('foundation_date', e.target.value)}
                                        className={cn(
                                            'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 pr-10 text-sm',
                                            errors.foundation_date && 'border-red-500'
                                        )}
                                        required
                                        disabled={readOnly}
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.foundation_date && (
                                    <p className="mt-1 text-xs text-red-500">{errors.foundation_date}</p>
                                )}
                            </div>

                            <div className="flex-1">
                                <Label className="block text-sm font-bold text-gray-700 mb-2">
                                    {tr('publicListingLabel')} <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => !readOnly && setData('is_public', true)}
                                        className={cn(
                                            'flex-1 py-2.5 flex items-center justify-center gap-2 text-gray-500 bg-white',
                                            data.is_public && 'bg-gray-100 text-gray-800'
                                        )}
                                        disabled={readOnly}
                                    >
                                        <span className="text-xs">{tr('listedLabel')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => !readOnly && setData('is_public', false)}
                                        className={cn(
                                            'flex-1 py-2.5 flex items-center justify-center gap-2',
                                            !data.is_public ? 'bg-[#1e293b] text-white' : 'bg-white text-gray-500'
                                        )}
                                        disabled={readOnly}
                                    >
                                        <span className="text-xs font-bold">{tr('privateLabel')}</span>
                                    </button>
                                </div>
                                {errors.is_public && (
                                    <p className="mt-1 text-xs text-red-500">{errors.is_public}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: 산업 및 위치 + completion bar */}
                    <div className="space-y-6">
                        <h3 className="text-gray-500 font-bold text-sm mb-1">{tr('industryLocationSection')}</h3>

                        {/* Primary Industry */}
                        <DiagnosisFieldShell fieldKey="industry_category" inertiaError={errors.industry_category}>
                            {({ borderCn, ErrorLine }) => (
                        <div>
                            <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="industry_category">
                                {tr('primaryIndustryLabel')} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.industry_category}
                                onValueChange={(value) => {
                                    setData('industry_category', value);
                                    setData('industry_subcategory', '');
                                    setData('industry_other', '');
                                    if (value !== 'Others') setData('industry_category_other', '');
                                }}
                                disabled={readOnly}
                            >
                                <SelectTrigger
                                    className={cn(
                                        'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 text-sm',
                                        borderCn
                                    )}
                                >
                                    <SelectValue placeholder={tr('primaryIndustryPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {industryCategories.length > 0 ? (
                                        industryCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    ) : null}
                                    <SelectItem value="Others">{tr('othersLabel')}</SelectItem>
                                    {industryCategories.length === 0 && (
                                        <SelectItem value="" disabled>
                                            No industries available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {data.industry_category === 'Others' && (
                                <div className="mt-2">
                                    <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="industry_category_other">
                                        {tr('primaryIndustryLabel')} ({tr('specifyPlaceholder')}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="industry_category_other"
                                        value={data.industry_category_other ?? ''}
                                        onChange={(e) => setData('industry_category_other', e.target.value)}
                                        placeholder={tr('specifyPlaceholder')}
                                        className={cn(
                                            'w-full h-11 rounded-lg border border-gray-200 px-3 text-sm',
                                            errors.industry_category_other && 'border-red-500'
                                        )}
                                        required
                                        disabled={readOnly}
                                    />
                                    {errors.industry_category_other && (
                                        <p className="mt-1 text-xs text-red-500">{errors.industry_category_other}</p>
                                    )}
                                </div>
                            )}
                            {ErrorLine}
                        </div>
                            )}
                        </DiagnosisFieldShell>

                        {/* Sub Industry Category — only when Primary is not "Others" */}
                        {data.industry_category && data.industry_category !== 'Others' && (() => {
                            const selectedCategory = industryCategories.find(
                                (cat) => cat.name === data.industry_category
                            );
                            const subCategories = selectedCategory?.subCategories || [];

                            if (!subCategories.length) return null;

                            return (
                                <div>
                                    <Label
                                        className="block text-sm font-bold text-gray-700 mb-2"
                                        htmlFor="industry_subcategory"
                                    >
                                        {tr('subIndustryLabel')} <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.industry_subcategory}
                                        onValueChange={(value) => {
                                            setData('industry_subcategory', value);
                                            if (value !== 'Others') setData('industry_other', '');
                                        }}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 text-sm',
                                                errors.industry_subcategory && 'border-red-500'
                                            )}
                                        >
                                            <SelectValue placeholder={tr('subIndustryPlaceholder')} />
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
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.industry_subcategory}
                                        </p>
                                    )}
                                    {data.industry_subcategory === 'Others' && (
                                        <div className="mt-2">
                                            <Input
                                                value={data.industry_other}
                                                onChange={(e) => setData('industry_other', e.target.value)}
                                                placeholder="Please specify"
                                                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm"
                                                required
                                                disabled={readOnly}
                                            />
                                            {errors.industry_other && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.industry_other}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* HQ Location */}
                        <div>
                            <Label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="hq_location">
                                {tr('hqLocationLabel')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                {hqLocations.length > 0 ? (
                                    <Select
                                        value={data.hq_location}
                                        onValueChange={(value) => setData('hq_location', value)}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 text-sm pr-9',
                                                errors.hq_location && 'border-red-500'
                                            )}
                                        >
                                            <SelectValue placeholder={tr('hqLocationPlaceholder')} />
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
                                        placeholder={tr('hqLocationPlaceholder')}
                                        className={cn(
                                            'w-full h-11 rounded-lg border border-teal-100 bg-teal-50/10 pr-9 text-sm',
                                            errors.hq_location && 'border-red-500'
                                        )}
                                        required
                                        disabled={readOnly}
                                    />
                                )}
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path d="M12 21s-6-5.373-6-10a6 6 0 1112 0c0 4.627-6 10-6 10z" />
                                    <circle cx="12" cy="11" r="2.5" />
                                </svg>
                            </div>
                            {errors.hq_location && (
                                <p className="mt-1 text-xs text-red-500">{errors.hq_location}</p>
                            )}
                        </div>

                        {/* Page completion (right side, bottom) */}
                        <div className="pt-6 mt-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-teal-600 font-bold text-xs">이 페이지 완성도</span>
                                <span className="text-teal-600 font-bold text-xs">
                                    {completionPct}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                필수 항목을 모두 입력하면 다음 단계로 이동할 수 있습니다
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Company logo section */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <Upload className="w-4 h-4 text-teal-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700 text-sm">Company Logo</h4>
                            <p className="text-xs text-gray-400 font-medium">
                                보고서 및 진단 결과서에 표시됩니다 (선택)
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => !readOnly && fileInputRef.current?.click()}
                        onDragOver={(e) => !readOnly && (e.preventDefault(), e.stopPropagation())}
                        onDrop={(e) => {
                            if (readOnly) return;
                            e.preventDefault();
                            e.stopPropagation();
                            const files = e.dataTransfer.files;
                            if (files.length > 0) handleFileChange(files[0]);
                        }}
                        className={cn(
                            'border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors',
                            !readOnly && 'cursor-pointer hover:border-teal-400/70 hover:bg-teal-50/30'
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

                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-16 h-16 bg-[#1e293b] rounded-lg flex items-center justify-center overflow-hidden">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt={tr('logoAlt')}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Upload className="w-7 h-7 text-white/40" />
                                )}
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="font-bold text-sm text-gray-700">{tr('logoUploadTitle')}</p>
                                <p className="text-xs text-gray-400">
                                    {tr('logoUploadHint')}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {tr('logoUploadSpec')}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (readOnly) return;
                                fileInputRef.current?.click();
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 bg-white shrink-0"
                            disabled={readOnly}
                        >
                            {tr('chooseFileBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedMode) return <>{cardContent}</>;
    return (
        <>
            <Head title={`${tr('companyInfoPageTitle')} - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={tr('companyInfoPageTitle')}
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
                {cardContent}
            </FormLayout>
        </>
    );
}
