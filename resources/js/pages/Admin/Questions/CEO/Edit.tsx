import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DynamicList from '@/components/Forms/DynamicList';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface DiagnosisQuestion {
    id: number;
    category: string;
    question_text: string;
    question_type: string;
    order: number;
    is_active: boolean;
    options?: string[];
    metadata?: any;
}

interface Props {
    question: DiagnosisQuestion;
    categories: Record<string, string>;
    questionTypes: Record<string, string>;
}

export default function CEOQuestionEdit({
    question,
    categories,
    questionTypes,
}: Props) {
    const [questionType, setQuestionType] = useState<string>(
        question.question_type,
    );
    const [options, setOptions] = useState<string[]>(question.options || []);
    const [metadata, setMetadata] = useState<any>(question.metadata || {});

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        category: question.category || '',
        question_text: question.question_text || '',
        question_type: question.question_type || '',
        order: question.order || 0,
        is_active: question.is_active ?? true,
        options: question.options || [],
        metadata: question.metadata || {},
    });

    useEffect(() => {
        setData('question_type', questionType);

        if (questionType === 'select') {
            setData('options', options);
        } else {
            setData('options', []);
        }

        if (
            questionType === 'likert' ||
            questionType === 'slider' ||
            questionType === 'number'
        ) {
            setData('metadata', metadata);
        } else {
            setData('metadata', {});
        }
    }, [questionType, options, metadata]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/admin/questions/ceo/${question.id}`);
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Edit CEO Question" />

                    <div className="mx-auto max-w-4xl p-6 md:p-8">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    router.visit('/admin/questions/ceo')
                                }
                                className="mb-4"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Questions
                            </Button>

                            <h1 className="text-3xl font-bold">
                                Edit CEO Question
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Details</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Category */}

                                    <div>
                                        <Label>
                                            Category
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Select
                                            defaultValue={data.category}
                                            onValueChange={(value) =>
                                                setData('category', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {Object.entries(categories).map(
                                                    ([key, label]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {errors.category && (
                                            <div className="text-sm text-red-500">
                                                {errors.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Text */}

                                    <div>
                                        <Label>
                                            Question Text
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) =>
                                                setData(
                                                    'question_text',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                        />

                                        {errors.question_text && (
                                            <div className="text-sm text-red-500">
                                                {errors.question_text}
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Type */}

                                    <div>
                                        <Label>
                                            Question Type
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>

                                        <Select
                                            defaultValue={questionType}
                                            onValueChange={(value) =>
                                                setQuestionType(value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {Object.entries(
                                                    questionTypes,
                                                ).map(([key, label]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* SELECT OPTIONS */}

                                    {questionType === 'select' && (
                                        <div>
                                            <Label>Options</Label>

                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder="Enter option"
                                                addLabel="Add Option"
                                            />
                                        </div>
                                    )}

                                    {/* SLIDER / LIKERT */}

                                    {(questionType === 'slider' ||
                                        questionType === 'likert') && (
                                        <div className="space-y-4">
                                            {questionType === 'slider' && (
                                                <>
                                                    <div>
                                                        <Label>Option A</Label>

                                                        <Input
                                                            value={
                                                                metadata.option_a ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setMetadata({
                                                                    ...metadata,
                                                                    option_a:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label>Option B</Label>

                                                        <Input
                                                            value={
                                                                metadata.option_b ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setMetadata({
                                                                    ...metadata,
                                                                    option_b:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {questionType === 'likert' && (
                                                <div>
                                                    <Label>
                                                        Scale Labels
                                                        (comma-separated)
                                                    </Label>

                                                    <Input
                                                        value={
                                                            metadata.labels?.join(
                                                                ', ',
                                                            ) || ''
                                                        }
                                                        onChange={(e) =>
                                                            setMetadata({
                                                                ...metadata,
                                                                labels: e.target.value
                                                                    .split(',')
                                                                    .map((s) =>
                                                                        s.trim(),
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* NUMBER TYPE */}

                                    {questionType === 'number' && (
                                        <div>
                                            <Label>
                                                Unit (Years, Billions, etc.)
                                            </Label>

                                            <Input
                                                value={metadata.unit || ''}
                                                onChange={(e) =>
                                                    setMetadata({
                                                        ...metadata,
                                                        unit: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* ORDER */}

                                    <div>
                                        <Label>Order</Label>

                                        <Input
                                            type="number"
                                            value={data.order}
                                            min="0"
                                            onChange={(e) =>
                                                setData(
                                                    'order',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* ACTIVE */}

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />

                                        <Label className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BUTTONS */}

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit('/admin/questions/ceo')
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    Update Question
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
