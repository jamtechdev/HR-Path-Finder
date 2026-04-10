import {
    FileText,
    Target,
    Settings,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Pencil,
    Download,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatEvalSummary, type FormatEvalSummaryResult } from './ReviewSubmitTab.formatter';
import { useTranslation } from 'react-i18next';

// ─── Chip helpers (match prototype) ─────────────────────────────────────────
function Chip({ children, variant = 'navy' }: { children: React.ReactNode; variant?: 'green' | 'blue' | 'amber' | 'navy' | 'red' | 'purple' | 'empty' }) {
    return <span className={cn('chip', variant)}>{children}</span>;
}

// ─── Snapshot question type ─────────────────────────────────────────────────
interface SnapshotQuestion {
    id: number;
    question_text: string;
    options?: string[];
    order?: number;
}

interface Props {
    projectId: number;
    snapshotQuestions?: SnapshotQuestion[];
    snapshotResponses?: Record<number, { response: string[]; text_response?: string }>;
    organizationalKpis?: any[];
    evaluationModelAssignments?: any[];
    evaluationStructure?: any;
    orgChartMappings?: { org_unit_name?: string; org_head_name?: string }[];
    onBack: () => void;
    onSubmit: () => void;
    onGoToStep?: (tab: 'performance-snapshot' | 'kpi-review' | 'model-assignment' | 'evaluation-structure') => void;
}

