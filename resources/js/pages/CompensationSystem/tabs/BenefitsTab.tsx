import React, { useMemo, useCallback, useState } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type { BenefitsConfiguration } from '../types';

interface BenefitItem {
    id: string;
    name: string;
    bs: number;
    bi: number;
    tax: boolean;
    cost: number;
    rec: boolean;
    cp: {
        tag: string;
        tl: string;
        title: string;
        desc: string;
        effect: string;
        caution: string;
        ex: string;
    };
}

interface BenefitCategory {
    id: string;
    icon: string;
    name: string;
    items: BenefitItem[];
}

const CATS: BenefitCategory[] = [
    {
        id: 'life',
        icon: '💰',
        name: '생활/경제',
        items: [
            {
                id: 'meal',
                name: '식대 지원',
                bs: 92,
                bi: 88,
                tax: true,
                cost: 120,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: '절세',
                    title: '식대 지원',
                    desc: '월 20만원 이내 식대는 복리후생비와 비과세 세 혜택이 적용됩니다.',
                    effect: '비과세 한도 내 운영 시 회사·직원 모두 세부담 완화. 연간 1인당 최대 240만원 비과세.',
                    caution: '현물 식사와 식대 중복 비과세 불가. 사내식당 운영 시 별도 검토 필요.',
                    ex: '예시: 월 20만원 식대 · 연간 240만원 비과세',
                },
            },
            {
                id: 'transport',
                name: '교통비 지원',
                bs: 78,
                bi: 72,
                tax: false,
                cost: 60,
                rec: false,
                cp: {
                    tag: 'mint',
                    tl: '복지',
                    title: '교통비 지원',
                    desc: '통근 교통비를 월정액 또는 실비로 지원합니다.',
                    effect: '출퇴근 부담 완화, 원거리 인재 유지에 유리.',
                    caution: '자가용 통근자 유류비 지원 시 과세 여부 사전 확인.',
                    ex: '예시: 월 10만원 정액 또는 대중교통 실비',
                },
            },
        ],
    },
    {
        id: 'health',
        icon: '🏃',
        name: '건강/에너지',
        items: [
            {
                id: 'checkup',
                name: '건강검진',
                bs: 95,
                bi: 90,
                tax: true,
                cost: 20,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: '비용인정',
                    title: '임직원 건강검진',
                    desc: '연 1회 이상 건강검진 비용은 복리후생비로 전액 비용 인정.',
                    effect: '세법상 복리후생비 인정. 1인당 20~50만원 수준.',
                    caution: '임원과 직원 간 차등 지원 시 임원 분 손금 불산입 위험.',
                    ex: '예시: 일반 검진 연 20만원 + 종합검진 선택 지원',
                },
            },
        ],
    },
    {
        id: 'growth',
        icon: '📚',
        name: '성장/자기계발',
        items: [
            {
                id: 'edu',
                name: '교육비 지원',
                bs: 82,
                bi: 75,
                tax: true,
                cost: 100,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: '비용인정',
                    title: '임직원 교육훈련비',
                    desc: '직무 관련 교육훈련비는 전액 비용 처리 가능.',
                    effect: '직무역량 강화, 인재 개발 투자.',
                    caution: '직무 무관 순수 자기계발은 과세 여부 검토 필요.',
                    ex: '예시: 연 100만원 자기계발비 + 사내 교육 프로그램 무상',
                },
            },
        ],
    },
];

const STRAT_OPTIONS = [
    { key: 'competitive', label: 'Talent Competitiveness' },
    { key: 'cost', label: 'Cost Efficiency' },
    { key: 'perf_drive', label: 'Performance Drive' },
    { key: 'safety', label: 'Employee Safety Net' },
];

const STRAT_GUIDE: Record<
    string,
    { tag: string; title: string; persona: string; desc: string; rec: string[]; ex: string }
