import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Backend-aligned types; some fields support both legacy and prototype values
interface EvaluationStructure {
    org_evaluation_cycle?: 'annual' | 'semi_annual' | 'quarterly';
    org_evaluation_timing?: string;
    org_evaluator_type?: string;
    org_evaluation_method?: 'absolute' | 'relative';
    org_rating_scale?: '3-level' | '4-level';
    org_rating_distribution?: number[];
    org_evaluation_group?: string;
    org_use_of_results?: string[];
    individual_evaluation_cycle?: 'annual' | 'semi_annual' | 'quarterly';
    individual_evaluation_timing?: string;
    individual_evaluator_types?: string[];
    individual_evaluators?: string[];
    individual_evaluation_method?: 'absolute' | 'relative';
    individual_rating_scale?: '3-level' | '4-level' | '5-level';
    individual_rating_distribution?: number[];
    individual_evaluation_groups?: string[];
    individual_use_of_results?: string[];
    individual_use_of_results_other?: string;
    organization_leader_evaluation?: string;
    summary_note?: string;
}

interface Props {
    project: { id: number };
    evaluationStructure?: EvaluationStructure | null;
    onContinue: (structure: EvaluationStructure) => void;
    onBack?: () => void;
}

function normalizeStructure(s: any): EvaluationStructure {
    if (!s) return {};
    if (s.organizational_evaluation || s.individual_evaluation) {
        return {
            org_evaluation_cycle: s.organizational_evaluation?.evaluation_cycle,
            org_evaluation_timing: s.organizational_evaluation?.evaluation_timing,
            org_evaluator_type: s.organizational_evaluation?.evaluator_type,
            org_evaluation_method: s.organizational_evaluation?.evaluation_method,
            org_rating_scale: s.organizational_evaluation?.rating_scale,
            org_rating_distribution: s.organizational_evaluation?.rating_distribution,
            org_evaluation_group: s.organizational_evaluation?.evaluation_group,
            org_use_of_results: Array.isArray(s.organizational_evaluation?.use_of_results) ? s.organizational_evaluation.use_of_results : undefined,
            individual_evaluation_cycle: s.individual_evaluation?.evaluation_cycle,
            individual_evaluation_timing: s.individual_evaluation?.evaluation_timing,
            individual_evaluator_types: s.individual_evaluation?.evaluator_types,
            individual_evaluators: s.individual_evaluation?.evaluators,
            individual_evaluation_method: s.individual_evaluation?.evaluation_method,
            individual_rating_scale: s.individual_evaluation?.rating_scale,
            individual_rating_distribution: s.individual_evaluation?.rating_distribution,
            individual_evaluation_groups: s.individual_evaluation?.evaluation_groups,
            individual_use_of_results: s.individual_evaluation?.use_of_results,
            individual_use_of_results_other: s.individual_evaluation?.use_of_results_other,
            organization_leader_evaluation: s.individual_evaluation?.organization_leader_evaluation,
            summary_note: s.summary_note,
        };
    }
    return { ...s };
}

// Map UI cycle to backend (semi -> semi_annual)
function cycleToBackend(v: string): 'annual' | 'semi_annual' | 'quarterly' {
    if (v === 'semi') return 'semi_annual';
    return v as 'annual' | 'semi_annual' | 'quarterly';
}
function cycleFromBackend(v?: string): string {
    if (v === 'semi_annual') return 'semi';
    return v || '';
}

// Parse timing string "1" or "1,7" into month numbers
function parseTiming(t?: string): number[] {
    if (!t) return [];
    return t.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => n >= 1 && n <= 12);
}
function formatTiming(months: number[]): string {
    return [...months].sort((a, b) => a - b).join(',');
}