export default function PerformanceSystemReviewSubmit({
    projectId,
    snapshotQuestions = [],
    snapshotResponses = {},
    organizationalKpis = [],
    evaluationModelAssignments = [],
    evaluationStructure,
    orgChartMappings = [],
    onBack,
    onSubmit,
    onGoToStep,
}: Props) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);
    const [showMissingError, setShowMissingError] = useState(false);
    const tr = (value?: string | null) => {
        const raw = String(value ?? '').trim();
        if (!raw) return '—';
        return t(raw, { defaultValue: raw });
    };

    const snapshotCount = useMemo(() => {
        const qIds = (snapshotQuestions as SnapshotQuestion[]).map((q) => q.id);
        return qIds.filter((id) => {
            const r = snapshotResponses[id];
            const arr = r?.response ?? [];
            return arr.length > 0;
        }).length;
    }, [snapshotQuestions, snapshotResponses]);

    const kpiCount = organizationalKpis.length;
    const assignmentCount = evaluationModelAssignments.length;
    const hasStructure = !!evaluationStructure;
    const allCompleted = snapshotCount > 0 && kpiCount > 0 && assignmentCount > 0 && hasStructure;

    // Group KPIs by organization_name for table
    const kpiByOrg = useMemo(() => {
        const map = new Map<string, { name: string; count: number; leader: string; status: string }>();
        (organizationalKpis || []).forEach((k: any) => {
            const name = k.organization_name || '—';
            if (!map.has(name)) {
                const leader = orgChartMappings.find((m) => m.org_unit_name === name)?.org_head_name || '—';
                map.set(name, { name, count: 0, leader, status: k.status || 'draft' });
            }
            const row = map.get(name)!;
            row.count += 1;
            if (k.status === 'confirmed') row.status = 'confirmed';
            else if (k.status === 'email_sent' && row.status !== 'confirmed') row.status = 'email_sent';
        });
        return Array.from(map.values());
    }, [organizationalKpis, orgChartMappings]);

    const totalKpis = kpiByOrg.reduce((s, o) => s + o.count, 0);

    // Group assignments by model (MBO, OKR, BSC)
    const assignmentsByModel = useMemo(() => {
        const g: Record<string, { job_name: string }[]> = { MBO: [], OKR: [], BSC: [] };
        (evaluationModelAssignments || []).forEach((a: any) => {
            const model = (a.evaluation_model || '').toUpperCase();
            const name = a.job_definition?.job_name || `Job ${a.job_definition_id || ''}`;
            if (model === 'MBO' || model === 'OKR' || model === 'BSC') {
                g[model].push({ job_name: name });
            }
        });
        return g;
    }, [evaluationModelAssignments]);

    const assignedTotal = (evaluationModelAssignments || []).filter(
        (a: any) => ['MBO', 'OKR', 'BSC'].includes((a.evaluation_model || '').toUpperCase())
    ).length;
    const rolesTotal = assignmentCount;

    const handleSubmit = () => {
        if (processing) return;
        if (!allCompleted) {
            setShowMissingError(true);
            return;
        }
        setShowMissingError(false);
        setProcessing(true);
        onSubmit();
    };

    const handleSavePdf = () => {
        window.print();
    };

    // Persona tags derived from snapshot responses (simplified)
    const personaTags = useMemo(() => {
        const tags: { label: string; cls: 't-mint' | 't-blue' | 't-amber' | 't-red' | 't-navy' }[] = [];
        const allResponses = Object.values(snapshotResponses).flatMap((r) => r?.response ?? []);
        const text = allResponses.join(' ').toLowerCase();
        if (text.includes('alignment') || text.includes('strategy')) tags.push({ label: 'Results-Oriented', cls: 't-mint' });
        if (text.includes('performance') || text.includes('differentiation')) tags.push({ label: 'Performance Culture', cls: 't-mint' });
        if (text.includes('moderate') || text.includes('differentiation')) tags.push({ label: 'Moderate Pay Differentiation', cls: 't-blue' });
        if (text.includes('manager') || text.includes('subjectivity')) tags.push({ label: 'Manager Bias Risk', cls: 't-red' });
        if (text.includes('compensation') || text.includes('weak')) tags.push({ label: 'Comp Linkage Weak', cls: 't-amber' });
        if (text.includes('goal') || text.includes('unclear')) tags.push({ label: 'Goal Clarity Needed', cls: 't-amber' });
        if (tags.length === 0 && allResponses.length > 0) tags.push({ label: 'Configuration in progress', cls: 't-navy' });
        return tags.slice(0, 6);
    }, [snapshotResponses]);

    const evalSummary: FormatEvalSummaryResult | null = hasStructure ? formatEvalSummary(evaluationStructure) : null;

    const missingSteps = [
        snapshotCount === 0 && t('performance_system_index.tabs.snapshot'),
        kpiCount === 0 && t('performance_system_index.tabs.kpi'),
        assignmentCount === 0 && t('performance_system_index.tabs.model'),
        !hasStructure && t('performance_system_index.tabs.structure'),
    ].filter(Boolean) as string[];

    const hasSnapshotError = showMissingError && snapshotCount === 0;
    const hasKpiError = showMissingError && kpiCount === 0;
    const hasAssignmentError = showMissingError && assignmentCount === 0;
    const hasStructureError = showMissingError && !hasStructure;

    const STATUS_LABEL: Record<string, string> = {
        confirmed: t('performance_system_review_submit.status.confirmed'),
        email_sent: t('performance_system_review_submit.status.email_sent'),
        draft: t('performance_system_review_submit.status.in_review'),
        none: t('performance_system_review_submit.status.not_started'),
    };
    const STATUS_CHIP: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { confirmed: 'green', email_sent: 'blue', draft: 'amber', none: 'red' };
    const MODEL_META: Record<string, { chip: 'amber' | 'purple' | 'blue'; badge: string; title: string; desc: string; fit: string }> = {
        MBO: {
            chip: 'amber',
            badge: t('performance_system_review_submit.models.mbo.badge'),
            title: t('performance_system_review_submit.models.mbo.title'),
            desc: t('performance_system_review_submit.models.mbo.desc'),
            fit: t('performance_system_review_submit.models.mbo.fit'),
        },
        OKR: {
            chip: 'purple',
            badge: t('performance_system_review_submit.models.okr.badge'),
            title: t('performance_system_review_submit.models.okr.title'),
            desc: t('performance_system_review_submit.models.okr.desc'),
            fit: t('performance_system_review_submit.models.okr.fit'),
        },
        BSC: {
            chip: 'blue',
            badge: t('performance_system_review_submit.models.bsc.badge'),
            title: t('performance_system_review_submit.models.bsc.title'),
            desc: t('performance_system_review_submit.models.bsc.desc'),
            fit: t('performance_system_review_submit.models.bsc.fit'),
        },
    };

    return (
        <div className="review-submit-page bg-[#eef1f7] min-h-screen pb-24">
            {/* Page Header */}
            <div className="rs-page-header relative">
                <div className="ph-inner">
                    <div>
                        <div className="rs-eyebrow">{t('performance_system_review_submit.step_eyebrow')}</div>
                        <h1 className="ph-title">{t('performance_system_review_submit.title')}</h1>
                        <p className="rs-sub">
                            {t('performance_system_review_submit.subtitle')}
                        </p>
                    </div>
                    <div className="ph-actions">
                        <button type="button" onClick={handleSavePdf} className="btn-dl">
                            <Download className="w-3.5 h-3.5" />
                            {t('performance_system_review_submit.save_pdf')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="rs-outer">
                {/* Error bar */}
                {showMissingError && !allCompleted && missingSteps.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-[#fff1f2] border border-[#fecaca]">
                        <AlertCircle className="w-5 h-5 text-[#b91c1c] flex-shrink-0" />
                        <p className="text-sm font-semibold text-[#b91c1c]">
                            {t('performance_system_review_submit.missing_error', { steps: missingSteps.join(', ') })}
                        </p>
                    </div>
                )}

                {/* Section 1 — Policy Snapshot */}
                <section className={cn('review-section s1', hasSnapshotError && 'border border-[#ef4444] bg-[#fff5f5]')}>
                    <div className="rs-hd">
                        <div className="rs-icon">📋</div>
                        <div className="rs-meta">
                            <div className="rs-step">{t('performance_system_review_submit.sections.snapshot.step')}</div>
                            <div className="rs-title">{t('performance_system_review_submit.sections.snapshot.title')}</div>
                            <div className="rs-desc">{t('performance_system_review_submit.sections.snapshot.desc')}</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('performance-snapshot')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{t('performance_system_review_submit.go_back')}</span>
                            </button>
                        )}
                    </div>
                    {personaTags.length > 0 && (
                        <div className="persona-banner">
                            <span className="persona-label">{t('performance_system_review_submit.diagnosis_keywords')}</span>
                            <div className="persona-tags">
                                {personaTags.map((tag, i) => (
                                    <span key={`${tag.label}-${i}`} className={cn('persona-tag', tag.cls)}>
                                        <span className="persona-tag-hash">#</span>
                                        {t(`performance_system_review_submit.persona.${tag.label}`, { defaultValue: tag.label })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {snapshotCount === 0 && (
                        <div className="demo-warning-bar">
                            {t('performance_system_review_submit.demo_warning')}
                        </div>
                    )}
                    <table className="snap-table">
                        <tbody>
                            {(snapshotQuestions as SnapshotQuestion[]).map((q, i) => {
                                const r = snapshotResponses[q.id];
                                const selected = r?.response ?? [];
                                return (
                                    <tr key={q.id}>
                                        <td>
                                            <span className="block text-[9.5px] font-normal not-uppercase text-[var(--rs-txt3)] mb-0.5">Q{i + 1}</span>
                                            {tr(q.question_text)}
                                        </td>
                                        <td>
                                            {selected.length === 0 ? (
                                                <Chip variant="empty">—</Chip>
                                            ) : (
                                                selected.map((opt, j) => (
                                                    <Chip key={`${q.id}-${j}`} variant={j === 0 ? 'green' : 'navy'}>
                                                        {tr(opt)}
                                                    </Chip>
                                                ))
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                {/* Section 2 — Organizational KPI */}
                <section className={cn('review-section s2', hasKpiError && 'border border-[#ef4444] bg-[#fff5f5]')}>
                    <div className="rs-hd">
                        <div className="rs-icon">🎯</div>
                        <div className="rs-meta">
                            <div className="rs-step">{t('performance_system_review_submit.sections.kpi.step')}</div>
                            <div className="rs-title">{t('performance_system_review_submit.sections.kpi.title')}</div>
                            <div className="rs-desc">{t('performance_system_review_submit.sections.kpi.desc')}</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('kpi-review')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{t('performance_system_review_submit.go_back')}</span>
                            </button>
                        )}
                    </div>
                    <div className="kpi-summary-line">
                        {t('performance_system_review_submit.total_orgs')}: <strong className="text-[var(--rs-navy)]">{kpiByOrg.length}</strong>
                        {' · '}
                        {t('performance_system_review_submit.total_kpis')}: <strong className="text-[var(--rs-navy)]">{totalKpis}</strong>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="kpi-mini-table">
                            <thead>
                                <tr>
                                    <th>{t('performance_system_review_submit.table.organization')}</th>
                                    <th>{t('performance_system_review_submit.table.kpi_count')}</th>
                                    <th>{t('performance_system_review_submit.table.leader')}</th>
                                    <th>{t('performance_system_review_submit.table.review_status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kpiByOrg.map((row, i) => (
                                    <tr key={row.name}>
                                        <td className="font-semibold">{tr(row.name)}</td>
                                        <td>{row.count > 0 ? <strong>{row.count}</strong> : <Chip variant="empty">—</Chip>}</td>
                                        <td className="text-[var(--rs-txt2)]">{tr(row.leader)}</td>
                                        <td>
                                            <Chip variant={STATUS_CHIP[row.status] || 'amber'}>
                                                {STATUS_LABEL[row.status] || tr(row.status)}
                                            </Chip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 3 — Goal Management Modeling */}
                <section className={cn('review-section s3', hasAssignmentError && 'border border-[#ef4444] bg-[#fff5f5]')}>
                    <div className="rs-hd">
                        <div className="rs-icon">⚙️</div>
                        <div className="rs-meta">
                                                    <div className="rs-step">{t('performance_system_review_submit.sections.model.step')}</div>
                                                    <div className="rs-title">{t('performance_system_review_submit.sections.model.title')}</div>
                                                    <div className="rs-desc">{t('performance_system_review_submit.sections.model.desc')}</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('model-assignment')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{t('performance_system_review_submit.go_back')}</span>
                            </button>
                        )}
                    </div>
                    <div className="model-summary-line">
                        {t('performance_system_review_submit.assigned_roles')} <strong className="text-[var(--rs-navy)]">{assignedTotal}/{rolesTotal}</strong>
                        {assignedTotal < rolesTotal ? (
                            <Chip variant="amber">{t('performance_system_review_submit.unassigned_count', { count: rolesTotal - assignedTotal })}</Chip>
                        ) : (
                            <Chip variant="green">{t('performance_system_review_submit.all_roles_assigned')}</Chip>
                        )}
                    </div>
                    <div className="flex flex-col">
                        {(['MBO', 'OKR', 'BSC'] as const).map((modelKey) => {
                            const list = assignmentsByModel[modelKey] || [];
                            if (list.length === 0) return null;
                            const m = MODEL_META[modelKey];
                            return (
                                <div key={modelKey} className="model-matrix-row">
                                    <div className="model-card">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Chip variant={m.chip}>{modelKey}</Chip>
                                            <span className="model-badge">{m.badge}</span>
                                        </div>
                                        <div className="model-title">{m.title}</div>
                                        <div className="model-desc">{m.desc}</div>
                                        <div className="model-fit">{m.fit}</div>
                                    </div>
                                    <div className="model-roles-wrap">
                                        <div className="model-roles-label">{t('performance_system_review_submit.assigned_roles_count', { count: list.length })}</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {list.map((r, i) => (
                                                <Chip key={i} variant="navy">{tr(r.job_name)}</Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 4 — Evaluation Process */}
                <section className={cn('review-section s4', hasStructureError && 'border border-[#ef4444] bg-[#fff5f5]')}>
                    <div className="rs-hd">
                        <div className="rs-icon">📅</div>
                        <div className="rs-meta">
                            <div className="rs-step">{t('performance_system_review_submit.sections.structure.step')}</div>
                            <div className="rs-title">{t('performance_system_review_submit.sections.structure.title')}</div>
                            <div className="rs-desc">{t('performance_system_review_submit.sections.structure.desc')}</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('evaluation-structure')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{t('performance_system_review_submit.go_back')}</span>
                            </button>
                        )}
                    </div>
                    {hasStructure && evalSummary ? (
                        <>
                            <table className="snap-table">
                                <tbody>
                                    <tr>
                                        <td>{t('performance_system_review_submit.eval_rows.org_evaluation')}</td>
                                        <td>
                                            {evalSummary.orgConducted ? (
                                                <Chip variant="green">{t('performance_system_review_submit.yes_conducted')}</Chip>
                                            ) : (
                                                <Chip variant="navy">{t('performance_system_review_submit.no_individual_only')}</Chip>
                                            )}
                                        </td>
                                    </tr>
                                    {evalSummary.orgConducted && (
                                        <>
                                            <tr>
                                                <td>{t('performance_system_review_submit.eval_rows.org_cycle')}</td>
                                                <td>
                                                    {evalSummary.orgCycle ? tr(evalSummary.orgCycle) : <Chip variant="empty">—</Chip>}
                                                    {evalSummary.orgTiming && <span className="text-[11.5px] text-[var(--rs-txt2)] ml-1">({tr(evalSummary.orgTiming)})</span>}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>{t('performance_system_review_submit.eval_rows.org_evaluator')}</td>
                                                <td>{evalSummary.orgEvaluator ? tr(evalSummary.orgEvaluator) : <Chip variant="empty">—</Chip>}</td>
                                            </tr>
                                            <tr>
                                                <td>{t('performance_system_review_submit.eval_rows.org_method')}</td>
                                                <td>{evalSummary.orgMethod ? tr(evalSummary.orgMethod) : <Chip variant="empty">—</Chip>}</td>
                                            </tr>
                                            <tr>
                                                <td>{t('performance_system_review_submit.eval_rows.org_result_usage')}</td>
                                                <td>
                                                    {evalSummary.orgUsage.length > 0 ? evalSummary.orgUsage.map((u: string, i: number) => <Chip key={i} variant="navy">{tr(u)}</Chip>) : <Chip variant="empty">—</Chip>}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    <tr>
                                        <td>{t('performance_system_review_submit.eval_rows.ind_cycle')}</td>
                                        <td>
                                            {evalSummary.indCycle ? tr(evalSummary.indCycle) : <Chip variant="empty">—</Chip>}
                                            {evalSummary.indTiming && <span className="text-[11.5px] text-[var(--rs-txt2)] ml-1">({tr(evalSummary.indTiming)})</span>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{t('performance_system_review_submit.eval_rows.evaluators')}</td>
                                        <td>
                                            {evalSummary.indEvaluators.length > 0 ? evalSummary.indEvaluators.map((e: string, i: number) => <Chip key={i} variant="navy">{tr(e)}</Chip>) : <Chip variant="empty">—</Chip>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{t('performance_system_review_submit.eval_rows.ind_method')}</td>
                                        <td>{evalSummary.indMethod ? tr(evalSummary.indMethod) : <Chip variant="empty">—</Chip>}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('performance_system_review_submit.eval_rows.ind_result_usage')}</td>
                                        <td>
                                            {evalSummary.indUsage.length > 0 ? evalSummary.indUsage.map((u: string, i: number) => <Chip key={i} variant="navy">{tr(u)}</Chip>) : <Chip variant="empty">—</Chip>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {evalSummary.distribution && (
                                <div className="px-5 pb-5">
                                    <div className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--rs-txt3)] mb-2">{t('performance_system_review_submit.ind_grade_distribution')}</div>
                                    <div className="dist-bar-row">
                                        {evalSummary.distribution.labels.map((label: string, i: number) => (
                                            <div
                                                key={label}
                                                className="dist-bar-seg"
                                                style={{
                                                    width: `${evalSummary.distribution!.pcts[i] ?? 0}%`,
                                                    backgroundColor: evalSummary.distribution!.colors[i] ?? '#94a3b8',
                                                }}
                                            >
                                                {(evalSummary.distribution!.pcts[i] ?? 0) >= 14 ? `${evalSummary.distribution!.pcts[i]}%` : ''}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="dist-legend">
                                        {evalSummary.distribution.labels.map((label: string, i: number) => (
                                            <div key={label} className="dist-legend-item">
                                                <span
                                                    className="dist-legend-dot"
                                                    style={{ backgroundColor: evalSummary.distribution!.colors[i] ?? '#94a3b8' }}
                                                />
                                                <strong>{tr(label)}</strong>
                                                <span>&nbsp;{evalSummary.distribution!.pcts[i] ?? 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {evalSummary.indMethod === 'Absolute Evaluation' && !evalSummary.orgConducted && (
                                <div className="mx-5 mb-5 p-3 rounded-lg bg-[var(--rs-mint-pale)] border border-[var(--rs-mint-border)] text-xs text-[#047857]">
                                    {t('performance_system_review_submit.absolute_note')}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-5 py-5 text-[var(--rs-txt3)] text-sm">{t('performance_system_review_submit.complete_step4')}</div>
                    )}
                </section>

                {/* Consultant footer */}
                <div className="consultant-footer">
                    <div className="cf-icon">🔍</div>
                    <div className="cf-body">
                        <div className="cf-label">{t('performance_system_review_submit.expert_review.label')}</div>
                        <div className="cf-title">{t('performance_system_review_submit.expert_review.title')}</div>
                        <p className="cf-desc">
                            {t('performance_system_review_submit.expert_review.desc')}
                        </p>
                        <div className="cf-steps">
                            <div className="cf-step"><div className="cf-step-num">1</div><span className="cf-step-txt">{t('performance_system_review_submit.expert_review.step1')}</span></div>
                            <div className="cf-step"><div className="cf-step-num">2</div><span className="cf-step-txt">{t('performance_system_review_submit.expert_review.step2')}</span></div>
                            <div className="cf-step"><div className="cf-step-num">3</div><span className="cf-step-txt">{t('performance_system_review_submit.expert_review.step3')}</span></div>
                            <div className="cf-step"><div className="cf-step-num">4</div><span className="cf-step-txt">{t('performance_system_review_submit.expert_review.step4')}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bottom-bar">
                <div className="bb-l">
                    <strong>{t('performance_system_review_submit.bottom.review_submit')}</strong>
                    {' · '}
                    {t('performance_system_review_submit.bottom.step_5_5')}
                </div>
                <div className="bb-r">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={processing}
                        className="btn-back-bar"
                    >
                        {t('common.back')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="btn-submit"
                    >
                        <ChevronRight className="w-4 h-4" />
                        {t('performance_system_review_submit.submit_draft')}
                    </button>
                </div>
            </div>
        </div>
    );
}
