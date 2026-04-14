import {
    ChevronLeft,
    ChevronRight,
    Check,
    Info,
    LayoutGrid,
    Circle,
    Zap,
    X,
    Target,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MBO_COLOR = '#f97316';
const MBO_PALE = '#fff7ed';
const MBO_BORDER = '#fed7aa';
const BSC_COLOR = '#3b82f6';
const BSC_PALE = '#eff6ff';
const BSC_BORDER = '#bfdbfe';
const OKR_COLOR = '#7c3aed';
const OKR_PALE = '#ede9fe';
const OKR_BORDER = '#c4b5fd';
const AMBER_PALE = '#fffbeb';
const AMBER_BORDER = '#fde68a';

const MODEL_INFO: Record<string, { title: string; sub: string; color: string; colorPale: string; features: string[]; suitable: string[]; examples: { objLabel: string; krLabel: string; obj: string; kr: string }[] }> = {
    mbo: {
        title: 'MBO — Management by Objectives',
        sub: 'Goal Management',
        color: MBO_COLOR,
        colorPale: MBO_PALE,
        features: [
            'A top-down goal management approach where managers and employees jointly agree on individual objectives, evaluated at the end of the period based on achievement',
            'Objectives are written in specific, measurable form (SMART criteria) and confirmed through prior agreement between evaluator and evaluatee',
            'Operates on a semi-annual or annual cycle, with a Mid-year Review and a Year-end Review',
            'Achievement rate against targets (e.g., 80%, 100%, 120%) determines the rating, directly linked to performance reviews, compensation, and promotion',
        ],
        suitable: [
            'Sales — Roles with clearly defined numeric targets such as revenue, new customer count, and contracts closed',
            'Manufacturing — Roles where quantitative KPIs like output volume, defect rate, and on-time delivery are straightforward to measure',
            'Operations & Logistics — Roles centered on repetitive, structured work such as case volume, cost savings, and SLA compliance',
        ],
        examples: [
            { objLabel: 'Goal 1', krLabel: 'Target', obj: 'Achieve Sales Revenue Target', kr: 'Reach 100%+ of individual semi-annual sales target of ₩800M' },
            { objLabel: 'Goal 2', krLabel: 'Target', obj: 'Increase New Customer Acquisition', kr: 'Acquire 15+ new enterprise clients' },
        ],
    },
    bsc: {
        title: 'BSC — Balanced Scorecard',
        sub: 'Multi-Perspective Performance Management',
        color: BSC_COLOR,
        colorPale: BSC_PALE,
        features: [
            'Evaluates performance across four perspectives: Financial, Customer, Internal Process, and Learning & Growth',
            'Prevents over-focus on short-term financial results by balancing multiple dimensions',
            'Each perspective has its own KPIs, weighted and aggregated into a final score',
            'Suitable for roles requiring strategic alignment and balanced performance across multiple areas',
        ],
        suitable: [
            'HR — Roles balancing employee satisfaction, retention, training completion, and cost efficiency',
            'Finance — Roles managing budget accuracy, reporting quality, process improvement, and stakeholder communication',
            'Business Support — Roles requiring cross-functional coordination and balanced outcomes',
        ],
        examples: [
            { objLabel: 'Financial', krLabel: 'KPI', obj: 'Cost Management', kr: 'Maintain budget variance within ±5%' },
            { objLabel: 'Customer', krLabel: 'KPI', obj: 'Service Quality', kr: 'Achieve 90%+ internal satisfaction score' },
        ],
    },
    okr: {
        title: 'OKR — Objectives & Key Results',
        sub: 'Ambitious Goal-Driven Framework',
        color: OKR_COLOR,
        colorPale: OKR_PALE,
        features: [
            'Set ambitious Objectives with 3–5 measurable Key Results per objective',
            'Encourages stretch goals; 70% achievement is considered successful',
            'Operates on quarterly cycles with frequent check-ins and adjustments',
            'Promotes transparency and alignment across teams and individuals',
        ],
        suitable: [
            'R&D / Engineering — Roles focused on innovation, product development, and technical excellence',
            'Strategy / Planning — Roles driving organizational transformation and strategic initiatives',
            'IT / Tech — Roles requiring agility, experimentation, and rapid iteration',
        ],
        examples: [
            { objLabel: 'Objective', krLabel: 'KR 1', obj: 'Launch Next-Gen Platform', kr: 'Deploy MVP to 100+ beta users' },
            { objLabel: '', krLabel: 'KR 2', obj: '', kr: 'Achieve 85%+ user satisfaction score' },
        ],
    },
};

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
    job_keyword?: { id: number; name: string };
}

