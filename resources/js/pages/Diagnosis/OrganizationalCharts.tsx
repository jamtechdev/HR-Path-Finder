import { Head, useForm } from '@inertiajs/react';
import { Eye, X, Upload } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { useTranslation } from 'react-i18next';
import { setOrgChartDraftFile, getOrgChartDraftFiles } from '@/lib/diagnosisFileDrafts';
import { cn } from '@/lib/utils';

interface Diagnosis {
    id: number;
    organizational_charts?: Array<{ year: string; file_url: string }> | Record<string, string>;
}

interface Props {
    project: { id: number; company: { name: string } };
    company: { name: string };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    embedMode?: boolean;
    readOnly?: boolean;
    embedData?: Record<string, unknown>;
    embedSetData?: (key: string, value: unknown) => void;
}

const REQUIRED_YEARS = [...DIAGNOSIS_ORG_CHART_REQUIRED_YEARS];

const YEAR_LABELS: Record<string, { title: string; subtitle: string }> = {
    '2023.12': { title: '2023.12', subtitle: '' },
    '2024.12': { title: '2024.12', subtitle: '' },
    '2025.12': { title: '2025.12', subtitle: '' },
};

export default function OrganizationalCharts({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    embedMode = false,
    readOnly = false,
    embedData,
    embedSetData,
}: Props) {
    const { t } = useTranslation();

    const [existingImages, setExistingImages] = useState<Record<string, string>>(() => {
        const images: Record<string, string> = {};
        const orgCharts = diagnosis?.organizational_charts;

        if (orgCharts && typeof orgCharts === 'object') {
            if (Array.isArray(orgCharts)) {
                orgCharts.forEach((item: any) => {
                    if (!item || typeof item !== 'object') return;
                    const year = item.year;
                    const path = item.file_url ?? item.path ?? item.filePath;
                    if (REQUIRED_YEARS.includes(year) && typeof path === 'string' && path) {
                        images[year] = path;
                    }
                });
            } else {
                Object.entries(orgCharts as Record<string, unknown>).forEach(([year, path]) => {
                    if (REQUIRED_YEARS.includes(year) && typeof path === 'string' && path) {
                        images[year] = path;
                    }
                });
            }
        }
        return images;
    });

    const [chartFiles, setChartFiles] = useState<Record<string, File[]>>(() => {
        const files: Record<string, File[]> = {};
        REQUIRED_YEARS.forEach((y) => { files[y] = []; });
        return files;
    });

    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const internalForm = useForm({ organizational_charts: {} as Record<string, File> });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;
    const lastSyncedChartsRef = useRef('');

    const inertiaOrgChartErr =
        typeof internalForm.errors.organizational_charts === 'string'
            ? internalForm.errors.organizational_charts
            : undefined;

    useEffect(() => {
        const out: Record<string, File> = {};
        Object.entries(chartFiles).forEach(([year, list]) => {
            if (list.length > 0) out[year] = list[0];
        });
        const sig = JSON.stringify(
            Object.entries(chartFiles)
                .map(([year, list]) => {
                    const f = list[0];
                    return f
                        ? `${year}:${f.name}:${f.size}:${f.lastModified}`
                        : `${year}:none`;
                })
                .sort(),
        );
        if (lastSyncedChartsRef.current === sig) return;
        lastSyncedChartsRef.current = sig;
        setData('organizational_charts', out);
    }, [chartFiles, setData]);

    useEffect(() => {
        if (!projectId || readOnly) return;
        const fromDraft = getOrgChartDraftFiles(projectId);
        for (const year of REQUIRED_YEARS) {
            const f = fromDraft[year];
            if (f) {
                setChartFiles((prev) => ({ ...prev, [year]: [f] }));
                setExistingImages((prev) => ({ ...prev, [year]: '' }));
            }
        }
    }, [projectId, readOnly]);

    const handleFileChange = (year: string, file: File | null) => {
        if (projectId) {
            setOrgChartDraftFile(projectId, year, file);
        }
        if (file) {
            setChartFiles((prev) => ({ ...prev, [year]: [file] }));
            setExistingImages((prev) => ({ ...prev, [year]: '' }));

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreviews((p) => ({ ...p, [year]: reader.result as string }));
                reader.readAsDataURL(file);
            } else {
                setFilePreviews((p) => ({ ...p, [year]: '' }));
            }
        } else {
            setChartFiles((prev) => ({ ...prev, [year]: [] }));
            setFilePreviews((prev) => ({ ...prev, [year]: '' }));
        }
    };

    const handleFileSelect = (year: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
            alert(t('diagnosis_org_chart.invalidFileType'));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(t('diagnosis_org_chart.fileSizeLimit'));
            return;
        }
        handleFileChange(year, file);
    };

    const getImageUrl = (path: string): string => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/storage/')) return path;
        if (path.startsWith('storage/')) return `/${path}`;
        return `/storage/${path}`;
    };

    const hasFile = (year: string) =>
        (existingImages[year] && existingImages[year].trim() !== '') || (chartFiles[year]?.length ?? 0) > 0;

    const uploadedCount = REQUIRED_YEARS.filter(hasFile).length;
    const activeIndex = REQUIRED_YEARS.findIndex((y) => !hasFile(y));
    const activeYear = activeIndex >= 0 ? REQUIRED_YEARS[activeIndex] : null;

    const validateBeforeNext = (): true | string => {
        const missing = REQUIRED_YEARS.filter((y) => !hasFile(y));
        if (missing.length === 0) return true;
        return t('diagnosis_org_chart.validationMissing');
    };

    const formatFileMeta = (file: File) => {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        const type = file.type === 'application/pdf' ? 'PDF' : 'Image';
        return `${type} · ${sizeMB}MB`;
    };

    const innerContent = (
        <div className="space-y-6">
            <div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                    {t('diagnosis_org_chart.description')}
                </p>
            </div>

            {/* Timeline */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-5">
                <div className="flex items-center gap-1 sm:gap-0 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
                    {REQUIRED_YEARS.map((year, idx) => {
                        const label = YEAR_LABELS[year] ?? { title: year, subtitle: '' };
                        return (
                            <React.Fragment key={year}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRefs.current[year]?.click()}
                                    className={cn(
                                        'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg transition-colors min-h-[44px] flex-1 sm:flex-none',
                                        hasFile(year) && 'bg-[rgba(78,205,196,0.12)]',
                                        activeYear === year && 'bg-[rgba(78,205,196,0.12)] shadow-sm',
                                        !hasFile(year) && activeYear !== year && 'opacity-70'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors',
                                            hasFile(year)
                                                ? 'border-[#4ecdc4] bg-[#4ecdc4] text-[#111d35]'
                                                : activeYear === year
                                                ? 'border-[#1a2744] bg-[#1a2744] text-white'
                                                : 'border-muted-foreground/40 bg-white text-muted-foreground'
                                        )}
                                    >
                                        {hasFile(year) ? '✓' : idx + 1}
                                    </span>
                                    <div>
                                        <div className={cn('text-[13px] font-semibold', hasFile(year) ? 'text-[#2ea89e]' : '')}>
                                            {label.title}
                                        </div>
                                        {label.subtitle && (
                                            <div className="text-[10.5px] text-muted-foreground">{label.subtitle}</div>
                                        )}
                                    </div>
                                    {hasFile(year) && (
                                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(78,205,196,0.15)] text-[#2ea89e]">
                                            {t('diagnosis_org_chart.uploadComplete')}
                                        </span>
                                    )}
                                    {activeYear === year && !hasFile(year) && (
                                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(201,168,76,0.15)] text-[#a07c20]">
                                            {t('diagnosis_org_chart.inProgress')}
                                        </span>
                                    )}
                                </button>
                                {idx < REQUIRED_YEARS.length - 1 && (
                                    <span className="text-base text-muted-foreground/60 px-1">→</span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[11.5px] text-muted-foreground mb-4 sm:mb-5">
                {REQUIRED_YEARS.map((_, i) => (
                    <span
                        key={i}
                        className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            i < uploadedCount ? 'bg-[#4ecdc4]' : i === uploadedCount ? 'bg-[#1a2744]' : 'bg-border'
                        )}
                    />
                ))}
                <span className="ml-1 whitespace-nowrap">
                    {uploadedCount} / 3 {t('diagnosis_org_chart.complete')}
                </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {REQUIRED_YEARS.map((year) => {
                    const existingPath = existingImages[year];
                    const existingUrl = existingPath ? getImageUrl(existingPath) : '';
                    const hasNewFile = (chartFiles[year]?.length ?? 0) > 0;
                    const isUploaded = hasFile(year);
                    const isActive = activeYear === year;
                    const label = YEAR_LABELS[year] ?? { title: year, subtitle: '' };
                    const file = chartFiles[year]?.[0];
                    const displayName = file?.name ?? (existingPath ? existingPath.split('/').pop() ?? '' : '');
                    const displayMeta = file ? formatFileMeta(file) : existingPath ? 'PDF · 업로드됨' : '';

                    return (
                        <div
                            key={year}
                            onClick={() => !isUploaded && fileInputRefs.current[year]?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const f = e.dataTransfer.files?.[0];
                                if (f && ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(f.type) && f.size <= 10 * 1024 * 1024) {
                                    handleFileChange(year, f);
                                }
                            }}
                            className={cn(
                                'rounded-[14px] overflow-hidden transition-all cursor-pointer border-[1.5px] bg-white dark:bg-[#1a2744]',
                                isUploaded && 'border-[#4ecdc4]',
                                isActive && !isUploaded && 'border-[#1a2744] shadow-md',
                                !isUploaded && !isActive && 'border-dashed border-muted-foreground/40'
                            )}
                        >
                            <div className={cn(
                                'px-4 py-4 pb-3 border-b flex items-center justify-between flex-wrap dark:border-[#2a3a5c]',
                                isActive && !isUploaded && 'bg-gradient-to-br from-[#1a2744] to-[#223058] text-white'
                            )}>
                                <div>
                                    <div className="text-[15px] font-bold tracking-tight">{label.title}</div>
                                    {label.subtitle && (
                                        <div className="text-[10.5px] mt-0.5 opacity-75">{label.subtitle}</div>
                                    )}
                                </div>
                                <span className={cn(
                                    'text-[10px] font-semibold px-2 py-1 rounded-full',
                                    isUploaded && 'bg-[rgba(78,205,196,0.15)] text-[#2ea89e]',
                                    isActive && !isUploaded && 'bg-white/15 text-white',
                                    !isUploaded && !isActive && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                )}>
                                    {isUploaded 
                                        ? t('diagnosis_org_chart.uploadComplete')
                                        : isActive 
                                        ? t('diagnosis_org_chart.uploadRequired')
                                        : t('diagnosis_org_chart.uploadPending')
                                    }
                                </span>
                            </div>

                            <input
                                ref={(el) => { fileInputRefs.current[year] = el; }}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={(e) => handleFileSelect(year, e)}
                                className="hidden"
                            />

                            {isUploaded ? (
                                <>
                                    <div className="flex items-center gap-3 p-4 min-h-[100px]">
                                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#e8f4f3] to-[#d0eeec] border border-[#4ecdc4]/20 flex items-center justify-center text-2xl">
                                            🗂
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[12.5px] font-semibold truncate dark:text-[#e2e8f0]">{displayName || 'File'}</div>
                                            <div className="text-[11px] text-muted-foreground">{displayMeta}</div>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = file ? filePreviews[year] : existingUrl;
                                                if (url) window.open(url, '_blank');
                                            }}
                                            className="h-7 px-2.5 rounded-md border border-border bg-background text-[11px] font-medium hover:bg-muted flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            {t('diagnosis_org_chart.preview')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFileChange(year, null);
                                                const el = fileInputRefs.current[year];
                                                if (el) el.value = '';
                                            }}
                                            className="h-7 px-2.5 rounded-md border border-border bg-background text-[11px] font-medium hover:border-red-500 hover:text-red-500 flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" />
                                            {t('diagnosis_org_chart.delete')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={cn(
                                    'py-6 px-4 flex flex-col items-center gap-2 min-h-[160px] justify-center',
                                    !isActive && 'opacity-60'
                                )}>
                                    <div className={cn(
                                        'w-11 h-11 rounded-xl flex items-center justify-center text-xl',
                                        isActive ? 'bg-[#4ecdc4]/10' : 'bg-muted'
                                    )}>
                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="text-[13px] font-semibold text-center">
                                        {t('diagnosis_org_chart.clickOrDrag')}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground text-center">
                                        {t('diagnosis_org_chart.supportedFormats')}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {['PNG', 'JPG', 'PDF', '10MB'].map((item) => (
                                            <span key={item} className="text-[9.5px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground dark:bg-[#2a3a5c]">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <DiagnosisFieldErrorMessage fieldKey="organizational_charts" inertiaError={inertiaOrgChartErr} />
        </div>
    );

    if (embedMode) return <>{innerContent}</>;

    return (
        <>
            <Head
                title={t('page_heads.organizational_charts', {
                    company:
                        company?.name ||
                        project?.company?.name ||
                        t('page_head_fallbacks.company'),
                })}
            />
            <FormLayout
                title={t('diagnosis_org_chart.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="job-grades"
                nextRoute="organizational-structure"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
                validateBeforeNext={validateBeforeNext}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}