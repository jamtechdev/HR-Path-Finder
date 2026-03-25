import { Plus, Trash2, AlertCircle, FileText, Info } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type { CompensationSnapshotQuestion, CompensationSnapshotResponse } from '../types';

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
    const clampPercentage = (value: string): number => {
        const parsed = parseFloat(value);
        if (Number.isNaN(parsed)) return 0;
        return Math.min(100, Math.max(0, parsed));
    };

    // Initialize responses state from existing data or external state
    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string | number | object | null>>(() => {
        if (externalResponses) return externalResponses;
        const responses: Record<number, string[] | string | number | object | null> = {};
        initialResponses?.forEach(resp => {
            if (resp.numeric_response !== null && resp.numeric_response !== undefined) {
                // Backend may serialize decimal values as strings (e.g. "3.00").
                const raw = resp.numeric_response as unknown;
                const n = typeof raw === 'string' ? parseFloat(raw) : (raw as number);
                responses[resp.question_id] = Number.isFinite(n) ? n : null;
            } else if (resp.text_response) {
                responses[resp.question_id] = resp.text_response;
            } else {
                responses[resp.question_id] = resp.response || null;
            }
        });
        return responses;
    });

    // Update local state when external state changes
    useEffect(() => {
        if (externalResponses) {
            // Normalize numeric strings (including nested objects/arrays) to numbers.
            // This keeps validation/completion logic consistent when backend stores decimals as strings.
            const normalizeValue = (value: any): any => {
                if (typeof value === 'string') {
                    const n = parseFloat(value);
                    return Number.isFinite(n) ? n : value;
                }

                if (Array.isArray(value)) {
                    return value.map((item) => {
                        if (item && typeof item === 'object') {
                            const out: Record<string, any> = { ...item };
                            Object.entries(out).forEach(([ik, iv]) => {
                                if (typeof iv === 'string') {
                                    const n = parseFloat(iv);
                                    if (Number.isFinite(n)) out[ik] = n;
                                }
                            });
                            return out;
                        }
                        return normalizeValue(item);
                    });
                }

                if (value && typeof value === 'object') {
                    const out: Record<string, any> = {};
                    Object.entries(value).forEach(([ik, iv]) => {
                        if (typeof iv === 'string') {
                            const n = parseFloat(iv);
                            out[ik] = Number.isFinite(n) ? n : iv;
                        } else {
                            out[ik] = normalizeValue(iv);
                        }
                    });
                    return out;
                }

                return value;
            };

            const normalized: Record<number, any> = {};
            Object.entries(externalResponses).forEach(([k, v]) => {
                normalized[Number(k)] = normalizeValue(v);
            });
            setSnapshotResponses(normalized);
        }
    }, [externalResponses]);

    // Sync local changes to external state if callback provided
    const updateResponses = (newResponses: Record<number, string[] | string | number | object | null>) => {
        setSnapshotResponses(newResponses);
        if (onSnapshotResponsesChange) {
            onSnapshotResponsesChange(newResponses);
        }
    };

    // Get Q17 response for filtering Q18 options
    const q17Question = questions.find((q, i) => i === 16);
    const q17Response = q17Question ? (snapshotResponses[q17Question.id] as string[] || []) : [];

    // Keep Q18 selection consistent with Q17 (so "invalid" previously selected options are cleared)
    const q18Question = questions.find((q, i) => i === 17);
    const q18Selected = q18Question ? snapshotResponses[q18Question.id] : null;

    useEffect(() => {
        if (!q18Question || q18Question.answer_type !== 'select_up_to_2') return;

        const options = Array.isArray(q18Question.options) ? q18Question.options : [];
        const allowed = q17Response.length > 0 ? options.filter((opt) => q17Response.includes(opt)) : [];

        if (!Array.isArray(q18Selected)) return;
        const next = q18Selected.filter((v) => allowed.includes(v));

        // Only update when something actually changed (prevents render loops)
        const changed =
            next.length !== q18Selected.length || next.some((v, i) => v !== q18Selected[i]);
        if (changed) {
            updateResponses({
                ...snapshotResponses,
                [q18Question.id]: next,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q17Response.join('|'), q18Question?.id, q18Selected]);

    const answeredCount = useMemo(() => questions.filter(q => {
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
                    const years = ['2023', '2024', '2025'] as const;
                    return years.every((y) => {
                        const v = (r as any)[y];
                        return typeof v === 'number' && Number.isFinite(v);
                    });
                }

                if (isYearsOfService) {
                    const keys = ['overall', '1_3', '4_7', '8_12', '13_17', '18_20'] as const;
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
    }).length, [questions, snapshotResponses]);
    const completionPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag="Compensation Structure"
                stepLabel="Strategic Compensation Snapshot"
                title="Strategic Compensation Snapshot"
                description="Please answer the following questions to help us understand your current compensation approach."
                completionPct={completionPct}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                {/* Main Questions Section */}
                <div className="lg:col-span-2 space-y-6">
                    {questions && questions.length > 0 ? (
                        questions.map((question, idx) => {
                            const isQ18 = idx === 17;
                            const isMultiYearNumeric = question.metadata?.is_multi_year === true || 
                                question.question_text?.toLowerCase().includes('past three years') ||
                                question.question_text?.toLowerCase().includes('average annual salary increase rate') ||
                                question.question_text?.toLowerCase().includes('labor cost ratio') ||
                                question.question_text?.toLowerCase().includes('average bonus payout ratio');
                            const isJobFunctions = question.metadata?.is_job_functions === true ||
                                question.question_text?.toLowerCase().includes('average salary by job function');
                            const isYearsOfService = question.metadata?.is_years_of_service === true ||
                                question.question_text?.toLowerCase().includes('average salary by years of service');

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
                                                    {question.question_text}
                                                </Label>
                                            
                                                {/* Multi-year numeric inputs */}
                                                {isMultiYearNumeric && question.answer_type === 'numeric' && (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {['2023', '2024', '2025'].map((year) => (
                                                                <div key={year} className="space-y-2">
                                                                    <Label className="text-sm font-medium text-muted-foreground">{year} (%)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        step="0.01"
                                                                        value={typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                            ? (snapshotResponses[question.id] as any)[year] || '' 
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
                                                                        placeholder="0.00"
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
                                                                : [{ function: 'Overall', amount: '' }, { function: 'Management', amount: '' }, { function: 'R&D', amount: '' }, { function: 'Sales & Marketing', amount: '' }, { function: 'Production', amount: '' }];
                                                            return jobFunctions.map((func: any, funcIdx: number) => (
                                                                <div key={funcIdx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                                    <Input
                                                                        value={func.function || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...jobFunctions];
                                                                            updated[funcIdx] = { ...updated[funcIdx], function: e.target.value };
                                                                            updateResponses({ ...snapshotResponses, [question.id]: updated });
                                                                        }}
                                                                        placeholder="Job Function"
                                                                        className="w-48"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        value={func.amount || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...jobFunctions];
                                                                            updated[funcIdx] = { ...updated[funcIdx], amount: parseFloat(e.target.value) || 0 };
                                                                            updateResponses({ ...snapshotResponses, [question.id]: updated });
                                                                        }}
                                                                        placeholder="Amount (KRW)"
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
                                                            <Plus className="w-4 h-4 mr-2" /> Add Function
                                                        </Button>
                                                    </div>
                                                )}
                                            
                                                {/* Years of Service */}
                                                {isYearsOfService && question.answer_type === 'numeric' && (
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Overall', key: 'overall' },
                                                            { label: '1–3 years', key: '1_3' },
                                                            { label: '4–7 years', key: '4_7' },
                                                            { label: '8–12 years', key: '8_12' },
                                                            { label: '13–17 years', key: '13_17' },
                                                            { label: '18–20 years', key: '18_20' },
                                                        ].map((range) => (
                                                            <div key={range.key} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                                                <Label className="w-32 text-sm font-medium">{range.label}</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                        ? (snapshotResponses[question.id] as any)[range.key] || '' 
                                                                        : ''}
                                                                    onChange={(e) => {
                                                                        const current = typeof snapshotResponses[question.id] === 'object' && snapshotResponses[question.id] !== null
                                                                            ? { ...(snapshotResponses[question.id] as any) } 
                                                                            : {};
                                                                        updateResponses({ 
                                                                            ...snapshotResponses, 
                                                                            [question.id]: { ...current, [range.key]: parseFloat(e.target.value) || 0 }
                                                                        });
                                                                    }}
                                                                    placeholder="Amount (KRW)"
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
                                                            <div className="p-3 rounded-lg bg-[#f0fdf9] border border-[rgba(46,196,160,0.2)] text-sm text-[#0f1c30]">
                                                                <span className="font-medium text-[#152540]">Based on your selection in Question 17</span>
                                                                <span className="text-[#4b5563]"> — choose the two programs you believe are least effective.</span>
                                                            </div>
                                                        )}
                                                        {(isQ18 && q17Response.length > 0 
                                                            ? (question.options || []).filter(opt => q17Response.includes(opt))
                                                            : (question.options || [])
                                                        ).map((option, optIdx) => {
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
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1 text-sm font-normal">{option}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                        {isQ18 && q17Response.length === 0 && (
                                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                                                    <Info className="w-4 h-4" />
                                                                    Please select benefits programs in Question 17 first.
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
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1 text-sm font-normal">{option}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            
                                                {/* Regular numeric input */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'numeric' && (
                                                    <Input
                                                        type="number"
                                                        value={snapshotResponses[question.id] as number || ''}
                                                        onChange={(e) => updateResponses({ ...snapshotResponses, [question.id]: parseFloat(e.target.value) || 0 })}
                                                        placeholder="Enter amount (KRW)"
                                                        className="max-w-md"
                                                    />
                                                )}
                                                
                                                {/* text input */}
                                                {!isMultiYearNumeric && !isJobFunctions && !isYearsOfService && question.answer_type === 'text' && (
                                                    <Textarea
                                                        value={snapshotResponses[question.id] as string || ''}
                                                        onChange={(e) => updateResponses({ ...snapshotResponses, [question.id]: e.target.value })}
                                                        placeholder="Enter your response"
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
                                                <p className="font-medium text-yellow-800 mb-1">No Questions Available</p>
                                                <p className="text-sm text-yellow-700">
                                                    Compensation snapshot questions have not been configured yet. Please contact the administrator to set up the questions in the admin panel.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {/* Save & Continue is in the page footer; no duplicate button here */}
                </div>
                        
                {/* Right Side Panel */}
                <div className="lg:col-span-1">
                            <Card className="sticky top-6 border-2 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">Step Purpose</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Understanding your compensation approach
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            In this step, you provide a comprehensive overview of your company's current compensation approach, including compensation philosophy, salary levels, bonus structures, and benefits programs.
                                        </p>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-semibold mb-2">This information will be used to:</p>
                                            <ul className="text-sm text-muted-foreground space-y-2 list-none">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Understand your current compensation strategy</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Identify areas for improvement</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Generate recommendations for your compensation framework</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Auto-populate data in subsequent steps</span>
                                                </li>
                                            </ul>
                                        </div>
                                        {questions && questions.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                                                        Question Explanations
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
