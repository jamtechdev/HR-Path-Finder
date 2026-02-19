import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicList from '@/components/Forms/DynamicList';
import { ChevronLeft } from 'lucide-react';

interface Props {
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotCreate({ answerTypes }: Props) {
    const [answerType, setAnswerType] = useState<string>('select_one');
    const [options, setOptions] = useState<string[]>([]);

    const [explanation, setExplanation] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        question_text: '',
        answer_type: 'select_one',
        options: [] as string[],
        order: 0,
        is_active: true,
        version: '',
        metadata: null as any,
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/compensation-snapshot', {
            onSuccess: () => {
                router.visit('/admin/compensation-snapshot');
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Create Compensation Snapshot Question" />
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
                            <h1 className="text-3xl font-bold">Create Compensation Snapshot Question</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Question Text <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder="Enter the question text..."
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Answer Type <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={answerType}
                                            onValueChange={setAnswerType}
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
                                                items={options}
                                                onChange={setOptions}
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
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                            placeholder="Auto-assigned if left empty"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Lower numbers appear first. Leave empty to auto-assign.
                                        </p>
                                    </div>

                                    <div>
                                        <Label>Version (Optional)</Label>
                                        <Input
                                            value={data.version}
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
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
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
                                            checked={data.is_active}
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
                                <Button type="submit" disabled={processing || (requiresOptions && options.length === 0)}>
                                    Create Question
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
