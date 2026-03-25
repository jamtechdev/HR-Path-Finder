import React, { useMemo } from 'react';
import type {
    CompensationSnapshotQuestion,
    BaseSalaryFramework,
    PayBand,
    SalaryTable,
    BonusPoolConfiguration,
    BenefitsConfiguration,
} from '../types';
import type { HrProject } from '../types';

const NAVY = '#1A2B4A';
const MINT = '#2EC4A0';
const GOLD = '#C6985F';
const BLUE = '#3E7BFA';
const BG = '#F4F5F7';
const BG_SECTION = '#F8F9FB';
const BORDER = '#E2E6EC';
const TEXT_MUTED = '#8A96A8';
const TEXT_MID = '#4A5B78';

interface ReviewTabProps {
    project: HrProject;
    snapshotQuestions: CompensationSnapshotQuestion[];
    snapshotResponses: Record<number, string[] | string | number | object | null>;
    baseSalaryFramework: BaseSalaryFramework;
    payBands: PayBand[];
    salaryTables: SalaryTable[];
    bonusPool: BonusPoolConfiguration;
    benefits: BenefitsConfiguration;
}

function formatKrWon(n: number): string {
    // Display compact units in English (100M / 10K KRW scale).
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}×100M`;
    if (n >= 10000) return `${(n / 10000).toFixed(0)}×10K`;
    return n.toLocaleString();
}

export default function ReviewTab({
    project,
    snapshotQuestions,
    snapshotResponses,
    baseSalaryFramework,
    payBands,
    salaryTables,
    bonusPool,
    benefits,
}: ReviewTabProps) {
    const completedCount = useMemo(() => {
        let n = 0;
        if (snapshotQuestions.length > 0 && Object.keys(snapshotResponses).length > 0) n++;
        if (baseSalaryFramework && Object.keys(baseSalaryFramework).length > 0) n++;
        if (payBands.length > 0 || salaryTables.length > 0) n++;
        if (bonusPool && Object.keys(bonusPool).length > 0) n++;
        if (benefits && Object.keys(benefits).length > 0) n++;
        return n;
    }, [snapshotQuestions.length, snapshotResponses, baseSalaryFramework, payBands.length, salaryTables.length, bonusPool, benefits]);

    const totalModules = 5;
    const isPayBand = baseSalaryFramework?.salary_determination_standard === 'pay_band';

    // Pay band scale for visualization (all bands)
    const { scaleMin, scaleMax } = useMemo(() => {
        if (isPayBand && payBands.length > 0) {
            const mins = payBands.map((b) => b.min_salary);
            const maxs = payBands.map((b) => b.max_salary);
            const min = Math.min(...mins);
            const max = Math.max(...maxs);
            const padding = (max - min) * 0.1 || 1000000;
            return { scaleMin: min - padding, scaleMax: max + padding };
        }
        if (!isPayBand && salaryTables.length > 0) {
            const all: number[] = [];
            salaryTables.forEach((r) => {
                [r.level_1, r.level_2, r.level_3, r.level_4, r.level_5].forEach((v) => {
                    if (v != null) all.push(v);
                });
            });
            if (all.length === 0) return { scaleMin: 0, scaleMax: 100000000 };
            const min = Math.min(...all);
            const max = Math.max(...all);
            const padding = (max - min) * 0.1 || 1000000;
            return { scaleMin: min - padding, scaleMax: max + padding };
        }
        return { scaleMin: 0, scaleMax: 100000000 };
    }, [isPayBand, payBands, salaryTables]);

    const payBandRows = useMemo(() => {
        if (isPayBand && payBands.length > 0) {
            return payBands.map((b, i) => ({
                grade: b.job_grade,
                range: `${formatKrWon(b.min_salary)} – ${formatKrWon(b.max_salary)}`,
                min: b.min_salary,
                max: b.max_salary,
                target: b.target_salary ?? (b.min_salary + b.max_salary) / 2,
                color: i % 3 === 0 ? BLUE : i % 3 === 1 ? MINT : GOLD,
            }));
        }
        if (!isPayBand && salaryTables.length > 0) {
            const byGrade = new Map<string, { min: number; max: number; name: string }>();
            salaryTables.forEach((r) => {
                const name = r.job_role || r.grade;
                const vals = [r.level_1, r.level_2, r.level_3, r.level_4, r.level_5].filter((v) => v != null) as number[];
                if (vals.length === 0) return;
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                if (!byGrade.has(name)) byGrade.set(name, { min, max, name });
                else {
                    const cur = byGrade.get(name)!;
                    cur.min = Math.min(cur.min, min);
                    cur.max = Math.max(cur.max, max);
                }
            });
            return Array.from(byGrade.entries()).map(([_, v], i) => ({
                grade: v.name,
                range: `${formatKrWon(v.min)} – ${formatKrWon(v.max)}`,
                min: v.min,
                max: v.max,
                target: (v.min + v.max) / 2,
                color: i % 3 === 0 ? BLUE : i % 3 === 1 ? MINT : GOLD,
            }));
        }
        return [];
    }, [isPayBand, payBands, salaryTables]);

    // Compensation mix from benefits ratio and bonus (only if we have data)
    const mixRatios = useMemo(() => {
        const benefitsPct = benefits?.benefits_expense_ratio ?? 0;
        let incentivePct = 0;
        if (bonusPool?.ratio_value != null) incentivePct = Math.min(100, bonusPool.ratio_value);
        else if (bonusPool?.amount_value != null && benefits?.previous_year_total_salary) {
            incentivePct = Math.round((bonusPool.amount_value / benefits.previous_year_total_salary) * 100);
        }
        const basePct = Math.max(0, 100 - benefitsPct - incentivePct);
        return { base: basePct, incentive: incentivePct, benefits: benefitsPct };
    }, [benefits?.benefits_expense_ratio, benefits?.previous_year_total_salary, bonusPool?.ratio_value, bonusPool?.amount_value]);

    const hasSnapshot = snapshotQuestions.length > 0 && Object.keys(snapshotResponses).length > 0;
    const firstResponses = useMemo(() => {
        if (!hasSnapshot) return [];
        return snapshotQuestions.slice(0, 3).map((q) => {
            const r = snapshotResponses[q.id];
            const label = q.question_text?.slice(0, 30) || `Q${q.id}`;
            let val: string;
            if (Array.isArray(r)) val = r.join(', ');
            else if (typeof r === 'number') val = r.toLocaleString();
            else val = (r as string) ?? '—';
            return { label, val };
        });
    }, [hasSnapshot, snapshotQuestions, snapshotResponses]);

    const progressPct = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
    const stepCompleted = useMemo(() => ({
        snapshot: snapshotQuestions.length > 0 && Object.keys(snapshotResponses).length > 0,
        base: baseSalaryFramework != null && Object.keys(baseSalaryFramework).length > 0,
        payBand: payBands.length > 0 || salaryTables.length > 0,
        bonus: bonusPool != null && Object.keys(bonusPool).length > 0,
        benefits: benefits != null && Object.keys(benefits).length > 0,
    }), [snapshotQuestions.length, snapshotResponses, baseSalaryFramework, payBands.length, salaryTables.length, bonusPool, benefits]);

    const structureTypeLabel: Record<string, string> = {
        annual_accumulated: 'Annual Accumulated',
        annual_non_accumulated: 'Annual Non-Accumulated',
        monthly: 'Monthly',
    };
    const triggerLabel: Record<string, string> = {
        profit: 'Profit',
        company_target: 'Company Targets',
        org_target: 'Organizational Targets',
        discretion: 'Discretion',
    };
    const eligibilityLabel: Record<string, string> = {
        all: 'All Employees',
        all_excl: 'All (excl. exec/contract)',
        all_exec_incl: 'All (exec incl., contract excl.)',
        regular: 'Regular Employees Only',
        grade: 'By Grade',
        org: 'By Organization',
        other_scope: 'Other',
    };
    const formatLabel = (map: Record<string, string>, value: string | undefined): string =>
        (value && map[value]) ? map[value] : (value || '—');
    const stratLabel: Record<string, string> = {
        competitive: 'Talent Competitiveness',
        cost: 'Cost Efficiency',
        perf_drive: 'Performance Drive',
        safety: 'Employee Safety Net',
    };

    return (
        <div className="min-h-full" style={{ background: BG, color: NAVY, fontFamily: "'Pretendard', 'DM Sans', -apple-system, sans-serif" }}>
            {/* Hero */}
            <div
                className="relative overflow-hidden px-7 py-7"
                style={{
                    background: 'linear-gradient(135deg, #1A2B4A 0%, #2C3E5D 60%, #243B60 100%)',
                }}
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="flex flex-wrap items-end justify-between gap-5 relative">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-[11px] text-white/50">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide" style={{ background: 'rgba(46,196,160,0.2)', border: '1px solid rgba(46,196,160,0.4)', color: MINT }}>
                                COMPENSATION STRUCTURE
                            </span>
                            <span>/ Step 6 of 6 · Review & Submit</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                            Review & Submit<br />
                            <em className="text-[22px] font-normal" style={{ color: MINT }}>Compensation System</em>
                        </h1>
                        <p className="text-xs text-white/55 mt-2 max-w-[460px] leading-relaxed">
                            Define the structural principles governing how base salaries are organized, adjusted, and differentiated across your organization.
                        </p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                        <div className="relative w-[60px] h-[60px] mx-auto">
                            <svg className="w-[60px] h-[60px] -rotate-90" viewBox="0 0 60 60">
                                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                <circle cx="30" cy="30" r="26" fill="none" stroke={MINT} strokeWidth="3" strokeLinecap="round" strokeDasharray="163" strokeDashoffset={163 - (163 * progressPct) / 100} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[13px] font-bold" style={{ color: MINT }}>{progressPct}%</span>
                                <span className="text-[8px] text-white/40 tracking-wider mt-0.5">DONE</span>
                            </div>
                        </div>
                        {(progressPct >= 100 || completedCount >= totalModules) && (
                            <div className="inline-flex items-center gap-1.5 mt-2 text-[9px] font-semibold tracking-wide px-2.5 py-1 rounded border" style={{ color: MINT, borderColor: 'rgba(46,196,160,0.35)', background: 'rgba(46,196,160,0.12)' }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MINT }} />
                                READY TO SUBMIT
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 px-6 py-6 pb-28 w-full max-w-7xl mx-auto lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                    {/* Snapshot card — from snapshot + benefits/bonus */}
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: BG_SECTION, borderColor: BORDER }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: MINT }}>◈</div>
                                <span className="text-sm font-semibold" style={{ color: NAVY }}>Strategic Compensation Snapshot</span>
                            </div>
                            {stepCompleted.snapshot && <span className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: '#E6F7F3', color: MINT, border: '1px solid #A8E6D9' }}>LIVE READ</span>}
                        </div>
                        <div className="p-5">
                            {!stepCompleted.snapshot && !benefits?.benefits_expense_ratio && !bonusPool?.payment_trigger_condition ? (
                                <p className="text-sm py-4" style={{ color: TEXT_MUTED }}>Complete the Strategic Compensation Snapshot step to see your summary here.</p>
                            ) : (
                                <>
                                    {firstResponses.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                            {firstResponses.map((item, i) => (
                                                <div key={i} className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                                    <div className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{ color: TEXT_MUTED }}>{item.label}</div>
                                                    <div className="text-base font-bold break-words" style={{ color: i === 0 ? GOLD : i === 1 ? NAVY : MINT }}>{item.val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(mixRatios.base > 0 || mixRatios.incentive > 0 || mixRatios.benefits > 0) && (
                                        <>
                                            <div className="text-[10px] font-semibold mb-2 uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Compensation Mix / Compensation Mix Ratio</div>
                                            <div className="flex h-4 rounded-lg overflow-hidden gap-0.5">
                                                <div className="h-full rounded-l" style={{ background: MINT, flex: mixRatios.base || 1 }} />
                                                <div className="h-full" style={{ background: GOLD, flex: mixRatios.incentive || 0 }} />
                                                <div className="h-full rounded-r" style={{ background: BLUE, flex: mixRatios.benefits || 0 }} />
                                            </div>
                                            <div className="flex gap-6 mt-3 flex-wrap text-xs" style={{ color: TEXT_MID }}>
                                                <span><span className="inline-block w-2.5 h-2.5 rounded mr-1.5 align-middle" style={{ background: MINT }} /> Base {mixRatios.base}%</span>
                                                <span><span className="inline-block w-2.5 h-2.5 rounded mr-1.5 align-middle" style={{ background: GOLD }} /> Incentive {mixRatios.incentive}%</span>
                                                <span><span className="inline-block w-2.5 h-2.5 rounded mr-1.5 align-middle" style={{ background: BLUE }} /> Benefits {mixRatios.benefits}%</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Base Salary Framework — from baseSalaryFramework */}
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: BG_SECTION, borderColor: BORDER }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: NAVY }}>A</div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 border rounded" style={{ color: TEXT_MUTED, borderColor: BORDER }}>REF-CODE-04A</span>
                                <span className="text-sm font-semibold" style={{ color: NAVY }}>Base Salary Framework</span>
                            </div>
                            {stepCompleted.base && <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MINT }}><span className="w-2 h-2 rounded-full" style={{ background: MINT }} /> Completed</div>}
                        </div>
                        <div className="p-5">
                            {!stepCompleted.base ? (
                                <p className="text-sm py-4" style={{ color: TEXT_MUTED }}>Complete the Base Salary Framework step to see your summary here.</p>
                            ) : (
                                <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Salary Structure Type</div>
                                        <div className="text-sm font-semibold" style={{ color: NAVY }}>{formatLabel(structureTypeLabel, baseSalaryFramework.salary_structure_type)}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Adjustment Unit</div>
                                        <div className="text-sm font-semibold">{baseSalaryFramework.salary_adjustment_unit || '—'}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Determination Standard</div>
                                        <div className="text-sm font-semibold" style={{ color: BLUE }}>{baseSalaryFramework.salary_determination_standard === 'pay_band' ? 'Pay Band' : baseSalaryFramework.salary_determination_standard === 'salary_table' ? 'Salary Table' : (baseSalaryFramework.salary_determination_standard || '—')}</div>
                                    </div>
                                    {(() => {
                                        let total = 0;
                                        if (payBands.length > 0) total = payBands.reduce((s, b) => s + (b.target_salary ?? (b.min_salary + b.max_salary) / 2), 0);
                                        else if (salaryTables.length > 0) {
                                            salaryTables.forEach((r) => {
                                                const vals = [r.level_1, r.level_2, r.level_3, r.level_4, r.level_5].filter((v) => v != null) as number[];
                                                if (vals.length > 0) total += vals.reduce((a, b) => a + b, 0) / vals.length;
                                            });
                                        }
                                        if (total <= 0) return null;
                                        return (
                                            <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                                <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Total Base Salary Pool</div>
                                                <div className="text-sm font-semibold" style={{ color: GOLD }}>{formatKrWon(total)} KRW</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {payBandRows.length > 0 && (
                                    <>
                                        <div className="h-px my-3" style={{ background: BORDER }} />
                                        <div className="text-[10px] font-semibold mb-3" style={{ color: TEXT_MUTED }}>PAY BAND STRUCTURE — Grade Visualization</div>
                                        {payBandRows.map((row, i) => {
                                            const span = scaleMax - scaleMin || 1;
                                            const left = ((row.min - scaleMin) / span) * 100;
                                            const width = ((row.max - row.min) / span) * 100;
                                            const mid = ((row.target - scaleMin) / span) * 100;
                                            return (
                                                <div key={i} className="mb-4">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[11px] font-semibold" style={{ color: NAVY }}>{row.grade}</span>
                                                        <span className="text-[10px]" style={{ color: TEXT_MUTED }}>{row.range}</span>
                                                    </div>
                                                    <div className="relative h-2.5 rounded border" style={{ background: '#EEF1F6', borderColor: BORDER }}>
                                                        <div className="absolute top-0 bottom-0 rounded" style={{ left: `${left}%`, width: `${width}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color}99)` }} />
                                                        <div className="absolute top-0 bottom-0 w-0.5 -translate-x-px" style={{ left: `${left}%`, background: '#fff', zIndex: 2 }} title={`MIN ${formatKrWon(row.min)}`} />
                                                        <div className="absolute top-0 bottom-0 w-0.5 -translate-x-px" style={{ left: `${mid}%`, background: '#fff', zIndex: 2 }} title={`MID ${formatKrWon(row.target)}`} />
                                                        <div className="absolute top-0 bottom-0 w-0.5 -translate-x-px" style={{ left: `${left + width}%`, background: '#fff', zIndex: 2 }} title={`MAX ${formatKrWon(row.max)}`} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="flex justify-between mt-1 text-xs" style={{ color: TEXT_MUTED }}><span>{formatKrWon(scaleMin)}</span><span>{formatKrWon(scaleMax)}</span></div>
                                    </>
                                )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bonus Pool — from bonusPool */}
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: BG_SECTION, borderColor: BORDER }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: NAVY }}>B</div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 border rounded" style={{ color: TEXT_MUTED, borderColor: BORDER }}>REF-CODE-04B</span>
                                <span className="text-sm font-semibold" style={{ color: NAVY }}>Bonus Pool Configuration</span>
                            </div>
                            {stepCompleted.bonus && <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MINT }}><span className="w-2 h-2 rounded-full" style={{ background: MINT }} /> Completed</div>}
                        </div>
                        <div className="p-5">
                            {!stepCompleted.bonus ? (
                                <p className="text-sm py-4" style={{ color: TEXT_MUTED }}>Complete the Bonus Pool Configuration step to see your summary here.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Payment Trigger</div>
                                        <div className="text-sm font-semibold" style={{ color: NAVY }}>{formatLabel(triggerLabel, bonusPool.payment_trigger_condition)}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Determination Criteria</div>
                                        <div className="text-sm font-semibold" style={{ color: BLUE }}>{bonusPool.bonus_pool_determination_criteria || '—'}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                        <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Eligibility Scope</div>
                                        <div className="text-sm font-semibold">{formatLabel(eligibilityLabel, bonusPool.eligibility_scope)}</div>
                                    </div>
                                    {(bonusPool.amount_value != null || bonusPool.ratio_value != null) && (
                                        <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                            <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Incentive Pool</div>
                                            <div className="text-sm font-semibold" style={{ color: GOLD }}>
                                                {bonusPool.amount_value != null ? `${formatKrWon(bonusPool.amount_value)} KRW` : bonusPool.ratio_value != null ? `${bonusPool.ratio_value}% of salary` : '—'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Benefits — from benefits */}
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: BG_SECTION, borderColor: BORDER }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: NAVY }}>C</div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 border rounded" style={{ color: TEXT_MUTED, borderColor: BORDER }}>REF-CODE-04C</span>
                                <span className="text-sm font-semibold" style={{ color: NAVY }}>Benefits Configuration</span>
                            </div>
                            {stepCompleted.benefits && <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MINT }}><span className="w-2 h-2 rounded-full" style={{ background: MINT }} /> Completed</div>}
                        </div>
                        <div className="p-5">
                            {!stepCompleted.benefits ? (
                                <p className="text-sm py-4" style={{ color: TEXT_MUTED }}>Complete the Benefits Configuration step to see your summary here.</p>
                            ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {benefits.benefits_expense_ratio != null && (
                                        <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                            <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Benefits Expense Ratio</div>
                                            <div className="text-sm font-semibold" style={{ color: GOLD }}>{typeof benefits.benefits_expense_ratio === 'number' ? benefits.benefits_expense_ratio.toFixed(1) : benefits.benefits_expense_ratio}%</div>
                                        </div>
                                    )}
                                    {benefits.benefits_strategic_direction && benefits.benefits_strategic_direction.length > 0 && (
                                        <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                            <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Strategic Direction</div>
                                            <div className="text-sm font-semibold" style={{ color: BLUE }}>{benefits.benefits_strategic_direction.map((d) => stratLabel[d.value] || d.value).join(', ')}</div>
                                        </div>
                                    )}
                                    {benefits.previous_year_total_benefits_expense != null && (
                                        <div className="p-4 rounded-lg border" style={{ background: BG_SECTION, borderColor: BORDER }}>
                                            <div className="text-[10px] font-medium uppercase mb-1.5 tracking-wider" style={{ color: TEXT_MUTED }}>Benefits Funding</div>
                                            <div className="text-sm font-semibold" style={{ color: GOLD }}>{formatKrWon(benefits.previous_year_total_benefits_expense)} KRW</div>
                                        </div>
                                    )}
                                    </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="px-3.5 py-2 border-b flex items-center gap-2 text-[11px] font-semibold" style={{ background: BG_SECTION, borderColor: BORDER, color: NAVY }}>
                            <span style={{ color: MINT }}>✓</span> Module Checklist
                        </div>
                        <div className="p-3">
                            {[
                                { label: 'Strategic Snapshot', done: stepCompleted.snapshot },
                                { label: 'Base Salary Framework', done: stepCompleted.base },
                                { label: 'Pay Band / Salary Table', done: stepCompleted.payBand },
                                { label: 'Bonus Pool Config', done: stepCompleted.bonus },
                                { label: 'Benefits Configuration', done: stepCompleted.benefits },
                                { label: 'Review & Submit', done: true, current: true },
                            ].map(({ label, done, current }) => (
                                <div
                                    key={label}
                                    className={`flex items-center gap-2 p-2.5 rounded border mb-1.5 last:mb-0 ${current ? 'border-[#A8E6D9]' : ''}`}
                                    style={{ background: current ? '#E6F7F3' : BG_SECTION, borderColor: current ? '#A8E6D9' : BORDER }}
                                >
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ background: current ? NAVY : done ? MINT : '#CDD3DC' }}>{current ? '→' : done ? '✓' : '·'}</div>
                                    <span className={`text-[10px] ${current ? 'font-semibold' : 'font-medium'}`} style={{ color: current ? NAVY : done ? TEXT_MID : TEXT_MUTED }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-white" style={{ borderColor: BORDER }}>
                        <div className="px-5 py-3 border-b flex items-center gap-2 text-sm font-semibold" style={{ background: BG_SECTION, borderColor: BORDER, color: NAVY }}>
                            <span style={{ color: MINT }}>⬡</span> System Info
                        </div>
                        <div className="p-4">
                            <div className="flex flex-col gap-0">
                                <div className="flex justify-between py-2.5 border-b text-sm" style={{ borderColor: BORDER }}><span style={{ color: TEXT_MUTED }}>Company</span><span className="font-medium">{project.company?.name || '—'}</span></div>
                                <div className="flex justify-between py-2.5 border-b text-sm" style={{ borderColor: BORDER }}><span style={{ color: TEXT_MUTED }}>Completed Modules</span><span className="font-semibold" style={{ color: MINT }}>{completedCount} / {totalModules} Completed</span></div>
                            </div>
                            <div className="mt-4 p-4 rounded-lg border text-xs leading-relaxed" style={{ background: '#E6F7F3', borderColor: '#A8E6D9', color: TEXT_MID }}>
                                <strong className="block mb-1.5" style={{ color: NAVY }}>After Submission</strong>
                                After submission, the full Step 4 modules are completed. The consultant reviews the design and the CEO proceeds with the final approval.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
