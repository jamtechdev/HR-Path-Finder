import { Building2, Stethoscope, Settings, Link2, Search, ChevronLeft, ArrowRight, X, ClipboardList } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { JobSelection } from '../hooks/useJobAnalysisState';

const MIN_JOBS_REQUIRED = 3;

interface JobKeyword {
    id: number;
    name: string;
    job_family?: string;
    tags?: ('core' | 'pre_selected' | 'recommended')[];
}

interface DiagnosisContext {
    industry: string | null;
    sizeRange: string | null;
    jobClassificationStatus: string | null;
    hasFormalFramework: boolean;
}

interface Step2JobListSelectionProps {
    suggestedJobs: JobKeyword[];
    jobSelections: JobSelection;
    onSelectionsChange: (selections: JobSelection) => void;
    onContinue: () => void;
    onBack: () => void;
    industry?: string;
    sizeRange?: string;
    diagnosisContext?: DiagnosisContext | null;
    fieldErrors?: FieldErrors;
}

const FAMILY_ICONS: Record<string, React.ReactNode> = {
    'Corporate & Management Support': <Building2 className="w-4 h-4" />,
    'Clinical & Medical': <Stethoscope className="w-4 h-4" />,
    'Operations & Technology': <Settings className="w-4 h-4" />,
    'Other': <Building2 className="w-4 h-4" />,
};

