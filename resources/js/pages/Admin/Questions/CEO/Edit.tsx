import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const [questionType, setQuestionType] = useState<string>(
        question.question_type,
    );
    const [options, setOptions] = useState<string[]>(question.options || []);
    const [metadata, setMetadata] = useState<any>(question.metadata || {});

    const { data, setData, put, processing, errors } = useForm({
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

        if (questionType === 'select') setData('options', options);
        else setData('options', []);

        if (['likert', 'slider', 'number'].includes(questionType))
            setData('metadata', metadata);
        else setData('metadata', {});
    }, [questionType, options, metadata]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/questions/ceo/${question.id}`);
    };

    return (
        <SidebarProvider defaultOpen>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_ceo_questions_edit.page_title')} />

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
                                {t(
                                    'admin_ceo_questions_edit.back_to_questions',
                                )}
                            </Button>

                            <h1 className="text-3xl font-bold">
                                {t('admin_ceo_questions_edit.page_title')}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_ceo_questions_edit.question_details',
                                        )}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Category */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_edit.category',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            defaultValue={data.category}
                                            onValueChange={(v) =>
                                                setData('category', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin_ceo_questions_edit.select_category',
                                                    )}
                                                />
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
                                            <div className="text-sm text-destructive">
                                                {errors.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Text */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_edit.question_text',
                                            )}{' '}
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
                                            <div className="text-sm text-destructive">
                                                {errors.question_text}
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Type */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_edit.question_type',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            defaultValue={questionType}
                                            onValueChange={setQuestionType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin_ceo_questions_edit.question_type',
                                                    )}
                                                />
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

                                    {/* Options */}
                                    {questionType === 'select' && (
                                        <div>
                                            <Label>
                                                {t(
                                                    'admin_ceo_questions_edit.options',
                                                )}
                                            </Label>
                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder="Enter option"
                                                addLabel={t(
                                                    'admin_ceo_questions_edit.add_option',
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Slider / Likert */}
                                    {questionType === 'slider' && (
                                        <>
                                            <div>
                                                <Label>
                                                    {t(
                                                        'admin_ceo_questions_edit.option_a',
                                                    )}
                                                </Label>
                                                <Input
                                                    value={
                                                        metadata.option_a || ''
                                                    }
                                                    onChange={(e) =>
                                                        setMetadata({
                                                            ...metadata,
                                                            option_a:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>
                                                    {t(
                                                        'admin_ceo_questions_edit.option_b',
                                                    )}
                                                </Label>
                                                <Input
                                                    value={
                                                        metadata.option_b || ''
                                                    }
                                                    onChange={(e) =>
                                                        setMetadata({
                                                            ...metadata,
                                                            option_b:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                    {questionType === 'likert' && (
                                        <div>
                                            <Label>
                                                {t(
                                                    'admin_ceo_questions_edit.scale_labels',
                                                )}
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
                                                placeholder="Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree"
                                            />
                                        </div>
                                    )}

                                    {/* Number */}
                                    {questionType === 'number' && (
                                        <div>
                                            <Label>
                                                {t(
                                                    'admin_ceo_questions_edit.unit',
                                                )}
                                            </Label>
                                            <Input
                                                value={metadata.unit || ''}
                                                onChange={(e) =>
                                                    setMetadata({
                                                        ...metadata,
                                                        unit: e.target.value,
                                                    })
                                                }
                                                placeholder="Billions of KRW"
                                            />
                                        </div>
                                    )}

                                    {/* Active */}
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
                                            {t(
                                                'admin_ceo_questions_edit.active',
                                            )}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit('/admin/questions/ceo')
                                    }
                                >
                                    {t('admin_ceo_questions_edit.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {t(
                                        'admin_ceo_questions_edit.update_question',
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
