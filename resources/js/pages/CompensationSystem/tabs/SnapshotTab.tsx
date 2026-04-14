import { Plus, Trash2, AlertCircle, FileText, Info } from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { translateStaticOnly } from '@/lib/translateStaticOnly';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type { CompensationSnapshotQuestion, CompensationSnapshotResponse } from '../types';

function stripCommas(v: string): string {
    return v.replace(/,/g, '');
}

function stableSerializeResponses(rec: Record<number, unknown>): string {
    const keys = Object.keys(rec)
        .map(Number)
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => a - b);
    const o: Record<string, unknown> = {};
    for (const k of keys) {
        o[String(k)] = rec[k];
    }
    return JSON.stringify(o);
}

/** Normalize numeric strings (including nested objects/arrays) to numbers — matches prior useEffect behavior. */
function normalizeSnapshotExternalValue(value: unknown): unknown {
    const numericFromAny = (v: unknown): number | null => {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return Number.isFinite(v) ? v : null;
        if (typeof v === 'string') {
            const n = parseFloat(stripCommas(v));
            return Number.isFinite(n) ? n : null;
        }
        if (typeof v === 'object') {
            const vo = typeof (v as { valueOf?: () => unknown }).valueOf === 'function' ? (v as { valueOf: () => unknown }).valueOf() : v;
            if (typeof vo === 'number') return Number.isFinite(vo) ? vo : null;
            if (typeof vo === 'string') {
                const n = parseFloat(stripCommas(vo));
                return Number.isFinite(n) ? n : null;
            }
            const n = parseFloat(stripCommas(String(v)));
            return Number.isFinite(n) ? n : null;
        }
        return null;
    };

    if (typeof value === 'string') {
        const n = parseFloat(stripCommas(value));
        return Number.isFinite(n) ? n : value;
    }
    const scalar = numericFromAny(value);
    if (scalar !== null) return scalar;

    if (Array.isArray(value)) {
        return value.map((item) => {
            if (item && typeof item === 'object') {
                const out: Record<string, unknown> = { ...(item as Record<string, unknown>) };
                Object.entries(out).forEach(([ik, iv]) => {
                    if (typeof iv === 'string') {
                        const n = parseFloat(stripCommas(iv));
                        if (Number.isFinite(n)) out[ik] = n;
                    }
                });
                return out;
            }
            return normalizeSnapshotExternalValue(item);
        });
    }

    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        Object.entries(value as Record<string, unknown>).forEach(([ik, iv]) => {
            if (typeof iv === 'string') {
                const n = parseFloat(stripCommas(iv));
                out[ik] = Number.isFinite(n) ? n : iv;
            } else {
                out[ik] = normalizeSnapshotExternalValue(iv);
            }
        });
        return out;
    }

    return value;
}

function normalizeSnapshotRecord(
    externalResponses: Record<number, unknown>,
): Record<number, string[] | string | number | object | null> {
    const normalized: Record<number, unknown> = {};
    Object.entries(externalResponses).forEach(([k, v]) => {
        normalized[Number(k)] = normalizeSnapshotExternalValue(v);
    });
    return normalized as Record<number, string[] | string | number | object | null>;
}

interface SnapshotTabProps {
    projectId: number;
    questions?: CompensationSnapshotQuestion[];
    responses: CompensationSnapshotResponse[];
    snapshotResponses?: Record<number, string[] | string | number | object | null>;
    onSnapshotResponsesChange?: (responses: Record<number, string[] | string | number | object | null>) => void;
    onNext: () => void;
    fieldErrors?: FieldErrors;
}

