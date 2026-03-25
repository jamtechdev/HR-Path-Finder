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
    const [expandedJobKeys, setExpandedJobKeys] = useState<Set<string>>(new Set());
    const [expandedOrg, setExpandedOrg] = useState(false);
    const [expandedMappingIds, setExpandedMappingIds] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<FieldErrors>({});

    const jobEntries = Object.entries(jobDefinitions).filter(([, def]) => def?.job_name);
    const jobsCount = jobEntries.length;
    const orgUnitsCount = orgMappings.filter((u) => (u.org_unit_name ?? '').trim()).length;
    const csfsCount = Object.values(jobDefinitions).reduce((acc, job) => acc + (job.csfs?.length || 0), 0);
    const roleOwnersCount = orgMappings.filter((m) => (m.org_head_name ?? '').trim()).length;
    const policyAnswerCount = Object.keys(policyAnswers).length;

    const toggleJobKey = (key: string) => {
        setExpandedJobKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

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
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431]">
            <div className="flex-1 min-h-0 max-w-[1000px] mx-auto w-full py-10 px-5 pb-8">
                <div className="mb-2" style={{ color: '#b88a44', fontSize: 11, fontWeight: 700, letterSpacing: 1.2 }}>
                    STEP 6 OF 6 – JOB ANALYSIS
                </div>
                <h1 className="m-0 mb-2 text-[#121431]" style={{ fontFamily: "'Pretendard', 'DM Sans', sans-serif", fontSize: 28 }}>
                    Step 6 — Review & Submit
                </h1>
                <p className="text-[#6b7280] text-[15px] mb-8 leading-relaxed">
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
                    <div className="rounded-xl p-5 border border-blue-200 bg-blue-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-0.5">Jobs Defined</p>
                            <p className="text-2xl font-bold text-blue-700">{jobsCount}</p>
                        </div>
                        <FileText className="w-9 h-9 text-blue-600 shrink-0" />
                    </div>
                    <div className="rounded-xl p-5 border border-green-200 bg-green-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-0.5">Org Units Mapped</p>
                            <p className="text-2xl font-bold text-green-700">{orgUnitsCount}</p>
                        </div>
                        <Network className="w-9 h-9 text-green-600 shrink-0" />
                    </div>
                    <div className="rounded-xl p-5 border border-purple-200 bg-purple-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-0.5">CSFs Generated</p>
                            <p className="text-2xl font-bold text-purple-700">{csfsCount}</p>
                        </div>
                        <Target className="w-9 h-9 text-purple-600 shrink-0" />
                    </div>
                    <div className="rounded-xl p-5 border border-orange-200 bg-orange-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-orange-900 uppercase tracking-wide mb-0.5">Role Owners</p>
                            <p className="text-2xl font-bold text-orange-700">{roleOwnersCount}</p>
                        </div>
                        <CheckCircle2 className="w-9 h-9 text-orange-600 shrink-0" />
                    </div>
                </div>

                {/* Policy Snapshot Answers - collapsible */}
                <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden mb-4">
                    <button
                        type="button"
                        onClick={() => setExpandedPolicy(!expandedPolicy)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#6b7280]" />
                            <span className="font-semibold text-[#121431]">Policy Snapshot Answers</span>
                            <span className="text-sm text-[#6b7280]">{policyAnswerCount} Answers</span>
                        </div>
                        {expandedPolicy ? (
                            <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                        )}
                    </button>
                    {expandedPolicy && (
                        <div className="border-t border-[#e5e7eb] px-5 py-4 bg-[#fafafa] space-y-4">
                            {policyEntries.map(([qId, answer], idx) => {
                                const q = questions.find((qu) => qu.id === parseInt(qId, 10));
                                return (
                                    <div key={qId} className="p-4 rounded-lg bg-white border border-[#e5e7eb]">
                                        <p className="text-sm font-medium text-[#121431] mb-2">
                                            {q?.question_text ?? `Question ${idx + 1}`}
                                        </p>
                                        <p className="text-sm text-[#6b7280]">
                                            <span className="font-semibold text-[#374151]">
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
                <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden mb-4">
                    <button
                        type="button"
                        onClick={() => setExpandedJobDefs(!expandedJobDefs)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#6b7280]" />
                            <span className="font-semibold text-[#121431]">Job Definitions ({jobsCount})</span>
                        </div>
                        {expandedJobDefs ? (
                            <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                        )}
                    </button>
                    {expandedJobDefs && (
                        <div className="border-t border-[#e5e7eb] px-5 py-4 bg-[#fafafa] space-y-2">
                            {jobEntries.map(([key, job]) => {
                                const isOpen = expandedJobKeys.has(key);
                                return (
                                    <div key={key} className="rounded-lg border border-[#e5e7eb] bg-white overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => toggleJobKey(key)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9fafb]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-[#6b7280]" />
                                                <span className="font-medium text-[#121431]">{job.job_name}</span>
                                            </div>
                                            {isOpen ? (
                                                <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="border-t border-[#e5e7eb] p-4 space-y-4 text-sm">
                                                {job.job_description && (
                                                    <div>
                                                        <p className="font-semibold text-[#121431] mb-1">Job Description</p>
                                                        <p className="text-[#6b7280] whitespace-pre-wrap">{job.job_description}</p>
                                                    </div>
                                                )}
                                                {job.job_specification && (
                                                    <div>
                                                        <p className="font-semibold text-[#121431] mb-2">Job Specification</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#6b7280]">
                                                            <div><strong>Education:</strong> REQ: {job.job_specification.education?.required || '—'} / PREF: {job.job_specification.education?.preferred || '—'}</div>
                                                            <div><strong>Experience:</strong> REQ: {job.job_specification.experience?.required || '—'} / PREF: {job.job_specification.experience?.preferred || '—'}</div>
                                                            <div><strong>Skills:</strong> REQ: {job.job_specification.skills?.required || '—'} / PREF: {job.job_specification.skills?.preferred || '—'}</div>
                                                            <div><strong>Communication:</strong> REQ: {job.job_specification.communication?.required || '—'} / PREF: {job.job_specification.communication?.preferred || '—'}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {(job.competency_levels?.length ?? 0) > 0 && (
                                                    <div>
                                                        <p className="font-semibold text-[#121431] mb-2">Competency Levels</p>
                                                        <ul className="list-disc pl-4 space-y-1 text-[#6b7280]">
                                                            {job.competency_levels!.map((l, i) => (
                                                                <li key={i}><strong>{l.level}:</strong> {l.description || '—'}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {(job.csfs?.length ?? 0) > 0 && (
                                                    <div>
                                                        <p className="font-semibold text-[#121431] mb-2">Critical Success Factors</p>
                                                        <div className="space-y-2">
                                                            {job.csfs!.map((c, i) => (
                                                                <div key={i} className="p-2 rounded bg-[#f3f4f6]">
                                                                    <p className="font-medium text-[#121431]">{c.name}</p>
                                                                    <p className="text-[#6b7280] text-xs">{c.description || '—'}</p>
                                                                    {(c.strategic_importance || c.category) && (
                                                                        <span className="text-xs text-[#6b7280]">
                                                                            {[c.strategic_importance, c.category].filter(Boolean).join(' · ')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
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

                {/* Organization Chart Mappings - collapsible */}
                {orgMappings.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden mb-4">
                        <button
                            type="button"
                            onClick={() => setExpandedOrg(!expandedOrg)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Network className="w-5 h-5 text-[#6b7280]" />
                                <span className="font-semibold text-[#121431]">Organization Chart Mappings ({orgUnitsCount})</span>
                            </div>
                            {expandedOrg ? (
                                <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-[#6b7280]" />
                            )}
                        </button>
                        {expandedOrg && (
                            <div className="border-t border-[#e5e7eb] px-5 py-4 bg-[#fafafa] space-y-2">
                                {orgMappings.filter((u) => (u.org_unit_name ?? '').trim()).map((mapping) => {
                                    const isOpen = expandedMappingIds.has(mapping.id);
                                    return (
                                        <div key={mapping.id} className="rounded-lg border border-[#e5e7eb] bg-white overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => toggleMapping(mapping.id)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9fafb]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-[#6b7280]" />
                                                    <span className="font-medium text-[#121431]">{mapping.org_unit_name || 'Unnamed unit'}</span>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="border-t border-[#e5e7eb] p-4 space-y-3 text-sm">
                                                    {(mapping.org_head_name || mapping.org_head_title || mapping.org_head_email) && (
                                                        <div>
                                                            <p className="font-semibold text-[#121431] mb-1">Organization Head</p>
                                                            <p className="text-[#6b7280]">
                                                                {mapping.org_head_name || '—'}
                                                                {mapping.org_head_title && ` · ${mapping.org_head_title}`}
                                                                {mapping.org_head_rank && ` (${mapping.org_head_rank})`}
                                                                {mapping.org_head_email && ` · ${mapping.org_head_email}`}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(mapping.job_keyword_ids?.length ?? 0) > 0 && (
                                                        <div>
                                                            <p className="font-semibold text-[#121431] mb-1">Mapped Jobs</p>
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
                                                            <p className="font-semibold text-[#121431] mb-1">Job Specialists</p>
                                                            <ul className="text-[#6b7280] space-y-1">
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
                className="sticky bottom-0 w-full bg-white border-t border-[#e0ddd5] py-[18px] px-6 md:px-[60px] flex flex-wrap items-center justify-between gap-4 z-10 mt-auto"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <p className="text-[13px] text-[#94a3b8] font-medium">
                    Jobs: <strong className="text-[#121431]">{jobsCount}</strong>
                    {' · '}
                    Org units: <strong className="text-[#121431]">{orgUnitsCount}</strong>
                    {' · '}
                    Review above, then submit.
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={processing}
                        className="border-[#e0ddd5] font-bold px-8 py-6 rounded-lg"
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
