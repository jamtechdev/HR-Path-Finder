import { DiagnosisFieldShell } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { loadAllTabDrafts, saveTabDraft } from '@/lib/diagnosisDraftStorage';
import { getLogoDraftFile, setLogoDraftFile } from '@/lib/diagnosisFileDrafts';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    hqLocations?: string[];
    embedMode?: boolean;
    readOnly?: boolean;
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
    const { t } = useTranslation();

    const normalizedProjectId =
        typeof projectId === 'string' ? Number(projectId) : projectId;

    const formatRegistrationNumber = (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 5)
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    };

    const [logoPreview, setLogoPreview] = useState<string | null>(
        company.logo_path || null,
    );
    const [customHqInput, setCustomHqInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const draftHydrated = useRef(false);
    const logoDraftPreviewHydrated = useRef(false);

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
        registration_number: formatRegistrationNumber(
            company.registration_number || '',
        ),
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
    const data = useEmbed
        ? ({ ...internalForm.data, ...embedData } as typeof internalForm.data)
        : internalForm.data;
    const setData = useEmbed
        ? (k: string, v: unknown) => embedSetData!(k, v as never)
        : internalForm.setData;
    const errors = internalForm.errors;

    const hqOptions = React.useMemo(() => {
        const base = [...hqLocations];
        const current =
            typeof data.hq_location === 'string' ? data.hq_location.trim() : '';
        if (current && !base.includes(current)) {
            return [current, ...base];
        }
        return base;
    }, [hqLocations, data.hq_location]);

    const isCustomHqSelected = React.useMemo(() => {
        const current =
            typeof data.hq_location === 'string' ? data.hq_location.trim() : '';
        if (!current) return false;
        return !hqOptions.includes(current);
    }, [data.hq_location, hqOptions]);

    const isFilledString = (v: unknown): boolean =>
        v !== undefined && v !== null && String(v).trim().length > 0;

    const serializeDraft = (formData: any): Record<string, unknown> => {
        try {
            const json = JSON.stringify(formData, (_k, v) =>
                v instanceof File ? undefined : v,
            );
            return JSON.parse(json);
        } catch {
            return {};
        }
    };

    // Load existing logo
    useEffect(() => {
        if (company.logo_path) {
            if (
                company.logo_path.startsWith('http') ||
                company.logo_path.startsWith('/')
            ) {
                setLogoPreview(company.logo_path);
            } else {
                setLogoPreview(`/storage/${company.logo_path}`);
            }
        }
    }, [company.logo_path]);

    // Rehydrate logo draft preview
    useEffect(() => {
        if (!normalizedProjectId || logoDraftPreviewHydrated.current) return;
        const draftLogo = getLogoDraftFile(normalizedProjectId);
        if (!draftLogo) return;

        logoDraftPreviewHydrated.current = true;
        if (!useEmbed) {
            internalForm.setData('logo', draftLogo);
        }
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(draftLogo);
    }, [normalizedProjectId, useEmbed]);

    // Load draft data
    useEffect(() => {
        if (
            draftHydrated.current ||
            !normalizedProjectId ||
            readOnly ||
            embedMode
        )
            return;
        draftHydrated.current = true;
        const p = loadAllTabDrafts(normalizedProjectId)['company-info'];
        if (!p) return;

        Object.entries(p).forEach(([k, v]) => {
            if (v === undefined || v === null || k === 'logo') return;

            if (
                k === 'hq_location' &&
                typeof v === 'string' &&
                v.trim().length === 1 &&
                hqLocations.length > 0
            ) {
                const prefix = v.trim().toLowerCase();
                const matches = hqLocations.filter((loc) =>
                    loc.toLowerCase().startsWith(prefix),
                );
                if (matches.length === 1) {
                    setData(
                        k as keyof typeof internalForm.data,
                        matches[0] as never,
                    );
                    return;
                }
            }
            setData(k as keyof typeof internalForm.data, v as never);
        });
    }, [normalizedProjectId, readOnly, embedMode, setData, hqLocations]);

    // Repair short HQ in embed mode
    useEffect(() => {
        const current =
            typeof data.hq_location === 'string' ? data.hq_location.trim() : '';
        if (current.length !== 1 || hqOptions.length === 0) return;
        const prefix = current.toLowerCase();
        const matches = hqOptions.filter((loc) =>
            loc.toLowerCase().startsWith(prefix),
        );
        if (matches.length === 1 && matches[0] !== data.hq_location) {
            setData('hq_location', matches[0]);
        }
    }, [data.hq_location, hqOptions, setData]);

    useEffect(() => {
        const current =
            typeof data.hq_location === 'string' ? data.hq_location.trim() : '';
        if (current && !hqOptions.includes(current)) {
            setCustomHqInput(current);
        }
    }, [data.hq_location, hqOptions]);

    const validateRegistrationNumber = (value: string): boolean => {
        if (!value) return true;
        const regex = /^\d{3}-\d{2}-\d{5}$/;
        return regex.test(value);
    };

    const handleFileChange = (file: File) => {
        if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
            alert(t('company_info.fileTypeError'));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert(t('company_info.fileSizeError'));
            return;
        }

        setData('logo', file);
        if (normalizedProjectId) setLogoDraftFile(normalizedProjectId, file);

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveDraft = () => {
        if (!projectId) return;
        const draft = serializeDraft({ ...data, is_public: data.is_public });
        saveTabDraft(projectId, 'company-info', draft);
        toast({
            title: t('company_info.saveDraft'),
            description: t('company_info.saveDraftHint'),
            variant: 'success',
        });
    };

    const primaryIndustryFilled =
        (data.industry_category && data.industry_category !== 'Others') ||
        (data.industry_category === 'Others' &&
            !!data.industry_category_other?.trim());

    const subIndustryFilled =
        !data.industry_category ||
        data.industry_category === 'Others' ||
        (!!data.industry_subcategory?.trim() &&
            (data.industry_subcategory !== 'Others' ||
                !!data.industry_other?.trim()));

    const requiredFields = [
        isFilledString(data.company_name),
        isFilledString(data.registration_number),
        isFilledString(data.foundation_date),
        primaryIndustryFilled,
        subIndustryFilled,
        isFilledString(data.hq_location),
        data.is_public !== undefined && data.is_public !== null,
    ];

    const completionPct = Math.round(
        (requiredFields.filter(Boolean).length / requiredFields.length) * 100,
    );

    const cardContent = (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#2a3a5c] dark:bg-[#1a2744]',
                embedMode ? 'mx-auto max-w-4xl' : 'w-full',
            )}
        >
            {/* Hero strip */}
            <div className="flex flex-wrap items-center justify-between bg-[#1e293b] px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-teal-500/20 p-3 text-teal-400">
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <rect x="4" y="3" width="16" height="18" rx="2" />
                            <path d="M8 7h8M8 11h8M8 15h5" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl leading-snug font-bold">
                            {t('company_info.companyInfoHeroTitle')}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-400">
                            {t('company_info.companyInfoHeroDesc')}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                    {data.company_name && (
                        <span className="max-w-[120px] truncate rounded-full border border-gray-600 bg-gray-700/50 px-3 py-1 text-xs">
                            {data.company_name}
                        </span>
                    )}
                    {data.industry_category && (
                        <span className="rounded-full border border-gray-600 bg-gray-700/50 px-3 py-1 text-xs">
                            {data.industry_category}
                        </span>
                    )}
                    {data.hq_location && (
                        <span className="rounded-full border border-gray-600 bg-gray-700/50 px-3 py-1 text-xs">
                            {data.hq_location}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-10 p-8">
                <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                    {/* Left Column - Company Identity */}
                    <div className="space-y-6">
                        <h3 className="mb-1 text-sm font-bold text-gray-500 dark:text-[#9AA3B2]">
                            {t('company_info.companyIdentitySection')}
                        </h3>

                        {/* Company Name */}
                        <div>
                            <Label
                                className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                htmlFor="company_name"
                            >
                                {t('company_info.companyNameLabel')}{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) =>
                                    setData('company_name', e.target.value)
                                }
                                placeholder={t(
                                    'company_info.companyNamePlaceholder',
                                )}
                                className={cn(
                                    'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 px-3 text-sm focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                    errors.company_name && 'border-red-500',
                                )}
                                required
                                disabled={readOnly}
                            />
                            {errors.company_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.company_name}
                                </p>
                            )}
                        </div>

                        {/* Registration Number */}
                        <div>
                            <Label
                                className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                htmlFor="registration_number"
                            >
                                {t('company_info.registrationNumberLabel')}{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="registration_number"
                                value={data.registration_number}
                                onChange={(e) =>
                                    setData(
                                        'registration_number',
                                        formatRegistrationNumber(
                                            e.target.value,
                                        ),
                                    )
                                }
                                placeholder="000-00-00000"
                                className={cn(
                                    'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 px-3 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                    errors.registration_number &&
                                        'border-red-500',
                                )}
                                required
                                maxLength={13}
                                disabled={readOnly}
                            />
                            {errors.registration_number && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.registration_number}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-amber-600">
                                {t('company_info.registrationNumberFormatHint')}
                            </p>
                        </div>

                        {/* Brand Name */}
                        <div>
                            <Label
                                className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                htmlFor="brand_name"
                            >
                                {t('company_info.brandNameLabel')}
                            </Label>
                            <Input
                                id="brand_name"
                                value={data.brand_name}
                                onChange={(e) =>
                                    setData('brand_name', e.target.value)
                                }
                                placeholder={t(
                                    'company_info.brandNamePlaceholder',
                                )}
                                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                disabled={readOnly}
                            />
                        </div>

                        {/* Foundation Date + Public Listing */}
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <Label
                                    className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                    htmlFor="foundation_date"
                                >
                                    {t('company_info.foundationDateLabel')}{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="foundation_date"
                                    type="date"
                                    value={data.foundation_date}
                                    onChange={(e) =>
                                        setData(
                                            'foundation_date',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 pr-10 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                        errors.foundation_date &&
                                            'border-red-500',
                                    )}
                                    required
                                    disabled={readOnly}
                                />
                                {errors.foundation_date && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.foundation_date}
                                    </p>
                                )}
                            </div>

                            <div className="flex-1">
                                <Label className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]">
                                    {t('company_info.publicListingLabel')}{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm font-semibold dark:border-[#2a3a5c]">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            !readOnly &&
                                            setData('is_public', true)
                                        }
                                        className={cn(
                                            'flex flex-1 items-center justify-center gap-2 bg-white py-2.5 text-gray-500 dark:bg-[#1e3a5f]/20 dark:text-[#9AA3B2]',
                                            data.is_public &&
                                                'bg-gray-100 text-gray-800 dark:bg-[#2a3a5c] dark:text-[#e2e8f0]',
                                        )}
                                        disabled={readOnly}
                                    >
                                        {t('company_info.listedLabel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            !readOnly &&
                                            setData('is_public', false)
                                        }
                                        className={cn(
                                            'flex flex-1 items-center justify-center gap-2 py-2.5',
                                            !data.is_public
                                                ? 'bg-[#1e293b] text-white'
                                                : 'bg-white text-gray-500 dark:bg-[#1e3a5f]/20 dark:text-[#9AA3B2]',
                                        )}
                                        disabled={readOnly}
                                    >
                                        {t('company_info.privateLabel')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Industry & Location */}
                    <div className="space-y-6">
                        <h3 className="mb-1 text-sm font-bold text-gray-500 dark:text-[#9AA3B2]">
                            {t('company_info.industryLocationSection')}
                        </h3>

                        {/* Primary Industry */}
                        <DiagnosisFieldShell
                            fieldKey="industry_category"
                            inertiaError={errors.industry_category}
                        >
                            {({ borderCn, ErrorLine }) => (
                                <div>
                                    <Label
                                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                        htmlFor="industry_category"
                                    >
                                        {t('company_info.primaryIndustryLabel')}{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.industry_category}
                                        onValueChange={(value) => {
                                            setData('industry_category', value);
                                            setData('industry_subcategory', '');
                                            setData('industry_other', '');
                                            if (value !== 'Others')
                                                setData(
                                                    'industry_category_other',
                                                    '',
                                                );
                                        }}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                                borderCn,
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={t(
                                                    'company_info.primaryIndustryPlaceholder',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industryCategories.map(
                                                (category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.name}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                            <SelectItem value="Others">
                                                {t('company_info.othersLabel')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {data.industry_category === 'Others' && (
                                        <div className="mt-2">
                                            <Label
                                                className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                                htmlFor="industry_category_other"
                                            >
                                                {t(
                                                    'company_info.primaryIndustryLabel',
                                                )}{' '}
                                                (
                                                {t(
                                                    'company_info.specifyPlaceholder',
                                                )}
                                                ){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="industry_category_other"
                                                value={
                                                    data.industry_category_other ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'industry_category_other',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'company_info.specifyPlaceholder',
                                                )}
                                                className={cn(
                                                    'h-11 w-full rounded-lg border border-gray-200 px-3 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                                    errors.industry_category_other &&
                                                        'border-red-500',
                                                )}
                                                required
                                                disabled={readOnly}
                                            />
                                        </div>
                                    )}
                                    {ErrorLine}
                                </div>
                            )}
                        </DiagnosisFieldShell>

                        {/* Sub Industry */}
                        {data.industry_category &&
                            data.industry_category !== 'Others' &&
                            (() => {
                                const selectedCategory =
                                    industryCategories.find(
                                        (cat) =>
                                            cat.name === data.industry_category,
                                    );
                                const subCategories =
                                    selectedCategory?.subCategories || [];
                                if (!subCategories.length) return null;

                                return (
                                    <div>
                                        <Label
                                            className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                            htmlFor="industry_subcategory"
                                        >
                                            {t('company_info.subIndustryLabel')}{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.industry_subcategory}
                                            onValueChange={(value) => {
                                                setData(
                                                    'industry_subcategory',
                                                    value,
                                                );
                                                if (value !== 'Others')
                                                    setData(
                                                        'industry_other',
                                                        '',
                                                    );
                                            }}
                                            disabled={readOnly}
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                                    errors.industry_subcategory &&
                                                        'border-red-500',
                                                )}
                                            >
                                                <SelectValue
                                                    placeholder={t(
                                                        'company_info.subIndustryPlaceholder',
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subCategories.map((sub) => (
                                                    <SelectItem
                                                        key={sub.id}
                                                        value={sub.name}
                                                    >
                                                        {sub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })()}

                        {/* HQ Location */}
                        <div>
                            <Label
                                className="mb-2 block text-sm font-bold text-gray-700 dark:text-[#CBD0DA]"
                                htmlFor="hq_location"
                            >
                                {t('company_info.hqLocationLabel')}{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                {hqOptions.length > 0 ? (
                                    <Select
                                        value={
                                            isCustomHqSelected
                                                ? '__custom__'
                                                : data.hq_location
                                        }
                                        onValueChange={(value) => {
                                            if (value === '__custom__') {
                                                setData(
                                                    'hq_location',
                                                    customHqInput.trim(),
                                                );
                                                return;
                                            }
                                            setData('hq_location', value);
                                        }}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 pr-9 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                                errors.hq_location &&
                                                    'border-red-500',
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={t(
                                                    'company_info.hqLocationPlaceholder',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hqOptions.map((location) => (
                                                <SelectItem
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </SelectItem>
                                            ))}
                                            {!readOnly && (
                                                <SelectItem value="__custom__">
                                                    Custom location...
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={data.hq_location}
                                        onChange={(e) =>
                                            setData(
                                                'hq_location',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'company_info.hqLocationPlaceholder',
                                        )}
                                        className={cn(
                                            'h-11 w-full rounded-lg border border-teal-100 bg-teal-50/10 pr-9 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]',
                                            errors.hq_location &&
                                                'border-red-500',
                                        )}
                                        disabled={readOnly}
                                    />
                                )}
                                <svg
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path d="M12 21s-6-5.373-6-10a6 6 0 1112 0c0 4.627-6 10-6 10z" />
                                    <circle cx="12" cy="11" r="2.5" />
                                </svg>
                            </div>

                            {hqOptions.length > 0 &&
                                !readOnly &&
                                isCustomHqSelected && (
                                    <div className="mt-2">
                                        <Input
                                            value={customHqInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setCustomHqInput(v);
                                                setData('hq_location', v);
                                            }}
                                            placeholder="Enter custom location"
                                            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                        />
                                    </div>
                                )}
                            {errors.hq_location && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.hq_location}
                                </p>
                            )}
                        </div>

                        {/* Completion Bar */}
                        <div className="mt-2 pt-6">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-teal-600">
                                    {t('company_info.completionTitle')}
                                </span>
                                <span className="text-xs font-bold text-teal-600">
                                    {completionPct}%
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#2a3a5c]">
                                <div
                                    className="h-2 rounded-full bg-teal-400 transition-all duration-300"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400 dark:text-[#6B7585]">
                                {t('company_info.completionDescription')}
                            </p>
                        </div>

                        {projectId && !readOnly && (
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="h-10 w-full rounded-lg bg-teal-500 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-400"
                                >
                                    {t('company_info.saveDraft')}
                                </button>
                                <p className="mt-2 text-[10px] text-gray-400 dark:text-[#6B7585]">
                                    {t('company_info.saveDraftHint')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-[#2a3a5c]" />

                {/* Logo Section */}
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-teal-50 p-2 dark:bg-teal-900/30">
                            <Upload className="h-4 w-4 text-teal-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 dark:text-[#CBD0DA]">
                                {t('company_info.logoUploadTitle')}
                            </h4>
                            <p className="text-xs font-medium text-gray-400 dark:text-[#6B7585]">
                                {t('company_info.logoUploadHint')}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-[#6B7585]">
                                {t('company_info.logoUploadSpec')}
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() =>
                            !readOnly && fileInputRef.current?.click()
                        }
                        onDragOver={(e) =>
                            !readOnly &&
                            (e.preventDefault(), e.stopPropagation())
                        }
                        onDrop={(e) => {
                            if (readOnly) return;
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files.length > 0)
                                handleFileChange(e.dataTransfer.files[0]);
                        }}
                        className={cn(
                            'flex flex-col items-center justify-between gap-6 rounded-xl border-2 border-dashed border-gray-200 p-8 transition-colors md:flex-row dark:border-[#2a3a5c]',
                            !readOnly &&
                                'cursor-pointer hover:border-teal-400/70 hover:bg-teal-50/30 dark:hover:border-teal-500/50 dark:hover:bg-teal-900/10',
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) =>
                                e.target.files?.[0] &&
                                handleFileChange(e.target.files[0])
                            }
                            className="hidden"
                        />

                        <div className="flex w-full items-center gap-6 md:w-auto flex-col md:flex-row">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-[#1e293b]">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt={t('company_info.logoAlt')}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Upload className="h-7 w-7 text-white/40" />
                                )}
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-sm font-bold text-gray-700 dark:text-[#CBD0DA]">
                                    {t('company_info.logoUploadTitle')}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-[#6B7585]">
                                    {t('company_info.logoUploadHint')}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-[#6B7585]">
                                    {t('company_info.logoUploadSpec')}
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
                            className="shrink-0 rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-bold text-gray-600 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30 dark:text-[#CBD0DA]"
                            disabled={readOnly}
                        >
                            {t('company_info.chooseFileBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedMode) return <>{cardContent}</>;

    return (
        <>
            <Head
                title={`${t('company_info.companyInfoPageTitle')} - ${company?.name || project?.company?.name || 'Company'}`}
            />
            <FormLayout
                title={t('company_info.companyInfoPageTitle')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                nextRoute="workforce"
                formData={{ ...data, is_public: data.is_public }}
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
            >
                {cardContent}
            </FormLayout>
        </>
    );
}