> = {
    competitive: {
        tag: 'Talent Competitiveness',
        title: 'Talent War — "Match or exceed the market"',
        persona: 'High-growth startups where talent acquisition is the top priority',
        desc: 'Secure top-tier benefits vs. the industry. Minimize the gap against competitors.',
        rec: ['Mental Health (EAP)', 'Remote & Flexible Work', 'L&D Budget'],
        ex: 'e.g. Audit competitor benefits and mandate items adopted by 70%+ of peers',
    },
    cost: {
        tag: 'Cost Efficiency',
        title: 'Tax & Cost — "Maximize real take-home value"',
        persona: 'SMEs that need to optimize their benefits budget',
        desc: 'Maximize employee-perceived value by leveraging tax-exempt and deductible items.',
        rec: ['Meal Allowance — 2.4M KRW/yr tax-free', 'Health Checkup — fully deductible'],
        ex: 'e.g. Allocate 70%+ of total benefits budget to tax-deductible items',
    },
    perf_drive: {
        tag: 'Performance Drive',
        title: 'Performance — "Combine high-performance environment with rewards"',
        persona: 'Organizations aiming for a high-performance culture',
        desc: 'Design benefits that support individual capability growth and work engagement.',
        rec: ['Training / Conferences', 'Coaching & Mentoring', 'Remote & Flexible Work'],
        ex: 'e.g. Additional L&D budget for top performers (S/A rating)',
    },
    safety: {
        tag: 'Employee Safety Net',
        title: 'Safety Net — "Provide stable care for your people"',
        persona: 'Companies that prioritize long-term retention and family-friendly culture',
        desc: 'Support the financial stability of employees and their families.',
        rec: ['Congratulatory/Condolence', 'Childcare & Tuition', 'Parental Leave'],
        ex: 'e.g. Life stability loan for 3+ year employees',
    },
};

const STATUS_OPTIONS = [
    { value: 'maintain', label: 'Maintain' },
    { value: 'expand', label: 'Expand' },
    { value: 'reduce', label: 'Reduce' },
    { value: 'remove', label: 'Discontinue' },
    { value: 'new', label: 'New' },
];

interface BenefitsTabProps {
    configuration: BenefitsConfiguration;
    onUpdate: (config: BenefitsConfiguration) => void;
    snapshotBenefitsPrograms?: string[];
    fieldErrors?: FieldErrors;
}

function getItemState(
    configuration: BenefitsConfiguration,
    itemId: string
): { active: boolean; status: string } {
    const current = configuration.current_benefits_programs || [];
    const future = configuration.future_programs || [];
    const fromCurrent = current.find((p) => p.name === itemId);
    const fromFuture = future.find((p) => p.name === itemId);
    if (fromCurrent) return { active: true, status: fromCurrent.status };
    if (fromFuture) return { active: true, status: fromFuture.status };
    return { active: false, status: 'none' };
}

