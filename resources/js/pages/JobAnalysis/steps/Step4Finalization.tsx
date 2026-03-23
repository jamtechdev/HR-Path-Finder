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
            <div className="min-h-full flex flex-col bg-[#f9f7f2] items-center justify-center p-8">
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

    const reportsTo =
        activeJob?.job_name === 'Accounting'
            ? 'CFO / Finance Director'
            : activeJob?.job_name === 'HR'
            ? 'CHRO / HR Director'
            : '—';

    return (
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431]">
            <div className="flex-1 min-h-0 max-w-[1100px] mx-auto w-full py-10 px-5 pb-8" style={{ padding: '0 20px', margin: '40px auto' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div>
                        <div className="step-label mb-2" style={{ color: '#b88a44', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                            STEP 4 OF 6 — JOB ANALYSIS
                        </div>
                        <h1 className="m-0 mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: 32 }}>
                            Finalization of Job Definitions
                        </h1>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-md border-[#e5e7eb] text-sm px-3 py-1.5">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
                <p className="text-[#6b7280] text-[15px] mb-6 max-w-[900px] leading-relaxed">
                    The job structure and Job Definition documents, reviewed and refined during the Job Definition stage, are finalized below.
                    The finalized job standards are used as baseline inputs for the subsequent design of the performance management system and the compensation system.
                </p>

                <div
                    className="rounded-xl border flex gap-4 p-5 mb-8 text-sm items-start"
                    style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
                >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
                        <Info className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div className="leading-relaxed text-[#1e40af]/90">
                        Once you confirm, <strong className="text-[#121431]">all jobs will be finalized globally.</strong> This is a
                        global confirmation of the entire job configuration — not per-job. Review each job
                        card carefully before proceeding.
                    </div>
                </div>

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
                                        : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#121431]/40 hover:bg-[#fafafa]'
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
                            <div className="pt-10 pb-10 px-6 md:px-10 pr-4 md:pr-10">
                                <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1" style={{ letterSpacing: 1 }}>
                                    JOB PROFILE — CORPORATE & MANAGEMENT SUPPORT
                                </div>
                                <h2
                                    className="mt-2 mb-3 text-white font-bold"
                                    style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)' }}
                                >
                                    {activeJob.job_name}
                                </h2>
                                <p className="opacity-90 max-w-[600px] leading-relaxed m-0 text-[15px]">
                                    {activeJob.job_description || 'No description entered.'}
                                </p>
                                <div className="sm:absolute top-10 right-6 md:right-10 text-right flex flex-col gap-2 min-w-[140px]">
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
                                        HEADCOUNT: <strong className="font-semibold">4 FTE</strong>
                                    </div>
                                    <div
                                        className="rounded px-3 py-2 text-[11px] border shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.12)',
                                            borderColor: 'rgba(255,255,255,0.25)',
                                        }}
                                    >
                                        JOB GRADE: <strong className="font-semibold">Grade 3—5</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* White content card — panels */}
                        <div
                            className="bg-white border border-t-0 rounded-b-xl overflow-hidden"
                            style={{
                                borderColor: '#e5e7eb',
                                padding: '28px 24px 32px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                                {/* Competency Leveling card */}
                                <div
                                    className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-sm"
                                    style={{
                                        borderColor: '#e5e7eb',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="font-bold text-[13px] uppercase tracking-wide text-[#121431]">
                                            COMPETENCY LEVELING
                                        </span>
                                        <span
                                            className="rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#6b7280]"
                                            style={{ background: '#f3f4f6' }}
                                        >
                                            {levels.length} LEVELS
                                        </span>
                                    </div>
                                    {levels.length > 0 ? (
                                        <div className="overflow-x-auto -mx-1">
                                            <table className="w-full border-collapse text-[13px]">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left pb-3 border-b font-medium text-[#6b7280] text-[11px] uppercase" style={{ borderColor: '#e5e7eb' }}>LV</th>
                                                        <th className="text-left pb-3 border-b font-medium text-[#6b7280] text-[11px] uppercase" style={{ borderColor: '#e5e7eb' }}>TITLE</th>
                                                        <th className="text-left pb-3 border-b font-medium text-[#6b7280] text-[11px] uppercase" style={{ borderColor: '#e5e7eb' }}>YEARS</th>
                                                        <th className="text-left pb-3 border-b font-medium text-[#6b7280] text-[11px] uppercase" style={{ borderColor: '#e5e7eb' }}>CORE EXPECTATION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {levels.map((level, idx) => {
                                                        const desc = level.description || '';
                                                        const titlePart = desc.includes(':') ? desc.split(':')[0].trim() : (level.level ? `${level.level}` : '');
                                                        const rest = desc.includes(':') ? desc.split(':').slice(1).join(':').trim() : desc;
                                                        return (
                                                            <tr key={idx} className="border-b last:border-0" style={{ borderColor: '#f3f4f6' }}>
                                                                <td className="py-3.5 align-top">
                                                                    <span
                                                                        className="inline-block px-2 py-1 rounded text-[10px] font-bold text-white"
                                                                        style={{ background: '#121431' }}
                                                                    >
                                                                        {level.level}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 align-top font-semibold text-[#121431]">{titlePart || '—'}</td>
                                                                <td className="py-3.5 align-top text-[#6b7280] text-[12px]">0–2 yrs</td>
                                                                <td className="py-3.5 align-top text-[#6b7280] text-[12px] leading-snug">{rest || '—'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-[13px] text-[#6b7280] py-4">No competency levels defined.</p>
                                    )}
                                </div>

                                {/* Job Specification card */}
                                <div
                                    className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-sm"
                                    style={{
                                        borderColor: '#e5e7eb',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="font-bold text-[13px] uppercase tracking-wide text-[#121431]">
                                            JOB SPECIFICATION
                                        </span>
                                        <span
                                            className="rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#6b7280]"
                                            style={{ background: '#f3f4f6' }}
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
                                            <div
                                                key={key}
                                                className="rounded-lg p-4 border border-[#f3f4f6]"
                                                style={{ background: '#fdfbf7' }}
                                            >
                                                <div className="text-[11px] font-bold uppercase text-[#6b7280] mb-2.5 tracking-wide">
                                                    {label}
                                                </div>
                                                <div className="flex gap-2.5 items-start mb-2 last:mb-0">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: '#e5e7eb', color: '#374151' }}>REQ</span>
                                                    <span className="text-[13px] text-[#374151] leading-snug">{spec?.[key]?.required || '—'}</span>
                                                </div>
                                                <div className="flex gap-2.5 items-start">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>PREF</span>
                                                    <span className="text-[13px] text-[#374151] leading-snug">{spec?.[key]?.preferred || '—'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CSF Matrix section */}
                            <div className="pt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
                                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                                    <span className="text-[13px] font-bold uppercase tracking-wide text-[#6b7280]">
                                        CRITICAL SUCCESS FACTOR MATRIX
                                    </span>
                                    <span className="text-[12px] text-[#9ca3af] font-normal">● Strategic ● Process ● Operational</span>
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
                                            <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: '#e5e7eb', background: '#fafafa' }}>
                                                <p className="text-[13px] text-[#6b7280] m-0">No critical success factors defined for this job.</p>
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
                                                        <div className="text-[11px] font-extrabold mb-3 uppercase tracking-wide" style={{ color: impColor }}>
                                                            ● {imp} IMPORTANCE
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {list.map((csf, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        'p-5 rounded-xl border transition-shadow hover:shadow-sm',
                                                                        csf.category === 'strategic' && 'bg-[#f4f6fb] border-[#dbeafe]',
                                                                        csf.category === 'process' && 'bg-[#f0f7ff] border-[#dbeafe]',
                                                                        csf.category === 'operational' && 'bg-[#f2f9f5] border-[#dcfce7]'
                                                                    )}
                                                                >
                                                                    <div className="font-semibold text-[14px] text-[#121431]">{csf.name}</div>
                                                                    <div className="text-[12px] text-[#6b7280] mt-1 leading-snug">{csf.description || '—'}</div>
                                                                    <span
                                                                        className={cn(
                                                                            'inline-block mt-4 text-[10px] font-bold uppercase px-2 py-1 rounded',
                                                                            csf.category === 'strategic' && 'bg-[#dbeafe] text-[#1e40af]',
                                                                            csf.category === 'process' && 'bg-[#dbeafe] text-[#1e40af]',
                                                                            csf.category === 'operational' && 'bg-[#dcfce7] text-[#15803d]'
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
                className="sticky bottom-0 w-full bg-white border-t border-[#e0ddd5] py-[18px] px-6 md:px-[60px] flex flex-wrap items-center justify-between gap-4 z-10 mt-auto"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <div className="text-[13px] text-[#94a3b8] font-medium">
                    Job Definitions: <strong className="text-[#121431]">{jobCount}</strong> roles ready for finalization
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="border-[#e0ddd5] font-bold px-8 py-6 rounded-lg"
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
