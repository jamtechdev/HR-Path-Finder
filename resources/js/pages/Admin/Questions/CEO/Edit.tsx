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
    const [metadataJson, setMetadataJson] = useState<string>(
        JSON.stringify(question.metadata || {}, null, 2),
    );
    const [metadataJsonError, setMetadataJsonError] = useState<string>('');

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

        setData('metadata', metadata);
    }, [questionType, options, metadata, setData]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(metadataJson);
            setMetadata(parsed && typeof parsed === 'object' ? parsed : {});
            setMetadataJsonError('');
        } catch {
            setMetadataJsonError(t('admin_ceo_questions_edit.invalid_json', 'Invalid JSON format'));
        }
    }, [metadataJson, t]);

    const updateMetadata = (key: string, value: unknown) => {
        const next = { ...(metadata || {}), [key]: value };
        setMetadata(next);
        setMetadataJson(JSON.stringify(next, null, 2));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/questions/ceo/${question.id}`);
    };

    return (
        <AdminLayout>
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

                                    {/* Order */}
                                    <div>
                                        <Label>{t('admin_ceo_questions_edit.display_order', 'Display Order')}</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={data.order ?? ''}
                                            onChange={(e) =>
                                                setData(
                                                    'order',
                                                    e.target.value === '' ? 0 : Number(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.order && (
                                            <div className="text-sm text-destructive">
                                                {errors.order}
                                            </div>
                                        )}
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
                                                placeholder={t('admin_ceo_questions_edit.enter_option', 'Enter option')}
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
                                                placeholder={t('admin_ceo_questions_edit.scale_labels_placeholder', 'Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree')}
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
                                                placeholder={t('admin_ceo_questions_edit.unit_placeholder', 'Billions of KRW')}
                                            />
                                        </div>
                                    )}

                                    {/* Metadata JSON (admin-driven survey text/callouts) */}
                                    <div className="space-y-3 rounded-md border p-4">
                                        <p className="text-sm font-medium">{t('admin_ceo_questions_edit.survey_copy_title', 'Survey Copy (Form Fields)')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin_ceo_questions_edit.survey_copy_desc', 'Fill EN/KO copy here. Values are saved into metadata automatically.')}
                                        </p>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.question_text_en', 'Question Text (EN)')}</Label>
                                                <Textarea
                                                    value={metadata.question_text_en || ''}
                                                    onChange={(e) => updateMetadata('question_text_en', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.question_text_ko', 'Question Text (KO)')}</Label>
                                                <Textarea
                                                    value={metadata.question_text_ko || ''}
                                                    onChange={(e) => updateMetadata('question_text_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.section_title_en', 'Section Title (EN)')}</Label>
                                                <Input
                                                    value={metadata.section_title || ''}
                                                    onChange={(e) => updateMetadata('section_title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.section_title_ko', 'Section Title (KO)')}</Label>
                                                <Input
                                                    value={metadata.section_title_ko || ''}
                                                    onChange={(e) => updateMetadata('section_title_ko', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.section_description_en', 'Section Description (EN)')}</Label>
                                                <Textarea
                                                    value={metadata.section_description || ''}
                                                    onChange={(e) => updateMetadata('section_description', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.section_description_ko', 'Section Description (KO)')}</Label>
                                                <Textarea
                                                    value={metadata.section_description_ko || ''}
                                                    onChange={(e) => updateMetadata('section_description_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.callout_title_en', 'Callout Title (EN)')}</Label>
                                                <Input
                                                    value={metadata.section_callout_title || ''}
                                                    onChange={(e) => updateMetadata('section_callout_title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.callout_title_ko', 'Callout Title (KO)')}</Label>
                                                <Input
                                                    value={metadata.section_callout_title_ko || ''}
                                                    onChange={(e) => updateMetadata('section_callout_title_ko', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.callout_body_en', 'Callout Body (EN)')}</Label>
                                                <Textarea
                                                    value={metadata.section_callout_body || ''}
                                                    onChange={(e) => updateMetadata('section_callout_body', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>{t('admin_ceo_questions_edit.callout_body_ko', 'Callout Body (KO)')}</Label>
                                                <Textarea
                                                    value={metadata.section_callout_body_ko || ''}
                                                    onChange={(e) => updateMetadata('section_callout_body_ko', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>{t('admin_ceo_questions_edit.metadata_json', 'Metadata (JSON)')}</Label>
                                        <Textarea
                                            value={metadataJson}
                                            onChange={(e) => setMetadataJson(e.target.value)}
                                            rows={8}
                                            placeholder={t('admin_ceo_questions_edit.metadata_json_placeholder', '{"title":"...", "description":"...", "callout_title":"...", "callout_body":"..."}')}
                                        />
                                        {metadataJsonError && (
                                            <div className="text-sm text-destructive">
                                                {metadataJsonError}
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t('admin_ceo_questions_edit.metadata_help', 'You can manage survey section/callout text from Admin metadata (EN/KO keys supported).')}
                                        </p>
                                    </div>

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
        </AdminLayout>
    );
}
