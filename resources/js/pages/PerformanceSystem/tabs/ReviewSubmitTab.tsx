import React, { useState, useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import { formatEvalSummary, type FormatEvalSummaryResult } from './ReviewSubmitTab.formatter';

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
    const [processing, setProcessing] = useState(false);

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
        if (processing || !allCompleted) return;
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
        snapshotCount === 0 && 'Performance Snapshot',
        kpiCount === 0 && 'KPI Review',
        assignmentCount === 0 && 'Evaluation Model Assignment',
        !hasStructure && 'Evaluation Structure',
    ].filter(Boolean) as string[];

    const STATUS_LABEL: Record<string, string> = { confirmed: 'Confirmed', email_sent: 'Email Sent', draft: 'In Review', none: 'Not Started' };
    const STATUS_CHIP: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { confirmed: 'green', email_sent: 'blue', draft: 'amber', none: 'red' };
    const MODEL_META: Record<string, { chip: 'amber' | 'purple' | 'blue'; badge: string; title: string; desc: string; fit: string }> = {
        MBO: { chip: 'amber', badge: 'Result-Driven', title: 'Management by Objectives (MBO)', desc: 'Sets clear quantitative targets and evaluates by achievement rate.', fit: 'Best for roles with clear numeric KPIs — Sales, Operations' },
        OKR: { chip: 'purple', badge: 'Challenge-Driven', title: 'Objectives & Key Results (OKR)', desc: 'Pairs ambitious Objectives with measurable Key Results.', fit: 'Best for creative/strategic roles — R&D, Strategy, Engineering' },
        BSC: { chip: 'blue', badge: 'Balanced', title: 'Balanced Scorecard (BSC)', desc: 'Measures performance across four perspectives.', fit: 'Best for support roles — HR, Finance, Planning' },
    };

    return (
        <div className="review-submit-page bg-[#eef1f7] min-h-screen pb-24">
            {/* Page Header */}
            <div className="rs-page-header relative">
                <div className="ph-inner">
                    <div>
                        <div className="rs-eyebrow">Step 5 of 5 — Final Review</div>
                        <h1 className="ph-title">Final Design Review</h1>
                        <p className="rs-sub">
                            Review your settings from each step below. Use &quot;Go Back&quot; to revise any section before submitting.
                        </p>
                    </div>
                    <div className="ph-actions">
                        <button type="button" onClick={handleSavePdf} className="btn-dl">
                            <Download className="w-3.5 h-3.5" />
                            Save PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="rs-outer">
                {/* Error bar */}
                {!allCompleted && missingSteps.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-[#fff1f2] border border-[#fecaca]">
                        <AlertCircle className="w-5 h-5 text-[#b91c1c] flex-shrink-0" />
                        <p className="text-sm font-semibold text-[#b91c1c]">
                            Please complete all steps before submitting. Missing: {missingSteps.join(', ')}
                        </p>
                    </div>
                )}

                {/* Section 1 — Policy Snapshot */}
                <section className="review-section s1">
                    <div className="rs-hd">
                        <div className="rs-icon">📋</div>
                        <div className="rs-meta">
                            <div className="rs-step">Step 1 — Policy Snapshot</div>
                            <div className="rs-title">Strategic Performance Snapshot</div>
                            <div className="rs-desc">Performance management philosophy & current state diagnosis</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('performance-snapshot')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Go Back</span>
                            </button>
                        )}
                    </div>
                    {personaTags.length > 0 && (
                        <div className="persona-banner">
                            <span className="persona-label">Diagnosis<br />Keywords</span>
                            <div className="persona-tags">
                                {personaTags.map((t, i) => (
                                    <span key={`${t.label}-${i}`} className={cn('persona-tag', t.cls)}>
                                        <span className="persona-tag-hash">#</span>
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {snapshotCount === 0 && (
                        <div className="demo-warning-bar">
                            ⚠ Demo data shown — will be replaced with actual survey responses once saved
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
                                            {q.question_text}
                                        </td>
                                        <td>
                                            {selected.length === 0 ? (
                                                <Chip variant="empty">—</Chip>
                                            ) : (
                                                selected.map((opt, j) => (
                                                    <Chip key={`${q.id}-${j}`} variant={j === 0 ? 'green' : 'navy'}>
                                                        {opt}
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
                <section className="review-section s2">
                    <div className="rs-hd">
                        <div className="rs-icon">🎯</div>
                        <div className="rs-meta">
                            <div className="rs-step">Step 2 — Organizational KPI</div>
                            <div className="rs-title">Organizational KPI Review</div>
                            <div className="rs-desc">KPI setup status by organizational unit</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('kpi-review')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Go Back</span>
                            </button>
                        )}
                    </div>
                    <div className="kpi-summary-line">
                        Total orgs: <strong className="text-[var(--rs-navy)]">{kpiByOrg.length}</strong>
                        {' · '}
                        Total KPIs: <strong className="text-[var(--rs-navy)]">{totalKpis}</strong>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="kpi-mini-table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>KPI Count</th>
                                    <th>Leader</th>
                                    <th>Review Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kpiByOrg.map((row, i) => (
                                    <tr key={row.name}>
                                        <td className="font-semibold">{row.name}</td>
                                        <td>{row.count > 0 ? <strong>{row.count}</strong> : <Chip variant="empty">—</Chip>}</td>
                                        <td className="text-[var(--rs-txt2)]">{row.leader}</td>
                                        <td>
                                            <Chip variant={STATUS_CHIP[row.status] || 'amber'}>
                                                {STATUS_LABEL[row.status] || row.status}
                                            </Chip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 3 — Goal Management Modeling */}
                <section className="review-section s3">
                    <div className="rs-hd">
                        <div className="rs-icon">⚙️</div>
                        <div className="rs-meta">
                            <div className="rs-step">Step 3 — Goal Management Modeling</div>
                            <div className="rs-title">Goal Management Model Assignment</div>
                            <div className="rs-desc">Assigned roles per model — MBO · OKR · BSC</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('model-assignment')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Go Back</span>
                            </button>
                        )}
                    </div>
                    <div className="model-summary-line">
                        Assigned <strong className="text-[var(--rs-navy)]">{assignedTotal}/{rolesTotal}</strong> roles
                        {assignedTotal < rolesTotal ? (
                            <Chip variant="amber">{rolesTotal - assignedTotal} unassigned</Chip>
                        ) : (
                            <Chip variant="green">All roles assigned</Chip>
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
                                        <div className="model-roles-label">Assigned roles ({list.length})</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {list.map((r, i) => (
                                                <Chip key={i} variant="navy">{r.job_name}</Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 4 — Evaluation Process */}
                <section className="review-section s4">
                    <div className="rs-hd">
                        <div className="rs-icon">📅</div>
                        <div className="rs-meta">
                            <div className="rs-step">Step 4 — Evaluation Process</div>
                            <div className="rs-title">Evaluation Structure</div>
                            <div className="rs-desc">Evaluation cycle, method, and grade distribution</div>
                        </div>
                        {onGoToStep && (
                            <button type="button" className="rs-edit-btn" onClick={() => onGoToStep('evaluation-structure')}>
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Go Back</span>
                            </button>
                        )}
                    </div>
                    {hasStructure && evalSummary ? (
                        <>
                            <table className="snap-table">
                                <tbody>
                                    <tr>
                                        <td>Org. Evaluation</td>
                                        <td>
                                            {evalSummary.orgConducted ? (
                                                <Chip variant="green">Yes — Conducted</Chip>
                                            ) : (
                                                <Chip variant="navy">No — Individual Only</Chip>
                                            )}
                                        </td>
                                    </tr>
                                    {evalSummary.orgConducted && (
                                        <>
                                            <tr>
                                                <td>Org. Eval Cycle</td>
                                                <td>
                                                    {evalSummary.orgCycle ?? <Chip variant="empty">—</Chip>}
                                                    {evalSummary.orgTiming && <span className="text-[11.5px] text-[var(--rs-txt2)] ml-1">({evalSummary.orgTiming})</span>}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Org. Evaluator</td>
                                                <td>{evalSummary.orgEvaluator ?? <Chip variant="empty">—</Chip>}</td>
                                            </tr>
                                            <tr>
                                                <td>Org. Eval Method</td>
                                                <td>{evalSummary.orgMethod ?? <Chip variant="empty">—</Chip>}</td>
                                            </tr>
                                            <tr>
                                                <td>Org. Result Usage</td>
                                                <td>
                                                    {evalSummary.orgUsage.length > 0 ? evalSummary.orgUsage.map((u: string, i: number) => <Chip key={i} variant="navy">{u}</Chip>) : <Chip variant="empty">—</Chip>}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    <tr>
                                        <td>Ind. Eval Cycle</td>
                                        <td>
                                            {evalSummary.indCycle ?? <Chip variant="empty">—</Chip>}
                                            {evalSummary.indTiming && <span className="text-[11.5px] text-[var(--rs-txt2)] ml-1">({evalSummary.indTiming})</span>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Evaluators</td>
                                        <td>
                                            {evalSummary.indEvaluators.length > 0 ? evalSummary.indEvaluators.map((e: string, i: number) => <Chip key={i} variant="navy">{e}</Chip>) : <Chip variant="empty">—</Chip>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Ind. Eval Method</td>
                                        <td>{evalSummary.indMethod ?? <Chip variant="empty">—</Chip>}</td>
                                    </tr>
                                    <tr>
                                        <td>Ind. Result Usage</td>
                                        <td>
                                            {evalSummary.indUsage.length > 0 ? evalSummary.indUsage.map((u: string, i: number) => <Chip key={i} variant="navy">{u}</Chip>) : <Chip variant="empty">—</Chip>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {evalSummary.distribution && (
                                <div className="px-5 pb-5">
                                    <div className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--rs-txt3)] mb-2">Individual Eval Grade Distribution</div>
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
                                                <strong>{label}</strong>
                                                <span>&nbsp;{evalSummary.distribution!.pcts[i] ?? 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {evalSummary.indMethod === 'Absolute Evaluation' && !evalSummary.orgConducted && (
                                <div className="mx-5 mb-5 p-3 rounded-lg bg-[var(--rs-mint-pale)] border border-[var(--rs-mint-border)] text-xs text-[#047857]">
                                    ✅ Absolute Evaluation — No pre-set distribution. Evaluators assign grades independently against criteria.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-5 py-5 text-[var(--rs-txt3)] text-sm">Complete Step 4 (Evaluation Structure) to see your configuration here.</div>
                    )}
                </section>

                {/* Consultant footer */}
                <div className="consultant-footer">
                    <div className="cf-icon">🔍</div>
                    <div className="cf-body">
                        <div className="cf-label">Next Step — Expert Review</div>
                        <div className="cf-title">After submission, an HR consultant will review your design</div>
                        <p className="cf-desc">
                            Based on the draft you&apos;ve designed, HR Path-Finder&apos;s expert consultants will review whether it fits your organization&apos;s reality and propose improvements where needed. The final performance management system is confirmed through a collaborative review process.
                        </p>
                        <div className="cf-steps">
                            <div className="cf-step"><div className="cf-step-num">1</div><span className="cf-step-txt">Submit Draft</span></div>
                            <div className="cf-step"><div className="cf-step-num">2</div><span className="cf-step-txt">Consultant Review (2–3 days)</span></div>
                            <div className="cf-step"><div className="cf-step-num">3</div><span className="cf-step-txt">Discussion & Adjustments</span></div>
                            <div className="cf-step"><div className="cf-step-num">4</div><span className="cf-step-txt">Final Sign-off & Report</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bottom-bar">
                <div className="bb-l">
                    <strong>Review & Submit</strong>
                    {' · '}
                    Step 5 of 5
                </div>
                <div className="bb-r">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={processing}
                        className="btn-back-bar"
                    >
                        ← Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing || !allCompleted}
                        className="btn-submit"
                    >
                        <ChevronRight className="w-4 h-4" />
                        Submit Draft
                    </button>
                </div>
            </div>
        </div>
    );
}