export default function BenefitsTab({
    configuration,
    onUpdate,
    snapshotBenefitsPrograms = [],
    fieldErrors = {},
}: BenefitsTabProps) {
    const [selectedConcept, setSelectedConcept] = useState<
        { type: 'item'; item: BenefitItem } | { type: 'strat'; key: string } | null
    >(null);
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(CATS.map((c) => c.id)));

    const totalLabor = configuration.previous_year_total_salary ?? 0;
    const totalBenefit = configuration.previous_year_total_benefits_expense ?? 0;
    const ratio = totalLabor > 0 ? (totalBenefit / totalLabor) * 100 : 0;
    const ratioStatus =
        ratio < 5 ? 'below' : ratio > 15 ? 'above' : 'ok';
    const ratioStatusText =
        ratioStatus === 'below'
            ? 'Below industry average (8–12%)'
            : ratioStatus === 'above'
              ? 'Above industry average — structural review recommended'
              : 'Within appropriate range';

    const stratSelected = useMemo(
        () => configuration.benefits_strategic_direction?.map((d) => d.value) ?? [],
        [configuration.benefits_strategic_direction]
    );

    const toggleStrat = useCallback(
        (key: string) => {
            const current = configuration.benefits_strategic_direction || [];
            const has = current.some((d) => d.value === key);
            if (has) {
                onUpdate({
                    ...configuration,
                    benefits_strategic_direction: current.filter((d) => d.value !== key),
                });
            } else if (current.length < 2) {
                onUpdate({
                    ...configuration,
                    benefits_strategic_direction: [
                        ...current,
                        { value: key, priority: current.length === 0 ? 'primary' : 'secondary' },
                    ],
                });
            }
            setSelectedConcept({ type: 'strat', key });
        },
        [configuration, onUpdate]
    );

    const toggleItem = useCallback(
        (item: BenefitItem) => {
            const state = getItemState(configuration, item.id);
            const current = configuration.current_benefits_programs || [];
            const future = configuration.future_programs || [];
            if (state.active) {
                onUpdate({
                    ...configuration,
                    current_benefits_programs: current.filter((p) => p.name !== item.id),
                    future_programs: future.filter((p) => p.name !== item.id),
                });
                setSelectedConcept(null);
            } else {
                const next = { name: item.id, status: 'maintain' as const };
                onUpdate({
                    ...configuration,
                    current_benefits_programs: [...current, next],
                });
                setSelectedConcept({ type: 'item', item });
            }
        },
        [configuration, onUpdate]
    );

    const setItemStatus = useCallback(
        (itemId: string, status: string) => {
            const current = configuration.current_benefits_programs || [];
            const future = configuration.future_programs || [];
            const inCurrent = current.findIndex((p) => p.name === itemId);
            const inFuture = future.findIndex((p) => p.name === itemId);
            const nextCurrent = current.filter((p) => p.name !== itemId);
            const nextFuture = future.filter((p) => p.name !== itemId);
            if (status === 'new') {
                nextFuture.push({ name: itemId, status: 'new' });
            } else {
                nextCurrent.push({ name: itemId, status });
            }
            onUpdate({
                ...configuration,
                current_benefits_programs: nextCurrent,
                future_programs: nextFuture,
            });
        },
        [configuration, onUpdate]
    );

    const activeItems = useMemo(() => {
        const set = new Set<string>();
        (configuration.current_benefits_programs || []).forEach((p) => set.add(p.name));
        (configuration.future_programs || []).forEach((p) => set.add(p.name));
        return set;
    }, [configuration.current_benefits_programs, configuration.future_programs]);

    const taxItems = useMemo(() => {
        const names: string[] = [];
        CATS.forEach((cat) =>
            cat.items.forEach((item) => {
                if (item.tax && activeItems.has(item.id)) names.push(item.name);
            })
        );
        return names;
    }, [activeItems]);

    const summaryHtml = useMemo(() => {
        const count = activeItems.size;
        const strats = stratSelected
            .map((k) => STRAT_OPTIONS.find((o) => o.key === k)?.label ?? k)
            .join(' · ');
        const taxList = taxItems.slice(0, 4).join(', ') + (taxItems.length > 4 ? ` and ${taxItems.length - 4} more` : '');
        let s = `The company operates <span class="text-[#5DCAA5] font-bold">${count}</span> benefits programs. `;
        if (strats)
            s += `<span class="text-[#5DCAA5] font-bold">${strats}</span> set as core strategic directions. `;
        if (taxList)
            s += `<span class="text-[#5DCAA5] font-bold">${taxList}</span> identified as tax-deductible items for cost optimization. `;
        if (totalLabor > 0)
            s += `Benefits expense ratio vs. total labor cost: <span class="text-[#5DCAA5] font-bold">${ratio.toFixed(1)}%</span>. `;
        s += 'All items are systematically managed by category.';
        return s;
    }, [activeItems.size, stratSelected, taxItems, totalLabor, ratio]);

    const filledCount = useMemo(
        () =>
            [
                configuration.previous_year_total_salary,
                configuration.previous_year_total_benefits_expense,
                configuration.benefits_strategic_direction?.length,
                activeItems.size,
            ].filter(Boolean).length,
        [configuration, activeItems.size]
    );
    const completionPct = Math.min(100, Math.round((filledCount / 4) * 100));

    const conceptPanel = useMemo(() => {
        if (selectedConcept?.type === 'strat') {
            const d = STRAT_GUIDE[selectedConcept.key];
            if (!d) return null;
            return (
                <div className="rounded-lg border bg-muted/30 p-3">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 bg-[#E8F7F2] text-[#0B6B4A]">
                        {d.tag}
                    </span>
                    <div className="font-semibold text-[#1B2E4B] text-sm mb-1">{d.title}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Target Persona
                    </div>
                    <div className="text-xs text-muted-foreground italic mb-2">{d.persona}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Strategic Focus
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.desc}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Recommended Priority Items
                    </div>
                    {d.rec.map((r, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                            <span className="text-[#1D9E75] text-xs">✓</span>
                            <span className="text-xs text-muted-foreground">{r}</span>
                        </div>
                    ))}
                    <div className="text-[10px] text-muted-foreground bg-background rounded-md px-2 py-1.5 border-l-2 border-[#1D9E75] mt-2">
                        {d.ex}
                    </div>
                </div>
            );
        }
        if (selectedConcept?.type === 'item') {
            const { item } = selectedConcept;
            const d = item.cp;
            return (
                <div className="rounded-lg border bg-muted/30 p-3">
                    <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                            d.tag === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-[#E8F7F2] text-[#0B6B4A]'
                        }`}
                    >
                        {d.tl}
                    </span>
                    <div className="font-semibold text-[#1B2E4B] text-sm mb-1">{d.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.desc}</p>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                        BENEFITS
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.effect}</div>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                        CAUTION
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.caution}</div>
                    <div className="text-[10px] text-muted-foreground bg-background rounded-md px-2 py-1.5 border-l-2 border-[#1D9E75]">
                        {d.ex}
                    </div>
                </div>
            );
        }
        return (
            <p className="text-xs italic text-muted-foreground">
                Click a benefits card
                <br />
                to view the detailed guide.
            </p>
        );
    }, [selectedConcept]);

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag="Compensation Structure"
                stepLabel="Step 5 of 6 · Benefits Configuration"
                title="Benefits Configuration"
                description="Diagnose current benefits and design future strategy based on industry benchmarking data."
                completionPct={completionPct}
            />
            <FieldErrorMessage fieldKey="comp-benefits" errors={fieldErrors} className="mt-4 px-1" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 pt-6 max-w-[1100px]">
                <div className="flex flex-col gap-4">
                    {/* Budget Overview */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                                Benefits Budget Overview
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                                        Total Labor Cost (100M KRW)
                                    </Label>
                                    <Input
                                        type="number"
                                        step={0.1}
                                        placeholder="e.g. 20"
                                        className="mt-1 font-semibold"
                                        value={totalLabor || ''}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...configuration,
                                                previous_year_total_salary: parseFloat(e.target.value) || undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                                        Total Benefits Expense (100M KRW)
                                    </Label>
                                    <Input
                                        type="number"
                                        step={0.1}
                                        placeholder="e.g. 1.5"
                                        className="mt-1 font-semibold"
                                        value={totalBenefit || ''}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...configuration,
                                                previous_year_total_benefits_expense:
                                                    parseFloat(e.target.value) || undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                                        Benefits Expense Ratio
                                    </Label>
                                    <div className="text-2xl font-extrabold text-[#1D9E75] mt-1">
                                        {totalLabor > 0 ? `${ratio.toFixed(2)}%` : '— %'}
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                ratioStatus === 'ok'
                                                    ? 'bg-[#1D9E75]'
                                                    : ratioStatus === 'above'
                                                      ? 'bg-destructive'
                                                      : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${Math.min(ratio * 5, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {ratioStatusText}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strategic Direction */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                Benefits Strategic Direction (Select up to 2)
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {STRAT_OPTIONS.map((opt) => {
                                    const selected = stratSelected.includes(opt.key);
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => toggleStrat(opt.key)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                                selected
                                                    ? 'bg-[#1B2E4B] text-white border-[#1B2E4B]'
                                                    : 'bg-background border-border hover:bg-muted'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {stratSelected.length === 2 && (
                                <p className="text-xs text-muted-foreground mt-2">2 selected</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category accordions */}
                    {CATS.map((cat) => {
                        const open = openCategories.has(cat.id);
                        const count = cat.items.filter((i) => activeItems.has(i.id)).length;
                        return (
                            <Card key={cat.id} className="shadow-sm border rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                        setOpenCategories((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(cat.id)) next.delete(cat.id);
                                            else next.add(cat.id);
                                            return next;
                                        });
                                    }}
                                >
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="font-bold text-[#1B2E4B] flex-1">{cat.name}</span>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {count}/{cat.items.length}
                                    </span>
                                    <span
                                        className={`text-muted-foreground transition-transform ${open ? '' : '-rotate-90'}`}
                                    >
                                        ▼
                                    </span>
                                </button>
                                {open && (
                                    <CardContent className="pt-0 pb-4 px-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {cat.items.map((item) => {
                                                const state = getItemState(configuration, item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) => {
                                                            if ((e.target as HTMLElement).closest('select')) return;
                                                            toggleItem(item);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                toggleItem(item);
                                                            }
                                                        }}
                                                        className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                                                            state.active
                                                                ? 'border-[#1D9E75] bg-[#E8F7F2]'
                                                                : 'border-border bg-muted/30 hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <div className="flex flex-wrap gap-1 mb-1">
                                                            {item.tax && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                                    💰 Tax Deductible
                                                                </span>
                                                            )}
                                                            {item.rec && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                                                    ⭐ Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span
                                                                className={`font-semibold text-sm ${
                                                                    state.active ? 'text-[#0B6B4A]' : 'text-foreground'
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {state.active && (
                                                                <span className="w-4 h-4 rounded bg-[#1D9E75] flex items-center justify-center text-white text-xs">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="h-0.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-muted-foreground/40 rounded-full"
                                                                    style={{ width: `${item.bs}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[9px] text-muted-foreground mt-0.5">
                                                                Industry avg. adoption: {item.bi}%
                                                            </p>
                                                        </div>
                                                        {state.active && (
                                                            <div
                                                                className="mt-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                            >
                                                                <Select
                                                                    value={state.status === 'none' ? 'maintain' : state.status}
                                                                    onValueChange={(v) => {
                                                                        setItemStatus(item.id, v);
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {STATUS_OPTIONS.map((opt) => (
                                                                            <SelectItem
                                                                                key={opt.value}
                                                                                value={opt.value}
                                                                            >
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}

                    {/* Summary Note */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Summary Note
                                </span>
                                <span className="text-[10px] text-muted-foreground">Auto-generated</span>
                            </div>
                            <div className="bg-[#1B2E4B] rounded-xl p-5 text-white">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                                    Policy Statement
                                </div>
                                <div
                                    className="text-sm leading-relaxed text-white/90"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            activeItems.size > 0
                                                ? summaryHtml
                                                : '<span class="italic text-white/40">Select benefits items to auto-generate the policy statement.</span>',
                                    }}
                                />
                                <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                                    ※ The final HR system design report will include professional consultant
                                    reviews and recommendations.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Side panel */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="font-semibold text-[#1B2E4B] mb-3">Step Purpose</div>
                            <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    Diagnose current benefits across <strong>6 categories</strong>.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    <strong>Industry benchmarking data</strong> to identify gaps.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    Identify <strong>tax-deductible</strong> items to maximize cost efficiency.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    <strong>Budget ratio</strong> updates in real time as you select items.
                                </li>
                            </ul>
                            <div className="h-px bg-border my-4" />
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                선택 옵션 가이드
                            </div>
                            {conceptPanel}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
