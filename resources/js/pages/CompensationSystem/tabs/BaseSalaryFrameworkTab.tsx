import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BaseSalaryFramework } from '../types';

interface BaseSalaryFrameworkTabProps {
    framework: BaseSalaryFramework;
    onUpdate: (framework: BaseSalaryFramework) => void;
    fieldErrors?: FieldErrors;
}

const STRUCTURE_VALUES = [
    'annual_accumulated',
    'annual_non_accumulated',
    'annual_hybrid',
    'seniority_based',
    'job_based',
] as const;

const UI = 'compensation_system.base_salary_ui' as const;

/** Radix sentinel — native `<select>` lists cannot be themed; avoids OS white popup in dark mode */
const SELECT_NONE = '__none__' as const;

function toSelectValue(v: string | undefined | null): string {
    return v && v !== '' ? v : SELECT_NONE;
}

function fromSelectValue(v: string): string | undefined {
    return v === SELECT_NONE ? undefined : v;
}

/** Lightweight illustration so the preview panel is not only placeholder copy (native selects cannot render charts). */
function StructurePreviewDiagram({ structureType }: { structureType: string | undefined }) {
    if (!structureType) return null;
    if (structureType === 'annual_accumulated') {
        return (
            <div className="flex h-28 w-full max-w-md items-end justify-center gap-1.5 px-2" aria-hidden>
                {[32, 44, 56, 68, 82].map((h, i) => (
                    <div
                        key={i}
                        className="flex flex-1 flex-col justify-end rounded-t-md bg-gradient-to-t from-teal-700 to-[#2ec4a0]"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        );
    }
    if (structureType === 'annual_non_accumulated') {
        return (
            <div className="flex h-28 w-full max-w-md flex-col items-center justify-center gap-3 px-4" aria-hidden>
                <div className="h-2.5 w-full max-w-xs rounded-full bg-white/25" />
                <div className="h-12 w-full max-w-xs rounded-lg border-2 border-dashed border-[#2ec4a0]/60 bg-[#2ec4a0]/15" />
                <div className="h-2.5 w-full max-w-xs rounded-full bg-white/25" />
            </div>
        );
    }
    if (structureType === 'annual_hybrid') {
        return (
            <div className="flex h-28 w-full max-w-md items-end justify-center gap-6 px-4" aria-hidden>
                <div className="flex h-full flex-1 items-end justify-center gap-1">
                    {[32, 48, 58].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-[#2ec4a0]/45" style={{ height: `${h}%` }} />
                    ))}
                </div>
                <div className="flex h-full flex-1 items-end justify-center gap-1">
                    {[38, 52, 66, 78].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-[#2ec4a0]" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        );
    }
    if (structureType === 'seniority_based') {
        return (
            <div className="flex h-28 w-full max-w-xs flex-col justify-center gap-2.5 px-4" aria-hidden>
                {[48, 58, 68, 78, 90].map((pct, i) => (
                    <div key={i} className="mx-auto h-2 rounded-full bg-[#2ec4a0]/90" style={{ width: `${pct}%` }} />
                ))}
            </div>
        );
    }
    if (structureType === 'job_based') {
        return (
            <div className="grid h-28 w-full max-w-[200px] grid-cols-2 gap-2 p-1" aria-hidden>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-[#2ec4a0]/40 bg-[#2ec4a0]/20" />
                ))}
            </div>
        );
    }
    return (
        <div className="flex h-24 w-full max-w-sm items-center justify-center rounded-lg border border-white/10 bg-white/5" aria-hidden>
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#2ec4a0]/40" />
        </div>
    );
}

function FrameworkSelect({
    value,
    onValueChange,
    options,
}: {
    value: string;
    onValueChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    const hasValue = value !== SELECT_NONE;
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={cn(
                    'h-10 w-full rounded-lg border-border bg-background text-[13px] shadow-none transition-colors hover:bg-muted/40 focus-visible:border-[#2ec4a0]/40 focus-visible:ring-[3px] focus-visible:ring-[#2ec4a0]/20 [&>span]:line-clamp-2',
                    hasValue ? 'font-medium text-foreground' : 'font-normal text-muted-foreground',
                )}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent
                position="popper"
                className="z-[250] max-h-[min(24rem,70vh)] border-border bg-popover text-popover-foreground shadow-lg"
            >
                {options.map(o => (
                    <SelectItem key={o.value} value={o.value} className="cursor-pointer text-[13px]">
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function Tip({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-flex">
            <span
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="w-3.5 h-3.5 rounded-full bg-[#e8eaed] text-[#9ca3af] font-bold text-[8.5px] flex items-center justify-center cursor-help border-0"
            >
                ?
            </span>
            {show && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[210px] bg-[#0f1c30] text-white/90 text-[11px] leading-snug font-normal p-2.5 rounded-md z-[200] shadow-lg pointer-events-none">
                    {text}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f1c30]" />
                </span>
            )}
        </span>
    );
}

export default function BaseSalaryFrameworkTab({ framework, onUpdate, fieldErrors = {} }: BaseSalaryFrameworkTabProps) {
    const { t, i18n } = useTranslation();
    const [purposeOpen, setPurposeOpen] = useState(true);

    const structureOptions = useMemo(
        () => STRUCTURE_VALUES.map(value => ({ value, label: t(`${UI}.structure_types.${value}`) })),
        [t, i18n.language],
    );

    const monthLabels = useMemo(
        () => Array.from({ length: 12 }, (_, i) => t(`compensation_system.months.${i + 1}`)),
        [t, i18n.language],
    );

    const KEYS = ['salary_structure_type', 'salary_adjustment_unit', 'salary_determination_standard', 'salary_adjustment_grouping', 'salary_adjustment_timing', 'common_salary_increase_rate', 'performance_based_increase_differentiation'] as const;
    const filledCount = useMemo(() => KEYS.filter(k => {
        const v = framework[k];
        if (k === 'salary_adjustment_timing') return Array.isArray(v) && v.length > 0;
        return v != null && v !== '';
    }).length, [framework]);
    const totalCount = KEYS.length;
    const pct = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

    const g1Count = [framework.salary_structure_type, framework.salary_adjustment_unit, framework.salary_determination_standard].filter(Boolean).length;
    const g2Count = [framework.salary_adjustment_grouping, framework.salary_adjustment_timing].filter(Boolean).length;
    const g2TimingLabel = framework.salary_adjustment_timing?.[0] != null ? monthLabels[framework.salary_adjustment_timing[0] - 1] : '';
    const g3Count = [framework.common_salary_increase_rate, framework.performance_based_increase_differentiation].filter(Boolean).length;

    const groupLabel = framework.salary_adjustment_grouping === 'single'
        ? t(`${UI}.group_single`)
        : framework.salary_adjustment_grouping === 'dual'
            ? t(`${UI}.group_dual`)
            : '—';
    const commonLabel = framework.common_salary_increase_rate === 'required'
        ? t(`${UI}.common_req`)
        : framework.common_salary_increase_rate === 'not_required'
            ? t(`${UI}.common_not_req`)
            : '—';
    const diffKey = framework.performance_based_increase_differentiation;
    const diffLabel = diffKey === 'strong'
        ? t(`${UI}.diff_strong`)
        : diffKey === 'moderate'
            ? t(`${UI}.diff_moderate`)
            : diffKey === 'none'
                ? t(`${UI}.diff_none`)
                : '—';

    const structureTypeLabel = framework.salary_structure_type
        ? t(`${UI}.structure_types.${framework.salary_structure_type}`)
        : null;
    const unitChipLabel = framework.salary_adjustment_unit === 'percentage'
        ? t(`${UI}.unit_percentage`)
        : framework.salary_adjustment_unit === 'krw'
            ? t(`${UI}.unit_krw`)
            : null;
    const standardChipLabel = framework.salary_determination_standard === 'pay_band'
        ? t(`${UI}.std_pay_band`)
        : framework.salary_determination_standard === 'salary_table'
            ? t(`${UI}.std_salary_table`)
            : null;

    return (
        <div className="space-y-0">
            {/* Page header - dark gradient (45) */}
            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0f1c30] to-[#1a2f52] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-9 mb-0">
                <div className="absolute -top-12 -right-12 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(46,196,160,0.08)_0%,transparent_70%)] pointer-events-none" />
                <div className="flex items-end justify-between gap-6 flex-wrap">
                    <div className="min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-2">
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#2ec4a0] bg-[rgba(46,196,160,0.12)] border border-[rgba(46,196,160,0.25)] px-2 py-0.5 rounded-full w-fit">
                                {t(`${UI}.eyebrow`)}
                            </span>
                            <span className="text-[11px] text-white/35 font-normal">{t(`${UI}.step_line`)}</span>
                        </div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-tight leading-tight mb-2">
                            {t(`${UI}.title`)}{' '}
                            <em className="text-[#2ec4a0] not-italic">{t(`${UI}.title_accent`)}</em>
                        </h1>
                        <p className="text-[13px] text-white/45 leading-relaxed max-w-[500px] font-light">
                            {t(`${UI}.subtitle`)}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                                    <circle
                                        cx="32" cy="32" r="26"
                                        fill="none" stroke="#2ec4a0" strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={163} strokeDashoffset={163 - (163 * pct) / 100}
                                        className="transition-[stroke-dashoffset] duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold text-white leading-none">{pct}%</span>
                                    <span className="text-[8px] text-white/35 uppercase tracking-wider mt-0.5">{t(`${UI}.progress_done`)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content: single column — all cards full width */}
            <div className="flex flex-col gap-6 w-full pt-4 sm:pt-6 px-0">
                {/* Main form sections */}
                <div className="flex flex-col gap-4 w-full">
                    {/* G1: Foundation */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/50">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G1</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">{t(`${UI}.g1`)}</span>
                            <span className={cn(
                                'text-[11px] font-normal',
                                g1Count === 3 ? 'text-[#2ec4a0]' : g1Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]'
                            )}>{t(`${UI}.selected_n`, { count: g1Count, total: 3 })}</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <FieldErrorMessage fieldKey="comp-salary-structure-type" errors={fieldErrors} className="!mt-0" />
                            <FieldErrorMessage fieldKey="comp-salary-determination" errors={fieldErrors} className="!mt-0" />
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_structure_type`)}
                                        <Tip text={t(`${UI}.tips.structure_type`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.salary_structure_type)}
                                        onValueChange={v => onUpdate({ ...framework, salary_structure_type: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_structure_type`) },
                                            ...structureOptions.map(o => ({ value: o.value, label: o.label })),
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_adjustment_unit`)}
                                        <Tip text={t(`${UI}.tips.adjustment_unit`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.salary_adjustment_unit)}
                                        onValueChange={v => onUpdate({ ...framework, salary_adjustment_unit: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_unit`) },
                                            { value: 'percentage', label: t(`${UI}.unit_percentage`) },
                                            { value: 'krw', label: t(`${UI}.unit_krw`) },
                                        ]}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_determination_standard`)}
                                        <Tip text={t(`${UI}.tips.determination_standard`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.salary_determination_standard)}
                                        onValueChange={v => onUpdate({ ...framework, salary_determination_standard: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_standard`) },
                                            { value: 'pay_band', label: t(`${UI}.std_pay_band`) },
                                            { value: 'salary_table', label: t(`${UI}.std_salary_table`) },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* G2: Operation Cycle */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/50">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G2</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">{t(`${UI}.g2`)}</span>
                            <span className={cn('text-[11px] font-normal', g2Count === 2 ? 'text-[#2ec4a0]' : g2Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]')}>{t(`${UI}.selected_n`, { count: g2Count, total: 2 })}</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_grouping`)}
                                        <Tip text={t(`${UI}.tips.grouping`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.salary_adjustment_grouping)}
                                        onValueChange={v => onUpdate({ ...framework, salary_adjustment_grouping: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_grouping`) },
                                            { value: 'single', label: t(`${UI}.grp_single`) },
                                            { value: 'dual', label: t(`${UI}.grp_dual`) },
                                        ]}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_timing`)}
                                        <Tip text={t(`${UI}.tips.timing`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.salary_adjustment_timing?.[0]?.toString())}
                                        onValueChange={v => {
                                            const raw = fromSelectValue(v);
                                            onUpdate({
                                                ...framework,
                                                salary_adjustment_timing: raw ? [parseInt(raw, 10)] : undefined,
                                            });
                                        }}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_month`) },
                                            ...monthLabels.map((label, i) => ({
                                                value: String(i + 1),
                                                label,
                                            })),
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* G3: Differentiation Strategy */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/50">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G3</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">{t(`${UI}.g3`)}</span>
                            <span className={cn('text-[11px] font-normal', g3Count === 2 ? 'text-[#2ec4a0]' : g3Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]')}>{t(`${UI}.selected_n`, { count: g3Count, total: 2 })}</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_common_increase`)}
                                        <Tip text={t(`${UI}.tips.common_increase`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.common_salary_increase_rate)}
                                        onValueChange={v => onUpdate({ ...framework, common_salary_increase_rate: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_option`) },
                                            { value: 'required', label: t(`${UI}.inc_required`) },
                                            { value: 'not_required', label: t(`${UI}.inc_not_required`) },
                                        ]}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        {t(`${UI}.label_perf_diff`)}
                                        <Tip text={t(`${UI}.tips.perf_diff`)} />
                                    </Label>
                                    <FrameworkSelect
                                        value={toSelectValue(framework.performance_based_increase_differentiation)}
                                        onValueChange={v => onUpdate({ ...framework, performance_based_increase_differentiation: fromSelectValue(v) })}
                                        options={[
                                            { value: SELECT_NONE, label: t(`${UI}.ph_level`) },
                                            { value: 'strong', label: t(`${UI}.diff_strong`) },
                                            { value: 'moderate', label: t(`${UI}.diff_moderate`) },
                                            { value: 'none', label: t(`${UI}.diff_none`) },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Declaration */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="bg-gradient-to-br from-[#152540] to-[#1e3a62] px-4 py-3.5 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-md bg-[rgba(201,168,76,0.15)] text-[#c9a84c] flex items-center justify-center text-xs" aria-hidden>◆</span>
                            <span className="text-xs font-semibold text-white flex-1">{t(`${UI}.policy_title`)}</span>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-[#2ec4a0] bg-[rgba(46,196,160,0.15)] border border-[rgba(46,196,160,0.3)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2ec4a0] animate-pulse" /> {t(`${UI}.policy_live`)}
                            </span>
                        </div>
                        <div className="p-4">
                            <p className="font-serif text-sm font-light leading-relaxed text-[#4b5563] italic">
                                {t(`${UI}.policy_p1`)}{' '}
                                {structureTypeLabel ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {structureTypeLabel}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_structure`)}</span>
                                )}{' '}
                                {t(`${UI}.policy_p2`)}{' '}
                                {unitChipLabel ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {unitChipLabel}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_unit`)}</span>
                                )}
                                {t(`${UI}.policy_p3`)}{' '}
                                {standardChipLabel ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {standardChipLabel}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_standard`)}</span>
                                )}
                                {t(`${UI}.policy_p4`)}{' '}
                                {groupLabel !== '—' ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{groupLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_grouping`)}</span>
                                )}
                                {t(`${UI}.policy_p5`)}{' '}
                                {g2TimingLabel ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{g2TimingLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_month`)}</span>
                                )}
                                {t(`${UI}.policy_p6`)}{' '}
                                {commonLabel !== '—' ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{commonLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">—</span>
                                )}
                                {t(`${UI}.policy_p7`)}{' '}
                                {diffLabel !== '—' ? (
                                    <span className="inline-block bg-primary/10 border border-primary/25 text-foreground font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{diffLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">{t(`${UI}.ph_chip_diff`)}</span>
                                )}
                                {t(`${UI}.policy_p8`)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Auxiliary cards — full width below main forms */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Structure Preview */}
                    <div className="bg-[#152540] rounded-xl overflow-hidden shadow-lg w-full">
                        <div className="px-4 py-3.5 flex items-center gap-2 border-b border-white/5">
                            <span className="w-7 h-7 rounded-md bg-[rgba(46,196,160,0.15)] text-[#2ec4a0] flex items-center justify-center text-xs">◇</span>
                            <span className="text-xs font-semibold text-white flex-1">{t(`${UI}.preview_title`)}</span>
                            <span className="text-[10px] font-semibold tracking-wide text-[#2ec4a0] bg-[rgba(46,196,160,0.15)] border border-[rgba(46,196,160,0.25)] px-2 py-0.5 rounded-full min-w-[60px] text-center">
                                {framework.salary_structure_type ? (t(`${UI}.short_labels.${framework.salary_structure_type}`) ?? '—') : '—'}
                            </span>
                        </div>
                        <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 p-5">
                            {!framework.salary_structure_type ? (
                                <div className="flex flex-col items-center gap-2 px-4 text-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-lg opacity-40">⬡</div>
                                    <p className="max-w-2xl text-xs leading-relaxed text-white/50">
                                        {t(`${UI}.preview_empty`)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex w-full flex-col items-center gap-3 px-2">
                                    <p className="text-center text-sm font-medium leading-snug text-white">
                                        {structureTypeLabel}
                                    </p>
                                    <StructurePreviewDiagram structureType={framework.salary_structure_type} />
                                    <p className="max-w-3xl px-2 text-center text-xs leading-relaxed text-white/70">
                                        {t(`${UI}.preview_selected`)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step Purpose - collapsible */}
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden w-full">
                        <button
                            type="button"
                            onClick={() => setPurposeOpen(!purposeOpen)}
                            className="w-full flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/50 cursor-pointer user-select-none text-left"
                        >
                            <span className="w-[26px] h-[26px] rounded-md bg-primary/15 text-[#2ec4a0] border border-primary/25 flex items-center justify-center text-xs shrink-0">
                                ✦
                            </span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground flex-1">
                                {t(`${UI}.purpose_title`)}
                            </span>
                            <span className="text-[#9ca3af] text-[11px] transition-transform" style={{ transform: purposeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                        </button>
                        {purposeOpen && (
                            <div className="p-5">
                                <div className="text-xs text-[#4b5563] leading-relaxed flex flex-col gap-2">
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>{t(`${UI}.purpose_b1`)}</span>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>{t(`${UI}.purpose_b2`)}</span>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>{t(`${UI}.purpose_b3`)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
