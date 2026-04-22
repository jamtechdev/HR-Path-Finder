import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DynamicList from '@/components/Forms/DynamicList';
import AdminLayout from '@/layouts/AdminLayout';
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
import { Textarea } from '@/components/ui/textarea';

interface Props {
    categories: Record<string, string>;
    questionTypes: Record<string, string>;
}

export default function CEOQuestionCreate({
    categories,
    questionTypes,
}: Props) {
    const { t } = useTranslation();
    const [questionType, setQuestionType] = useState<string>('text');
    const [options, setOptions] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<any>({});
    const [metadataJson, setMetadataJson] = useState<string>('{}');
    const [metadataJsonError, setMetadataJsonError] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        category: '',
        question_text: '',
        question_type: 'text',
        order: null as number | null,
        is_active: true,
        options: null as string[] | null,
        metadata: null as any,
    });

    useEffect(() => {
        setData('question_type', questionType);
        if (questionType === 'select') setData('options', options);
        else setData('options', null);

        setData('metadata', metadata);
    }, [questionType, options, metadata, setData]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(metadataJson);
            setMetadata(parsed && typeof parsed === 'object' ? parsed : {});
            setMetadataJsonError('');
        } catch {
            setMetadataJsonError('Invalid JSON format');
        }
    }, [metadataJson]);

    const updateMetadata = (key: string, value: unknown) => {
        const next = { ...(metadata || {}), [key]: value };
        setMetadata(next);
        setMetadataJson(JSON.stringify(next, null, 2));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/questions/ceo', {
            onSuccess: () => router.visit('/admin/questions/ceo'),
        });
    };

    return (
        <AdminLayout>
            <Head title={t('admin_ceo_questions_create.page_title')} />
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
                                    'admin_ceo_questions_create.back_to_questions',
                                )}
                            </Button>

                            <h1 className="text-3xl font-bold">
                                {t('admin_ceo_questions_create.page_title')}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_ceo_questions_create.question_details',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Category */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_create.category',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(v) =>
                                                setData('category', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin_ceo_questions_create.select_category',
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
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Question Text */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_create.question_text',
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
                                            required
                                        />
                                        {errors.question_text && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.question_text}
                                            </p>
                                        )}
                                    </div>

                                    {/* Question Type */}
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_ceo_questions_create.question_type',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={questionType}
                                            onValueChange={setQuestionType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
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

                                    {/* Order */}
                                    <div>
                                        <Label>Display Order</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={data.order ?? ''}
                                            onChange={(e) =>
                                                setData(
                                                    'order',
                                                    e.target.value === '' ? null : Number(e.target.value),
                                                )
                                            }
                                            placeholder="Auto (append at end)"
                                        />
                                        {errors.order && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.order}
                                            </p>
                                        )}
                                    </div>

                                    {/* Options */}
                                    {questionType === 'select' && (
                                        <div>
                                            <Label>
                                                {t(
                                                    'admin_ceo_questions_create.options',
                                                )}
                                            </Label>
                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder="Enter option"
                                                addLabel={t(
                                                    'admin_ceo_questions_create.add_option',
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Likert / Slider / Number metadata */}
                                    {questionType === 'slider' && (
                                        <>
                                            <div>
                                                <Label>
                                                    {t(
                                                        'admin_ceo_questions_create.option_a',
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
                                                        'admin_ceo_questions_create.option_b',
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
                                                    'admin_ceo_questions_create.scale_labels',
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

                                    {questionType === 'number' && (
                                        <div>
                                            <Label>
                                                {t(
                                                    'admin_ceo_questions_create.unit',
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

                                    {/* Metadata JSON (admin-driven survey text/callouts) */}
                                    <div className="space-y-3 rounded-md border p-4">
                                        <p className="text-sm font-medium">Survey Copy (Form Fields)</p>
                                        <p className="text-xs text-muted-foreground">
                                            Fill EN/KO copy here. Values are saved into metadata automatically.
                                        </p>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div>
                                                <Label>Question Text (EN)</Label>
                                                <Textarea
                                                    value={metadata.question_text_en || ''}
                                                    onChange={(e) => updateMetadata('question_text_en', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Question Text (KO)</Label>
                                                <Textarea
                                                    value={metadata.question_text_ko || ''}
                                                    onChange={(e) => updateMetadata('question_text_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Section Title (EN)</Label>
                                                <Input
                                                    value={metadata.section_title || ''}
                                                    onChange={(e) => updateMetadata('section_title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Section Title (KO)</Label>
                                                <Input
                                                    value={metadata.section_title_ko || ''}
                                                    onChange={(e) => updateMetadata('section_title_ko', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Section Description (EN)</Label>
                                                <Textarea
                                                    value={metadata.section_description || ''}
                                                    onChange={(e) => updateMetadata('section_description', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Section Description (KO)</Label>
                                                <Textarea
                                                    value={metadata.section_description_ko || ''}
                                                    onChange={(e) => updateMetadata('section_description_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Callout Title (EN)</Label>
                                                <Input
                                                    value={metadata.section_callout_title || ''}
                                                    onChange={(e) => updateMetadata('section_callout_title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Callout Title (KO)</Label>
                                                <Input
                                                    value={metadata.section_callout_title_ko || ''}
                                                    onChange={(e) => updateMetadata('section_callout_title_ko', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Callout Body (EN)</Label>
                                                <Textarea
                                                    value={metadata.section_callout_body || ''}
                                                    onChange={(e) => updateMetadata('section_callout_body', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Callout Body (KO)</Label>
                                                <Textarea
                                                    value={metadata.section_callout_body_ko || ''}
                                                    onChange={(e) => updateMetadata('section_callout_body_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Metadata (JSON)</Label>
                                        <Textarea
                                            value={metadataJson}
                                            onChange={(e) => setMetadataJson(e.target.value)}
                                            rows={8}
                                            placeholder='{"title":"...", "description":"...", "callout_title":"...", "callout_body":"..."}'
                                        />
                                        {metadataJsonError && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {metadataJsonError}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Use metadata to control survey UI copy from Admin (EN/KO variants supported, e.g. title_ko, description_ko, callout_title_ko, callout_body_ko).
                                        </p>
                                    </div>

                                    {/* Active */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer"
                                        >
                                            {t(
                                                'admin_ceo_questions_create.active',
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
                                    {t('admin_ceo_questions_create.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {t(
                                        'admin_ceo_questions_create.create_question',
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AdminLayout>
    );
}
