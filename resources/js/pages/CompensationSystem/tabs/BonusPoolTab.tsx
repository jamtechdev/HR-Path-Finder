import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import CompensationPageHeader from '../components/CompensationPageHeader';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import type { BonusPoolConfiguration } from '../types';

const CRITERIA_MAP: Record<string, string[]> = {
    profit: [
        'Revenue (매출액)',
        'Operating profit (영업이익)',
        'Net profit (당기순이익)',
        'Projected revenue (예상 매출)',
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

const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

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
            tag: '성과 지향',
            tagCls: 'perf',
            icon: '📈',
            iconCls: 'mint',
            title: '수익 발생 시 지급',
            desc: '실제 이익이 발생했을 때만 성과급 재원이 생성됩니다. 회사의 재무 건전성과 성과급을 직접 연동하는 가장 일반적인 방식입니다.',
            ex: '예시: "당해연도 영업이익 흑자 전환 시 해당 이익의 10%를 성과급 재원으로 설정"',
        },
        company_target: {
            tag: '성과 지향',
            tagCls: 'perf',
            icon: '🎯',
            iconCls: 'mint',
            title: '회사 목표 달성 시 지급',
            desc: '사전에 설정한 전사 목표(매출, KPI 등)를 달성했을 때 지급이 트리거됩니다.',
            ex: '예시: "연간 매출 목표 100% 달성 시 성과급 지급"',
        },
        org_target: {
            tag: '성과 지향',
            tagCls: 'perf',
            icon: '🏢',
            iconCls: 'mint',
            title: '조직 목표 달성 시 지급',
            desc: '팀·부서 단위의 목표 달성 여부가 기준입니다.',
            ex: '예시: "각 사업부의 OKR 달성률 70% 이상인 경우 해당 사업부 직원에게 성과급 지급"',
        },
        discretion: {
            tag: '재량 중심',
            tagCls: 'flex',
            icon: '⚖️',
            iconCls: 'gold',
            title: '경영진 재량 지급',
            desc: '정량적 기준 없이 CEO 또는 이사회의 판단으로 재원을 결정합니다.',
            ex: '예시: "연말 경영진 회의에서 사업 환경 및 조직 기여도를 종합 평가하여 지급 여부 결정"',
        },
    },
    method: {
        ratio: {
            tag: '성과 연동',
            tagCls: 'perf',
            icon: '%',
            iconCls: 'mint',
            title: '이익의 고정 비율',
            desc: '이익에 미리 정한 비율을 곱해 재원을 산정합니다.',
            ex: '예시: "영업이익의 10%를 성과급 재원으로 확정"',
        },
        range: {
            tag: '유연형',
            tagCls: 'flex',
            icon: '↔',
            iconCls: 'gold',
            title: '범위 기반 결정',
            desc: '최소~최대 범위를 정해두고 그 안에서 결정합니다.',
            ex: '예시: "성과급 재원은 최소 2억, 최대 10억 범위 내에서 당해 실적에 따라 결정"',
        },
        amount: {
            tag: '안정 지향',
            tagCls: 'stab',
            icon: '₩',
            iconCls: 'navy',
            title: '고정 금액',
            desc: '경영 실적과 무관하게 사전에 확정된 금액을 지급합니다.',
            ex: '예시: "매년 전사 성과급 재원을 3억원으로 고정 편성"',
        },
        annual: {
            tag: '재량형',
            tagCls: 'flex',
            icon: '📅',
            iconCls: 'gold',
            title: '사업연도별 별도 결정',
            desc: '매년 사업 여건에 따라 재원을 새로 결정합니다.',
            ex: '예시: "매년 12월 이사회에서 차년도 성과급 재원 규모를 별도로 의결"',
        },
    },
    leave: {
        include: {
            tag: '포용형',
            tagCls: 'stab',
            icon: '🏥',
            iconCls: 'navy',
            title: '휴직자 포함 (근무일 기준)',
            desc: '휴직 기간을 제외한 실제 근무일 수에 비례하여 성과급을 지급합니다.',
            ex: '예시: "총 근무일 120일 / 연간 근무일 240일 = 50% 지급"',
        },
        exclude: {
            tag: '엄격형',
            tagCls: 'perf',
            icon: '🚫',
            iconCls: 'mint',
            title: '휴직자 제외',
            desc: '휴직 기간이 있는 직원은 성과급 지급 대상에서 제외합니다.',
            ex: '예시: "산정기간 중 1일이라도 휴직 이력 있는 직원은 제외"',
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
        const parts: string[] = [];
        const trTxt =
            {
                profit: '수익 발생 시',
                company_target: '회사 목표 달성 시',
                org_target: '조직 목표 달성 시',
                discretion: '경영진 재량',
            }[trigger] || trigger;
        const crTxt = configuration.bonus_pool_determination_criteria || '';
        const meTxt =
            {
                ratio: '이익의 고정 비율',
                range: '범위 기반 결정',
                amount: '고정 금액',
                annual: '사업연도별 별도 결정',
            }[method] || method;
        const scTxt =
            {
                all: '전 직원',
                all_excl: '전 직원 (임원·계약직 제외)',
                all_exec_incl: '전 직원 (임원 포함, 계약직 제외)',
                regular: '정규직',
                grade: '특정 직급 이상',
                org: '특정 조직 단위',
                other_scope: '기타',
            }[configuration.eligibility_scope || ''] || configuration.eligibility_scope || '';
        const pm = configuration.bonus_payment_month
            ? `${configuration.bonus_payment_month}월`
            : '';
        const fm = configuration.bonus_pool_finalization_timing
            ? `${configuration.bonus_pool_finalization_timing}월`
            : '';

        let s = '회사는 ';
        s += `<span class="text-[#5DCAA5] font-bold">${trTxt}</span>를 기점으로 `;
        if (crTxt) s += `<span class="text-[#5DCAA5] font-bold">${crTxt}</span>의 `;
        if (method === 'ratio' && configuration.ratio_value != null)
            s += `<span class="text-[#5DCAA5] font-bold">${configuration.ratio_value}%</span>를 `;
        else if (method === 'range' && configuration.range_min != null && configuration.range_max != null)
            s += `<span class="text-[#5DCAA5] font-bold">${configuration.range_min}~${configuration.range_max}만원</span>을 `;
        else if (method === 'amount' && configuration.amount_value != null)
            s += `<span class="text-[#5DCAA5] font-bold">${configuration.amount_value}만원</span>을 `;
        else if (meTxt) s += `<span class="text-[#5DCAA5] font-bold">${meTxt}</span>으로 `;
        s += '성과급 재원을 확정하며, ';
        if (scTxt) s += `지급 대상은 <span class="text-[#5DCAA5] font-bold">${scTxt}</span>으로 하되 `;
        s += pm ? `<span class="text-[#5DCAA5] font-bold">${pm}</span>에 지급한다.` : '지급 시기를 결정한다.';
        if (fm) s += ` (재원 확정 기준월: <span class="text-[#5DCAA5] font-bold">${fm}</span>)`;
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
                description="성과급 운영 원칙과 배분 기준을 설계합니다."
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
                                                수익 발생 시 (Paid when profit is generated)
                                            </SelectItem>
                                            <SelectItem value="company_target">
                                                회사 목표 달성 시 (Company-wide targets achieved)
                                            </SelectItem>
                                            <SelectItem value="org_target">
                                                조직 목표 달성 시 (Organizational targets achieved)
                                            </SelectItem>
                                            <SelectItem value="discretion">
                                                경영진 재량 (Discretionary / CEO decision)
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
                                                        : '— trigger 선택 후 활성화 —'
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
                                            이익의 고정 비율 (Fixed percentage of profit)
                                        </SelectItem>
                                        <SelectItem value="range">
                                            범위 기반 결정 (Range-based determination)
                                        </SelectItem>
                                        <SelectItem value="amount">고정 금액 (Fixed amount)</SelectItem>
                                        <SelectItem value="annual">
                                            사업연도별 별도 결정 (Separate determination by business year)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(method === 'ratio' || method === 'range' || method === 'amount') && (
                                <div className="mt-4 flex flex-wrap items-center gap-4">
                                    {method === 'ratio' && (
                                        <>
                                            <Label className="text-sm">비율</Label>
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
                                                        ratio_value: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </>
                                    )}
                                    {method === 'range' && (
                                        <>
                                            <Label className="text-sm">최소</Label>
                                            <Input
                                                type="number"
                                                placeholder="최소"
                                                className="max-w-[120px]"
                                                value={configuration.range_min ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        range_min: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <Label className="text-sm">~ 최대</Label>
                                            <Input
                                                type="number"
                                                placeholder="최대"
                                                className="max-w-[120px]"
                                                value={configuration.range_max ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...configuration,
                                                        range_max: parseFloat(e.target.value) || undefined,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">만원</span>
                                        </>
                                    )}
                                    {method === 'amount' && (
                                        <>
                                            <Label className="text-sm">금액</Label>
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
                                            <span className="text-sm text-muted-foreground">만원</span>
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
                                                전 직원 (임원·계약직 포함)
                                            </SelectItem>
                                            <SelectItem value="all_excl">
                                                전 직원 (임원·계약직 제외)
                                            </SelectItem>
                                            <SelectItem value="all_exec_incl">
                                                전 직원 (임원 포함, 계약직 제외)
                                            </SelectItem>
                                            <SelectItem value="regular">정규직만</SelectItem>
                                            <SelectItem value="grade">특정 직급 이상</SelectItem>
                                            <SelectItem value="org">특정 조직 단위</SelectItem>
                                            <SelectItem value="other_scope">기타 (직접 입력)</SelectItem>
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
                                            <SelectItem value="yearend">연말 재직자</SelectItem>
                                            <SelectItem value="announce">보너스 공지일 재직자</SelectItem>
                                            <SelectItem value="tenure3_abs">3개월 이상 재직</SelectItem>
                                            <SelectItem value="tenure3_period">
                                                산정기간 내 3개월 이상 재직
                                            </SelectItem>
                                            <SelectItem value="other_crit">기타</SelectItem>
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
                                            포함 — 근무일 기준 (Included, working days basis)
                                        </SelectItem>
                                        <SelectItem value="exclude">제외 (Excluded)</SelectItem>
                                        <SelectItem value="other_leave">기타</SelectItem>
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
                                                급여 기반 비율 (% of salary-based calculation)
                                            </SelectItem>
                                            <SelectItem value="band_amount">
                                                직급·밴드 기반 금액 (Amount based on salary band)
                                            </SelectItem>
                                            <SelectItem value="fixed_amount">
                                                사전 정의 고정액 (Predefined fixed amount per person)
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
                                                전사 균등 배분 (Equal allocation, company-wide)
                                            </SelectItem>
                                            <SelectItem value="org_diff">
                                                조직별 차등 배분 (Differentiated by organization)
                                            </SelectItem>
                                            <SelectItem value="indiv_perf">
                                                개인 성과 기반 배분 (Differentiated by individual performance)
                                            </SelectItem>
                                            <SelectItem value="mixed">
                                                조직 + 개인 혼합 (Differentiated by organization and individual)
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
                                                                const v = Math.min(
                                                                    100,
                                                                    Math.max(0, parseFloat(e.target.value) || 0)
                                                                );
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
                                        ⚠ 가중치 합계가 100%가 되어야 다음 단계로 진행 가능합니다.
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
                                        value={configuration.calculation_period_start || ''}
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
                                        value={configuration.calculation_period_end || ''}
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
                                <span className="text-[10px] text-muted-foreground">자동 생성</span>
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
                                            : '<span class="italic text-white/40">설정값을 입력하면 성과급 정책 문장이 자동 완성됩니다.</span>',
                                    }}
                                />
                                <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                                    ※ 최종 HR 시스템 설계 보고서에는 전문 컨설턴트의 검토 의견과 권고사항이 함께
                                    제공됩니다.
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
                                    성과급 재원의 발생 조건과 규모를 결정합니다.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    지급 대상 범위와 자격 기준을 정의합니다.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    개인·조직 성과의 배분 가중치를 구조화합니다.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
                                    이 설정은 이후 개인 보너스 산출의 기준이 됩니다.
                                </li>
                            </ul>
                            <div className="h-px bg-border my-4" />
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                선택 옵션 가이드
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
                                    항목을 선택하면 개념 설명이 표시됩니다.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
