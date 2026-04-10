import { ChevronLeft, CheckCircle2, FileDown, Info } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import SuccessModal from '@/components/Modals/SuccessModal';
import { Button } from '@/components/ui/button';
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
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);
        }, 300);
    };

    const csfMatrix = useMemo(() => {
        const csfs = activeJob?.csfs;
        if (!csfs?.length) return {} as Record<string, Record<string, Array<{ name?: string; description?: string; category?: string; strategic_importance?: string }>>>;
        const matrix: Record<string, Record<string, typeof csfs>> = {
            high: { strategic: [], process: [], operational: [] },
            medium: { strategic: [], process: [], operational: [] },
            low: { strategic: [], process: [], operational: [] },
        };
        csfs.forEach((c) => {
            const imp = (c.strategic_importance || 'medium') as 'high' | 'medium' | 'low';
            const cat = (c.category || 'strategic') as 'strategic' | 'process' | 'operational';
            if (matrix[imp]?.[cat]) matrix[imp][cat].push(c);
        });
        return matrix;
    }, [activeJob?.csfs]);

    if (!hasJobs) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center bg-[#f9f7f2] p-8 dark:bg-slate-950">
                <p className="text-[#6b7280] text-center">
                    No job definitions found. Please go back to Job Definition to complete at least one role.
                </p>
                <Button variant="outline" onClick={onBack} className="mt-4 border-[#e5e7eb]">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Edit
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
        if (relatedOrgUnits.length === 0) return 'Not mapped yet';
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
        if (unique.length === 0) return 'Not mapped yet';
        return unique.slice(0, 2).join(' / ');
    }, [mappingById, relatedOrgUnits]);

    const headcountLabel = useMemo(() => {
        if (relatedOrgUnits.length === 0) return 'Not mapped yet';
        const specialistCount = relatedOrgUnits.reduce((sum, unit) => {
            return sum + (unit.job_specialists || []).filter((s) => activeJobKeywordIds.includes(s.job_keyword_id)).length;
        }, 0);
        if (specialistCount > 0) return `${specialistCount} FTE`;
        const mappedUnitsCount = relatedOrgUnits.filter((unit) =>
            (unit.job_keyword_ids || []).some((id) => activeJobKeywordIds.includes(id))
        ).length;
        return mappedUnitsCount > 0 ? `${mappedUnitsCount} FTE` : 'Not mapped yet';
    }, [activeJobKeywordIds, relatedOrgUnits]);

    const finalHeadcountLabel = useMemo(() => {
        if (headcountLabel !== 'Not mapped yet') return headcountLabel;
        const fromDiagnosis = Number(diagnosisSummary?.present_headcount ?? 0);
        if (fromDiagnosis > 0) return `${fromDiagnosis} FTE`;
        return '—';
    }, [headcountLabel, diagnosisSummary?.present_headcount]);

    const jobGradeLabel = useMemo(() => {
        const grades = (diagnosisSummary?.job_grade_names || []).filter((g) => String(g || '').trim() !== '');
        if (grades.length === 0) return '—';
        if (grades.length === 1) return grades[0];
        return `${grades[0]} — ${grades[grades.length - 1]}`;
    }, [diagnosisSummary?.job_grade_names]);

    return (
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431] dark:bg-slate-950 dark:text-slate-100">
            <div className="flex-1 min-h-0 max-w-[1100px] mx-auto w-full py-10 px-5 pb-44" style={{ padding: '0 20px', margin: '40px auto' }}>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="step-label mb-2 text-[12px] font-bold tracking-[1px] text-[#b88a44] dark:text-amber-300">
                            STEP 4 OF 6 — JOB ANALYSIS
                        </div>
                        <h1 className="m-0 mb-4 text-3xl font-bold text-[#121431] dark:text-slate-100">
                            Finalization of Job Definitions
                        </h1>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-md border-[#e5e7eb] px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
                <p className="mb-6 max-w-[900px] text-[15px] leading-relaxed text-[#6b7280] dark:text-slate-300">
                    The job structure and Job Definition documents, reviewed and refined during the Job Definition stage, are finalized below.
                    The finalized job standards are used as baseline inputs for the subsequent design of the performance management system and the compensation system.
                </p>

                <div className="mb-8 flex items-start gap-4 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 dark:bg-blue-400/20">
                        <Info className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div className="leading-relaxed text-[#1e40af]/90 dark:text-slate-300">
                        Once you confirm, <strong className="text-[#121431] dark:text-slate-100">all jobs will be finalized globally.</strong> This is a
                        global confirmation of the entire job configuration — not per-job. Review each job
                        card carefully before proceeding.
                    </div>
                </div>

                <FieldErrorMessage fieldKey="finalization" errors={fieldErrors} className="mb-4" />

                <div className="flex gap-2 mb-8 flex-wrap">
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
                    <>
                        {/* Job Profile Card — dark header with shadow */}
                        <div
                            className="relative rounded-t-xl text-white overflow-hidden"
                            style={{
                                background: '#121431',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div className="pt-10 pb-10 px-6 md:px-10">
                                <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1" style={{ letterSpacing: 1 }}>
                                    JOB PROFILE — CORPORATE & MANAGEMENT SUPPORT
                                </div>
                                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 md:max-w-[70%]">
                                        <h2
                                            className="mt-2 mb-3 text-white font-bold"
                                            style={{ fontFamily: "'Pretendard', 'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)' }}
                                        >
                                            {activeJob.job_name}
                                        </h2>
                                        <p className="opacity-90 leading-relaxed m-0 text-[15px]">
                                            {activeJob.job_description || 'No description entered.'}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col gap-2 min-w-[200px]">
                                    <div
                                        className="rounded px-3 py-2 text-[11px] border shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.12)',
                                            borderColor: 'rgba(255,255,255,0.25)',
                                        }}
                                    >
                                        REPORTS TO: <strong className="font-semibold">{reportsTo}</strong>
                                    </div>
                                    <div
                                        className="rounded px-3 py-2 text-[11px] border shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.12)',
                                            borderColor: 'rgba(255,255,255,0.25)',
                                        }}
                                    >
                                        HEADCOUNT: <strong className="font-semibold">{finalHeadcountLabel}</strong>
                                    </div>
                                    <div
                                        className="rounded px-3 py-2 text-[11px] border shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.12)',
                                            borderColor: 'rgba(255,255,255,0.25)',
                                        }}
                                    >
                                        JOB GRADE: <strong className="font-semibold">{jobGradeLabel}</strong>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* White content card — panels */}
                        <div className="overflow-hidden rounded-b-xl border border-t-0 border-[#e5e7eb] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                                {/* Competency Leveling card */}
                                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition-shadow hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="text-[13px] font-bold uppercase tracking-wide text-[#121431] dark:text-slate-100">
                                            COMPETENCY LEVELING
                                        </span>
                                        <span
                                            className="rounded-[10px] bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#6b7280] dark:bg-slate-700 dark:text-slate-300"
                                        >
                                            {levels.length} LEVELS
                                        </span>
                                    </div>
                                    {levels.length > 0 ? (
                                        <div className="overflow-x-auto -mx-1">
                                            <table className="w-full border-collapse text-[13px] table-fixed">
                                                <thead>
                                                    <tr>
                                                        <th className="w-[52px] border-b border-[#e5e7eb] pb-3 text-left text-[11px] font-medium uppercase text-[#6b7280] dark:border-slate-700 dark:text-slate-400">LV</th>
                                                        <th className="w-[150px] border-b border-[#e5e7eb] pb-3 pr-3 text-left text-[11px] font-medium uppercase text-[#6b7280] dark:border-slate-700 dark:text-slate-400">TITLE</th>
                                                        <th className="w-[72px] border-b border-[#e5e7eb] pb-3 pr-3 text-left text-[11px] font-medium uppercase text-[#6b7280] dark:border-slate-700 dark:text-slate-400">YEARS</th>
                                                        <th className="border-b border-[#e5e7eb] pb-3 text-left text-[11px] font-medium uppercase text-[#6b7280] dark:border-slate-700 dark:text-slate-400">CORE EXPECTATION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {levels.map((level, idx) => {
                                                        const desc = level.description || '';
                                                        const titlePart = desc.includes(':') ? desc.split(':')[0].trim() : (level.level ? `${level.level}` : '');
                                                        const rest = desc.includes(':') ? desc.split(':').slice(1).join(':').trim() : desc;
                                                        return (
                                                            <tr key={idx} className="border-b border-[#f3f4f6] last:border-0 dark:border-slate-800">
                                                                <td className="py-3.5 align-top">
                                                                    <span
                                                                        className="inline-block px-2 py-1 rounded text-[10px] font-bold text-white"
                                                                        style={{ background: '#121431' }}
                                                                    >
                                                                        {level.level}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 align-top pr-3 font-semibold text-[#121431] dark:text-slate-100">{titlePart || '—'}</td>
                                                                <td className="py-3.5 align-top pr-3 text-[12px] text-[#6b7280] dark:text-slate-300">0–2 yrs</td>
                                                                <td className="py-3.5 align-top text-[12px] leading-snug text-[#6b7280] dark:text-slate-300">{rest || '—'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="py-4 text-[13px] text-[#6b7280] dark:text-slate-300">No competency levels defined.</p>
                                    )}
                                </div>

                                {/* Job Specification card */}
                                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition-shadow hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="text-[13px] font-bold uppercase tracking-wide text-[#121431] dark:text-slate-100">
                                            JOB SPECIFICATION
                                        </span>
                                        <span
                                            className="rounded-[10px] bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#6b7280] dark:bg-slate-700 dark:text-slate-300"
                                        >
                                            4 DIMENSIONS
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'education' as const, label: 'EDUCATION' },
                                            { key: 'experience' as const, label: 'EXPERIENCE' },
                                            { key: 'skills' as const, label: 'SKILLS' },
                                            { key: 'communication' as const, label: 'COMMUNICATION' },
                                        ].map(({ key, label }) => (
                                            <div key={key} className="rounded-lg border border-[#f3f4f6] bg-[#fdfbf7] p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-[#6b7280] dark:text-slate-400">
                                                    {label}
                                                </div>
                                                <div className="flex gap-2.5 items-start mb-2 last:mb-0">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: '#e5e7eb', color: '#374151' }}>REQ</span>
                                                    <span className="text-[13px] leading-snug text-[#374151] dark:text-slate-200">{spec?.[key]?.required || '—'}</span>
                                                </div>
                                                <div className="flex gap-2.5 items-start">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>PREF</span>
                                                    <span className="text-[13px] leading-snug text-[#374151] dark:text-slate-200">{spec?.[key]?.preferred || '—'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CSF Matrix section */}
                            <div className="border-t border-[#e5e7eb] pt-6 dark:border-slate-700">
                                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                                    <span className="text-[13px] font-bold uppercase tracking-wide text-[#6b7280] dark:text-slate-400">
                                        CRITICAL SUCCESS FACTOR MATRIX
                                    </span>
                                    <span className="text-[12px] font-normal text-[#9ca3af] dark:text-slate-400">● Strategic ● Process ● Operational</span>
                                </div>

                                {(() => {
                                    const hasAnyCsf = (['high', 'medium', 'low'] as const).some(
                                        (imp) =>
                                            ((csfMatrix[imp]?.strategic?.length ?? 0) +
                                                (csfMatrix[imp]?.process?.length ?? 0) +
                                                (csfMatrix[imp]?.operational?.length ?? 0)) > 0
                                    );
                                    if (!hasAnyCsf) {
                                        return (
                                            <div className="rounded-xl border border-dashed border-[#e5e7eb] bg-[#fafafa] p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
                                                <p className="m-0 text-[13px] text-[#6b7280] dark:text-slate-300">No critical success factors defined for this job.</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <>
                                            {(['high', 'medium', 'low'] as const).map((imp) => {
                                                const list = (csfMatrix[imp]?.strategic ?? []).concat(csfMatrix[imp]?.process ?? []).concat(csfMatrix[imp]?.operational ?? []);
                                                if (list.length === 0) return null;
                                                const impColor = imp === 'high' ? '#ef4444' : imp === 'medium' ? '#f59e0b' : '#22c55e';
                                                return (
                                                    <div key={imp} className="mb-6 last:mb-0">
                                                        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-wide" style={{ color: impColor }}>
                                                            ● {imp} IMPORTANCE
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {list.map((csf, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        'p-5 rounded-xl border transition-shadow hover:shadow-sm',
                                                                        csf.category === 'strategic' &&
                                                                            'bg-[#f4f6fb] border-[#dbeafe] dark:bg-indigo-950/30 dark:border-indigo-800/60',
                                                                        csf.category === 'process' &&
                                                                            'bg-[#f0f7ff] border-[#dbeafe] dark:bg-sky-950/30 dark:border-sky-800/60',
                                                                        csf.category === 'operational' &&
                                                                            'bg-[#f2f9f5] border-[#dcfce7] dark:bg-emerald-950/30 dark:border-emerald-800/60'
                                                                    )}
                                                                >
                                                                    <div className="text-[14px] font-semibold text-[#121431] dark:text-slate-100">{csf.name}</div>
                                                                    <div className="mt-1 text-[12px] leading-snug text-[#6b7280] dark:text-slate-300">{csf.description || '—'}</div>
                                                                    <span
                                                                        className={cn(
                                                                            'inline-block mt-4 text-[10px] font-bold uppercase px-2 py-1 rounded',
                                                                            csf.category === 'strategic' &&
                                                                                'bg-[#dbeafe] text-[#1e40af] dark:bg-indigo-900/70 dark:text-indigo-200',
                                                                            csf.category === 'process' &&
                                                                                'bg-[#dbeafe] text-[#1e40af] dark:bg-sky-900/70 dark:text-sky-200',
                                                                            csf.category === 'operational' &&
                                                                                'bg-[#dcfce7] text-[#15803d] dark:bg-emerald-900/70 dark:text-emerald-200'
                                                                        )}
                                                                    >
                                                                        {csf.category || 'strategic'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <footer
                className="sticky bottom-0 z-20 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white/95 px-6 py-[18px] backdrop-blur md:px-[60px] dark:border-slate-700 dark:bg-slate-900/95"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <div className="text-[13px] font-medium text-[#94a3b8] dark:text-slate-400">
                    Job Definitions: <strong className="text-[#121431] dark:text-slate-100">{jobCount}</strong> roles ready for finalization
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="rounded-lg border-[#e0ddd5] px-8 py-6 font-bold dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                        ← Back to Edit
                    </Button>
                    <Button
                        type="button"
                        onClick={handleFinalize}
                        disabled={isSubmitting}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                    >
                        {isSubmitting ? (
                            'Finalizing...'
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirm & Finalize All Jobs →
                            </>
                        )}
                    </Button>
                </div>
            </footer>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Job Analysis Finalized Successfully!"
                message="You have finalized job analysis. Click OK to continue to Org Chart Mapping."
                nextStepLabel="OK — Continue to Org Chart Mapping"
                onNextStep={() => {
                    setShowSuccessModal(false);
                    onContinue();
                }}
            />
        </div>
    );
}
