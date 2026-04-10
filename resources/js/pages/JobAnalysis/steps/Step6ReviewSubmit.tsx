import { router } from '@inertiajs/react';
import {
    FileText,
    Network,
    Target,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Shield,
    User,
    Briefcase,
} from 'lucide-react';
import React, { useState } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary, { flattenErrors } from '@/components/Forms/InlineErrorSummary';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import type { PolicyAnswer, JobSelection, JobDefinition, OrgChartMapping } from '../hooks/useJobAnalysisState';

interface Question {
    id: number;
    question_text: string;
    order: number;
}

interface Step6ReviewSubmitProps {
    projectId: number;
    policyAnswers: Record<number, PolicyAnswer>;
    jobSelections: JobSelection;
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    questions?: Question[];
    onBack: () => void;
    fieldErrors?: FieldErrors;
}

export default function Step6ReviewSubmit({
    projectId,
    policyAnswers,
    jobSelections,
    jobDefinitions,
    orgMappings,
    questions = [],
    onBack,
    fieldErrors = {},
}: Step6ReviewSubmitProps) {
    const [processing, setProcessing] = useState(false);
    const [expandedPolicy, setExpandedPolicy] = useState(false);
    const [expandedJobDefs, setExpandedJobDefs] = useState(false);
    const [expandedOrg, setExpandedOrg] = useState(false);
    const [expandedMappingIds, setExpandedMappingIds] = useState<Set<string>>(new Set());
    const [showJobMatrix, setShowJobMatrix] = useState(false);
    const [activeJobKey, setActiveJobKey] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<FieldErrors>({});

    const jobEntries = Object.entries(jobDefinitions).filter(([, def]) => def?.job_name);
    const jobsCount = jobEntries.length;
    const orgUnitsCount = orgMappings.filter((u) => (u.org_unit_name ?? '').trim()).length;
    const csfsCount = Object.values(jobDefinitions).reduce((acc, job) => acc + (job.csfs?.length || 0), 0);
    const roleOwnersCount = orgMappings.filter((m) => (m.org_head_name ?? '').trim()).length;
    const policyAnswerCount = Object.keys(policyAnswers).length;
    const activeMatrixJobKey = activeJobKey || (jobEntries[0]?.[0] ?? '');
    const activeMatrixJob = activeMatrixJobKey ? jobDefinitions[activeMatrixJobKey] : null;

    const toggleMapping = (id: string) => {
        setExpandedMappingIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getJobName = (jobId: number) => {
        const def = Object.values(jobDefinitions).find(
            (d) => d.job_keyword_id === jobId || d.grouped_job_keyword_ids?.includes(jobId)
        );
        return def?.job_name ?? `Job ${jobId}`;
    };

    const handleSubmit = () => {
        if (processing) return;
        setSubmitErr(null);
        setSubmitFieldErrors({});
        if (jobsCount === 0) {
            setSubmitErr('Add at least one job definition before submitting.');
            return;
        }
        setProcessing(true);

        const finalData = {
            policy_answers: Object.entries(policyAnswers).map(([questionId, answer]) => ({
                question_id: parseInt(questionId, 10),
                answer: answer.answer,
                conditional_text: answer.conditional_text ?? null,
            })),
            job_selections: {
                selected_job_keyword_ids: jobSelections?.selected_job_keyword_ids ?? [],
                custom_jobs: jobSelections?.custom_jobs ?? [],
                grouped_jobs: jobSelections?.grouped_jobs ?? [],
            },
            job_definitions: Object.values(jobDefinitions).map((j) => ({
                job_keyword_id: j.job_keyword_id,
                job_name: j.job_name,
                grouped_job_keyword_ids: j.grouped_job_keyword_ids,
                job_description: j.job_description,
                job_specification: j.job_specification,
                competency_levels: j.competency_levels,
                csfs: j.csfs,
            })),
            org_chart_mappings: orgMappings
                .filter((u) => (u.org_unit_name ?? '').trim())
                .map((unit, idx) => ({
                    id: unit.id,
                    parent_id: unit.parentId ?? null,
                    sort_order: unit.sort_order ?? idx,
                    is_kpi_reviewer: !!unit.is_kpi_reviewer,
                    org_unit_name: (unit.org_unit_name ?? '').trim(),
                    job_keyword_ids: unit.job_keyword_ids ?? [],
                    org_head_name: unit.org_head_name ?? null,
                    org_head_rank: unit.org_head_rank ?? null,
                    org_head_title: unit.org_head_title ?? null,
                    org_head_email: unit.org_head_email ?? null,
                    job_specialists: (unit.job_specialists ?? []).map((s) => ({
                        job_keyword_id: s.job_keyword_id,
                        name: s.name,
                        rank: s.rank,
                        title: s.title,
                        email: s.email,
                    })),
                })),
        };

        router.post(`/hr-manager/job-analysis/${projectId}/submit`, finalData, {
            onSuccess: () => {
                setProcessing(false);
                setSubmitted(true);
                toast({
                    title: toastCopy.submitted,
                    description: 'Your job analysis has been submitted. 직무 분석이 제출되었습니다.',
                    variant: 'success',
                    duration: 2000,
                });
            },
            onError: (errors: Record<string, string | string[]>) => {
                const fe: FieldErrors = {};
                if (errors && typeof errors === 'object') {
                    for (const [k, v] of Object.entries(errors)) {
                        if (k === 'message') continue;
                        const m = Array.isArray(v) ? v[0] : v;
                        if (typeof m === 'string' && m) fe[k] = m;
                    }
                }
                setSubmitFieldErrors(fe);
                const lines = flattenErrors(errors);
                setSubmitErr(lines.length ? lines.join(' ') : 'Error submitting. Please try again.');
                setProcessing(false);
            },
        });
    };

    const policyEntries = Object.entries(policyAnswers).sort(([a], [b]) => {
        const orderA = questions.find((q) => q.id === parseInt(a, 10))?.order ?? 999;
        const orderB = questions.find((q) => q.id === parseInt(b, 10))?.order ?? 999;
        return orderA - orderB;
    });

    if (submitted) {
        return (
            <Dialog
                open={submitted}
                onOpenChange={(open) => {
                    if (!open) router.visit('/hr-manager/dashboard');
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-[#48b082] flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">
                            <span className="block">Job analysis submitted</span>
                            <span className="block text-sm font-medium opacity-90 mt-1">직무 분석 제출이 완료되었습니다</span>
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            <span className="block">All data has been submitted successfully. </span>
                            <span className="block opacity-90 mt-1">
                                제출이 완료되었습니다. 아래 요약이 반영되었습니다.
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-2 pb-2 text-sm space-y-2">
                        <div className="flex items-center gap-2 justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">Jobs: {jobsCount}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                            <Network className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Org units: {orgUnitsCount}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold">CSFs: {csfsCount}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                            <User className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold">Role owners: {roleOwnersCount}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
                        <button
                            type="button"
                            onClick={() => router.visit('/hr-manager/dashboard')}
                            className="w-full sm:w-auto h-11 rounded-lg bg-[#121431] hover:bg-[#1e2a4a] text-white font-semibold"
                        >
                            Done
                            <span className="block text-xs opacity-80">대시보드로 이동</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431] dark:bg-slate-950 dark:text-slate-100">
            <div className="flex-1 min-h-0 max-w-[1000px] mx-auto w-full py-10 px-5 pb-8">
                <div className="mb-2 text-[11px] font-bold tracking-[1.2px] text-[#b88a44] dark:text-amber-300">
                    STEP 6 OF 6 – JOB ANALYSIS
                </div>
                <h1 className="m-0 mb-2 text-3xl font-bold text-[#121431] dark:text-slate-100">
                    Step 6 — Review & Submit
                </h1>
                <p className="mb-8 text-[15px] leading-relaxed text-[#6b7280] dark:text-slate-300">
                    Review all collected data before final submission. Once submitted, the Job Analysis step will be completed.
                </p>

                <FieldErrorMessage fieldKey="review-submit" errors={fieldErrors} className="mb-4" />
                {(submitErr || Object.keys(submitFieldErrors).length > 0) && (
                    <div className="mb-6">
                        <InlineErrorSummary message={submitErr} errors={submitFieldErrors} />
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800/60 dark:bg-blue-950/30">
                        <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">Jobs Defined</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{jobsCount}</p>
                        </div>
                        <FileText className="w-9 h-9 text-blue-600 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800/60 dark:bg-green-950/30">
                        <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-green-900 dark:text-green-200">Org Units Mapped</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{orgUnitsCount}</p>
                        </div>
                        <Network className="w-9 h-9 text-green-600 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800/60 dark:bg-purple-950/30">
                        <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-purple-900 dark:text-purple-200">CSFs Generated</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{csfsCount}</p>
                        </div>
                        <Target className="w-9 h-9 text-purple-600 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800/60 dark:bg-orange-950/30">
                        <div>
                            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-orange-900 dark:text-orange-200">Role Owners</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{roleOwnersCount}</p>
                        </div>
                        <CheckCircle2 className="w-9 h-9 text-orange-600 shrink-0" />
                    </div>
                </div>

                {/* Policy Snapshot Answers - collapsible */}
                <div className="mb-4 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={() => setExpandedPolicy(!expandedPolicy)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#fafafa] dark:hover:bg-slate-800/60"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                            <span className="font-semibold text-[#121431] dark:text-slate-100">Policy Snapshot Answers</span>
                            <span className="text-sm text-[#6b7280] dark:text-slate-400">{policyAnswerCount} Answers</span>
                        </div>
                        {expandedPolicy ? (
                            <ChevronDown className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                        )}
                    </button>
                    {expandedPolicy && (
                        <div className="space-y-4 border-t border-[#e5e7eb] bg-[#fafafa] px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                            {policyEntries.map(([qId, answer], idx) => {
                                const q = questions.find((qu) => qu.id === parseInt(qId, 10));
                                return (
                                    <div key={qId} className="rounded-lg border border-[#e5e7eb] bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                        <p className="mb-2 text-sm font-medium text-[#121431] dark:text-slate-100">
                                            {q?.question_text ?? `Question ${idx + 1}`}
                                        </p>
                                        <p className="text-sm text-[#6b7280] dark:text-slate-300">
                                            <span className="font-semibold text-[#374151] dark:text-slate-100">
                                                {answer.answer === 'yes' ? 'Yes' : answer.answer === 'no' ? 'No' : 'Not sure'}
                                            </span>
                                            {answer.conditional_text && (
                                                <span className="block mt-1"> — {answer.conditional_text}</span>
                                            )}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Job Definitions - collapsible with nested jobs */}
                <div className="mb-4 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={() => setExpandedJobDefs(!expandedJobDefs)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#fafafa] dark:hover:bg-slate-800/60"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                            <span className="font-semibold text-[#121431] dark:text-slate-100">Job Definitions ({jobsCount})</span>
                        </div>
                        {expandedJobDefs ? (
                            <ChevronDown className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                        )}
                    </button>
                    {expandedJobDefs && (
                        <div className="space-y-2 border-t border-[#e5e7eb] bg-[#fafafa] px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                            {jobEntries.map(([key, job]) => (
                                <div key={key} className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-[#6b7280] dark:text-slate-400" />
                                            <span className="font-medium text-[#121431] dark:text-slate-100">{job.job_name}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8"
                                            onClick={() => {
                                                setActiveJobKey(key);
                                                setShowJobMatrix(true);
                                            }}
                                        >
                                            Open Job Matrix Card
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showJobMatrix && activeMatrixJob && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-[#f8fafc] px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <div>
                                <h3 className="font-semibold text-[#121431] dark:text-slate-100">Job Matrix Card</h3>
                                <p className="text-xs text-[#6b7280] dark:text-slate-400">
                                    {activeMatrixJob.job_name} · Stage 3 draft data (editable preview for confirmation)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowJobMatrix(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-5 text-sm md:grid-cols-2">
                            <div>
                                <p className="mb-1 text-xs text-[#6b7280] dark:text-slate-400">Job Name</p>
                                <div className="rounded border bg-[#fafafa] px-3 py-2 dark:border-slate-700 dark:bg-slate-900">{activeMatrixJob.job_name}</div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-[#6b7280] dark:text-slate-400">Job Code</p>
                                <div className="rounded border bg-[#fafafa] px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                    {activeMatrixJob.job_keyword_id ?? '—'}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="mb-1 text-xs text-[#6b7280] dark:text-slate-400">Job Purpose</p>
                                <div className="whitespace-pre-wrap rounded border bg-[#fafafa] px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                    {activeMatrixJob.job_description || '—'}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="mb-1 text-xs text-[#6b7280] dark:text-slate-400">Competency Levels</p>
                                <div className="overflow-hidden rounded border bg-[#fafafa] dark:border-slate-700 dark:bg-slate-900">
                                    <table className="w-full text-xs">
                                        <thead className="bg-[#f1f5f9] dark:bg-slate-800">
                                            <tr>
                                                <th className="text-left px-2 py-1.5">Level</th>
                                                <th className="text-left px-2 py-1.5">Expected Behavior</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(activeMatrixJob.competency_levels || []).map((lv, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-2 py-1.5">{lv.level || `Lv.${idx + 1}`}</td>
                                                    <td className="px-2 py-1.5">{lv.description || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="mb-1 text-xs text-[#6b7280] dark:text-slate-400">CSFs</p>
                                <div className="rounded border bg-[#fafafa] px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                    {(activeMatrixJob.csfs || []).length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-1">
                                            {(activeMatrixJob.csfs || []).map((c, idx) => (
                                                <li key={idx}>{c.name || '—'}{c.description ? ` — ${c.description}` : ''}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span>—</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Organization Chart Mappings - collapsible */}
                {orgMappings.length > 0 && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setExpandedOrg(!expandedOrg)}
                            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#fafafa] dark:hover:bg-slate-800/60"
                        >
                            <div className="flex items-center gap-3">
                                <Network className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                                <span className="font-semibold text-[#121431] dark:text-slate-100">Organization Chart Mappings ({orgUnitsCount})</span>
                            </div>
                            {expandedOrg ? (
                                <ChevronDown className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-[#6b7280] dark:text-slate-400" />
                            )}
                        </button>
                        {expandedOrg && (
                            <div className="space-y-2 border-t border-[#e5e7eb] bg-[#fafafa] px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                                {orgMappings.filter((u) => (u.org_unit_name ?? '').trim()).map((mapping) => {
                                    const isOpen = expandedMappingIds.has(mapping.id);
                                    return (
                                        <div key={mapping.id} className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white dark:border-slate-700 dark:bg-slate-900">
                                            <button
                                                type="button"
                                                onClick={() => toggleMapping(mapping.id)}
                                                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f9fafb] dark:hover:bg-slate-800/60"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-[#6b7280] dark:text-slate-400" />
                                                    <span className="font-medium text-[#121431] dark:text-slate-100">{mapping.org_unit_name || 'Unnamed unit'}</span>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4 text-[#6b7280] dark:text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-[#6b7280] dark:text-slate-400" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="space-y-3 border-t border-[#e5e7eb] p-4 text-sm dark:border-slate-700">
                                                    {(mapping.org_head_name || mapping.org_head_title || mapping.org_head_email) && (
                                                        <div>
                                                            <p className="mb-1 font-semibold text-[#121431] dark:text-slate-100">Organization Head</p>
                                                            <p className="text-[#6b7280] dark:text-slate-300">
                                                                {mapping.org_head_name || '—'}
                                                                {mapping.org_head_title && ` · ${mapping.org_head_title}`}
                                                                {mapping.org_head_rank && ` (${mapping.org_head_rank})`}
                                                                {mapping.org_head_email && ` · ${mapping.org_head_email}`}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(mapping.job_keyword_ids?.length ?? 0) > 0 && (
                                                        <div>
                                                            <p className="mb-1 font-semibold text-[#121431] dark:text-slate-100">Mapped Jobs</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {mapping.job_keyword_ids!.map((jobId) => (
                                                                    <span
                                                                        key={jobId}
                                                                        className="px-2.5 py-1 rounded-full bg-[#121431] text-white text-xs font-medium"
                                                                    >
                                                                        {getJobName(jobId)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(mapping.job_specialists?.length ?? 0) > 0 && (
                                                        <div>
                                                            <p className="mb-1 font-semibold text-[#121431] dark:text-slate-100">Job Specialists</p>
                                                            <ul className="space-y-1 text-[#6b7280] dark:text-slate-300">
                                                                {mapping.job_specialists!.map((s, i) => (
                                                                    <li key={i}>
                                                                        {getJobName(s.job_keyword_id)}: {s.name}
                                                                        {s.title && ` · ${s.title}`}
                                                                        {s.email && ` · ${s.email}`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {jobsCount === 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-900 font-semibold text-sm">
                            No jobs have been finalized. Please go back to Finalization to complete at least one job.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer — same bar as Org Chart Mapping / Policy Snapshot steps */}
            <footer
                className="sticky bottom-0 z-10 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white px-6 py-[18px] md:px-[60px] dark:border-slate-700 dark:bg-slate-900"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <p className="text-[13px] font-medium text-[#94a3b8] dark:text-slate-400">
                    Jobs: <strong className="text-[#121431] dark:text-slate-100">{jobsCount}</strong>
                    {' · '}
                    Org units: <strong className="text-[#121431] dark:text-slate-100">{orgUnitsCount}</strong>
                    {' · '}
                    Review above, then submit.
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={processing}
                        className="rounded-lg border-[#e0ddd5] px-8 py-6 font-bold dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                        ← Back
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                    >
                        {processing ? 'Submitting...' : 'Submit Job Analysis'}
                    </Button>
                </div>
            </footer>
        </div>
    );
}
