import React, { useMemo, useCallback, useState } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
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
        name: 'Lifestyle & Economy',
        items: [
            {
                id: 'meal',
                name: 'Meal Allowance',
                bs: 92,
                bi: 88,
                tax: true,
                cost: 120,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: 'Tax savings',
                    title: 'Meal Allowance',
                    desc: 'Meal allowances up to 200,000 KRW per month qualify as welfare expenses and receive tax-exempt benefits.',
                    effect: 'When operated within the tax-exempt limit, it reduces the tax burden for both the company and employees. Up to 2,400,000 KRW per person per year is tax-exempt.',
                    caution: 'Tax-exempt treatment cannot be duplicated between in-kind meals and meal allowances. If operating an in-house cafeteria, review separately.',
                    ex: 'Example: Meal allowance of 200,000 KRW/month; tax-exempt up to 2,400,000 KRW/year',
                },
            },
            {
                id: 'transport',
                name: 'Transportation Allowance',
                bs: 78,
                bi: 72,
                tax: false,
                cost: 60,
                rec: false,
                cp: {
                    tag: 'mint',
                    tl: 'Welfare',
                    title: 'Transportation Allowance',
                    desc: 'Provide commuting transportation costs either as a monthly fixed allowance or reimbursement of actual expenses.',
                    effect: 'Reduces the commuting burden and helps retain talent living in distant areas.',
                    caution: 'If reimbursing fuel costs for employees commuting by private vehicle, confirm taxability in advance.',
                    ex: 'Example: 100,000 KRW fixed per month or reimbursement of actual public-transport expenses',
                },
            },
        ],
    },
    {
        id: 'health',
        icon: '🏃',
        name: 'Health & Energy',
        items: [
            {
                id: 'checkup',
                name: 'Health Screening',
                bs: 95,
                bi: 90,
                tax: true,
                cost: 20,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: 'Deductible costs',
                    title: 'Employee Health Screening',
                    desc: 'Health screening costs paid at least once per year can be fully recognized as deductible welfare expenses.',
                    effect: 'Recognized as welfare expense under tax law. Typically 200,000–500,000 KRW per person.',
                    caution: 'If support differs between executives and employees, there is a risk that executives’ portions may not be deductible.',
                    ex: 'Example: 200,000 KRW/year for basic screening + optional coverage for comprehensive screening',
                },
            },
        ],
    },
    {
        id: 'growth',
        icon: '📚',
        name: 'Growth & Self-Development',
        items: [
            {
                id: 'edu',
                name: 'Education & Training Support',
                bs: 82,
                bi: 75,
                tax: true,
                cost: 100,
                rec: false,
                cp: {
                    tag: 'gold',
                    tl: 'Deductible costs',
                    title: 'Employee Education & Training Expenses',
                    desc: 'Job-related education and training expenses can be fully treated as deductible costs.',
                    effect: 'Strengthen job-related capabilities and invest in talent development.',
                    caution: 'Pure self-development unrelated to the job requires review of tax treatment.',
                    ex: 'Example: 1,000,000 KRW/year for self-development + free internal training programs',
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
    const { t } = useTranslation();
    const tt = (key: string, fallback: string, vars?: Record<string, unknown>) =>
        t(key, { defaultValue: fallback, ...(vars ?? {}) });
    const [selectedConcept, setSelectedConcept] = useState<
        { type: 'item'; item: BenefitItem } | { type: 'strat'; key: string } | null
    >(null);
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(CATS.map((c) => c.id)));

    const totalLabor = configuration.previous_year_total_salary ?? 0;
    const totalBenefit = configuration.previous_year_total_benefits_expense ?? 0;
    const rawRatio = totalLabor > 0 ? (totalBenefit / totalLabor) * 100 : 0;
    const ratio = Math.min(rawRatio, 100);
    const ratioStatus =
        rawRatio > 100 ? 'invalid' : ratio < 5 ? 'below' : ratio > 15 ? 'above' : 'ok';
    const ratioStatusText =
        ratioStatus === 'invalid'
            ? tt('compensation_system.benefits.ratio_invalid', 'Benefits expense cannot exceed total labor cost (max 100%).')
            : ratioStatus === 'below'
            ? tt('compensation_system.benefits.ratio_below', 'Below industry average (8–12%)')
            : ratioStatus === 'above'
              ? tt('compensation_system.benefits.ratio_above', 'Above industry average — structural review recommended')
              : tt('compensation_system.benefits.ratio_ok', 'Within appropriate range');

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
        let s = `${tt('compensation_system.benefits.summary_prefix', 'The company operates ')}<span class="text-emerald-400 font-bold">${count}</span> ${tt('compensation_system.benefits.summary_programs', 'benefits programs.') } `;
        if (strats)
            s += `<span class="text-emerald-400 font-bold">${strats}</span> ${tt('compensation_system.benefits.summary_strategic', 'set as core strategic directions.')} `;
        if (taxList)
            s += `<span class="text-emerald-400 font-bold">${taxList}</span> ${tt('compensation_system.benefits.summary_tax', 'identified as tax-deductible items for cost optimization.')} `;
        if (totalLabor > 0)
            s += `${tt('compensation_system.benefits.summary_ratio', 'Benefits expense ratio vs. total labor cost: ')}<span class="text-emerald-400 font-bold">${ratio.toFixed(1)}%</span>. `;
        s += tt('compensation_system.benefits.summary_tail', 'All items are systematically managed by category.');
        return s;
    }, [activeItems.size, stratSelected, taxItems, totalLabor, ratio, tt]);

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
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 bg-emerald-500/15 text-emerald-300">
                        {d.tag}
                    </span>
                    <div className="font-semibold text-foreground text-sm mb-1">{d.title}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        {tt('compensation_system.benefits.target_persona', 'Target Persona')}
                    </div>
                    <div className="text-xs text-muted-foreground italic mb-2">{d.persona}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        {tt('compensation_system.benefits.strategic_focus', 'Strategic Focus')}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.desc}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        {tt('compensation_system.benefits.recommended_items', 'Recommended Priority Items')}
                    </div>
                    {d.rec.map((r, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                            <span className="text-emerald-400 text-xs">✓</span>
                            <span className="text-xs text-muted-foreground">{r}</span>
                        </div>
                    ))}
                    <div className="text-[10px] text-muted-foreground bg-background rounded-md px-2 py-1.5 border-l-2 border-emerald-500 mt-2">
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
                            d.tag === 'gold' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                    >
                        {d.tl}
                    </span>
                    <div className="font-semibold text-foreground text-sm mb-1">{d.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.desc}</p>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                        {tt('compensation_system.benefits.benefits_label', 'BENEFITS')}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.effect}</div>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                        {tt('compensation_system.benefits.caution_label', 'CAUTION')}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{d.caution}</div>
                    <div className="text-[10px] text-muted-foreground bg-background rounded-md px-2 py-1.5 border-l-2 border-emerald-500">
                        {d.ex}
                    </div>
                </div>
            );
        }
        return (
            <p className="text-xs italic text-muted-foreground">
                {tt('compensation_system.benefits.click_card', 'Click a benefits card')}
                <br />
                {tt('compensation_system.benefits.click_card_suffix', 'to view the detailed guide.')}
            </p>
        );
    }, [selectedConcept]);

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag={t('compensation_system.snapshot.header_eyebrow')}
                stepLabel={t('compensation_system.step_labels.step5')}
                title={t('compensation_system.tabs.benefits')}
                description={t('compensation_system.step_desc_benefits')}
                completionPct={completionPct}
            />
            <FieldErrorMessage fieldKey="comp-benefits" errors={fieldErrors} className="mt-4 px-1" />
            <div className="flex flex-col gap-5 w-full pt-6">
                <div className="flex flex-col gap-4 w-full">
                    {/* Budget Overview */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                                {tt('compensation_system.benefits.budget_overview', 'Benefits Budget Overview')}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                                        {tt('compensation_system.benefits.total_labor', 'Total Labor Cost (100M KRW)')}
                                    </Label>
                                    <Input
                                        type="number"
                                        step={0.1}
                                        placeholder={tt('compensation_system.benefits.eg_20', 'e.g. 20')}
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
                                        {tt('compensation_system.benefits.total_expense', 'Total Benefits Expense (100M KRW)')}
                                    </Label>
                                    <Input
                                        type="number"
                                        step={0.1}
                                        placeholder={tt('compensation_system.benefits.eg_1_5', 'e.g. 1.5')}
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
                                        {tt('compensation_system.benefits.expense_ratio', 'Benefits Expense Ratio')}
                                    </Label>
                                    <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                                        {totalLabor > 0 ? `${ratio.toFixed(2)}%` : '— %'}
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                ratioStatus === 'ok'
                                                    ? 'bg-emerald-500'
                                                    : ratioStatus === 'above' || ratioStatus === 'invalid'
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
                                {tt('compensation_system.benefits.strategic_direction', 'Benefits Strategic Direction (Select up to 2)')}
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
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background border-border hover:bg-muted'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {stratSelected.length === 2 && (
                                <p className="text-xs text-muted-foreground mt-2">{tt('compensation_system.benefits.two_selected', '2 selected')}</p>
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
                                    <span className="font-bold text-foreground flex-1">{cat.name}</span>
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
                                                                ? 'border-emerald-500/60 bg-emerald-500/10'
                                                                : 'border-border bg-muted/30 hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <div className="flex flex-wrap gap-1 mb-1">
                                                            {item.tax && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                                    {tt('compensation_system.benefits.tax_deductible', '💰 Tax Deductible')}
                                                                </span>
                                                            )}
                                                            {item.rec && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                                                    {tt('compensation_system.benefits.recommended', '⭐ Recommended')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span
                                                                className={`font-semibold text-sm ${
                                                                    state.active ? 'text-emerald-300' : 'text-foreground'
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {state.active && (
                                                                <span className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white text-xs">
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
                                                                {tt('compensation_system.benefits.industry_adoption', 'Industry avg. adoption: {{value}}%', { value: item.bi })}
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
                            <div className="flex items-center justify-between flex-wrap mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {tt('compensation_system.benefits.summary_note', 'Summary Note')}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{tt('compensation_system.benefits.auto_generated', 'Auto-generated')}</span>
                            </div>
                            <div className="bg-[#1B2E4B] rounded-xl p-5 text-white">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                                    {tt('compensation_system.benefits.policy_statement', 'Policy Statement')}
                                </div>
                                <div
                                    className="text-sm leading-relaxed text-white/90"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            activeItems.size > 0
                                                ? summaryHtml
                                                : `<span class="italic text-white/40">${tt('compensation_system.benefits.summary_empty', 'Select benefits items to auto-generate the policy statement.')}</span>`,
                                    }}
                                />
                                <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                                    {tt('compensation_system.benefits.report_note', '※ The final HR system design report will include professional consultant reviews and recommendations.')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Step purpose + option guide — full width */}
                <div className="w-full">
                    <Card className="shadow-sm border rounded-xl overflow-hidden w-full">
                        <CardContent className="p-5">
                            <div className="font-semibold text-foreground mb-3">{tt('compensation_system.benefits.step_purpose', 'Step Purpose')}</div>
                            <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {tt('compensation_system.benefits.purpose_1', 'Diagnose current benefits across 6 categories.')}
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {tt('compensation_system.benefits.purpose_2', 'Use industry benchmarking data to identify gaps.')}
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {tt('compensation_system.benefits.purpose_3', 'Identify tax-deductible items to maximize cost efficiency.')}
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {tt('compensation_system.benefits.purpose_4', 'Budget ratio updates in real time as you select items.')}
                                </li>
                            </ul>
                            <div className="h-px bg-border my-4" />
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                {tt('compensation_system.benefits.option_guide', 'Option Guide')}
                            </div>
                            {conceptPanel}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
