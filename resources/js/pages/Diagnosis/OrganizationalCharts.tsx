import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Eye, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { both, tr } from '@/config/diagnosisTranslations';

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
    '2023.12': { title: '2023.12', subtitle: '2년 전 조직도' },
    '2024.12': { title: '2024.12', subtitle: '작년 조직도' },
    '2025.12': { title: '현재', subtitle: '최신(현재) 조직도' },
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
    const [existingImages, setExistingImages] = useState<Record<string, string>>(() => {
        const images: Record<string, string> = {};
        if (diagnosis?.organizational_charts && typeof diagnosis.organizational_charts === 'object' && !Array.isArray(diagnosis.organizational_charts)) {
            Object.entries(diagnosis.organizational_charts).forEach(([year, path]) => {
                if (REQUIRED_YEARS.includes(year) && typeof path === 'string' && path) images[year] = path;
            });
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

    useEffect(() => {
        const out: Record<string, File> = {};
        Object.entries(chartFiles).forEach(([year, list]) => {
            if (list.length > 0) out[year] = list[0];
        });
        setData('organizational_charts', out);
    }, [chartFiles, setData]);

    const handleFileChange = (year: string, file: File | null) => {
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
            alert('Please upload a JPG, PNG, or PDF file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
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
        return 'Upload organizational charts for all required years (2023.12, 2024.12, 2025.12).';
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
                            {both('orgChartDesc').en}
                            <span className="text-[10px] font-semibold text-[#4ecdc4] ml-1">{tr('required')}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">{both('orgChartDesc').ko}</p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-0">
                            {REQUIRED_YEARS.map((year, idx) => (
                                <React.Fragment key={year}>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[year]?.click()}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                            hasFile(year) && 'bg-[rgba(78,205,196,0.12)]',
                                            activeYear === year && 'bg-[rgba(78,205,196,0.12)]',
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
                                        <span
                                            className={cn(
                                                'text-[13px] font-semibold',
                                                hasFile(year) ? 'text-[#2ea89e]' : activeYear === year ? 'text-[#1a2744]' : 'text-muted-foreground'
                                            )}
                                        >
                                            {YEAR_LABELS[year]?.title ?? year}
                                        </span>
                                        {hasFile(year) && (
                                            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(78,205,196,0.15)] text-[#2ea89e]">
                                                {tr('uploadComplete')}
                                            </span>
                                        )}
                                        {activeYear === year && !hasFile(year) && (
                                            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(201,168,76,0.15)] text-[#a07c20]">
                                                In progress
                                            </span>
                                        )}
                                    </button>
                                    {idx < REQUIRED_YEARS.length - 1 && (
                                        <span className="text-base text-muted-foreground/60 px-1">→</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground mb-5">
                        {REQUIRED_YEARS.map((_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    i < uploadedCount ? 'bg-[#4ecdc4]' : i === uploadedCount ? 'bg-[#1a2744]' : 'bg-border'
                                )}
                            />
                        ))}
                        <span className="ml-1">{uploadedCount} / 3 {tr('complete')}</span>
                    </div>

                    {/* 3-card grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {REQUIRED_YEARS.map((year) => {
                            const existingPath = existingImages[year];
                            const existingUrl = existingPath ? getImageUrl(existingPath) : '';
                            const hasNewFile = (chartFiles[year]?.length ?? 0) > 0;
                            const isUploaded = hasFile(year);
                            const isActive = activeYear === year;
                            const label = YEAR_LABELS[year] ?? { title: year, subtitle: '' };
                            const file = chartFiles[year]?.[0];
                            const displayName = file?.name ?? (existingPath ? existingPath.split('/').pop() ?? '' : '');
                            const displayMeta = file ? formatFileMeta(file) : existingPath ? 'PDF · 2.3MB · 업로드됨' : '';

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
                                        'rounded-[14px] overflow-hidden transition-all cursor-pointer border-[1.5px]',
                                        isUploaded && 'border-[#4ecdc4] border-solid',
                                        isActive && !isUploaded && 'border-[#1a2744] border-solid shadow-md',
                                        !isUploaded && !isActive && 'border-dashed border-muted-foreground/40'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'px-4 py-4 pb-3 border-b flex items-center justify-between',
                                            isActive && !isUploaded && 'bg-gradient-to-br from-[#1a2744] to-[#223058] border-white/10'
                                        )}
                                    >
                                        <div>
                                            <div className={cn('text-[15px] font-bold tracking-tight', isActive && !isUploaded && 'text-white')}>
                                                {label.title}
                                            </div>
                                            <div className={cn('text-[10.5px] mt-0.5', isActive && !isUploaded ? 'text-white/45' : 'text-muted-foreground')}>
                                                {label.subtitle}
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                'text-[10px] font-semibold px-2 py-1 rounded-full',
                                                isUploaded && 'bg-[rgba(78,205,196,0.15)] text-[#2ea89e]',
                                                isActive && !isUploaded && 'bg-white/15 text-white',
                                                !isUploaded && !isActive && 'bg-[rgba(201,168,76,0.12)] text-[#a07c20]'
                                            )}
                                        >
                                            {isUploaded ? tr('uploadComplete') : isActive ? `● ${tr('uploadRequired')}` : tr('uploadPending')}
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
                                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#e8f4f3] to-[#d0eeec] border border-[rgba(78,205,196,0.2)] flex items-center justify-center text-2xl flex-shrink-0">
                                                    🗂
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[12.5px] font-semibold text-foreground truncate">{displayName || 'File'}</div>
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
                                                        else if (existingUrl) window.open(existingUrl, '_blank');
                                                    }}
                                                    className="h-7 px-2.5 rounded-md border border-border bg-background text-[11px] font-medium text-muted-foreground hover:bg-muted"
                                                >
                                                    <Eye className="w-3 h-3 inline mr-1" />
                                                    {tr('preview')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFileChange(year, null);
                                                        const el = fileInputRefs.current[year];
                                                        if (el) el.value = '';
                                                    }}
                                                    className="h-7 px-2.5 rounded-md border border-border bg-background text-[11px] font-medium text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/5"
                                                >
                                                    <X className="w-3 h-3 inline mr-1" />
                                                    {tr('delete')}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            className={cn(
                                                'py-6 px-4 flex flex-col items-center gap-2 min-h-[160px] justify-center',
                                                !isActive && 'opacity-60'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors',
                                                    isActive ? 'bg-[rgba(78,205,196,0.12)]' : 'bg-muted'
                                                )}
                                            >
                                                <Upload className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className={cn('text-[13px] font-semibold text-center', isActive ? 'text-[#5a6478]' : 'text-muted-foreground')}>
                                                {tr('clickOrDrag')}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground text-center">
                                                {tr('currentOrgChart')}
                                            </div>
                                            <div className="flex gap-1 mt-0.5">
                                                {['PNG', 'JPG', 'PDF', '최대 10MB'].map((t) => (
                                                    <span key={t} className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
    );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Organizational Charts - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Organizational Chart"
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