interface ModelGuidance {
    concept?: string;
    key_characteristics?: string;
    best_fit_organizations?: string;
}

interface OrgKpi {
    id?: number;
    linked_job_id?: number;
    kpi_name?: string;
    organization_name?: string;
}

interface Props {
    project: { id: number };
    jobDefinitions?: JobDefinition[];
    organizationalKpis?: OrgKpi[];
    evaluationModelAssignments?: { job_definition_id: number; evaluation_model: string }[];
    modelGuidance?: { mbo?: ModelGuidance; bsc?: ModelGuidance; okr?: ModelGuidance };
    jobRecommendations?: Record<number, 'mbo' | 'bsc' | 'okr'>;
    onContinue: (assignments: Record<number, 'mbo' | 'bsc' | 'okr'>) => void;
    onBack?: () => void;
    fieldErrors?: FieldErrors;
}

export default function EvaluationModelAssignmentTab({
    project,
    jobDefinitions = [],
    organizationalKpis = [],
    evaluationModelAssignments = [],
    modelGuidance = {},
    jobRecommendations = {},
    onContinue,
    onBack,
    fieldErrors = {},
}: Props) {
    const { t } = useTranslation();
    const [inlineMsg, setInlineMsg] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<Record<number, 'mbo' | 'bsc' | 'okr'>>({});
    const [modelModal, setModelModal] = useState<'mbo' | 'bsc' | 'okr' | null>(null);
    const [kpiModalJob, setKpiModalJob] = useState<JobDefinition | null>(null);
    const BULK_ALL = '__all__';
    const [bulkDept, setBulkDept] = useState(BULK_ALL);
    const [bulkModel, setBulkModel] = useState<string>('');

    useEffect(() => {
        const initial: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        const seenJobs = new Set<number>();
        (evaluationModelAssignments || []).forEach((a: any) => {
            const jid = a.job_definition_id;
            if (jid == null || seenJobs.has(jid)) return;
            seenJobs.add(jid);
            const model = (a.evaluation_model || '').toLowerCase();
            if (model === 'mbo' || model === 'bsc' || model === 'okr') {
                initial[jid] = model;
            }
        });
        if (Object.keys(initial).length > 0) {
            setAssignments(initial);
            return;
        }
        jobDefinitions.forEach((job) => {
            if (job?.id != null && job.job_keyword_id && jobRecommendations[job.job_keyword_id]) {
                initial[job.id] = jobRecommendations[job.job_keyword_id];
            }
        });
        setAssignments(initial);
    }, [jobDefinitions, jobRecommendations, evaluationModelAssignments]);

    const { uniqueJobDefinitions, keyToRepId } = useMemo(() => {
        const keyToRep = new Map<string, number>();
        const byKey = new Map<string, JobDefinition>();
        jobDefinitions.forEach((j) => {
            if (j?.id == null) return;
            const name = (j.job_name ?? '').trim();
            const dept = (j.job_keyword?.name ?? '').trim();
            const key = `${name}::${dept}`;
            if (!byKey.has(key)) {
                byKey.set(key, j);
                keyToRep.set(key, j.id);
            }
        });
        const keyToRepId: Record<string, number> = {};
        keyToRep.forEach((id, k) => { keyToRepId[k] = id; });
        return { uniqueJobDefinitions: Array.from(byKey.values()), keyToRepId };
    }, [jobDefinitions]);

    const kpisByJobId = useMemo(() => {
        const map: Record<number, OrgKpi[]> = {};
        const seen = new Map<number, Set<string>>();
        (organizationalKpis || []).forEach((k) => {
            const jobId = k.linked_job_id;
            if (jobId == null) return;
            const key = k.id != null ? `id:${k.id}` : `name:${(k.organization_name ?? '')}::${(k.kpi_name ?? '')}`;
            if (!seen.has(jobId)) seen.set(jobId, new Set());
            if (seen.get(jobId)!.has(key)) return;
            seen.get(jobId)!.add(key);
            if (!map[jobId]) map[jobId] = [];
            map[jobId].push(k);
        });
        return map;
    }, [organizationalKpis]);

    const departments = useMemo(() => {
        const set = new Set<string>();
        uniqueJobDefinitions.forEach((j) => {
            const kw = j.job_keyword?.name?.trim();
            if (kw) set.add(kw);
        });
        return Array.from(set);
    }, [uniqueJobDefinitions]);

    const assignedCount = Object.keys(assignments).filter((id) => assignments[Number(id)]).length;
    const totalCount = uniqueJobDefinitions.length;

    const assignModel = (jobId: number, model: 'mbo' | 'bsc' | 'okr') => {
        setInlineMsg(null);
        setAssignments((prev) => {
            const next = { ...prev };
            if (prev[jobId] === model) {
                delete next[jobId];
                return next;
            }
            next[jobId] = model;
            return next;
        });
    };

    const applyBulk = () => {
        setInlineMsg(null);
        if (!bulkModel || bulkModel === '') {
            setInlineMsg('Please select a model for bulk assignment.');
            return;
        }
        const model = bulkModel.toLowerCase() as 'mbo' | 'bsc' | 'okr';
        setAssignments((prev) => {
            const next = { ...prev };
            uniqueJobDefinitions.forEach((job) => {
                const deptMatch = bulkDept === BULK_ALL || job.job_keyword?.name === bulkDept;
                if (deptMatch) {
                    next[job.id] = model;
                }
            });
            return next;
        });
    };

    const handleContinue = () => {
        setInlineMsg(null);
        const expanded: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        jobDefinitions.forEach((j) => {
            if (j?.id == null) return;
            const key = `${(j.job_name ?? '').trim()}::${(j.job_keyword?.name ?? '').trim()}`;
            const repId = keyToRepId[key];
            if (repId != null && assignments[repId]) expanded[j.id] = assignments[repId];
        });
        onContinue(expanded);
    };

    const mboGuidance = modelGuidance.mbo || { concept: 'Set individual objectives and evaluate performance based on achievement rate.', best_fit_organizations: 'Sales · Manufacturing · Operations' };
    const bscGuidance = modelGuidance.bsc || { concept: 'Align organizational strategy across four perspectives: Financial, Customer, Process, and Learning.', best_fit_organizations: 'HR · Finance · Business Support' };
    const okrGuidance = modelGuidance.okr || { concept: 'Track ambitious performance through Objectives and measurable Key Results.', best_fit_organizations: 'R&D · Strategy · IT/Engineering' };

    const mboJobs = uniqueJobDefinitions.filter((j) => assignments[j.id] === 'mbo');
    const bscJobs = uniqueJobDefinitions.filter((j) => assignments[j.id] === 'bsc');
    const okrJobs = uniqueJobDefinitions.filter((j) => assignments[j.id] === 'okr');

    return (
        <div className="min-h-full flex flex-col bg-[#f0f3f8] dark:bg-slate-950 dark:text-slate-100">
            <div className="flex-1 py-5 sm:px-6 pb-[100px]">
                <div className="max-w-[1200px] mx-auto grid gap-4 grid-cols-1 xl:grid-cols-[1fr_260px]">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <InlineErrorSummary message={inlineMsg} className="mb-2" />
                        <p className="mb-0.5 text-[15px] font-bold text-[#1a2b4a] dark:text-slate-100">{t('performance_system_model_assignment.title')}</p>
                        <p className="mb-4 text-xs text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.subtitle')}</p>

                        {/* Model reference cards */}
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                            {(['mbo', 'bsc', 'okr'] as const).map((model) => {
                                const concept = model === 'mbo' ? mboGuidance.concept : model === 'bsc' ? bscGuidance.concept : okrGuidance.concept;
                                const badgeClass = model === 'mbo' ? 'bg-[#fff7ed] text-[#f97316] border-[#fed7aa]' : model === 'bsc' ? 'bg-[#eff6ff] text-[#3b82f6] border-[#bfdbfe]' : 'bg-[#ede9fe] text-[#7c3aed] border-[#c4b5fd]';
                                return (
                                    <div key={model} className="rounded-[14px] border border-[#e2e8f0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                                        <div className="flex items-center justify-between flex-wrap mb-2">
                                            <span className={cn('text-[13px] font-extrabold px-3 py-0.5 rounded-lg border', badgeClass)}>{model.toUpperCase()}</span>
                                            <Button variant="outline" size="sm" className="h-7 rounded-full border-[#e2e8f0] px-2 text-[10.5px] font-semibold text-[#94a3b8] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setModelModal(model)}>{t('common.view')}</Button>
                                        </div>
                                        <p className="text-[11.5px] leading-snug text-[#64748b] dark:text-slate-300">{concept}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bulk bar */}
                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <span className="text-xs font-semibold text-[#1a2b4a] dark:text-slate-100">{t('performance_system_model_assignment.bulk_assign')}</span>
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <Select value={bulkDept} onValueChange={setBulkDept}>
                                    <SelectTrigger className="h-8 w-full rounded-lg border-[#e2e8f0] bg-[#f0f3f8] text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:w-[140px]"> <SelectValue placeholder={t('performance_system_model_assignment.all_roles')} /> </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={BULK_ALL}>{t('performance_system_model_assignment.all_roles')}</SelectItem>
                                        {departments.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-[#94a3b8] dark:text-slate-300">→</span>
                                <Select value={bulkModel} onValueChange={setBulkModel}>
                                    <SelectTrigger className="h-8 w-full rounded-lg border-[#e2e8f0] bg-[#f0f3f8] text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:w-[140px]"> <SelectValue placeholder={t('performance_system_model_assignment.select_model')} /> </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mbo">MBO</SelectItem>
                                        <SelectItem value="bsc">BSC</SelectItem>
                                        <SelectItem value="okr">OKR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyBulk} className="bg-[#1a2b4a] hover:bg-[#2e4270] text-white text-xs font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> {t('performance_system_model_assignment.bulk_assign')}
                            </Button>
                        </div>

                        {/* Job table */}
                        <div className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white dark:border-slate-700 dark:bg-slate-900">
                            <div className="hidden items-center gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:grid" style={{ gridTemplateColumns: '1fr auto 180px' }}>
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.table.job_role')}</span>
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.table.linked_kpi')}</span>
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.table.performance_model')}</span>
                            </div>
                            <div className="divide-y divide-[#f1f5f9] dark:divide-slate-700">
                                {uniqueJobDefinitions.map((job) => {
                                    const assigned = assignments[job.id];
                                    const kpis = kpisByJobId[job.id] || [];
                                    const hasKpis = kpis.length > 0;
                                    return (
                                        <div
                                            key={job.id}
                                            className={cn(
                                                'flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-[#fafbfd] dark:hover:bg-slate-800/40 sm:grid sm:items-center',
                                                assigned === 'mbo' && 'border-l-[3px] border-l-[#f97316]',
                                                assigned === 'bsc' && 'border-l-[3px] border-l-[#3b82f6]',
                                                assigned === 'okr' && 'border-l-[3px] border-l-[#7c3aed]',
                                                !assigned && 'border-l-[3px] border-l-[#e2e8f0] dark:border-l-slate-700'
                                            )}
                                            style={{ gridTemplateColumns: '1fr auto 180px' }}
                                        >
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#1a2b4a] dark:text-slate-100">{job.job_name}</p>
                                                {(() => {
                                                    const dept = job.job_keyword?.name?.trim() ?? '';
                                                    const sameAsName = dept && job.job_name?.trim() === dept;
                                                    if (sameAsName) return null;
                                                    return <p className="text-[11px] text-[#94a3b8] dark:text-slate-400">{dept || '—'}</p>;
                                                })()}
                                            </div>
                                            <div>
                                                {hasKpis ? (
                                                    <Button variant="outline" size="sm" className="h-7 gap-1 rounded-full border-[#e2e8f0] bg-[#f0f3f8] text-[10.5px] font-semibold text-[#94a3b8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => setKpiModalJob(job)}>
                                                        <Target className="w-2.5 h-2.5" /> + KPI
                                                    </Button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10.5px] text-[#94a3b8] dark:text-slate-400">
                                                        <X className="w-2.5 h-2.5 opacity-45" /> {t('performance_system_model_assignment.no_kpi_linked')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                {(['mbo', 'bsc', 'okr'] as const).map((m) => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => assignModel(job.id, m)}
                                                        className={cn(
                                                            'flex-1 py-1.5 text-[11.5px] font-bold rounded-lg border text-center transition-all',
                                                            assigned === m
                                                                ? m === 'mbo'
                                                                    ? 'bg-[#fff7ed] border-[#f97316] text-[#f97316]'
                                                                    : m === 'bsc'
                                                                    ? 'bg-[#eff6ff] border-[#3b82f6] text-[#3b82f6]'
                                                                    : 'bg-[#ede9fe] border-[#7c3aed] text-[#7c3aed]'
                                                                : 'bg-[#f0f3f8] border-[#e2e8f0] text-[#94a3b8] hover:border-[#b0bec5] hover:text-[#64748b] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100'
                                                        )}
                                                    >
                                                        {m.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                            <FieldErrorMessage
                                                fieldKey={`model-job-${job.id}`}
                                                errors={fieldErrors}
                                                className="sm:col-span-3 pl-0 sm:px-4"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[12.5px] font-bold text-[#1a2b4a] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                                <Check className="w-3.5 h-3.5 text-[#2ec4a0]" /> {t('performance_system_model_assignment.assigned_mapping_summary')}
                            </div>
                            <div className="p-4 flex flex-col gap-2.5">
                                {['mbo', 'bsc', 'okr'].map((m) => {
                                    const jobs = m === 'mbo' ? mboJobs : m === 'bsc' ? bscJobs : okrJobs;
                                    const badgeClass = m === 'mbo' ? 'bg-[#fff7ed] text-[#f97316]' : m === 'bsc' ? 'bg-[#eff6ff] text-[#3b82f6]' : 'bg-[#ede9fe] text-[#7c3aed]';
                                    return (
                                        <div key={m} className="flex items-start gap-2">
                                            <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-md flex-shrink-0', badgeClass)}>{m.toUpperCase()}</span>
                                            <div className="flex flex-wrap gap-1">
                                                {jobs.length > 0 ? jobs.map((j) => (
                                                    <span key={j.id} className="rounded-full border border-[#e2e8f0] bg-[#f0f3f8] px-2 py-0.5 text-[11px] text-[#64748b] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">{j.job_name}</span>
                                                )) : <span className="text-[11.5px] italic text-[#94a3b8] dark:text-slate-400">{t('performance_system_model_assignment.unassigned')}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Guide + Note */}
                    <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
                        <div className="overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2 border-b border-[#e2e8f0] bg-[#f1f5f9] px-4 py-3 text-[12.5px] font-bold text-[#1a2b4a] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                                <Info className="w-3.5 h-3.5 text-[#2ec4a0]" /> {t('performance_system_model_assignment.model_selection_guide')}
                            </div>
                            <div className="space-y-0 divide-y divide-[#eef2f7] p-3 dark:divide-slate-700">
                                <div className="flex gap-2.5 py-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-[#fff7ed] flex items-center justify-center flex-shrink-0">
                                        <Circle className="w-3.5 h-3.5 text-[#f97316]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1a2b4a] dark:text-slate-100">MBO</p>
                                        <p className="mt-0.5 text-[11px] leading-snug text-[#64748b] dark:text-slate-300">{mboGuidance.concept}</p>
                                        <p className="mt-1 text-[10.5px] text-[#94a3b8] dark:text-slate-400">{t('performance_system_model_assignment.recommended')}: <span className="font-semibold text-[#f97316]">{mboGuidance.best_fit_organizations}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 py-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                                        <LayoutGrid className="w-3.5 h-3.5 text-[#3b82f6]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1a2b4a] dark:text-slate-100">BSC</p>
                                        <p className="mt-0.5 text-[11px] leading-snug text-[#64748b] dark:text-slate-300">{bscGuidance.concept}</p>
                                        <p className="mt-1 text-[10.5px] text-[#94a3b8] dark:text-slate-400">{t('performance_system_model_assignment.recommended')}: <span className="font-semibold text-[#3b82f6]">{bscGuidance.best_fit_organizations}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 py-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-3.5 h-3.5 text-[#7c3aed]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1a2b4a] dark:text-slate-100">OKR</p>
                                        <p className="mt-0.5 text-[11px] leading-snug text-[#64748b] dark:text-slate-300">{okrGuidance.concept}</p>
                                        <p className="mt-1 text-[10.5px] text-[#94a3b8] dark:text-slate-400">{t('performance_system_model_assignment.recommended')}: <span className="font-semibold text-[#7c3aed]">{okrGuidance.best_fit_organizations}</span></p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-1 border-t border-[#eef2f7] px-3 pb-3 pt-2 text-[10.5px] leading-snug text-[#94a3b8] dark:border-slate-700 dark:text-slate-400">
                                {t('performance_system_model_assignment.guide_note_1')} <strong className="text-[#1a2b4a] dark:text-slate-100">{t('performance_system_model_assignment.same_model')}</strong> {t('performance_system_model_assignment.guide_note_2')}
                            </p>
                        </div>
                        <div className="rounded-[14px] border border-[#fde68a] bg-[#fffbeb] p-4 dark:border-amber-700 dark:bg-amber-950/20">
                            <p className="mb-2 text-xs font-bold text-[#92400e] dark:text-amber-200">{t('common.note')}</p>
                            <p className="text-[11.5px] leading-relaxed text-[#78350f] dark:text-amber-100">
                                Pathfinder&apos;s suggestions are <strong>general recommendations</strong>, not definitive answers. Consider your organization&apos;s <strong>job characteristics, evaluation culture, and operational context</strong> before finalizing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <footer className="fixed bottom-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-[#e2e8f0] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-slate-700 dark:bg-slate-900/95">
                <span className="text-xs text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.assigned')}: <strong className="text-[#1a2b4a] dark:text-slate-100">{assignedCount}</strong> / <strong className="text-[#1a2b4a] dark:text-slate-100">{totalCount}</strong> {t('performance_system_model_assignment.roles')}</span>
                <div className="flex gap-2">
                    {onBack && (
                        <Button variant="outline" onClick={onBack} className="rounded-lg border-[#e2e8f0] font-medium text-[#64748b] hover:border-[#1a2b4a] hover:text-[#1a2b4a] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> {t('common.back')}
                        </Button>
                    )}
                    <Button onClick={handleContinue} className="bg-[#1a2b4a] hover:bg-[#2e4270] text-white rounded-lg font-semibold px-4 sm:px-5 text-xs sm:text-sm">
                        <span className="hidden sm:inline">{t('performance_system_model_assignment.continue_to_structure')}</span>
                        <span className="sm:hidden">{t('common.continue')}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                </div>
            </footer>

            {/* Model detail modal */}
            <Dialog open={!!modelModal} onOpenChange={() => setModelModal(null)}>
                <DialogContent className="w-full max-w-[520px] overflow-hidden rounded-[18px] p-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {modelModal && (() => {
                        const info = MODEL_INFO[modelModal];
                        if (!info) return null;
                        return (
                            <>
                                <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-[#e2e8f0] p-5 pb-4 dark:border-slate-700">
                                    <div>
                                        <DialogTitle className="text-[15px] font-bold text-[#1a2b4a] dark:text-slate-100">{info.title}</DialogTitle>
                                        <p className="mt-0.5 text-[11.5px] text-[#94a3b8] dark:text-slate-300">{info.sub}</p>
                                    </div>
                                </DialogHeader>
                                <div className="p-5 pt-4 space-y-5 max-h-[70vh] overflow-y-auto">
                                    <div>
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.modal.key_features')}</p>
                                        <div className="space-y-2">
                                            {info.features.map((f, i) => (
                                                <div key={i} className="flex gap-2 text-xs leading-snug text-[#64748b] dark:text-slate-300">
                                                    <span className="font-extrabold flex-shrink-0" style={{ color: info.color }}>{i + 1}.</span>
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.modal.best_suited_for')}</p>
                                        <div className="space-y-1.5">
                                            {info.suitable.map((s, i) => (
                                                <div key={i} className="flex gap-2 items-start">
                                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: info.color }} />
                                                    <span className="text-[11.5px] leading-snug text-[#64748b] dark:text-slate-300">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{t('performance_system_model_assignment.modal.example_structure')}</p>
                                        <div className="space-y-2">
                                            {info.examples.map((ex, i) => (
                                                <div key={i} className="rounded-lg border p-2.5 dark:bg-slate-800/60 dark:border-slate-700" style={{ background: info.colorPale, borderColor: `${info.color}33` }}>
                                                    {ex.objLabel && <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: info.color }}>{ex.objLabel}</p>}
                                                    {ex.obj && <p className="mb-1 text-xs font-semibold text-[#1a2b4a] dark:text-slate-100">{ex.obj}</p>}
                                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-300">{ex.krLabel}</p>
                                                    <p className="text-[11.5px] text-[#64748b] dark:text-slate-300">{ex.kr}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* KPI modal */}
            <Dialog open={!!kpiModalJob} onOpenChange={() => setKpiModalJob(null)}>
                <DialogContent className="w-full max-w-[400px] overflow-hidden rounded-[18px] p-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {kpiModalJob && (
                        <>
                            <DialogHeader className="flex flex-row items-start justify-between border-b border-[#e2e8f0] p-5 pb-4 dark:border-slate-700">
                                <div>
                                    <DialogTitle className="text-[15px] font-bold text-[#1a2b4a] dark:text-slate-100">{kpiModalJob.job_name}</DialogTitle>
                                    <p className="mt-0.5 text-[11.5px] text-[#94a3b8] dark:text-slate-300">{kpiModalJob.job_keyword?.name ?? '—'}</p>
                                </div>
                            </DialogHeader>
                            <div className="p-5">
                                <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] after:h-px after:flex-1 after:bg-[#e2e8f0] after:content-[''] dark:text-slate-300 dark:after:bg-slate-700">{t('performance_system_model_assignment.modal.linked_org_kpis')}</p>
                                <div className="space-y-2">
                                    {(kpisByJobId[kpiModalJob.id] || []).map((kpi, i) => (
                                        <div key={i} className="flex items-start gap-2.5 rounded-lg border border-[#e2e8f0] bg-[#f0f3f8] p-2.5 dark:border-slate-700 dark:bg-slate-800">
                                            <span className="w-5 h-5 rounded-md bg-[#1a2b4a] text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                            <span className="text-[13px] font-semibold text-[#1a2b4a] dark:text-slate-100">{kpi.kpi_name ?? '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
