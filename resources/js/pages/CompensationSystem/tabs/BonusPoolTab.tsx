import React, { useMemo, useCallback } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type { BonusPoolConfiguration } from '../types';

const CRITERIA_MAP: Record<string, string[]> = {
    profit: [
        'Revenue',
        'Operating profit',
        'Net profit',
        'Projected revenue',
        'Projected operating profit after tax',
        'Projected net profit after tax',
        'EBITDA',
        'Discretionary (CEO decision)',
    ],
    company_target: [
        'Overall company KPI achievement rate',
        'Revenue target attainment',
        'Operating profit target attainment',
        'Custom company-wide target',
    ],
    org_target: [
        'Divisional KPI achievement rate',
        'Team OKR achievement rate',
        'MBO fulfillment rate',
        'Custom organizational target',
    ],
    discretion: ['CEO decision', 'Board resolution', 'Executive committee consensus'],
};

const ALLOC_ITEMS = [
    { id: 'indiv', lbl: 'Individual performance rating' },
    { id: 'org', lbl: 'Organizational performance results' },
    { id: 'grade', lbl: 'Job grade' },
    { id: 'pos', lbl: 'Job position' },
    { id: 'role', lbl: 'Role level' },
    { id: 'other', lbl: 'Other (manual input)' },
];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const toDateInputValue = (raw?: string | null) => {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatKrWon = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '—';
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-US');
};

interface ConceptData {
    tag: string;
    tagCls: string;
    icon: string;
    iconCls: string;
    title: string;
    desc: string;
    ex: string;
}

const CONCEPTS: Record<string, Record<string, ConceptData>> = {
    trigger: {
        profit: {
            tag: 'Performance-driven',
            tagCls: 'perf',
            icon: '📈',
            iconCls: 'mint',
            title: 'Paid when profit is generated',
            desc: 'The bonus pool is created only when actual profit is generated. This directly links company financial health to bonus funding and is the most common approach.',
            ex: 'Example: "When operating profit turns positive this year, set 10% of that profit as the bonus funding."',
        },
        company_target: {
            tag: 'Performance-driven',
            tagCls: 'perf',
            icon: '🎯',
            iconCls: 'mint',
            title: 'Paid when company targets are achieved',
            desc: 'Payout is triggered when pre-set company-wide targets (revenue, KPIs, etc.) are met.',
            ex: 'Example: "Pay bonuses when the annual revenue target is achieved at 100%."',
        },
        org_target: {
            tag: 'Performance-driven',
            tagCls: 'perf',
            icon: '🏢',
            iconCls: 'mint',
            title: 'Paid when organizational targets are achieved',
            desc: 'Achievement of targets at the team or department level is the criterion.',
            ex: 'Example: "If each business unit’s OKR attainment is 70% or higher, pay bonuses to employees in that unit."',
        },
        discretion: {
            tag: 'Discretion-based',
            tagCls: 'flex',
            icon: '⚖️',
            iconCls: 'gold',
            title: 'Management discretion payout',
            desc: 'The bonus pool is determined by CEO or board judgment without fixed quantitative criteria.',
            ex: 'Example: "At the year-end management meeting, evaluate business conditions and organizational contribution to decide whether to pay."',
        },
    },
    method: {
        ratio: {
            tag: 'Profit-linked',
            tagCls: 'perf',
            icon: '%',
            iconCls: 'mint',
            title: 'Fixed percentage of profit',
            desc: 'The pool is calculated by multiplying profit by a predetermined percentage.',
            ex: 'Example: "Set operating profit × 10% as the bonus funding."',
        },
        range: {
            tag: 'Flexible',
            tagCls: 'flex',
            icon: '↔',
            iconCls: 'gold',
            title: 'Range-based determination',
            desc: 'Set a minimum and maximum range, then determine within that range.',
            ex: 'Example: "The bonus pool is determined based on performance within a range of 0.2 to 1.0 billion KRW."',
        },
        amount: {
            tag: 'Stable',
            tagCls: 'stab',
            icon: '₩',
            iconCls: 'navy',
            title: 'Fixed amount',
            desc: 'A fixed amount is paid regardless of business performance.',
            ex: 'Example: "Fix the annual company bonus pool at 0.3 billion KRW."',
        },
        annual: {
            tag: 'Discretionary',
            tagCls: 'flex',
            icon: '📅',
            iconCls: 'gold',
            title: 'Separate determination by business year',
            desc: 'Each year, the bonus pool is newly determined based on business conditions.',
            ex: 'Example: "In the December board meeting, separately decide the next year’s bonus pool size."',
        },
    },
    leave: {
        include: {
            tag: 'Inclusive',
            tagCls: 'stab',
            icon: '🏥',
            iconCls: 'navy',
            title: 'Include employees on leave (working-day basis)',
            desc: 'Bonuses are paid proportionally based on actual working days, excluding leave periods.',
            ex: 'Example: "120 working days out of 240 in the year = pay 50%."',
        },
        exclude: {
            tag: 'Strict',
            tagCls: 'perf',
            icon: '🚫',
            iconCls: 'mint',
            title: 'Exclude employees on leave',
            desc: 'Employees with any leave during the calculation period are excluded from the bonus payout.',
            ex: 'Example: "If an employee has any leave history for even 1 day during the calculation period, they are excluded."',
        },
    },
};

