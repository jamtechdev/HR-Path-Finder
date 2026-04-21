import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import SuccessModal from '@/components/Modals/SuccessModal';
import { Button } from '@/components/ui/button';
import { waitWebAnimationMs } from '@/lib/deferred';
import { cn } from '@/lib/utils';
import type { JobDefinition, OrgChartMapping } from '../hooks/useJobAnalysisState';

interface Step4FinalizationProps {
    projectId: number;
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    diagnosisSummary?: {
        present_headcount?: number | null;
        job_grade_names?: string[];
    };
    policyAnswers?: Record<number, { answer: string; conditional_text?: string }>;
    jobSelections?: {
        selected_job_keyword_ids: number[];
        custom_jobs: string[];
        grouped_jobs: Array<{ name: string; job_keyword_ids: number[] }>;
    };
    onContinue: () => void;
    onBack: () => void;
    fieldErrors?: FieldErrors;
}

export default function Step4Finalization({
    projectId,
    jobDefinitions,
    orgMappings,
    diagnosisSummary,
    policyAnswers = {},
    jobSelections = {
        selected_job_keyword_ids: [],
        custom_jobs: [],
        grouped_jobs: [],
    },
    onContinue,
    onBack,
    fieldErrors = {},
}: Step4FinalizationProps) {
    const { t } = useTranslation();
    const [activeJobKey, setActiveJobKey] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const jobEntries = useMemo(
        () => Object.entries(jobDefinitions).filter(([, def]) => def?.job_name),
        [jobDefinitions]
    );
    const jobCount = jobEntries.length;
    const hasJobs = jobCount > 0;

    const activeKey = activeJobKey || (jobEntries[0]?.[0] ?? '');
    const activeJob = activeKey ? jobDefinitions[activeKey] : null;

    const handleFinalize = () => {
        if (!hasJobs) return;
        setIsSubmitting(true);
        void waitWebAnimationMs(300).then(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);
        });
    };

    if (!hasJobs) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center bg-[#f9f7f2] p-8 dark:bg-slate-950">
                <p className="text-[#6b7280] text-center">
                    {t('job_analysis_pages.step4.no_jobs')}
                </p>
                <Button variant="outline" onClick={onBack} className="mt-4 border-[#e5e7eb]">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t('job_analysis_pages.step4.back_edit')}
                </Button>
            </div>
        );
    }

    const spec = activeJob?.job_specification;
    const levels = activeJob?.competency_levels || [];

    const activeJobKeywordIds = useMemo(() => {
        if (!activeJob) return [];
        const ids = new Set<number>();
        if (typeof activeJob.job_keyword_id === 'number') ids.add(activeJob.job_keyword_id);
        (activeJob.grouped_job_keyword_ids || []).forEach((id) => {
            if (typeof id === 'number') ids.add(id);
        });
        return Array.from(ids);
    }, [activeJob]);

    const mappingById = useMemo(() => {
        const map = new Map<string, OrgChartMapping>();
        orgMappings.forEach((m) => map.set(m.id, m));
        return map;
    }, [orgMappings]);

    const relatedOrgUnits = useMemo(() => {
        if (activeJobKeywordIds.length === 0) return [] as OrgChartMapping[];
        return orgMappings.filter((unit) => {
            const unitHasJob = (unit.job_keyword_ids || []).some((id) => activeJobKeywordIds.includes(id));
            const specialistHasJob = (unit.job_specialists || []).some((s) => activeJobKeywordIds.includes(s.job_keyword_id));
            return unitHasJob || specialistHasJob;
        });
    }, [activeJobKeywordIds, orgMappings]);

    const reportsTo = useMemo(() => {
        if (relatedOrgUnits.length === 0) return null;
        const candidates = relatedOrgUnits
            .map((unit) => {
                if (unit.parentId) {
                    const parent = mappingById.get(unit.parentId);
                    if (parent) {
                        return parent.org_head_title || parent.org_head_rank || parent.org_head_name || parent.org_unit_name;
                    }
                }
                return unit.org_head_title || unit.org_head_rank || unit.org_head_name || unit.org_unit_name;
            })
            .filter(Boolean) as string[];
        const unique = Array.from(new Set(candidates.map((v) => v.trim()).filter(Boolean)));
        if (unique.length === 0) return null;
        return unique.slice(0, 2).join(' / ');
    }, [mappingById, relatedOrgUnits]);

    const jobGradeLabel = useMemo(() => {
        const grades = (diagnosisSummary?.job_grade_names || []).filter((g) => String(g || '').trim() !== '');
        if (grades.length === 0) return t('job_analysis_pages.common.dash');
        if (grades.length === 1) return grades[0];
        return `${grades[0]} — ${grades[grades.length - 1]}`;
    }, [diagnosisSummary?.job_grade_names, t]);

    const levelPillClass = (idx: number) =>
        [
            'bg-[#E1F5EE] text-[#0F6E56]',
            'bg-[#E6F1FB] text-[#185FA5]',
            'bg-[#EEEDFE] text-[#534AB7]',
            'bg-[#FAEEDA] text-[#854F0B]',
            'bg-[#FAECE7] text-[#993C1D]',
        ][idx % 5];

    const depthDotClass = (idx: number) =>
        ['bg-[#1D9E75]', 'bg-[#378ADD]', 'bg-[#7F77DD]', 'bg-[#BA7517]', 'bg-[#D85A30]'][idx % 5];

    const depthFilledCount = (idx: number, total: number) => {
        if (total <= 0) return 0;
        return Math.min(5, Math.max(1, Math.ceil((5 * (idx + 1)) / total)));
    };

    return (
        <div className="min-h-full flex flex-col bg-[#f5f5f3] text-[#1a1a18] dark:bg-slate-950 dark:text-slate-100">
            <div className="flex-1 min-h-0 max-w-[1100px] mx-auto w-full py-10 px-5 pb-44" style={{ padding: '0 20px', margin: '40px auto' }}>
                <FieldErrorMessage fieldKey="finalization" errors={fieldErrors} className="mb-4" />

                <div className="flex gap-2 mb-6 flex-wrap">
                    {jobEntries.map(([key]) => {
                        const isActive = activeKey === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveJobKey(key)}
                                className={cn(
                                    'py-2.5 px-5 rounded-[25px] text-[13px] font-semibold border transition-all duration-200',
                                    isActive
                                        ? 'bg-[#121431] text-white border-[#121431] shadow-md'
                                        : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#121431]/40 hover:bg-[#fafafa] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800'
                                )}
                            >
                                {jobDefinitions[key]?.job_name}
                            </button>
                        );
                    })}
                </div>

                {activeJob && (
                    <div className="max-w-[900px] mx-auto w-full space-y-4" style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                        <header className="mb-6">
                            <div
                                className="text-[11px] text-[#888780] uppercase tracking-[0.08em] mb-1.5"
                                style={{ letterSpacing: '0.08em' }}
                            >
                                {t('job_analysis_pages.step4.job_profile_family')}
                            </div>
                            <h2 className="text-[28px] font-medium text-[#1a1a18] dark:text-slate-100 m-0 mb-2.5 leading-tight">
                                {activeJob.job_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#1a1a18] dark:text-slate-200">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#888780]">{t('job_analysis_pages.step4.meta_reporting_line')}</span>
                                    <span className="font-medium">{reportsTo ?? t('job_analysis_pages.step4.not_mapped_yet')}</span>
                                </div>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#b4b2a9] shrink-0" aria-hidden />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#888780]">{t('job_analysis_pages.step4.meta_employment_type')}</span>
                                    <span className="font-medium">{t('job_analysis_pages.step4.employment_regular_fte')}</span>
                                </div>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#b4b2a9] shrink-0" aria-hidden />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#888780]">{t('job_analysis_pages.step4.meta_grade_range')}</span>
                                    <span className="font-medium">{jobGradeLabel}</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Rank system */}
                            <div className="rounded-[12px] border-[0.5px] border-[#d3d1c7] bg-white p-6 dark:border-slate-600 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-4 text-[11px] text-[#888780] tracking-[0.08em]">
                                    <span>{t('job_analysis_pages.step4.rank_system_heading')}</span>
                                    <span className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[10px] font-medium normal-case text-[#0F6E56]">
                                        {t('job_analysis_pages.step4.rank_stages_badge', { count: levels.length || 0 })}
                                    </span>
                                </div>
                                {levels.length > 0 ? (
                                    <div>
                                        {levels.map((level, idx) => {
                                            const desc = level.description || '';
                                            const titlePart = desc.includes(':')
                                                ? desc.split(':')[0].trim()
                                                : level.level || '';
                                            const rest = desc.includes(':')
                                                ? desc.split(':').slice(1).join(':').trim()
                                                : desc;
                                            const yearKey = `job_analysis_pages.step4.year_band_${Math.min(idx, 4)}` as const;
                                            const filled = depthFilledCount(idx, levels.length);
                                            return (
                                                <div
                                                    key={idx}
                                                    className="grid grid-cols-[48px_64px_1fr] gap-3 items-start py-2.5 border-b border-[#d3d1c7] last:border-0 dark:border-slate-700"
                                                >
                                                    <span
                                                        className={cn(
                                                            'text-[11px] font-medium px-2 py-0.5 rounded-full text-center',
                                                            levelPillClass(idx)
                                                        )}
                                                    >
                                                        {level.level}
                                                    </span>
                                                    <span className="text-[12px] text-[#5f5e5a] pt-0.5">{t(yearKey)}</span>
                                                    <div>
                                                        <div className="text-[12px] font-medium text-[#5f5e5a] mb-0.5">
                                                            {titlePart || t('job_analysis_pages.common.dash')}
                                                        </div>
                                                        <div className="text-[13px] text-[#1a1a18] leading-[1.6] dark:text-slate-200">
                                                            {rest || t('job_analysis_pages.common.dash')}
                                                        </div>
                                                        <div className="flex gap-[3px] mt-1.5">
                                                            {Array.from({ length: 5 }).map((_, dotIdx) => (
                                                                <span
                                                                    key={dotIdx}
                                                                    className={cn(
                                                                        'w-1.5 h-1.5 rounded-full',
                                                                        dotIdx < filled ? depthDotClass(idx) : 'bg-[#d3d1c7]'
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-[13px] text-[#6b7280] dark:text-slate-400 m-0">{t('job_analysis_pages.step4.no_competency')}</p>
                                )}
                            </div>

                            {/* Job requirements */}
                            <div className="rounded-[12px] border-[0.5px] border-[#d3d1c7] bg-white p-6 dark:border-slate-600 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-4 text-[11px] text-[#888780] tracking-[0.08em]">
                                    <span>{t('job_analysis_pages.step4.job_requirements_heading')}</span>
                                    <span className="rounded-full bg-[#E6F1FB] px-2 py-0.5 text-[10px] font-medium normal-case text-[#185FA5]">
                                        {t('job_analysis_pages.step4.job_requirements_badge', { count: 4 })}
                                    </span>
                                </div>
                                <div className="space-y-0">
                                    {(['education', 'experience', 'skills', 'communication'] as const).map((key, sIdx) => (
                                        <div key={key}>
                                            {sIdx > 0 ? <hr className="border-0 border-t-[0.5px] border-[#d3d1c7] my-3 dark:border-slate-700" /> : null}
                                            <div className="text-[11px] text-[#888780] tracking-[0.08em] mb-2.5">
                                                {t(`job_analysis_pages.step3.spec_labels.${key}`)}
                                            </div>
                                            <div className="grid grid-cols-[56px_1fr] gap-2 items-start mb-2">
                                                <span className="rounded-full bg-[#F1EFE8] text-[10px] font-medium text-[#5F5E5A] text-center py-0.5">
                                                    {t('job_analysis_pages.step4.spec_req')}
                                                </span>
                                                <span className="text-[13px] leading-[1.6] text-[#1a1a18] dark:text-slate-200">
                                                    {spec?.[key]?.required || t('job_analysis_pages.common.dash')}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-[56px_1fr] gap-2 items-start">
                                                <span className="rounded-full bg-[#FAEEDA] text-[10px] font-medium text-[#854F0B] text-center py-0.5">
                                                    {t('job_analysis_pages.step4.spec_pref')}
                                                </span>
                                                <span className="text-[13px] leading-[1.6] text-[#1a1a18] dark:text-slate-200">
                                                    {spec?.[key]?.preferred || t('job_analysis_pages.common.dash')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CSF matrix — 3-column grid */}
                        <div className="rounded-[12px] border-[0.5px] border-[#d3d1c7] bg-white p-6 dark:border-slate-600 dark:bg-slate-900">
                            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#888780] tracking-[0.08em]">
                                <span>{t('job_analysis_pages.step4.csf_matrix')}</span>
                                <span className="rounded-full bg-[#E6F1FB] px-2 py-0.5 text-[10px] font-medium normal-case text-[#185FA5]">
                                    {t('job_analysis_pages.step4.csf_matrix_scope_badge')}
                                </span>
                            </div>
                            {(() => {
                                const csfItems = activeJob.csfs ?? [];
                                if (csfItems.length === 0) {
                                    return (
                                        <p className="m-0 mt-3 text-[13px] text-[#6b7280] dark:text-slate-400">{t('job_analysis_pages.step4.no_csf')}</p>
                                    );
                                }
                                const pad = (3 - (csfItems.length % 3)) % 3;
                                const cells = [...csfItems, ...Array(pad).fill(null)];
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                        {cells.map((csf, i) => {
                                            if (!csf) {
                                                return <div key={`empty-${i}`} className="hidden sm:block min-h-[1px]" aria-hidden />;
                                            }
                                            const cat = csf.category || 'strategic';
                                            const tagClass =
                                                cat === 'strategic'
                                                    ? 'bg-[#EEEDFE] text-[#534AB7]'
                                                    : cat === 'process'
                                                      ? 'bg-[#E6F1FB] text-[#185FA5]'
                                                      : 'bg-[#E1F5EE] text-[#0F6E56]';
                                            return (
                                                <div
                                                    key={`${csf.name}-${i}`}
                                                    className="rounded-lg bg-[#f5f5f3] dark:bg-slate-800/80 px-[14px] py-[12px] border border-transparent dark:border-slate-700"
                                                >
                                                    <span className={cn('inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-2', tagClass)}>
                                                        {t(`job_analysis_pages.step4.category_display.${cat}`)}
                                                    </span>
                                                    <div className="text-[13px] font-medium text-[#1a1a18] dark:text-slate-100 mb-1">{csf.name}</div>
                                                    <div className="text-[12px] text-[#5f5e5a] leading-relaxed dark:text-slate-400">
                                                        {csf.description || t('job_analysis_pages.common.dash')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <footer
                className="sticky bottom-0 z-20 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white/95 px-6 py-[18px] backdrop-blur md:px-[60px] dark:border-slate-700 dark:bg-slate-900/95"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <div className="text-[13px] font-medium text-[#94a3b8] dark:text-slate-400">
                    {t('job_analysis_pages.step4.footer_roles', { count: jobCount })}
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="rounded-lg border-[#e0ddd5] px-8 py-6 font-bold dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                        {t('job_analysis_pages.step4.back_to_edit')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleFinalize}
                        disabled={isSubmitting}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                    >
                        {isSubmitting ? (
                            t('job_analysis_pages.step4.finalizing')
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {t('job_analysis_pages.step4.confirm_finalize')}
                            </>
                        )}
                    </Button>
                </div>
            </footer>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={t('job_analysis_pages.step4.success_title')}
                message={t('job_analysis_pages.step4.success_message')}
                nextStepLabel={t('job_analysis_pages.step4.success_next')}
                onNextStep={() => {
                    setShowSuccessModal(false);
                    onContinue();
                }}
            />
        </div>
    );
}