export default function SnapshotTab({ projectId, questions = [], responses: initialResponses, snapshotResponses: externalResponses, onSnapshotResponsesChange, onNext, fieldErrors = {} }: SnapshotTabProps) {
    const { t } = useTranslation();
    const tr = (v?: string | null) => {
        const raw = String(v ?? '').trim();
        if (!raw) return '';
        return translateStaticOnly(t, raw, ['compensation_system.', 'common.', 'buttons.', 'steps.']);
    };
    const clampPercentage = (value: string): number => {
        const parsed = parseFloat(value.replace(/,/g, ''));
        if (Number.isNaN(parsed)) return 0;
        return Math.min(100, Math.max(0, parsed));
    };

    const formatWithCommas = (n: number | string | null | undefined): string => {
        if (n === null || n === undefined || n === '') return '';
        const num = typeof n === 'string' ? parseFloat(stripCommas(n)) : n;
        if (!Number.isFinite(num)) return '';
        return num.toLocaleString('en-US');
    };
    const parseNumberWithCommas = (v: string): number => {
        const cleaned = stripCommas(v);
        const parsed = parseFloat(cleaned);
        // Use NaN so downstream "answered" checks using Number.isFinite() treat it as empty.
        return Number.isNaN(parsed) ? NaN : parsed;
    };

    // Initialize responses state from existing data or external state
    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string | number | object | null>>(() => {
        const numericFromAny = (value: any): number | null => {
            if (value === null || value === undefined) return null;
            if (typeof value === 'number') return Number.isFinite(value) ? value : null;
            if (typeof value === 'string') {
                const n = parseFloat(stripCommas(value));
                return Number.isFinite(n) ? n : null;
            }
            if (typeof value === 'object') {
                const v = typeof (value as any).valueOf === 'function' ? (value as any).valueOf() : value;
                if (typeof v === 'number') return Number.isFinite(v) ? v : null;
                if (typeof v === 'string') {
                    const n = parseFloat(stripCommas(v));
                    return Number.isFinite(n) ? n : null;
                }
                const n = parseFloat(stripCommas(String(value)));
                return Number.isFinite(n) ? n : null;
            }
            return null;
        };

        const ext = externalResponses as Record<number, unknown> | undefined;
        if (ext && typeof ext === 'object' && Object.keys(ext).length > 0) {
            return normalizeSnapshotRecord(ext) as Record<number, string[] | string | number | object | null>;
        }
        const responses: Record<number, string[] | string | number | object | null> = {};
        initialResponses?.forEach(resp => {
            if (resp.numeric_response !== null && resp.numeric_response !== undefined) {
                // Backend may serialize decimal values as strings (e.g. "3.00").
                const raw = resp.numeric_response as unknown;
                const n = numericFromAny(raw);
                responses[resp.question_id] = n ?? null;
            } else if (resp.text_response) {
                responses[resp.question_id] = resp.text_response;
            } else {
                responses[resp.question_id] = resp.response || null;
            }
        });
        return responses;
    });

    const snapshotStateRef = useRef(snapshotResponses);
    snapshotStateRef.current = snapshotResponses;

    const externalResponsesRef = useRef(externalResponses);
    externalResponsesRef.current = externalResponses;

    const externalSig = useMemo(() => {
        if (!externalResponses) return '';
        return stableSerializeResponses(normalizeSnapshotRecord(externalResponses as Record<number, unknown>) as Record<number, unknown>);
    }, [externalResponses]);

    // Update local state when external *content* changes (deps use sig only so new parent object refs do not retrigger).
    useEffect(() => {
        const ext = externalResponsesRef.current;
        if (!ext || externalSig === '') return;
        const next = normalizeSnapshotRecord(ext as Record<number, unknown>);
        setSnapshotResponses((prev) => {
            if (stableSerializeResponses(prev as Record<number, unknown>) === stableSerializeResponses(next as Record<number, unknown>)) {
                return prev;
            }
            return next;
        });
    }, [externalSig]);

    // Sync local changes to external state if callback provided
    const updateResponses = (newResponses: Record<number, string[] | string | number | object | null>) => {
        if (
            stableSerializeResponses(snapshotStateRef.current as Record<number, unknown>) ===
            stableSerializeResponses(newResponses as Record<number, unknown>)
        ) {
            return;
        }
        setSnapshotResponses(newResponses);
        onSnapshotResponsesChange?.(newResponses);
    };

    // Q17/Q18 filtering relies on question "order", not array index.
    const q17Question = questions.find((q) => q.order === 17);
    const q17Response = q17Question ? (snapshotResponses[q17Question.id] as string[] || []) : [];

    // Keep Q18 selection consistent with Q17 (so "invalid" previously selected options are cleared)
    const q18Question = questions.find((q) => q.order === 18);
    const q18Selected = q18Question ? snapshotResponses[q18Question.id] : null;
    const q18SelectedSig = Array.isArray(q18Selected) ? JSON.stringify(q18Selected) : '';

    useEffect(() => {
        if (!q18Question || q18Question.answer_type !== 'select_up_to_2') return;

        const q17Options = Array.isArray(q17Question?.options) ? q17Question?.options : [];
        const allowed = q17Response.length > 0
            ? (q17Options.length > 0 ? q17Options.filter((opt) => q17Response.includes(opt)) : q17Response)
            : [];

        if (!Array.isArray(q18Selected)) return;
        const next = q18Selected.filter((v) => allowed.includes(v));

        // Only update when something actually changed (prevents render loops)
        const changed =
            next.length !== q18Selected.length || next.some((v, i) => v !== q18Selected[i]);
        if (changed) {
            updateResponses({
                ...snapshotStateRef.current,
                [q18Question.id]: next,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q17Response.join('|'), q18Question?.id, q18SelectedSig]);

    const isQuestionVisible = (
        q: CompensationSnapshotQuestion,
        responses: Record<number, string[] | string | number | object | null>,
    ): boolean => {
        const parentOrder = q.metadata?.parent_question_order;
        if (typeof parentOrder !== 'number') return true;

        const parent = questions.find((candidate) => candidate.order === parentOrder);
        if (!parent) return true;

        const parentResponse = responses[parent.id];
        const showWhenParentAnswered = q.metadata?.show_when_parent_answered !== false;
        const requiredOptionRaw = q.metadata?.show_when_parent_option_includes;
        const requiredOption = typeof requiredOptionRaw === 'string' ? requiredOptionRaw.trim() : '';

        const hasParentAnswer = (() => {
            if (parentResponse === null || parentResponse === undefined) return false;
            if (typeof parentResponse === 'string') return parentResponse.trim() !== '';
            if (typeof parentResponse === 'number') return Number.isFinite(parentResponse);
            if (Array.isArray(parentResponse)) return parentResponse.length > 0;
            if (typeof parentResponse === 'object') return Object.keys(parentResponse as object).length > 0;
            return false;
        })();

        if (showWhenParentAnswered && !hasParentAnswer) return false;

        if (requiredOption !== '') {
            if (Array.isArray(parentResponse)) {
                return parentResponse.some((entry) =>
                    String(entry).toLowerCase() === requiredOption.toLowerCase()
                );
            }
            if (typeof parentResponse === 'string') {
                return parentResponse.toLowerCase() === requiredOption.toLowerCase();
            }
            return false;
        }

        return true;
    };

    const visibleQuestions = useMemo(
        () => questions.filter((q) => isQuestionVisible(q, snapshotResponses)),
        [questions, snapshotResponses],
    );

    const answeredCount = useMemo(() => visibleQuestions.filter(q => {
        const r = snapshotResponses[q.id];
        if (q.answer_type === 'numeric') {
            if (typeof r === 'number') return Number.isFinite(r);

            if (Array.isArray(r)) {
                const isJobFunctions =
                    q.metadata?.is_job_functions === true ||
                    (q.question_text?.toLowerCase().includes('average salary by job function') ?? false);

                if (isJobFunctions) {
                    return (
                        r.length > 0 &&
                        r.every((item) => {
                            if (!item || typeof item !== 'object') return false;
                            const fn = (item as any).function;
                            const amt = (item as any).amount;
                            return (
                                typeof fn === 'string' &&
                                fn.trim() !== '' &&
                                typeof amt === 'number' &&
                                Number.isFinite(amt)
                            );
                        })
                    );
                }

                return r.length > 0;
            }

            if (typeof r === 'object' && r !== null) {
                const lower = q.question_text?.toLowerCase() ?? '';
                const isMultiYear =
                    q.metadata?.is_multi_year === true ||
                    lower.includes('past three years') ||
                    lower.includes('average annual salary increase rate') ||
                    lower.includes('labor cost ratio') ||
                    lower.includes('average bonus payout ratio');

                const isYearsOfService =
                    q.metadata?.is_years_of_service === true ||
                    lower.includes('average salary by years of service');

                if (isMultiYear) {
                    const years =
                        Array.isArray(q.metadata?.years) && q.metadata.years.length > 0
                            ? q.metadata.years.map((year: unknown) => String(year))
                            : ['2023', '2024', '2025'];
                    return years.every((y) => {
                        const v = (r as any)[y];
                        return typeof v === 'number' && Number.isFinite(v);
                    });
                }

                if (isYearsOfService) {
                    const keys =
                        Array.isArray(q.metadata?.service_ranges) && q.metadata.service_ranges.length > 0
                            ? q.metadata.service_ranges
                                  .map((range: any) => (range && typeof range === 'object' ? String(range.key || '') : ''))
                                  .filter((key: string) => key.trim() !== '')
                            : ['overall', '1_3', '4_7', '8_12', '13_17', '18_20'];
                    return keys.every((k) => {
                        const v = (r as any)[k];
                        return typeof v === 'number' && Number.isFinite(v);
                    });
                }

                return Object.values(r as any).some((v) => typeof v === 'number' && Number.isFinite(v));
            }

            return false;
        }
        if (q.answer_type === 'text') return typeof r === 'string' && r.trim() !== '';
        return Array.isArray(r) ? r.length > 0 : r != null && r !== '';
    }).length, [visibleQuestions, snapshotResponses]);
    const completionPct = visibleQuestions.length ? Math.round((answeredCount / visibleQuestions.length) * 100) : 0;

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag={t('compensation_system.snapshot.header_eyebrow')}
                stepLabel={t('compensation_system.snapshot.header_step')}
                title={t('compensation_system.snapshot.header_title')}
                description={t('compensation_system.snapshot.header_desc')}
                completionPct={completionPct}
            />
            <div className="flex flex-col gap-6 w-full pt-6">
                {/* Main Questions Section */}
                <div className="w-full space-y-6">
                    {visibleQuestions && visibleQuestions.length > 0 ? (
                        visibleQuestions.map((question, idx) => {
                            const isQ18 = question.order === 18;
                            const isMultiYearNumeric = question.metadata?.is_multi_year === true || 
                                question.question_text?.toLowerCase().includes('past three years') ||
                                question.question_text?.toLowerCase().includes('average annual salary increase rate') ||
                                question.question_text?.toLowerCase().includes('labor cost ratio') ||
                                question.question_text?.toLowerCase().includes('average bonus payout ratio');
                            const isJobFunctions = question.metadata?.is_job_functions === true ||
                                question.question_text?.toLowerCase().includes('average salary by job function');
                            const isYearsOfService = question.metadata?.is_years_of_service === true ||
                                question.question_text?.toLowerCase().includes('average salary by years of service');
                            const unitLabel = String(question.metadata?.unit || '').trim() || 'KRW';
                            const metadataYears =
                                Array.isArray(question.metadata?.years) && question.metadata.years.length > 0
                                    ? question.metadata.years.map((year: unknown) => String(year))
                                    : ['2023', '2024', '2025'];
                            const metadataJobFunctions =
                                Array.isArray(question.metadata?.default_functions) && question.metadata.default_functions.length > 0
                                    ? question.metadata.default_functions.map((fn: unknown) => ({ function: String(fn), amount: '' }))
                                    : [
                                          { function: 'Overall', amount: '' },
                                          { function: 'Management', amount: '' },
                                          { function: 'R&D', amount: '' },
                                          { function: 'Sales & Marketing', amount: '' },
                                          { function: 'Production', amount: '' },
                                      ];
                            const metadataServiceRanges =
                                Array.isArray(question.metadata?.service_ranges) && question.metadata.service_ranges.length > 0
                                    ? question.metadata.service_ranges
                                          .map((range: any) => ({
                                              label: String(range?.label || '').trim(),
                                              key: String(range?.key || '').trim(),
                                          }))
                                          .filter((range: { label: string; key: string }) => range.label !== '' && range.key !== '')
                                    : [
                                          { label: t('compensation_system.snapshot.overall'), key: 'overall' },
                                          { label: t('compensation_system.snapshot.years_1_3'), key: '1_3' },
                                          { label: t('compensation_system.snapshot.years_4_7'), key: '4_7' },
                                          { label: t('compensation_system.snapshot.years_8_12'), key: '8_12' },
                                          { label: t('compensation_system.snapshot.years_13_17'), key: '13_17' },
                                          { label: t('compensation_system.snapshot.years_18_20'), key: '18_20' },
                                      ];

                            return (
                                <Card
                                    key={question.id}
                                    className={cn(
                                        'border-2 hover:border-primary/30 transition-all shadow-sm',
                                        fieldErrors[`comp-q-${question.id}`] && 'border-destructive'
                                    )}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start flex-row sm:flex-col gap-4 mb-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-lg font-semibold block mb-4 leading-relaxed">
                                                    {tr(question.question_text)}
                                                </Label>
                                            
                                                {/* Multi-year numeric inputs */}
                                                {isMultiYearNumeric && question.answer_type === 'numeric' && (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {metadataYears.map((year) => (
                                                                <div key={year} className="space-y-2">
                                                                    <Label className="text-sm font-medium text-muted-foreground">{year} ({unitLabel})</Label>
                                                                    <Input
                                                                        type="text"
                                                                        min={0}
                                                                        max={100}
                                                                        step="0.01"
                                                                        value={typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                            ? formatWithCommas((snapshotResponses[question.id] as any)[year] ?? '')
                                                                            : ''}
                                                                        onChange={(e) => {
                                                                            const current = typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                                ? { ...(snapshotResponses[question.id] as any) } 
                                                                                : {};
                                                                            updateResponses({ 
                                                                                ...snapshotResponses, 
                                                                                [question.id]: { ...current, [year]: clampPercentage(e.target.value) }
                                                                            });
                                                                        }}
                                                                        placeholder={t('compensation_system.snapshot.placeholder_zero')}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            
                                                {/* Job Functions with add/remove */}
                                                {isJobFunctions && question.answer_type === 'numeric' && (
                                                    <div className="space-y-4">
                                                        {(() => {
                                                            const jobFunctions = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as any) 
                                                                : metadataJobFunctions;
                                                            return jobFunctions.map((func: any, funcIdx: number) => (
                                                                <div key={funcIdx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                                    <Input
                                                                        value={func.function || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...jobFunctions];
                                                                            updated[funcIdx] = { ...updated[funcIdx], function: e.target.value };
                                                                            updateResponses({ ...snapshotResponses, [question.id]: updated });
                                                                        }}
                                                                        placeholder={t('compensation_system.snapshot.job_function')}
                                                                        className="w-48"
                                                                    />
                                                                    <Input
                                                                        type="text"
                                                                        value={formatWithCommas(func.amount ?? '')}
                                                                        onChange={(e) => {
                                                                            const updated = [...jobFunctions];
                                                                            updated[funcIdx] = { ...updated[funcIdx], amount: parseNumberWithCommas(e.target.value) };
                                                                            updateResponses({ ...snapshotResponses, [question.id]: updated });
                                                                        }}
                                                                        placeholder={unitLabel === 'KRW' ? t('compensation_system.snapshot.amount_krw') : `Amount (${unitLabel})`}
                                                                        className="flex-1"
                                                                    />
                                                                    {jobFunctions.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                            onClick={() => {
                                                                                const updated = jobFunctions.filter((_: any, i: number) => i !== funcIdx);
                                                                                updateResponses({ ...snapshotResponses, [question.id]: updated });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ));
                                                        })()}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const current = Array.isArray(snapshotResponses[question.id]) 
                                                                    ? (snapshotResponses[question.id] as any) 
                                                                    : [];
                                                                updateResponses({ 
                                                                    ...snapshotResponses, 
                                                                    [question.id]: [...current, { function: '', amount: '' }]
                                                                });
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" /> {t('compensation_system.snapshot.add_function')}
                                                        </Button>
                                                    </div>
                                                )}
                                            
                                                {/* Years of Service */}
                                                {isYearsOfService && question.answer_type === 'numeric' && (
                                                    <div className="space-y-3">
                                                        {metadataServiceRanges.map((range) => (
                                                            <div key={range.key} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                                                <Label className="w-32 text-sm font-medium">{range.label}</Label>
                                                                <Input
                                                                    type="text"
                                                                    value={typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                        ? formatWithCommas((snapshotResponses[question.id] as any)[range.key] ?? '')
                                                                        : ''}
                                                                    onChange={(e) => {
                                                                        const current = typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                            ? { ...(snapshotResponses[question.id] as any) } 
                                                                            : {};
                                                                        updateResponses({ 
                                                                            ...snapshotResponses, 
                                                                            [question.id]: { ...current, [range.key]: parseNumberWithCommas(e.target.value) }
                                                                        });
                                                                    }}
                                                                    placeholder={unitLabel === 'KRW' ? t('compensation_system.snapshot.amount_krw') : `Amount (${unitLabel})`}
                                                                    className="flex-1 max-w-md"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            
                                                {/* Regular select_one - (42) round radio consistent with checkboxes */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'select_one' && question.options && (
                                                    <RadioGroup
                                                        value={Array.isArray(snapshotResponses[question.id]) 
                                                            ? (snapshotResponses[question.id] as string[])[0] || ''
                                                            : (snapshotResponses[question.id] as string) || ''}
                                                        onValueChange={(v) => updateResponses({ ...snapshotResponses, [question.id]: v })}
                                                        className="space-y-3"
                                                    >
                                                        {question.options.map((option, optIdx) => (
                                                            <div key={optIdx} className="flex items-center space-x-3 p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors">
                                                                <RadioGroupItem value={option} id={`q${question.id}-opt${optIdx}`} className="border-2 data-[state=checked]:border-[hsl(var(--primary))] data-[state=checked]:bg-[hsl(var(--primary))]" />
                                                                <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1 text-sm font-normal">{option}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            
                                                {/* select_up_to_2 - with Q18 filtering from Q17 (43: connected to former answer) */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'select_up_to_2' && (
                                                    <div className="space-y-3">
                                                        {isQ18 && (
                                                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/25 text-sm text-foreground">
                                                                <span className="font-medium text-[#152540]">{t('compensation_system.snapshot.based_on_q17')}</span>
                                                                <span className="text-[#4b5563]"> — {t('compensation_system.snapshot.choose_two_least_effective')}</span>
                                                            </div>
                                                        )}
                                                        {(() => {
                                                            const q18Options = isQ18
                                                                ? (q17Response.length > 0
                                                                    ? ((Array.isArray(q17Question?.options) && q17Question?.options.length > 0
                                                                        ? q17Question?.options
                                                                        : q17Response) as string[])
                                                                    : [])
                                                                : (question.options || []);
                                                            return q18Options.map((option, optIdx) => {
                                                            const selected = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).includes(option)
                                                                : false;
                                                            const selectedCount = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).length 
                                                                : 0;
                                                            return (
                                                                <div key={optIdx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                                                    selected 
                                                                        ? 'border-primary bg-primary/5' 
                                                                        : 'border-muted hover:bg-muted/50'
                                                                } ${!selected && selectedCount >= 2 ? 'opacity-50' : ''}`}>
                                                                    <Checkbox
                                                                        id={`q${question.id}-opt${optIdx}`}
                                                                        checked={selected}
                                                                        disabled={!selected && selectedCount >= 2}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = Array.isArray(snapshotResponses[question.id]) 
                                                                                ? snapshotResponses[question.id] as string[]
                                                                                : [];
                                                                            if (checked) {
                                                                                updateResponses({ ...snapshotResponses, [question.id]: [...current, option] });
                                                                            } else {
                                                                                updateResponses({ ...snapshotResponses, [question.id]: current.filter(v => v !== option) });
                                                                            }
                                                                        }}
                                                                        className="rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1 text-sm font-normal">{tr(option)}</Label>
                                                                </div>
                                                            );
                                                            });
                                                        })()}
                                                        {isQ18 && q17Response.length > 0 && (() => {
                                                            const q18Options = (Array.isArray(q17Question?.options) && q17Question?.options.length > 0
                                                                ? q17Question?.options.filter((opt) => q17Response.includes(opt))
                                                                : q17Response) as string[];
                                                            return q18Options.length === 0;
                                                        })() && (
                                                            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <p className="text-sm text-blue-800">
                                                                    {t('compensation_system.snapshot.no_predefined_options')}
                                                                </p>
                                                                <Textarea
                                                                    value={typeof snapshotResponses[question.id] === 'string' ? (snapshotResponses[question.id] as string) : ''}
                                                                    onChange={(e) => updateResponses({ ...snapshotResponses, [question.id]: e.target.value })}
                                                                    placeholder={t('compensation_system.snapshot.enter_least_effective')}
                                                                    rows={3}
                                                                    className="resize-none bg-background"
                                                                />
                                                            </div>
                                                        )}
                                                        {isQ18 && q17Response.length === 0 && (
                                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                                                    <Info className="w-4 h-4" />
                                                                    {t('compensation_system.snapshot.select_q17_first')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            
                                                {/* multiple (unlimited) - (42) round checkbox consistent with select_up_to_2 */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'multiple' && question.options && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIdx) => {
                                                            const selected = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).includes(option)
                                                                : false;
                                                            return (
                                                                <div key={optIdx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                                                    selected 
                                                                        ? 'border-primary bg-primary/5' 
                                                                        : 'border-muted hover:bg-muted/50'
                                                                }`}>
                                                                    <Checkbox
                                                                        id={`q${question.id}-opt${optIdx}`}
                                                                        checked={selected}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = Array.isArray(snapshotResponses[question.id]) 
                                                                                ? snapshotResponses[question.id] as string[]
                                                                                : [];
                                                                            if (checked) {
                                                                                updateResponses({ ...snapshotResponses, [question.id]: [...current, option] });
                                                                            } else {
                                                                                updateResponses({ ...snapshotResponses, [question.id]: current.filter(v => v !== option) });
                                                                            }
                                                                        }}
                                                                        className="rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1 text-sm font-normal">{tr(option)}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            
                                                {/* Regular numeric input */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'numeric' && (
                                                    <Input
                                                        type="text"
                                                        value={formatWithCommas(snapshotResponses[question.id] as any)}
                                                        onChange={(e) => updateResponses({ ...snapshotResponses, [question.id]: parseNumberWithCommas(e.target.value) })}
                                                        placeholder={t('compensation_system.snapshot.enter_amount_krw')}
                                                        className="max-w-md"
                                                    />
                                                )}
                                                
                                                {/* text input */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'text' && (
                                                    <Textarea
                                                        value={snapshotResponses[question.id] as string || ''}
                                                        onChange={(e) => updateResponses({ ...snapshotResponses, [question.id]: e.target.value })}
                                                        placeholder={t('compensation_system.snapshot.enter_response')}
                                                        rows={4}
                                                        className="resize-none"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <FieldErrorMessage fieldKey={`comp-q-${question.id}`} errors={fieldErrors} className="mt-3" />
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-yellow-800 mb-1">{t('compensation_system.snapshot.no_questions')}</p>
                                                <p className="text-sm text-yellow-700">
                                                    {t('compensation_system.snapshot.no_questions_desc')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {/* Save & Continue is in the page footer; no duplicate button here */}
                </div>
                        
                {/* Step purpose & help — full width below questions */}
                <div className="w-full">
                            <Card className="border-2 shadow-sm w-full">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">{t('compensation_system.snapshot.step_purpose')}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {t('compensation_system.snapshot.step_purpose_desc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {t('compensation_system.snapshot.purpose_body')}
                                        </p>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-semibold mb-2">{t('compensation_system.snapshot.used_for')}</p>
                                            <ul className="text-sm text-muted-foreground space-y-2 list-none">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{t('compensation_system.snapshot.used_for_1')}</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{t('compensation_system.snapshot.used_for_2')}</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{t('compensation_system.snapshot.used_for_3')}</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{t('compensation_system.snapshot.used_for_4')}</span>
                                                </li>
                                            </ul>
                                        </div>
                                        {questions && questions.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                                                        {t('compensation_system.snapshot.question_explanations')}
                                                    </p>
                                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                        {questions.map((question, idx) => {
                                                            const explanation = question.metadata?.explanation;
                                                            if (!explanation) return null;
                                                            return (
                                                                <div key={question.id} className="p-3 bg-muted/50 rounded-lg border border-muted">
                                                                    <p className="font-semibold mb-1 text-xs text-primary">Q{idx + 1}</p>
                                                                    <p className="whitespace-pre-line text-xs text-muted-foreground leading-relaxed">{explanation}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                </div>
            </div>
        </div>
    );
}