export default function Step2JobListSelection({
    suggestedJobs,
    jobSelections,
    onSelectionsChange,
    onContinue,
    onBack,
    industry,
    sizeRange,
    diagnosisContext,
    fieldErrors = {},
}: Step2JobListSelectionProps) {
    const { t } = useTranslation();
    const clsStatus = diagnosisContext?.jobClassificationStatus;
    const clsLabel = clsStatus === 'yes'
        ? t('job_analysis_pages.step1.options.yes')
        : clsStatus === 'no'
          ? t('job_analysis_pages.step1.options.no')
          : clsStatus === 'not_sure'
            ? t('job_analysis_pages.step1.options.not_sure')
            : '—';
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>(
        jobSelections.selected_job_keyword_ids || []
    );
    const [customJobs, setCustomJobs] = useState<string[]>(jobSelections.custom_jobs || []);
    const [customJobInput, setCustomJobInput] = useState('');
    const [groupedJobs] = useState(jobSelections.grouped_jobs || []);

    // Pre-select when no formal framework (only on initial load if no existing selections)
    const [didPreSelect, setDidPreSelect] = useState(false);
    useEffect(() => {
        if (
            didPreSelect ||
            !diagnosisContext?.hasFormalFramework ||
            suggestedJobs.length === 0 ||
            selectedJobIds.length > 0
        ) {
            return;
        }
        const preSelected = suggestedJobs
            .filter((j) => (j.tags || []).includes('pre_selected'))
            .map((j) => j.id);
        if (preSelected.length > 0) {
            setSelectedJobIds(preSelected);
            setDidPreSelect(true);
        }
    }, [diagnosisContext?.hasFormalFramework, suggestedJobs, didPreSelect, selectedJobIds.length]);

    useEffect(() => {
        onSelectionsChange({
            selected_job_keyword_ids: selectedJobIds,
            custom_jobs: customJobs,
            grouped_jobs: groupedJobs,
        });
    }, [selectedJobIds, customJobs, groupedJobs, onSelectionsChange]);

    const handleJobToggle = (jobId: number) => {
        if (selectedJobIds.includes(jobId)) {
            setSelectedJobIds(selectedJobIds.filter((id) => id !== jobId));
        } else {
            setSelectedJobIds([...selectedJobIds, jobId]);
        }
    };

    const handleAddCustomJob = () => {
        const name = customJobInput.trim();
        if (name && !customJobs.includes(name)) {
            setCustomJobs([...customJobs, name]);
            setCustomJobInput('');
        }
    };

    const handleRemoveToken = (type: 'job' | 'custom', idOrIndex: number | string) => {
        if (type === 'job') {
            setSelectedJobIds(selectedJobIds.filter((id) => id !== idOrIndex));
        } else {
            setCustomJobs(customJobs.filter((_, i) => i !== idOrIndex));
        }
    };

    // Group jobs by family
    const byFamily = suggestedJobs.reduce<Record<string, JobKeyword[]>>((acc, job) => {
        const family = job.job_family || 'Other';
        if (!acc[family]) acc[family] = [];
        acc[family].push(job);
        return acc;
    }, {});
    const baseFamilies = [
        'Corporate & Management Support',
        'Clinical & Medical',
        'Operations & Technology',
        'Other',
    ];
    const familyOrder = [
        ...baseFamilies.filter((f) => byFamily[f]?.length),
        ...Object.keys(byFamily).filter((f) => !baseFamilies.includes(f)),
    ];

    const totalConfirmed = selectedJobIds.length + customJobs.length;
    const confirmedNames: string[] = [
        ...selectedJobIds
            .map((id) => suggestedJobs.find((j) => j.id === id)?.name)
            .filter(Boolean) as string[],
        ...customJobs,
    ];

    const industryLabel = industry || t('job_analysis_pages.step2.your_industry');
    const sizeLabel = sizeRange ? `${sizeRange.replace('-', ' - ')} ${t('job_analysis_pages.step2.sidebar_size_suffix')}` : t('job_analysis_pages.step2.your_size');
    const frameworkLabel = diagnosisContext?.hasFormalFramework
        ? t('job_analysis_pages.step2.sidebar_framework_with')
        : t('job_analysis_pages.step2.sidebar_framework_without');

    return (
        <div className="min-h-full flex flex-col bg-[#f6f3eb] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <div
                className="max-w-[1300px] mx-auto w-full py-10 pb-32 grid gap-10 lg:grid-cols-[1fr_300px]"
                style={{ margin: '40px auto', padding: '0 20px', gap: 40 }}
            >
                <main className="min-w-0">
                    <div className="mb-1 text-[11px] font-bold text-[#b59461] dark:text-amber-300">
                        {t('job_analysis_pages.step2.stage')}
                    </div>
                    <h1 className="mb-2 text-3xl font-bold leading-tight text-[#1a1a3d] dark:text-slate-100">
                        {t('job_analysis_pages.step2.title')}
                    </h1>
                    <p className="mb-4 text-base text-[#475569] dark:text-slate-300">
                        <strong>{t('job_analysis_pages.step2.purpose_label')}</strong>{' '}
                        {t('job_analysis_pages.step2.purpose_text')}
                    </p>

                    {/* Info box */}
                    <div
                        className="mb-8 flex gap-4 rounded-lg border border-[#ddd] bg-[#ece9df] p-5 dark:border-slate-700 dark:bg-slate-900/80"
                        style={{
                            marginBottom: 30,
                        }}
                    >
                        <div className="text-xl shrink-0">
                            <Link2 className="h-5 w-5 text-[#666] dark:text-slate-300" />
                        </div>
                        <p className="text-[13px] leading-relaxed text-[#334155] dark:text-slate-200" style={{ lineHeight: 1.5 }}>
                            {t('job_analysis_pages.step2.info_text', {
                                industry: industryLabel,
                                size: sizeLabel,
                                framework: frameworkLabel,
                            })}
                        </p>
                    </div>

                    {/* Job sections by family */}
                    {familyOrder.map((family) => {
                        const jobs = byFamily[family] || [];
                        const selectedInFamily = jobs.filter((j) => selectedJobIds.includes(j.id)).length;
                        return (
                            <div key={family}>
                                <div className="flex flex-wrap items-center gap-2 text-base font-bold text-[#0f172a] dark:text-slate-100" style={{ margin: '30px 0 15px' }}>
                                    <span className="flex items-center gap-2">
                                        {FAMILY_ICONS[family] || <Building2 className="w-4 h-4" />}
                                        {family}
                                    </span>
                                    <span
                                        className="rounded-[10px] border border-[#ddd] px-2 py-0.5 text-[11px] font-normal text-[#888] dark:border-slate-600 dark:text-slate-400"
                                        style={{ padding: '1px 8px' }}
                                    >
                                        {jobs.length} {t('job_analysis_pages.step2.roles')}
                                    </span>
                                    {selectedInFamily > 0 && (
                                        <span className="text-[#5cb85c] text-[11px]">
                                            {selectedInFamily} {t('job_analysis_pages.step2.selected')}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="grid gap-3"
                                    style={{
                                        gridTemplateColumns: window.innerWidth < 640
                                        ? "1fr"
                                        : "repeat(3, 1fr)"
                                    }}
                                >
                                    {jobs.map((job) => {
                                        const isSelected = selectedJobIds.includes(job.id);
                                        const tags = job.tags || [];
                                        return (
                                            <button
                                                key={job.id}
                                                type="button"
                                                onClick={() => handleJobToggle(job.id)}
                                                className={cn(
                                                    'rounded-lg p-4 border text-left transition-all',
                                                    isSelected
                                                        ? 'border-2 border-[#5cb85c] bg-[#f0f7f0] dark:bg-emerald-900/20'
                                                        : 'border border-white bg-white hover:border-[#e0ddd5] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500'
                                                )}
                                                style={{
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleJobToggle(job.id)}
                                                        className="border-[#cbd5e1] data-[state=checked]:bg-[#5cb85c] data-[state=checked]:border-[#5cb85c]"
                                                    />
                                                    <span className="flex-1 font-bold text-[#0f172a] dark:text-slate-100">{job.name}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {tags.includes('pre_selected') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#d4e9d5',
                                                                color: '#2e7d32',
                                                            }}
                                                        >
                                                            {t('job_analysis_pages.step2.tags.pre_selected')}
                                                        </span>
                                                    )}
                                                    {tags.includes('core') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#dbdad3',
                                                                color: '#555',
                                                            }}
                                                        >
                                                            {t('job_analysis_pages.step2.tags.core')}
                                                        </span>
                                                    )}
                                                    {tags.includes('recommended') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#f9f1c7',
                                                                color: '#856404',
                                                            }}
                                                        >
                                                            {t('job_analysis_pages.step2.tags.recommended')}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add custom job */}
                    <div className="mt-12" style={{ marginTop: 50 }}>
                        <div
                            className="font-bold text-xs uppercase"
                            style={{ letterSpacing: 0.5 }}
                        >
                            {t('job_analysis_pages.step2.add_custom')}
                        </div>
                        <div className="flex gap-2 mt-2" style={{ marginTop: 10, gap: 10 }}>
                            <Input
                                value={customJobInput}
                                onChange={(e) => setCustomJobInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCustomJob();
                                    }
                                }}
                                placeholder={t('job_analysis_pages.step2.custom_placeholder')}
                                className="flex-1 rounded-md border-[#ccc] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                style={{ padding: 12 }}
                            />
                            <Button
                                type="button"
                                onClick={handleAddCustomJob}
                                className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold rounded-md px-6"
                                style={{ padding: '0 25px' }}
                            >
                                {t('job_analysis_pages.step2.add')}
                            </Button>
                        </div>
                    </div>

                    {/* Confirmed scope */}
                    <div
                        className="mt-8 rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                        style={{
                            marginTop: 30,
                            borderRadius: 8,
                            border: '1px solid #e0ddd5',
                            padding: 20,
                        }}
                    >
                        <div
                            className="flex justify-between items-center flex-wrap gap-2 mb-4"
                            style={{ marginBottom: 15 }}
                        >
                            <div className="font-bold flex items-center gap-2 flex-wrap">
                                <ClipboardList className="w-4 h-4 shrink-0" />
                                <span>{t('job_analysis_pages.step2.confirmed_scope')}</span>
                                <span
                                    className="text-white text-[10px] font-medium px-2 py-0.5 rounded-[10px]"
                                    style={{ background: '#1a1a3d' }}
                                >
                                    {totalConfirmed}
                                </span>
                            </div>
                            <div className="text-[11px] text-[#999] dark:text-slate-400">
                                {t('job_analysis_pages.step2.scope_hint')}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedJobIds.map((jobId) => {
                                const name = suggestedJobs.find((j) => j.id === jobId)?.name;
                                if (!name) return null;
                                return (
                                    <span
                                        key={`job-${jobId}`}
                                        className="inline-flex items-center gap-1.5 bg-[#f0f7f0] border border-[#5cb85c] text-[#5cb85c] rounded-[20px] text-[13px] py-1 px-3"
                                    >
                                        {name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveToken('job', jobId)}
                                            className="hover:opacity-80"
                                            aria-label={`Remove ${name}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                            {customJobs.map((name, index) => (
                                <span
                                    key={`custom-${index}`}
                                    className="inline-flex items-center gap-1.5 bg-[#f0f7f0] border border-[#5cb85c] text-[#5cb85c] rounded-[20px] text-[13px] py-1 px-3"
                                >
                                    {name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveToken('custom', index)}
                                        className="hover:opacity-80"
                                        aria-label={`Remove ${name}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Sidebar - Diagnosis Context */}
                {diagnosisContext && (
                    <aside className="shrink-0">
                        <div
                            className="overflow-hidden rounded-xl bg-white dark:border dark:border-slate-700 dark:bg-slate-900"
                            style={{
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                borderRadius: 12,
                            }}
                        >
                            <div
                                className="p-5 text-white"
                                style={{ background: '#151535', padding: 20 }}
                            >
                                <div className="font-bold mb-1 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    {t('job_analysis_pages.step2.context.title')}
                                </div>
                                <div className="text-[11px] text-slate-300">
                                    {t('job_analysis_pages.step2.context.subtitle')}
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4 dark:border-slate-700"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="mb-1 text-[10px] uppercase text-[#999] dark:text-slate-400">
                                    {t('job_analysis_pages.step2.context.industry')}
                                </div>
                                <div className="font-bold text-[#0f172a] dark:text-slate-100">{diagnosisContext.industry || '—'}</div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4 dark:border-slate-700"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="mb-1 text-[10px] uppercase text-[#999] dark:text-slate-400">
                                    {t('job_analysis_pages.step2.context.company_size')}
                                </div>
                                <div className="font-bold text-[#0f172a] dark:text-slate-100">
                                    {diagnosisContext.sizeRange
                                        ? `${diagnosisContext.sizeRange.replace('-', ' - ')} ${t('job_analysis_pages.step2.sidebar_size_suffix')}`
                                        : '—'}
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4 dark:border-slate-700"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="mb-1 text-[10px] uppercase text-[#999] dark:text-slate-400">
                                    {t('job_analysis_pages.step2.context.job_classification')}
                                </div>
                                <div
                                    className={cn(
                                        'font-bold',
                                        diagnosisContext.jobClassificationStatus !== 'yes' && 'text-[#d9534f]',
                                        diagnosisContext.jobClassificationStatus === 'yes' && 'text-[#0f172a] dark:text-slate-100'
                                    )}
                                >
                                    {clsLabel}
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4 dark:border-slate-700"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="mb-1 text-[10px] uppercase text-[#999] dark:text-slate-400">
                                    {t('job_analysis_pages.step2.context.role_differentiation')}
                                </div>
                                <div className="font-bold text-[#5cb85c]">{t('job_analysis_pages.step2.context.skill_level_based')}</div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4 dark:border-slate-700"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="mb-1 text-[10px] uppercase text-[#999] dark:text-slate-400">
                                    {t('job_analysis_pages.step2.context.grade_authority')}
                                </div>
                                <div className="font-bold text-[#d9534f]">{t('job_analysis_pages.step2.context.not_defined')}</div>
                            </div>
                            <div className="p-5 text-xs text-[#334155] dark:text-slate-300" style={{ lineHeight: 1.4, padding: 20 }}>
                                <strong className="text-[#c8963e]">{t('job_analysis_pages.step2.context.why_matters')}</strong>{' '}
                                {t('job_analysis_pages.step2.context.why_body')}
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Sticky footer */}
            <footer
                className="sticky bottom-0 z-10 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#ddd] bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900"
                
            >
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-[13px] text-[#666] dark:text-slate-300">
                        {t('job_analysis_pages.step2.complete_min', { min: MIN_JOBS_REQUIRED })} — {totalConfirmed} {t('job_analysis_pages.step2.selected')}
                    </p>
                    <FieldErrorMessage fieldKey="job-selection" errors={fieldErrors} className="!mt-0" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="rounded-md border-[#ccc] font-medium dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        style={{ padding: '10px 25px' }}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('job_analysis_pages.step2.back')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onContinue}
                        className="rounded-md bg-[#1a1a3d] font-bold text-white hover:bg-[#2d2d5c] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        style={{ padding: '12px 30px' }}
                    >
                        {t('job_analysis_pages.step2.continue_to_job_definition')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
