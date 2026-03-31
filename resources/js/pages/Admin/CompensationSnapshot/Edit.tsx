import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DynamicList from '@/components/Forms/DynamicList';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
    metadata?: any;
}

interface Props {
    question: CompensationSnapshotQuestion;
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotEdit({ question, answerTypes }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const getQuestionId = (): number | null => {
        if (typeof question.id === 'number' && Number.isFinite(question.id)) {
            return question.id;
        }
        const match = window.location.pathname.match(/\/admin\/compensation-snapshot\/(\d+)\/edit$/);
        if (!match) return null;
        const parsed = Number(match[1]);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const initialAnswerType = question.answer_type ?? 'select_one';
    const initialOptions = question.options || [];
    const initialExplanation = question.metadata?.explanation || '';
    const [answerType, setAnswerType] = useState<string>(initialAnswerType);
    const [options, setOptions] = useState<string[]>(initialOptions);
    const [explanation, setExplanation] = useState<string>(initialExplanation);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        question_text: question.question_text ?? '',
        answer_type: initialAnswerType,
        options: initialOptions,
        order: question.order,
        is_active: question.is_active,
        version: question.version || '',
        metadata: question.metadata || null,
    });

    useEffect(() => {
        const nextAnswerType = question.answer_type ?? 'select_one';
        const nextOptions = question.options || [];
        const nextExplanation = question.metadata?.explanation || '';

        setAnswerType(nextAnswerType);
        setOptions(nextOptions);
        setExplanation(nextExplanation);

        setData('question_text', question.question_text ?? '');
        setData('answer_type', nextAnswerType);
        setData('options', nextOptions);
        setData('order', question.order ?? 0);
        setData('is_active', Boolean(question.is_active));
        setData('version', question.version || '');
        setData('metadata', question.metadata || null);
    }, [question.id]);

    useEffect(() => {
        const pathname = window.location.pathname;
        const match = pathname.match(/\/admin\/compensation-snapshot\/(\d+)\/edit$/);
        const idFromUrl = match?.[1];
        if (!idFromUrl) return;

        fetch(`/admin/compensation-snapshot/${idFromUrl}/edit-data`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(async (res) => {
                if (!res.ok) return null;
                const payload = await res.json();
                return payload?.question ?? null;
            })
            .then((freshQuestion) => {
                if (!freshQuestion) return;
                setAnswerType(freshQuestion.answer_type ?? 'select_one');
                setOptions(Array.isArray(freshQuestion.options) ? freshQuestion.options : []);
                setExplanation(freshQuestion.metadata?.explanation || '');
                setData('question_text', freshQuestion.question_text ?? '');
                setData('answer_type', freshQuestion.answer_type ?? 'select_one');
                setData('options', Array.isArray(freshQuestion.options) ? freshQuestion.options : []);
                setData('order', Number(freshQuestion.order ?? 0));
                setData('is_active', Boolean(freshQuestion.is_active));
                setData('version', freshQuestion.version || '');
                setData('metadata', freshQuestion.metadata || null);
            })
            .catch(() => {
                // No-op: page already has initial props fallback.
            });
    }, [question.id]);

    useEffect(() => {
        setData('answer_type', answerType);
        // Only set options if answer type requires them
        if (['select_one', 'select_up_to_2', 'multiple'].includes(answerType)) {
            setData('options', options);
        } else {
            setData('options', null);
        }
        // Set metadata with explanation
        setData('metadata', explanation ? { explanation } : null);
    }, [answerType, options, explanation]);

    const requiresOptions = ['select_one', 'select_up_to_2', 'multiple'].includes(answerType);
    const displayQuestionText = data.question_text || question.question_text || '';
    const displayAnswerType = answerType || question.answer_type || 'select_one';
    const displayOptions = options.length > 0 ? options : (question.options || []);
    const displayOrder = typeof data.order === 'number' ? data.order : (question.order ?? 0);
    const displayVersion = data.version || question.version || '';
    const displayExplanation = explanation || question.metadata?.explanation || '';
    const displayIsActive = typeof data.is_active === 'boolean' ? data.is_active : Boolean(question.is_active);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const questionId = getQuestionId();
        if (!questionId) {
            return;
        }

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const payload = {
            question_text: data.question_text,
            answer_type: data.answer_type,
            options: data.options,
            order: data.order,
            is_active: data.is_active,
            version: data.version,
            metadata: data.metadata,
        };

        setSubmitting(true);
        fetch(`/admin/compensation-snapshot/${questionId}/update-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Failed to update question');
                }
                return res.json();
            })
            .then(() => {
                router.visit('/admin/compensation-snapshot');
            })
            .catch(() => {
                setSubmitting(false);
            });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Edit Compensation Snapshot Question" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/compensation-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Questions
                            </Button>
                            <h1 className="text-3xl font-bold">Edit Compensation Snapshot Question</h1>
                        </div>

                        <form key={question.id} onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Question Text <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={displayQuestionText}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Answer Type <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={displayAnswerType}
                                            onValueChange={(value) => {
                                                setAnswerType(value);
                                                setData('answer_type', value as any);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(answerTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.answer_type && (
                                            <p className="text-sm text-destructive mt-1">{errors.answer_type}</p>
                                        )}
                                    </div>

                                    {requiresOptions && (
                                        <div>
                                            <Label>Answer Options <span className="text-destructive">*</span></Label>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Add all possible answer options for this question
                                            </p>
                                            <DynamicList
                                                label=""
                                                items={displayOptions}
                                                onChange={(next) => {
                                                    setOptions(next);
                                                    setData('options', next);
                                                }}
                                                placeholder="Enter option text"
                                                addLabel="Add Option"
                                            />
                                            {errors.options && (
                                                <p className="text-sm text-destructive mt-1">{errors.options}</p>
                                            )}
                                            {options.length === 0 && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    At least one option is required
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {!requiresOptions && (
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                {answerType === 'numeric' 
                                                    ? 'This question type accepts numeric input (KRW amounts, percentages, etc.). No options needed.'
                                                    : 'This question type accepts text input. No options needed.'}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={displayOrder}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <Label>Version (Optional)</Label>
                                        <Input
                                            value={displayVersion}
                                            onChange={(e) => setData('version', e.target.value)}
                                            placeholder="e.g., 1.0, 2.0"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            For versioning/effective date handling
                                        </p>
                                    </div>

                                    <div>
                                        <Label>Explanation (Optional)</Label>
                                        <Textarea
                                            value={displayExplanation}
                                            onChange={(e) => {
                                                setExplanation(e.target.value);
                                                setData('metadata', e.target.value ? { explanation: e.target.value } : null);
                                            }}
                                            rows={4}
                                            placeholder="Enter detailed explanation for this question. This will be displayed in the right side panel for HR Managers."
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This explanation will be shown in the right side panel when HR Managers view this question.
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={displayIsActive}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (question will be shown to HR Managers)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/compensation-snapshot')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting || processing || (requiresOptions && options.length === 0)}>
                                    {submitting ? 'Updating...' : 'Update Question'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
