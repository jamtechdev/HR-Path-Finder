import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import type { BaseSalaryFramework } from '../types';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { cn } from '@/lib/utils';

interface BaseSalaryFrameworkTabProps {
    framework: BaseSalaryFramework;
    onUpdate: (framework: BaseSalaryFramework) => void;
    fieldErrors?: FieldErrors;
}

const STRUCTURE_TYPE_OPTIONS = [
    { value: 'annual_accumulated', label: 'Annual Salary System (Accumulated)' },
    { value: 'annual_non_accumulated', label: 'Annual Salary System (Non-Accumulated)' },
    { value: 'annual_hybrid', label: 'Annual Salary System (Hybrid)' },
    { value: 'seniority_based', label: 'Seniority-based Pay System' },
    { value: 'job_based', label: 'Job-based Pay System' },
];

const SHORT_LABELS: Record<string, string> = {
    annual_accumulated: 'Accumulated',
    annual_non_accumulated: 'Non-Accum.',
    annual_hybrid: 'Hybrid',
    seniority_based: 'Seniority',
    job_based: 'Job-based',
};

const MONTHS = [
    'January (1월)', 'February (2월)', 'March (3월)', 'April (4월)', 'May (5월)', 'June (6월)',
    'July (7월)', 'August (8월)', 'September (9월)', 'October (10월)', 'November (11월)', 'December (12월)',
];

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
    const [purposeOpen, setPurposeOpen] = useState(true);

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
    const g2TimingLabel = framework.salary_adjustment_timing?.[0] != null ? MONTHS[framework.salary_adjustment_timing[0] - 1] : '';
    const g3Count = [framework.common_salary_increase_rate, framework.performance_based_increase_differentiation].filter(Boolean).length;

    const groupLabel = framework.salary_adjustment_grouping === 'single' ? 'single-group' : framework.salary_adjustment_grouping === 'dual' ? 'dual-group' : '—';
    const commonLabel = framework.common_salary_increase_rate === 'required' ? 'required' : framework.common_salary_increase_rate === 'not_required' ? 'not required' : '—';
    const diffLabel = framework.performance_based_increase_differentiation ? framework.performance_based_increase_differentiation.replace('_', ' ') : '—';

    return (
        <div className="space-y-0">
            {/* Page header - dark gradient (45) */}
            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0f1c30] to-[#1a2f52] px-8 py-9 mb-0">
                <div className="absolute -top-12 -right-12 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(46,196,160,0.08)_0%,transparent_70%)] pointer-events-none" />
                <div className="flex items-end justify-between gap-6 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#2ec4a0] bg-[rgba(46,196,160,0.12)] border border-[rgba(46,196,160,0.25)] px-2 py-0.5 rounded-full">
                                Compensation Structure
                            </span>
                            <span className="text-[11px] text-white/35 font-normal">Step 1 of 6 · Base Salary Framework</span>
                        </div>
                        <h1 className="font-serif text-3xl font-light text-white tracking-tight leading-tight mb-2">
                            Salary Structure <em className="text-[#2ec4a0] not-italic">Configuration</em>
                        </h1>
                        <p className="text-[13px] text-white/45 leading-relaxed max-w-[500px] font-light">
                            Define the structural principles governing how base salaries are organized, adjusted, and differentiated across your organization.
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
                                    <span className="text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Done</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content: two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-[1280px] mx-auto px-0 pt-6">
                {/* Left: Form sections */}
                <div className="flex flex-col gap-4">
                    {/* G1: Foundation */}
                    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(15,28,48,0.08),0_4px_16px_rgba(15,28,48,0.05)] border border-[#e8eaed] overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaed] bg-[#f7f8fa]">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G1</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">Foundation</span>
                            <span className={cn(
                                'text-[11px] font-normal',
                                g1Count === 3 ? 'text-[#2ec4a0]' : g1Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]'
                            )}>{g1Count} / 3 selected</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <FieldErrorMessage fieldKey="comp-salary-structure-type" errors={fieldErrors} className="!mt-0" />
                            <FieldErrorMessage fieldKey="comp-salary-determination" errors={fieldErrors} className="!mt-0" />
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Salary Structure Type
                                        <Tip text="The overarching framework for how base salaries are structured. Accumulated systems add increments; Non-accumulated reset to base each year; Hybrid combines both." />
                                    </Label>
                                    <select
                                        value={framework.salary_structure_type || ''}
                                        onChange={(e) => onUpdate({ ...framework, salary_structure_type: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.salary_structure_type ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select structure type</option>
                                        {STRUCTURE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Salary Adjustment Unit
                                        <Tip text="How salary changes are expressed: as a percentage (%) or as an absolute amount in Korean Won (KRW)." />
                                    </Label>
                                    <select
                                        value={framework.salary_adjustment_unit || ''}
                                        onChange={(e) => onUpdate({ ...framework, salary_adjustment_unit: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.salary_adjustment_unit ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select unit</option>
                                        <option value="percentage">% (Percentage)</option>
                                        <option value="krw">KRW (Korean Won)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Salary Determination Standard
                                        <Tip text="Pay Band: salaries set within defined min–max ranges per grade. Salary Table: a fixed matrix of salary amounts by grade and step." />
                                    </Label>
                                    <select
                                        value={framework.salary_determination_standard || ''}
                                        onChange={(e) => onUpdate({ ...framework, salary_determination_standard: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.salary_determination_standard ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select standard</option>
                                        <option value="pay_band">Pay Band</option>
                                        <option value="salary_table">Salary Table</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* G2: Operation Cycle */}
                    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(15,28,48,0.08),0_4px_16px_rgba(15,28,48,0.05)] border border-[#e8eaed] overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaed] bg-[#f7f8fa]">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G2</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">Operation Cycle</span>
                            <span className={cn('text-[11px] font-normal', g2Count === 2 ? 'text-[#2ec4a0]' : g2Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]')}>{g2Count} / 2 selected</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Salary Adjustment Grouping
                                        <Tip text="Single group: entire org reviewed simultaneously. Dual group: split by hire cohort timing to spread workload and budget." />
                                    </Label>
                                    <select
                                        value={framework.salary_adjustment_grouping || ''}
                                        onChange={(e) => onUpdate({ ...framework, salary_adjustment_grouping: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.salary_adjustment_grouping ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select grouping</option>
                                        <option value="single">Single group (entire organization at once)</option>
                                        <option value="dual">Dual group (split by hire timing)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Salary Adjustment Timing
                                        <Tip text="The calendar month in which salary revisions take effect. Typically aligns with the performance review cycle completion." />
                                    </Label>
                                    <select
                                        value={framework.salary_adjustment_timing?.[0]?.toString() ?? ''}
                                        onChange={(e) => onUpdate({ ...framework, salary_adjustment_timing: e.target.value ? [parseInt(e.target.value, 10)] : undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.salary_adjustment_timing?.length ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select month</option>
                                        {MONTHS.map((label, i) => <option key={i} value={String(i + 1)}>{label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* G3: Differentiation Strategy */}
                    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(15,28,48,0.08),0_4px_16px_rgba(15,28,48,0.05)] border border-[#e8eaed] overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaed] bg-[#f7f8fa]">
                            <span className="w-[26px] h-[26px] rounded-md bg-[#152540] text-[#2ec4a0] text-[11px] font-bold flex items-center justify-center tracking-wide shrink-0">G3</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">Differentiation Strategy</span>
                            <span className={cn('text-[11px] font-normal', g3Count === 2 ? 'text-[#2ec4a0]' : g3Count > 0 ? 'text-[#c9a84c]' : 'text-[#9ca3af]')}>{g3Count} / 2 selected</span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Common Salary Increase Rate
                                        <Tip text="Required: all employees receive a baseline increase (e.g., inflation-linked) in addition to performance adjustments. Not Required: increases are purely performance-driven." />
                                    </Label>
                                    <select
                                        value={framework.common_salary_increase_rate || ''}
                                        onChange={(e) => onUpdate({ ...framework, common_salary_increase_rate: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.common_salary_increase_rate ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select option</option>
                                        <option value="required">Required</option>
                                        <option value="not_required">Not Required</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium text-[#6b7280] flex items-center gap-1">
                                        Performance-based Differentiation Level
                                        <Tip text="Strong: performance ratings drive large pay gaps. Moderate: meaningful but not extreme differences. No differentiation: uniform increases regardless of performance." />
                                    </Label>
                                    <select
                                        value={framework.performance_based_increase_differentiation || ''}
                                        onChange={(e) => onUpdate({ ...framework, performance_based_increase_differentiation: e.target.value || undefined })}
                                        className={cn(
                                            'h-10 pl-3 pr-8 py-0 border rounded-lg bg-[#f7f8fa] text-[13px] font-normal appearance-none bg-no-repeat bg-[length:10px_6px] bg-[right_11px_center] cursor-pointer outline-none transition-all w-full',
                                            framework.performance_based_increase_differentiation ? 'border-[#d4d8de] text-[#152540] font-medium bg-white' : 'border-[#d4d8de] text-[#9ca3af]'
                                        )}
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E\")" }}
                                    >
                                        <option value="">Select level</option>
                                        <option value="strong">Strong differentiation</option>
                                        <option value="moderate">Moderate differentiation</option>
                                        <option value="none">No differentiation</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Declaration */}
                    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(15,28,48,0.08)] border border-[#e8eaed] overflow-hidden">
                        <div className="bg-gradient-to-br from-[#152540] to-[#1e3a62] px-4 py-3.5 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-md bg-[rgba(201,168,76,0.15)] text-[#c9a84c] flex items-center justify-center text-xs">§</span>
                            <span className="text-xs font-semibold text-white flex-1">Policy Declaration</span>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-[#2ec4a0] bg-[rgba(46,196,160,0.15)] border border-[rgba(46,196,160,0.3)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2ec4a0] animate-pulse" /> Live
                            </span>
                        </div>
                        <div className="p-4">
                            <p className="font-serif text-sm font-light leading-relaxed text-[#4b5563] italic">
                                This organization adopts a{' '}
                                {framework.salary_structure_type ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {STRUCTURE_TYPE_OPTIONS.find(o => o.value === framework.salary_structure_type)?.label ?? framework.salary_structure_type}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">structure type</span>
                                )}{' '}
                                system, administering salary adjustments expressed in{' '}
                                {framework.salary_adjustment_unit ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {framework.salary_adjustment_unit === 'percentage' ? '%' : 'KRW'}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">unit</span>
                                )}. Individual salaries are determined against a{' '}
                                {framework.salary_determination_standard ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">
                                        {framework.salary_determination_standard === 'pay_band' ? 'Pay Band' : 'Salary Table'}
                                    </span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">standard</span>
                                )}. Reviews are conducted on a{' '}
                                {groupLabel !== '—' ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{groupLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">grouping</span>
                                )}{' '}
                                basis, taking effect from{' '}
                                {g2TimingLabel ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{g2TimingLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">month</span>
                                )}{' '}
                                annually. A common baseline increase is{' '}
                                {commonLabel !== '—' ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{commonLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">—</span>
                                )}, with{' '}
                                {diffLabel !== '—' ? (
                                    <span className="inline-block bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-[#152540] font-sans text-xs font-semibold not-italic px-2 py-0.5 rounded-md mx-0.5">{diffLabel}</span>
                                ) : (
                                    <span className="inline-block min-w-[70px] border-b border-dashed border-[#d4d8de] text-[#9ca3af] font-sans text-xs not-italic text-center px-1 mx-0.5 align-baseline">differentiation level</span>
                                )}{' '}
                                applied across performance tiers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="flex flex-col gap-4 lg:sticky lg:top-6">
                    {/* Structure Preview */}
                    <div className="bg-[#152540] rounded-xl overflow-hidden shadow-lg">
                        <div className="px-4 py-3.5 flex items-center gap-2 border-b border-white/5">
                            <span className="w-7 h-7 rounded-md bg-[rgba(46,196,160,0.15)] text-[#2ec4a0] flex items-center justify-center text-xs">◇</span>
                            <span className="text-xs font-semibold text-white flex-1">Structure Preview</span>
                            <span className="text-[10px] font-semibold tracking-wide text-[#2ec4a0] bg-[rgba(46,196,160,0.15)] border border-[rgba(46,196,160,0.25)] px-2 py-0.5 rounded-full min-w-[60px] text-center">
                                {framework.salary_structure_type ? (SHORT_LABELS[framework.salary_structure_type] ?? '—') : '—'}
                            </span>
                        </div>
                        <div className="p-5 min-h-[160px] flex items-center justify-center">
                            {!framework.salary_structure_type ? (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-lg opacity-40">⬡</div>
                                    <p className="text-xs text-white/25 leading-relaxed max-w-[180px]">Select a Salary Structure Type to see a visual preview</p>
                                </div>
                            ) : (
                                <p className="text-xs text-white/40 text-center max-w-[180px] leading-relaxed">
                                    Structure: {STRUCTURE_TYPE_OPTIONS.find(o => o.value === framework.salary_structure_type)?.label}. Diagram can be added here.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Step Purpose - collapsible */}
                    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(15,28,48,0.08)] border border-[#e8eaed] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setPurposeOpen(!purposeOpen)}
                            className="w-full flex items-center gap-3 px-5 py-4 border-b border-[#e8eaed] bg-[#f7f8fa] cursor-pointer user-select-none text-left"
                        >
                            <span className="w-[26px] h-[26px] rounded-md bg-[#f0fdf9] text-[#2ec4a0] border border-[rgba(46,196,160,0.2)] flex items-center justify-center text-xs shrink-0">✦</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4b5563] flex-1">Step Purpose</span>
                            <span className="text-[#9ca3af] text-[11px] transition-transform" style={{ transform: purposeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                        </button>
                        {purposeOpen && (
                            <div className="p-5">
                                <div className="text-xs text-[#4b5563] leading-relaxed flex flex-col gap-2">
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>Define how salary bands and pay grades are structured across the organization.</span>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>Configure the adjustment unit, cycle, and performance linkage level.</span>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <span className="text-[#2ec4a0] mt-1 shrink-0">•</span>
                                        <span>This configuration will auto-generate pay band tables and serve as the foundation for all compensation decisions.</span>
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