interface BonusPoolTabProps {
    configuration: BonusPoolConfiguration;
    onUpdate: (config: BonusPoolConfiguration) => void;
    fieldErrors?: FieldErrors;
}

export default function BonusPoolTab({ configuration, onUpdate, fieldErrors = {} }: BonusPoolTabProps) {
    const trigger = configuration.payment_trigger_condition || '';
    const method = configuration.bonus_pool_determination_method || '';
    const criteriaOptions = trigger ? CRITERIA_MAP[trigger] || [] : [];

    const allocationWeights = configuration.allocation_weights || {};
    const checkedAlloc = useMemo(
        () => ALLOC_ITEMS.filter(({ id }) => configuration.allocation_criteria?.includes(id) ?? false),
        [configuration.allocation_criteria]
    );
    const totalWeight = useMemo(
        () =>
            checkedAlloc.reduce(
                (sum, { id }) => sum + (allocationWeights[id] ?? 0),
                0
            ),
        [checkedAlloc, allocationWeights]
    );
    const weightOk = checkedAlloc.length === 0 || totalWeight === 100;

    const canNext =
        !!trigger &&
        !!configuration.bonus_pool_determination_criteria &&
        !!method &&
        !!configuration.eligibility_scope &&
        !!configuration.bonus_payment_month &&
        weightOk;

    const conceptData: ConceptData | null = useMemo(() => {
        if (trigger && CONCEPTS.trigger[trigger]) return CONCEPTS.trigger[trigger];
        if (method && CONCEPTS.method[method]) return CONCEPTS.method[method];
        const leave = configuration.inclusion_of_employees_on_leave;
        if (leave && CONCEPTS.leave[leave]) return CONCEPTS.leave[leave];
        return null;
    }, [trigger, method, configuration.inclusion_of_employees_on_leave]);

    const updateSummary = useCallback(() => {
        const trTxt =
            {
                profit: 'Profit',
                company_target: 'Company Targets',
                org_target: 'Organizational Targets',
                discretion: 'Discretion',
            }[trigger] || trigger;
        const crTxt = configuration.bonus_pool_determination_criteria || '';
        const meTxt =
            {
                ratio: 'Fixed percentage of profit',
                range: 'Range-based determination',
                amount: 'Fixed amount',
                annual: 'Separate determination by business year',
            }[method] || method;
        const scTxt =
            {
                all: 'All employees (incl. exec & contractors)',
                all_excl: 'All employees (excl. exec & contractors)',
                all_exec_incl: 'All employees (incl. exec, excl. contractors)',
                regular: 'Regular employees only',
                grade: 'By job grade',
                org: 'By organization unit',
                other_scope: 'Other',
            }[configuration.eligibility_scope || ''] || configuration.eligibility_scope || '';
        const pm = configuration.bonus_payment_month
            ? `${configuration.bonus_payment_month} month`
            : '';
        const fm = configuration.bonus_pool_finalization_timing
            ? `${configuration.bonus_pool_finalization_timing} month`
            : '';

        let s = 'The company sets the bonus pool based on ';
        s += `<span class="text-[#5DCAA5] font-bold">${trTxt}</span> as the trigger condition.`;
        if (crTxt) s += ` The determination criteria is <span class="text-[#5DCAA5] font-bold">${crTxt}</span>.`;

        if (method === 'ratio' && configuration.ratio_value != null) {
            s += ` The pool is determined as <span class="text-[#5DCAA5] font-bold">${configuration.ratio_value}%</span> of profit.`;
        } else if (method === 'range' && configuration.range_min != null && configuration.range_max != null) {
            s += ` The pool is determined within <span class="text-[#5DCAA5] font-bold">${formatKrWon(configuration.range_min)}~${formatKrWon(configuration.range_max)} (10,000 KRW)</span>.`;
        } else if (method === 'amount' && configuration.amount_value != null) {
            s += ` The pool is fixed at <span class="text-[#5DCAA5] font-bold">${formatKrWon(configuration.amount_value)} (10,000 KRW)</span>.`;
        } else if (meTxt) {
            s += ` Determination method: <span class="text-[#5DCAA5] font-bold">${meTxt}</span>.`;
        }

        if (scTxt) s += ` Eligible recipients are <span class="text-[#5DCAA5] font-bold">${scTxt}</span>.`;
        s += pm ? ` Payment is scheduled for <span class="text-[#5DCAA5] font-bold">${pm}</span>.` : ' The payment timing is to be decided.';
        if (fm) s += ` (Finalization month: <span class="text-[#5DCAA5] font-bold">${fm}</span>).`;
        return s;
    }, [configuration, trigger, method]);

    const filledFields = useMemo(
        () =>
            [
                configuration.payment_trigger_condition,
                configuration.bonus_pool_determination_criteria,
                configuration.bonus_pool_determination_method,
                configuration.eligibility_scope,
                configuration.bonus_pool_finalization_timing,
                configuration.bonus_payment_month,
            ].filter(Boolean).length,
        [configuration]
    );
    const completionPct = Math.min(100, Math.round((filledFields / 6) * 100));

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag="Compensation Structure"
                stepLabel="Step 4 of 6 · Bonus Pool Configuration"
                title="Bonus Pool Configuration"
                description="Design the rules and allocation criteria for your bonus pool."
                completionPct={completionPct}
            />
            <FieldErrorMessage fieldKey="comp-bonus-pool" errors={fieldErrors} className="mt-4 px-1" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-5 pt-6 max-w-[1060px]">
                <div className="flex flex-col gap-4">
                    {/* 1. Bonus Pool Determination */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1B2E4B] text-white text-xs font-bold flex items-center justify-center">
                                    1
                                </span>
                                <span className="font-semibold text-[#1B2E4B]">
                                    Bonus Pool Determination
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Payment Trigger Condition
                                    </Label>
                                    <Select
                                        value={trigger}
                                        onValueChange={(v) => {
                                            onUpdate({
                                                ...configuration,
                                                payment_trigger_condition: v,
                                                bonus_pool_determination_criteria: undefined,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="profit">
                                                Paid when profit is generated
                                            </SelectItem>
                                            <SelectItem value="company_target">
                                                Paid when company-wide targets are achieved
                                            </SelectItem>
                                            <SelectItem value="org_target">
                                                Paid when organizational targets are achieved
                                            </SelectItem>
                                            <SelectItem value="discretion">
                                                Management discretion (CEO decision)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Bonus Pool Determination Criteria
                                    </Label>
                                    <Select
                                        value={configuration.bonus_pool_determination_criteria || ''}
                                        onValueChange={(v) =>
                                            onUpdate({
                                                ...configuration,
                                                bonus_pool_determination_criteria: v,
                                            })
                                        }
                                        disabled={!trigger}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue
                                                placeholder={
                                                    trigger
                                                        ? 'Select criteria'
                                                        : '— Activate after selecting a trigger —'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {criteriaOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Bonus Pool Determination Method
                                </Label>
                                <Select
                                    value={method}
                                    onValueChange={(v) =>
                                        onUpdate({
                                            ...configuration,
                                            bonus_pool_determination_method: v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ratio">
                                            Fixed percentage of profit
                                        </SelectItem>
                                        <SelectItem value="range">
                                            Range-based determination
                                        </SelectItem>
                                        <SelectItem value="amount">Fixed amount</SelectItem>
                                        <SelectItem value="annual">
                                            Separate determination by business year
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(method === 'ratio' || method === 'range' || method === 'amount') && (
                                <div className="mt-4 flex flex-wrap items-center gap-4">
                                    {method === 'ratio' && (
                                        <>
                                            <Label className="text-sm">Ratio</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.1}
                                                placeholder="e.g. 10"
                                                className="max-w-[140px]"
                                                value={configuration.ratio_value ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        ratio_value: Number.isNaN(parseFloat(e.target.value))
                                                            ? undefined
                                                            : Math.min(100, Math.max(0, parseFloat(e.target.value))),
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </>
                                    )}
                                    {method === 'range' && (
                                        <>
                                            <Label className="text-sm">Min</Label>
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                className="max-w-[120px]"
                                                value={configuration.range_min ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        range_min: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <Label className="text-sm">~ Max</Label>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                className="max-w-[120px]"
                                                value={configuration.range_max ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        range_max: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">10,000 KRW</span>
                                        </>
                                    )}
                                    {method === 'amount' && (
                                        <>
                                            <Label className="text-sm">Amount</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 50000"
                                                className="max-w-[140px]"
                                                value={configuration.amount_value ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        amount_value: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">10,000 KRW</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. Eligibility Determination */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1B2E4B] text-white text-xs font-bold flex items-center justify-center">
                                    2
                                </span>
                                <span className="font-semibold text-[#1B2E4B]">
                                    Eligibility Determination
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Eligibility Scope
                                    </Label>
                                    <Select
                                        value={configuration.eligibility_scope || ''}
                                        onValueChange={(v) =>
                                            onUpdate({ ...configuration, eligibility_scope: v })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All employees (incl. executives & contractors)
                                            </SelectItem>
                                            <SelectItem value="all_excl">
                                                All employees (excl. executives & contractors)
                                            </SelectItem>
                                            <SelectItem value="all_exec_incl">
                                                All employees (incl. executives, excl. contractors)
                                            </SelectItem>
                                        <SelectItem value="regular">Regular employees only</SelectItem>
                                        <SelectItem value="grade">By job grade</SelectItem>
                                        <SelectItem value="org">By organization unit</SelectItem>
                                        <SelectItem value="other_scope">Other (manual input)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Eligibility Criteria
                                    </Label>
                                    <Select
                                        value={configuration.eligibility_criteria || ''}
                                        onValueChange={(v) =>
                                            onUpdate({ ...configuration, eligibility_criteria: v })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select criteria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yearend">Employees employed at year-end</SelectItem>
                                            <SelectItem value="announce">Employees employed on the bonus announcement date</SelectItem>
                                            <SelectItem value="tenure3_abs">Employed for 3+ months</SelectItem>
                                            <SelectItem value="tenure3_period">
                                                Employed for 3+ months within the evaluation period
                                            </SelectItem>
                                            <SelectItem value="other_crit">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Inclusion of Employees on Leave
                                </Label>
                                <Select
                                    value={configuration.inclusion_of_employees_on_leave || ''}
                                    onValueChange={(v) =>
                                        onUpdate({
                                            ...configuration,
                                            inclusion_of_employees_on_leave: v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="include">
                                            Included — working days basis
                                        </SelectItem>
                                        <SelectItem value="exclude">Excluded</SelectItem>
                                        <SelectItem value="other_leave">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Allocation Method */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1B2E4B] text-white text-xs font-bold flex items-center justify-center">
                                    3
                                </span>
                                <span className="font-semibold text-[#1B2E4B]">
                                    Allocation Method
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Bonus Calculation Unit
                                    </Label>
                                    <Select
                                        value={configuration.bonus_calculation_unit || ''}
                                        onValueChange={(v) =>
                                            onUpdate({
                                                ...configuration,
                                                bonus_calculation_unit: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="salary_pct">
                                                Salary-based percentage (% of salary-based calculation)
                                            </SelectItem>
                                            <SelectItem value="band_amount">
                                                Amount based on job grade & salary band
                                            </SelectItem>
                                            <SelectItem value="fixed_amount">
                                                Predefined fixed amount per person
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Allocation Scope
                                    </Label>
                                    <Select
                                        value={configuration.allocation_scope || ''}
                                        onValueChange={(v) =>
                                            onUpdate({
                                                ...configuration,
                                                allocation_scope: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equal">
                                                Equal allocation (company-wide)
                                            </SelectItem>
                                            <SelectItem value="org_diff">
                                                Differentiated by organization
                                            </SelectItem>
                                            <SelectItem value="indiv_perf">
                                                Differentiated by individual performance
                                            </SelectItem>
                                            <SelectItem value="mixed">
                                                Mixed: organization + individual
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Allocation Criteria & Weights
                                </Label>
                                <div className="border rounded-lg divide-y mt-2">
                                    {ALLOC_ITEMS.map(({ id, lbl }) => {
                                        const checked =
                                            configuration.allocation_criteria?.includes(id) ?? false;
                                        const w = allocationWeights[id] ?? 0;
                                        return (
                                            <div
                                                key={id}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 ${
                                                    checked ? 'bg-muted/30' : ''
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`alloc_${id}`}
                                                    checked={checked}
                                                    className="rounded-full border-2"
                                                    onCheckedChange={(c) => {
                                                        const arr = configuration.allocation_criteria || [];
                                                        const next = c
                                                            ? [...arr, id]
                                                            : arr.filter((x) => x !== id);
                                                        const nextWeights = { ...allocationWeights };
                                                        if (!c) delete nextWeights[id];
                                                        onUpdate({
                                                            ...configuration,
                                                            allocation_criteria: next,
                                                            allocation_weights: nextWeights,
                                                        });
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`alloc_${id}`}
                                                    className="flex-1 cursor-pointer text-sm"
                                                >
                                                    {lbl}
                                                </Label>
                                                {checked && (
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            className="w-14 h-8 text-right text-sm"
                                                            value={w || ''}
                                                            onChange={(e) => {
                                                                const raw = parseFloat(e.target.value);
                                                                const safeRaw = Number.isNaN(raw) ? 0 : Math.max(0, raw);
                                                                const otherTotal = checkedAlloc.reduce(
                                                                    (sum, item) =>
                                                                        item.id === id ? sum : sum + (allocationWeights[item.id] ?? 0),
                                                                    0
                                                                );
                                                                const allowedMax = Math.max(0, 100 - otherTotal);
                                                                const v = Math.min(100, allowedMax, safeRaw);
                                                                onUpdate({
                                                                    ...configuration,
                                                                    allocation_weights: {
                                                                        ...allocationWeights,
                                                                        [id]: v,
                                                                    },
                                                                });
                                                            }}
                                                        />
                                                        <span className="text-xs text-muted-foreground">%</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {checkedAlloc.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#1D9E75] rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(totalWeight, 100)}%`,
                                                    backgroundColor:
                                                        totalWeight > 100 ? 'var(--destructive)' : undefined,
                                                }}
                                            />
                                        </div>
                                        <span
                                            className={`text-sm font-bold ${
                                                totalWeight === 100
                                                    ? 'text-[#1D9E75]'
                                                    : totalWeight > 100
                                                      ? 'text-destructive'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {Math.round(totalWeight)}%
                                        </span>
                                    </div>
                                )}
                                {checkedAlloc.length > 0 && totalWeight !== 100 && (
                                    <p className="text-xs text-destructive mt-1">
                                        ⚠ Allocation weights must total 100% to proceed to the next step.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Payment Timing */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-[#1B2E4B] text-white text-xs font-bold flex items-center justify-center">
                                    4
                                </span>
                                <span className="font-semibold text-[#1B2E4B]">
                                    Payment Timing
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Bonus Pool Finalization Timing
                                    </Label>
                                    <Select
                                        value={configuration.bonus_pool_finalization_timing?.toString() || ''}
                                        onValueChange={(v) =>
                                            onUpdate({
                                                ...configuration,
                                                bonus_pool_finalization_timing: v ? parseInt(v, 10) : undefined,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, i) => (
                                                <SelectItem key={i} value={String(i + 1)}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Bonus Payment Month
                                    </Label>
                                    <Select
                                        value={configuration.bonus_payment_month?.toString() || ''}
                                        onValueChange={(v) =>
                                            onUpdate({
                                                ...configuration,
                                                bonus_payment_month: v ? parseInt(v, 10) : undefined,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, i) => (
                                                <SelectItem key={i} value={String(i + 1)}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Calculation Period Start Date
                                    </Label>
                                    <Input
                                        type="date"
                                        className="mt-1"
                                        value={toDateInputValue(configuration.calculation_period_start)}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...configuration,
                                                calculation_period_start: e.target.value || undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Calculation Period End Date
                                    </Label>
                                    <Input
                                        type="date"
                                        className="mt-1"
                                        value={toDateInputValue(configuration.calculation_period_end)}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...configuration,
                                                calculation_period_end: e.target.value || undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Summary Note */}
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                        5
                                    </span>
                                    <span className="font-semibold text-[#1B2E4B]">Summary Note</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">Auto-generated</span>
                            </div>
                            <div className="bg-[#1B2E4B] rounded-xl p-5 text-white">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                                    Policy Statement
                                </div>
                                <div
                                    className="text-sm leading-relaxed text-white/90"
                                    dangerouslySetInnerHTML={{
                                        __html: trigger
                                            ? updateSummary()
                                            : '<span class="italic text-white/40">Enter the required settings to auto-generate the bonus policy statement.</span>',
                                    }}
                                />
                                <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                                    ※ The final HR system design report will include professional consultant reviews and recommendations.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right panel: Step Purpose + Concept */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <Card className="shadow-sm border rounded-xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="font-semibold text-[#1B2E4B] mb-3">Step Purpose</div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    Determine the trigger conditions and size of the bonus pool.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    Define the eligible population and qualification criteria.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    Structure the allocation weights for individual and organizational performance.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    These settings become the basis for calculating individual bonuses later.
                                </li>
                            </ul>
                            <div className="h-px bg-border my-4" />
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Option Guide
                            </div>
                            {conceptData ? (
                                <div className="rounded-lg border bg-muted/30 p-3">
                                    <span
                                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                                            conceptData.tagCls === 'perf'
                                                ? 'bg-[#E8F7F2] text-[#0B6B4A]'
                                                : conceptData.tagCls === 'gold'
                                                  ? 'bg-amber-100 text-amber-800'
                                                  : 'bg-[#EEF2F7] text-[#1B2E4B]'
                                        }`}
                                    >
                                        {conceptData.tag}
                                    </span>
                                    <div className="font-semibold text-[#1B2E4B] text-sm mb-1">
                                        {conceptData.title}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                        {conceptData.desc}
                                    </p>
                                    <div className="text-[10px] text-muted-foreground bg-background rounded-md px-2 py-1.5 border-l-2 border-[#1D9E75]">
                                        {conceptData.ex}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs italic text-muted-foreground">
                                    Select an option to view the concept explanation.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