export default function EvaluationStructureTab({
    project,
    evaluationStructure: initialStructure,
    onContinue,
    onBack,
}: Props) {
    const [structure, setStructure] = useState<EvaluationStructure>(() => normalizeStructure(initialStructure));
    const [orgRun, setOrgRun] = useState<boolean>(() => {
        const s = normalizeStructure(initialStructure);
        return !!(s.org_evaluation_cycle || s.org_evaluation_method || s.org_evaluator_type);
    });
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ sec1: false, sec2: false });
    const [orgMonths, setOrgMonths] = useState<number[]>(() => parseTiming(normalizeStructure(initialStructure).org_evaluation_timing));
    const [indMonths, setIndMonths] = useState<number[]>(() => parseTiming(normalizeStructure(initialStructure).individual_evaluation_timing));
    const [orgUsageOther, setOrgUsageOther] = useState(false);
    const [indUsageOther, setIndUsageOther] = useState(!!normalizeStructure(initialStructure).individual_use_of_results_other);

    useEffect(() => {
        if (initialStructure !== undefined && initialStructure !== null) {
            const s = normalizeStructure(initialStructure);
            setStructure(s);
            setOrgRun(!!(s.org_evaluation_cycle || s.org_evaluation_method || s.org_evaluator_type));
            setOrgMonths(parseTiming(s.org_evaluation_timing));
            setIndMonths(parseTiming(s.individual_evaluation_timing));
            setIndUsageOther(!!s.individual_use_of_results_other);
        }
    }, [initialStructure]);

    const toggleSection = (id: string) => {
        setCollapsed((c) => ({ ...c, [id]: !c[id] }));
    };

    const neededMonths = (cycle: string) => (cycle === 'annual' ? 1 : cycle === 'semi' ? 2 : 4);
    const toggleMonth = (months: number[], setMonths: (m: number[]) => void, cycle: string, monthNum: number) => {
        const needed = neededMonths(cycle);
        const idx = months.indexOf(monthNum);
        if (idx >= 0) {
            const next = months.filter((_, i) => i !== idx);
            setMonths(next);
        } else {
            let next = [...months, monthNum].sort((a, b) => a - b);
            if (next.length > needed) next = next.slice(-needed);
            setMonths(next);
        }
    };

    // Single-select option card
    const pick = (group: keyof EvaluationStructure, value: string, backendValue?: string) => {
        const v = backendValue ?? value;
        setStructure((s) => ({ ...s, [group]: v }));
    };
    // Multi-select (array) option card
    const pickMulti = (group: keyof EvaluationStructure, value: string) => {
        setStructure((s) => {
            const arr = (Array.isArray(s[group]) ? s[group] : []) as string[];
            const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
            return { ...s, [group]: next };
        });
    };

    // Build payload for backend
    const buildPayload = (): EvaluationStructure => {
        const cycleBackend = (c: string) => cycleToBackend(c || 'annual');
        const orgCycle = structure.org_evaluation_cycle || (structure as any).org_cycle;
        const indCycle = structure.individual_evaluation_cycle || (structure as any).ind_cycle;
        const payload: EvaluationStructure = {
            org_evaluation_cycle: orgRun ? cycleBackend(orgCycle || cycleFromBackend(structure.org_evaluation_cycle)) : undefined,
            org_evaluation_timing: orgRun && orgMonths.length ? formatTiming(orgMonths) : undefined,
            org_evaluator_type: orgRun ? (structure.org_evaluator_type || undefined) : undefined,
            org_evaluation_method: orgRun ? structure.org_evaluation_method : undefined,
            org_rating_scale: orgRun && structure.org_evaluation_method === 'relative' ? structure.org_rating_scale : undefined,
            org_rating_distribution: orgRun && structure.org_evaluation_method === 'relative' ? structure.org_rating_distribution : undefined,
            org_evaluation_group: orgRun ? structure.org_evaluation_group : undefined,
            org_use_of_results: orgRun && Array.isArray(structure.org_use_of_results) && structure.org_use_of_results.length
                ? structure.org_use_of_results
                : undefined,
            individual_evaluation_cycle: cycleBackend(indCycle || cycleFromBackend(structure.individual_evaluation_cycle)),
            individual_evaluation_timing: indMonths.length ? formatTiming(indMonths) : undefined,
            individual_evaluator_types: structure.individual_evaluator_types?.length ? structure.individual_evaluator_types : undefined,
            individual_evaluators: structure.individual_evaluators?.length ? structure.individual_evaluators : undefined,
            individual_evaluation_method: structure.individual_evaluation_method,
            individual_rating_scale: structure.individual_evaluation_method === 'relative' ? structure.individual_rating_scale : undefined,
            individual_rating_distribution: structure.individual_evaluation_method === 'relative' ? structure.individual_rating_distribution : undefined,
            individual_evaluation_groups: structure.individual_evaluation_groups?.length ? structure.individual_evaluation_groups : undefined,
            individual_use_of_results: structure.individual_use_of_results?.length ? structure.individual_use_of_results : undefined,
            individual_use_of_results_other: structure.individual_use_of_results_other || undefined,
            organization_leader_evaluation: structure.organization_leader_evaluation,
            summary_note: structure.summary_note,
        };
        return payload;
    };

    const handleContinue = () => {
        const payload = buildPayload();
        onContinue(payload);
    };

    // Section completion for progress
    const orgFilled = orgRun
        ? [
            structure.org_evaluation_cycle || (structure as any).org_cycle,
            structure.org_evaluator_type,
            structure.org_evaluation_method,
        ].filter(Boolean).length
        : 3;
    const indFilled =
        [
            structure.individual_evaluation_cycle || (structure as any).ind_cycle,
            (structure.individual_evaluators?.length ?? 0) > 0,
            structure.individual_evaluation_method,
        ].filter(Boolean).length;

    const progressFields = [
        orgRun !== null,
        !orgRun || !!structure.org_evaluation_cycle || !!(structure as any).org_cycle,
        !orgRun || !!structure.org_evaluation_method,
        !!structure.individual_evaluation_cycle || !!(structure as any).ind_cycle,
        (structure.individual_evaluators?.length ?? 0) > 0,
        !!structure.individual_evaluation_method,
    ];
    const progressDone = progressFields.filter(Boolean).length;
    const progressTotal = progressFields.length;

    const cycleMap: Record<string, string> = { annual: 'Annual', semi: 'Semi-Annual', semi_annual: 'Semi-Annual', quarterly: 'Quarterly' };
    const methodMap: Record<string, string> = { absolute: 'Absolute (절대)', relative: 'Relative (상대)' };
    const orgEvalMap: Record<string, string> = { ceo: 'CEO / Top Mgmt', dept: 'Dept Heads', top_down: 'Top-down' };
    const indEvalMap: Record<string, string> = {
        primary: 'Direct Mgr',
        peer_same_dept: 'Peer',
        self_evaluation: 'Self',
    };
    const orgUsageMap: Record<string, string> = {
        dist_adjust: 'Adjust Ind. Distribution',
        bonus: 'Bonus Pool',
        reference: 'Reference Only',
        dept_head_link: 'Link to Dept Head',
    };
    const indUsageMap: Record<string, string> = {
        salary_adjustment: 'Salary',
        bonus_allocation: 'Bonus',
        promotion: 'Promotion',
        training_selection: 'Development',
    };

    const orgCycleVal = structure.org_evaluation_cycle || (structure as any).org_cycle || cycleFromBackend(structure.org_evaluation_cycle);
    const indCycleVal = structure.individual_evaluation_cycle || (structure as any).ind_cycle || cycleFromBackend(structure.individual_evaluation_cycle);

    const sentenceParts: string[] = [];
    if (orgRun && (orgCycleVal || structure.org_evaluation_method)) {
        sentenceParts.push(
            `Org performance is assessed <strong>${(cycleMap[orgCycleVal] || cycleMap[structure.org_evaluation_cycle || ''] || '').toLowerCase()}</strong> using <strong>${methodMap[structure.org_evaluation_method || ''] || ''}</strong> scoring`
        );
    }
    if (indCycleVal && (structure.individual_evaluators?.length ?? 0) > 0 && structure.individual_evaluation_method) {
        const evs = (structure.individual_evaluators || []).map((v) => indEvalMap[v] || v).join(' + ');
        sentenceParts.push(
            `Individual employees are evaluated <strong>${(cycleMap[indCycleVal] || cycleMap[structure.individual_evaluation_cycle || ''] || '').toLowerCase()}</strong> by <strong>${evs}</strong> using <strong>${methodMap[structure.individual_evaluation_method] || ''}</strong> scoring`
        );
    }
    const sentenceSummary = sentenceParts.length
        ? sentenceParts.join(', and ') + '.'
        : '<span class="sent-blank">Select options above to generate a plain-English description of your evaluation structure.</span>';

    const summaryRows = [
        { key: 'Org Evaluation', val: orgRun ? 'Yes — Org-level' : 'Skipped' },
        { key: 'Org Cycle', val: orgRun ? (cycleMap[orgCycleVal] || cycleMap[structure.org_evaluation_cycle || ''] || '—') : '—' },
        { key: 'Org Method', val: orgRun ? (methodMap[structure.org_evaluation_method || ''] || '—') : '—' },
        { key: 'Ind. Cycle', val: cycleMap[indCycleVal] || cycleMap[structure.individual_evaluation_cycle || ''] || '—' },
        {
            key: 'Evaluator(s)',
            val:
                (structure.individual_evaluators?.length ?? 0) > 0
                    ? (structure.individual_evaluators || []).map((v) => indEvalMap[v] || v).join(', ')
                    : '—',
        },
        { key: 'Ind. Method', val: methodMap[structure.individual_evaluation_method || ''] || '—' },
    ];

    return (
        <div className="eval-structure-page bg-[#eef1f7] min-h-screen pb-24">
            <div className="es-outer">
                <div className="main-col space-y-4">
                    {/* Section progress */}
                    <div className="section-progress">
                        <button
                            type="button"
                            onClick={() => orgRun && document.getElementById('sec1')?.scrollIntoView({ behavior: 'smooth' })}
                            className={cn(
                                'sp-step',
                                orgRun ? (orgFilled >= 3 ? 'done' : 'active') : 'done'
                            )}
                        >
                            <span className="sp-dot">{orgFilled >= 3 ? '✓' : '1'}</span>
                            Org. Evaluation
                        </button>
                        <span className="sp-line" />
                        <button
                            type="button"
                            onClick={() => document.getElementById('sec2')?.scrollIntoView({ behavior: 'smooth' })}
                            className={cn(
                                'sp-step',
                                indFilled >= 3 ? 'done' : indFilled > 0 ? 'active' : ''
                            )}
                        >
                            <span className="sp-dot">{indFilled >= 3 ? '✓' : '2'}</span>
                            Individual Evaluation
                        </button>
                    </div>

                    {/* Org run toggle */}
                    <div className="org-run-wrap">
                        <div className="org-run-label">조직평가를 실시하겠습니까? — Will you conduct an organizational evaluation?</div>
                        <div className="org-run-cards">
                            <button
                                type="button"
                                onClick={() => setOrgRun(true)}
                                className={cn('org-run-card yes', orgRun && 'selected')}
                            >
                                <span className="orc-radio" />
                                <div className="orc-body">
                                    <div className="orc-icon">🏢</div>
                                    <div className="orc-title">Yes — Run org-level evaluation</div>
                                    <div className="orc-desc">Company or team performance is assessed first. The result anchors and calibrates individual scores.</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrgRun(false)}
                                className={cn('org-run-card no', !orgRun && 'selected')}
                            >
                                <span className="orc-radio" />
                                <div className="orc-body">
                                    <div className="orc-icon">⏭️</div>
                                    <div className="orc-title">No — Skip to individual evaluation</div>
                                    <div className="orc-desc">Each employee is evaluated directly against personal goals. Simpler setup, lower overhead.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    {/* Section 1: Organizational Evaluation */}
                    <div id="sec1" className={cn('section-block', !orgRun && 'org-hidden', orgFilled >= 3 && 'complete', collapsed.sec1 && 'collapsed')}>
                        <div className="section-hd" onClick={() => toggleSection('sec1')}>
                            <div className="s-icon org">🏢</div>
                            <div className="s-meta">
                                <div className="s-title">Organizational Evaluation</div>
                                <div className="s-subtitle">Company-level baseline — precedes individual scores</div>
                            </div>
                            <span className={cn('s-status', orgFilled >= 3 ? 'complete' : orgFilled > 0 ? 'partial' : 'empty')}>
                                {orgFilled >= 3 ? '✓ Complete' : orgFilled > 0 ? `${orgFilled} of 3 done` : 'Not started'}
                            </span>
                            {collapsed.sec1 ? <ChevronDown className="s-chevron w-3.5 h-3.5" /> : <ChevronUp className="s-chevron w-3.5 h-3.5" />}
                        </div>
                        {orgRun && (
                            <div className="section-body">
                                <div className="fg">
                                    <div className="fg-label">Evaluation Cycle <span className="fg-label-req">● Required</span></div>
                                    <div className="card-grid g3">
                                        {(['annual', 'semi', 'quarterly'] as const).map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => pick('org_evaluation_cycle' as keyof EvaluationStructure, c, cycleToBackend(c))}
                                                className={cn('opt-card', (orgCycleVal === c || structure.org_evaluation_cycle === cycleToBackend(c)) && 'selected')}
                                            >
                                                <span className="opt-radio" />
                                                <div className="opt-icon">{c === 'annual' ? '📅' : c === 'semi' ? '🔁' : '⚡'}</div>
                                                <div className="opt-title">{cycleMap[c] || c}</div>
                                                <div className="opt-desc">
                                                    {c === 'annual' ? 'Once per year. Lowest admin burden.' : c === 'semi' ? 'Twice per year. Mid-year course correction.' : 'Every quarter. Best for OKR cultures.'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {(orgCycleVal || structure.org_evaluation_cycle) && (
                                    <div className="fg month-picker-wrap">
                                        <div className="fg-label">Evaluation Month{neededMonths(orgCycleVal || 'annual') > 1 ? 's' : ''} — Select {neededMonths(orgCycleVal || 'annual')}</div>
                                        <div className="month-grid">
                                            {MONTHS.map((m, i) => {
                                                const num = i + 1;
                                                const sel = orgMonths.includes(num);
                                                return (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => toggleMonth(orgMonths, setOrgMonths, orgCycleVal || 'annual', num)}
                                                        className={cn('month-btn', sel && 'selected')}
                                                    >
                                                        <span className="m-num">{String(num).padStart(2, '0')}</span>
                                                        <span className="m-name">{m}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={cn('month-hint', orgMonths.length === neededMonths(orgCycleVal || 'annual') && 'filled')}>
                                            {orgMonths.length === neededMonths(orgCycleVal || 'annual')
                                                ? `✓ Evaluation months: ${orgMonths.sort((a, b) => a - b).map((n) => MONTHS[n - 1]).join(', ')}`
                                                : `Select ${neededMonths(orgCycleVal || 'annual')} month${neededMonths(orgCycleVal || 'annual') > 1 ? 's' : ''} for evaluation`}
                                        </div>
                                    </div>
                                )}
                                <div className="fg">
                                    <div className="fg-label">Who Evaluates <span className="fg-label-req">● Required</span></div>
                                    <div className="card-grid g2">
                                        {[
                                            { val: 'ceo', label: 'CEO / Top Management', desc: 'Strongest strategic signal. Evaluation is signed off at the top.', icon: '👔' },
                                            { val: 'dept', label: 'Department Heads', desc: 'Each dept head evaluates their own area. Results consolidated company-wide.', icon: '🏗️' },
                                        ].map(({ val, label, desc, icon }) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => pick('org_evaluator_type' as keyof EvaluationStructure, val)}
                                                className={cn('opt-card', structure.org_evaluator_type === val && 'selected')}
                                            >
                                                <span className="opt-radio" />
                                                <div className="opt-icon">{icon}</div>
                                                <div className="opt-title">{label}</div>
                                                <div className="opt-desc">{desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="fg">
                                    <div className="fg-label">Evaluation Method <span className="fg-label-req">● Required</span></div>
                                    <div className="card-grid g2">
                                        {(['absolute', 'relative'] as const).map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() =>
                                                    setStructure((s) => ({
                                                        ...s,
                                                        org_evaluation_method: m,
                                                        ...(m === 'relative' && !s.org_rating_scale
                                                            ? { org_rating_scale: '3-level' as const, org_rating_distribution: [30, 40, 30] }
                                                            : {}),
                                                    }))
                                                }
                                                className={cn('opt-card', structure.org_evaluation_method === m && 'selected')}
                                            >
                                                <span className="opt-radio" />
                                                <div className="opt-icon">{m === 'absolute' ? '📏' : '⚖️'}</div>
                                                <div className="opt-title">{m === 'absolute' ? '절대평가 — Absolute' : '상대평가 — Relative'}</div>
                                                <div className="opt-desc">
                                                    {m === 'absolute'
                                                        ? "Each unit is scored against pre-set targets. Results don't depend on how other departments performed."
                                                        : 'Departments are ranked against each other. Grade distribution is fixed across the organisation.'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {structure.org_evaluation_method === 'relative' && (
                                    <div className="evaluator-sub-inner">
                                        <div className="sub-label">Grade Distribution for Org Evaluation</div>
                                        <div className="flex gap-2 mb-2">
                                            {(['3-level', '4-level'] as const).map((scale) => (
                                                <button
                                                    key={scale}
                                                    type="button"
                                                    onClick={() =>
                                                        setStructure((s) => ({
                                                            ...s,
                                                            org_rating_scale: scale,
                                                            org_rating_distribution: scale === '3-level' ? [30, 40, 30] : [20, 35, 35, 10],
                                                        }))
                                                    }
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors',
                                                        structure.org_rating_scale === scale ? 'bg-[#2ec4a0] text-white border-[#2ec4a0]' : 'bg-white border-[#e0e7ef] text-[#5a6a85]'
                                                    )}
                                                >
                                                    {scale}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="dist-bar flex h-9 rounded-lg overflow-hidden gap-0.5">
                                            {(structure.org_rating_scale === '4-level' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C']).map((label, i) => (
                                                <div
                                                    key={label}
                                                    className="dist-seg flex items-center justify-center text-[10px] font-extrabold text-white"
                                                    style={{
                                                        width: `${structure.org_rating_distribution?.[i] ?? 0}%`,
                                                        background: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i],
                                                    }}
                                                >
                                                    {label}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11.5px] text-[#5a6a85] mt-2">
                                            Total: {(structure.org_rating_distribution || []).reduce((a, b) => a + b, 0)}%
                                        </p>
                                    </div>
                                )}
                                <div className="fg">
                                    <div className="fg-label">How Org Score Is Used</div>
                                    <div className="card-grid g2">
                                        {[
                                            { u: 'dist_adjust', icon: '⚖️', title: 'Adjust Individual Grade Distribution by Org', desc: "Each org unit's individual grade curve is calibrated based on its org-level score." },
                                            { u: 'bonus', icon: '💰', title: 'Bonus Pool Multiplier', desc: 'Org score multiplies the bonus pool size before individual distribution.' },
                                            { u: 'reference', icon: '📊', title: 'Reference Only', desc: 'Org score is shown for context but does not mathematically affect individual ratings.' },
                                            { u: 'dept_head_link', icon: '👔', title: "Link to Dept Head's Individual Rating", desc: "The org-level result is directly reflected in the department head's own individual performance grade." },
                                        ].map(({ u, icon, title, desc }) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => pickMulti('org_use_of_results' as keyof EvaluationStructure, u)}
                                                className={cn('opt-card multi-sel', structure.org_use_of_results?.includes(u) && 'selected')}
                                            >
                                                <span className="opt-check" />
                                                <div className="opt-icon">{icon}</div>
                                                <div className="opt-title">{title}</div>
                                                <div className="opt-desc">{desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Individual Evaluation */}
                    <div id="sec2" className={cn('section-block', indFilled >= 3 && 'complete', collapsed.sec2 && 'collapsed')}>
                        <div className="section-hd" onClick={() => toggleSection('sec2')}>
                            <div className="s-icon ind">👤</div>
                            <div className="s-meta">
                                <div className="s-title">Individual Evaluation</div>
                                <div className="s-subtitle">Per-employee assessment — core of the performance cycle</div>
                            </div>
                            <span className={cn('s-status', indFilled >= 3 ? 'complete' : indFilled > 0 ? 'partial' : 'empty')}>
                                {indFilled >= 3 ? '✓ Complete' : indFilled > 0 ? `${indFilled} of 3 done` : 'Not started'}
                            </span>
                            {collapsed.sec2 ? <ChevronDown className="s-chevron w-3.5 h-3.5" /> : <ChevronUp className="s-chevron w-3.5 h-3.5" />}
                        </div>
                        <div className="section-body">
                            <div className="fg">
                                <div className="fg-label">Evaluation Cycle <span className="fg-label-req">● Required</span></div>
                                <div className="card-grid g3">
                                    {(['annual', 'semi', 'quarterly'] as const).map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => pick('individual_evaluation_cycle' as keyof EvaluationStructure, c, cycleToBackend(c))}
                                            className={cn('opt-card', (indCycleVal === c || structure.individual_evaluation_cycle === cycleToBackend(c)) && 'selected')}
                                        >
                                            <span className="opt-radio" />
                                            <div className="opt-icon">{c === 'annual' ? '📅' : c === 'semi' ? '🔁' : '⚡'}</div>
                                            <div className="opt-title">{cycleMap[c] || c}</div>
                                            <div className="opt-desc">
                                                {c === 'annual' ? 'Once per year. Standard for most companies.' : c === 'semi' ? 'Twice per year. Mid-year development check-in.' : 'Every quarter. High-velocity teams.'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {(indCycleVal || structure.individual_evaluation_cycle) && (
                                <div className="fg month-picker-wrap">
                                    <div className="fg-label">Evaluation Month{neededMonths(indCycleVal || 'annual') > 1 ? 's' : ''} — Select {neededMonths(indCycleVal || 'annual')}</div>
                                    <div className="month-grid">
                                        {MONTHS.map((m, i) => {
                                            const num = i + 1;
                                            const sel = indMonths.includes(num);
                                            return (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => toggleMonth(indMonths, setIndMonths, indCycleVal || 'annual', num)}
                                                    className={cn('month-btn', sel && 'selected')}
                                                >
                                                    <span className="m-num">{String(num).padStart(2, '0')}</span>
                                                    <span className="m-name">{m}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className={cn('month-hint', indMonths.length === neededMonths(indCycleVal || 'annual') && 'filled')}>
                                        {indMonths.length === neededMonths(indCycleVal || 'annual')
                                            ? `✓ Evaluation months: ${indMonths.sort((a, b) => a - b).map((n) => MONTHS[n - 1]).join(', ')}`
                                            : `Select the month(s) when individual evaluation takes place`}
                                    </div>
                                </div>
                            )}
                            <div className="fg">
                                <div className="fg-label">Evaluator(s) <span className="fg-label-req">● Required</span></div>
                                <div className="card-grid g4">
                                    {[
                                        { val: 'primary', label: 'Direct Manager', desc: 'Immediate supervisor evaluates the employee. Most common approach.', icon: '👆' },
                                        { val: 'peer_same_dept', label: 'Peer Review', desc: 'Colleagues evaluate each other. Surfaces collaboration quality.', icon: '👥' },
                                        { val: 'self_evaluation', label: 'Self Assessment', desc: 'Employee evaluates themselves first. Sets the tone for the review discussion.', icon: '🪞' },
                                        { val: '360', label: '360° Feedback', desc: 'Manager + peer + self + subordinate. Most comprehensive picture.', icon: '🔄' },
                                    ].map(({ val, label, desc, icon }) => {
                                        const is360 = val === '360';
                                        const selected = is360
                                            ? (structure.individual_evaluators?.length ?? 0) >= 3
                                            : structure.individual_evaluators?.includes(val);
                                        const onClick = () => {
                                            if (is360) {
                                                const all = ['primary', 'peer_same_dept', 'self_evaluation'];
                                                const current = structure.individual_evaluators || [];
                                                const hasAll = all.every((e) => current.includes(e));
                                                setStructure((s) => ({
                                                    ...s,
                                                    individual_evaluators: hasAll
                                                        ? current.filter((x) => !all.includes(x))
                                                        : [...new Set([...(s.individual_evaluators || []), ...all])],
                                                }));
                                            } else {
                                                pickMulti('individual_evaluators' as keyof EvaluationStructure, val);
                                            }
                                        };
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={onClick}
                                                className={cn('opt-card multi-sel', selected && 'selected')}
                                            >
                                                <span className="opt-check" />
                                                <div className="opt-icon">{icon}</div>
                                                <div className="opt-title">{label}</div>
                                                <div className="opt-desc">{desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="fg">
                                <div className="fg-label">Evaluation Method <span className="fg-label-req">● Required</span></div>
                                <div className="card-grid g2">
                                    {(['absolute', 'relative'] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() =>
                                                setStructure((s) => ({
                                                    ...s,
                                                    individual_evaluation_method: m,
                                                    ...(m === 'relative' && !s.individual_rating_scale
                                                        ? { individual_rating_scale: '3-level' as const, individual_rating_distribution: [30, 40, 30] }
                                                        : {}),
                                                }))
                                            }
                                            className={cn('opt-card', structure.individual_evaluation_method === m && 'selected')}
                                        >
                                            <span className="opt-radio" />
                                            <div className="opt-icon">{m === 'absolute' ? '📏' : '⚖️'}</div>
                                            <div className="opt-title">{m === 'absolute' ? '절대평가 — Absolute' : '상대평가 — Relative'}</div>
                                            <div className="opt-desc">
                                                {m === 'absolute'
                                                    ? 'Each employee is scored against their own goals. Grade is not influenced by peers.'
                                                    : 'Employees are ranked within a peer group. Fixed distribution curve applied.'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {structure.individual_evaluation_method === 'relative' && (
                                <div className="evaluator-sub-inner">
                                    <div className="sub-label">Grade Distribution for Individual Evaluation</div>
                                    <div className="flex gap-2 mb-2">
                                        {(['3-level', '4-level', '5-level'] as const).map((scale) => (
                                            <button
                                                key={scale}
                                                type="button"
                                                onClick={() =>
                                                    setStructure((s) => ({
                                                        ...s,
                                                        individual_rating_scale: scale,
                                                        individual_rating_distribution:
                                                            scale === '3-level' ? [30, 40, 30] : scale === '4-level' ? [20, 35, 35, 10] : [10, 15, 50, 15, 10],
                                                    }))
                                                }
                                                className={cn(
                                                    'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors',
                                                    structure.individual_rating_scale === scale ? 'bg-[#2ec4a0] text-white border-[#2ec4a0]' : 'bg-white border-[#e0e7ef] text-[#5a6a85]'
                                                )}
                                            >
                                                {scale}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="dist-bar flex h-9 rounded-lg overflow-hidden gap-0.5">
                                        {(structure.individual_rating_scale === '5-level'
                                            ? ['S', 'A', 'B', 'C', 'D']
                                            : structure.individual_rating_scale === '4-level'
                                            ? ['A', 'B', 'C', 'D']
                                            : ['A', 'B', 'C']
                                        ).map((label, i) => (
                                            <div
                                                key={label}
                                                className="dist-seg flex items-center justify-center text-[10px] font-extrabold text-white"
                                                style={{
                                                    width: `${structure.individual_rating_distribution?.[i] ?? 0}%`,
                                                    background: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][i],
                                                }}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11.5px] text-[#5a6a85] mt-2">
                                        Total: {(structure.individual_rating_distribution || []).reduce((a, b) => a + b, 0)}%
                                    </p>
                                </div>
                            )}
                            <div className="fg">
                                <div className="fg-label">How Individual Score Is Used</div>
                                <div className="card-grid g2">
                                    {[
                                        { val: 'salary_adjustment', icon: '💵', title: 'Salary Increase', desc: 'Performance grade directly determines merit raise percentage.' },
                                        { val: 'bonus_allocation', icon: '🎁', title: 'Bonus / Incentive', desc: 'Performance score sets individual bonus multiplier.' },
                                        { val: 'promotion', icon: '🚀', title: 'Promotion Decision', desc: 'Minimum score thresholds gate eligibility for promotion.' },
                                        { val: 'training_selection', icon: '📚', title: 'Development Planning', desc: 'Results feed into personalized growth and training plans.' },
                                    ].map(({ val, icon, title, desc }) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => pickMulti('individual_use_of_results' as keyof EvaluationStructure, val)}
                                            className={cn('opt-card multi-sel', structure.individual_use_of_results?.includes(val) && 'selected')}
                                        >
                                            <span className="opt-check" />
                                            <div className="opt-icon">{icon}</div>
                                            <div className="opt-title">{title}</div>
                                            <div className="opt-desc">{desc}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="ind-usage-etc">
                                    <button
                                        type="button"
                                        onClick={() => setIndUsageOther(!indUsageOther)}
                                        className={cn('etc-check-row', indUsageOther && 'active')}
                                    >
                                        <span className="etc-checkbox" />
                                        <span className="etc-label">+ Other usage (specify)</span>
                                    </button>
                                    {indUsageOther && (
                                        <input
                                            type="text"
                                            className="etc-input"
                                            placeholder="Describe other usage..."
                                            value={structure.individual_use_of_results_other || ''}
                                            onChange={(e) => setStructure((s) => ({ ...s, individual_use_of_results_other: e.target.value }))}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side panel */}
                <div className="es-side-panel">
                    <div className="summary-card">
                        <div className="sum-label">📋 Configuration Summary</div>
                        <div className="sum-rows">
                            {summaryRows.map(({ key, val }) => (
                                <div key={key} className="sum-row">
                                    <div className="sum-key">{key}</div>
                                    <div className={cn('sum-val', val !== '—' ? 'filled' : 'empty')}>
                                        {val}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="sentence-card">
                        <div className="sent-label">📝 Plain-English Summary</div>
                        <div className="sent-txt" dangerouslySetInnerHTML={{ __html: sentenceSummary }} />
                    </div>
                    <div className="progress-card">
                        <div className="prog-label">Completion</div>
                        <div className="prog-bar-track">
                            <div
                                className="prog-bar-fill"
                                style={{ width: `${Math.round((progressDone / progressTotal) * 100)}%` }}
                            />
                        </div>
                        <div className="prog-nums">
                            <span className="prog-done">{progressDone} / {progressTotal} fields</span>
                            <span className="prog-total">{Math.round((progressDone / progressTotal) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="es-bottom-bar">
                <div className="bb-l">
                    <strong>Evaluation Structure</strong>
                    <span>— Step 4 of 5</span>
                </div>
                <div className="bb-r">
                    {onBack && (
                        <button type="button" className="btn-save" onClick={onBack}>
                            Back
                        </button>
                    )}
                    <button type="button" className="btn-next" onClick={handleContinue}>
                        Continue to Review
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
