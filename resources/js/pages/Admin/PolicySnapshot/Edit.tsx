import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface Question {
    id: number;
    question_text: string;
    order: number;
    is_active: boolean;
    has_conditional_text: boolean;
}

interface Props {
    question: Question;
}

export default function Edit({ question }: Props) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        question_text: question.question_text || '',
        order: question.order || 0,
        is_active: question.is_active ?? true,
        has_conditional_text: question.has_conditional_text ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/policy-snapshot/${question.id}`);
    };

    return (
        <AdminLayout>
            <Head title={t('policy_snapshot_edit.page_title')} />
            <div className="mx-auto max-w-4xl p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    router.visit('/admin/policy-snapshot')
                                }
                                className="mb-4"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                {t('policy_snapshot_edit.back')}
                            </Button>

                            <h1 className="text-3xl font-bold">
                                {t('policy_snapshot_edit.page_title')}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('policy_snapshot_edit.card_title')}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Question Text */}
                                    <div>
                                        <Label>
                                            {t('policy_snapshot_edit.question_text')}
                                            <span className="text-destructive"> *</span>
                                        </Label>

                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => {
                                                setData('question_text', e.target.value);
                                                clearInertiaFieldError(clearErrors, 'question_text');
                                            }}
                                            rows={3}
                                            required
                                        />

                                        {errors.question_text && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.question_text}
                                            </p>
                                        )}
                                    </div>

                                    {/* Conditional Text */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_conditional_text"
                                            checked={data.has_conditional_text}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'has_conditional_text',
                                                    checked as boolean,
                                                )
                                            }
                                        />

                                        <Label htmlFor="has_conditional_text">
                                            {t('policy_snapshot_edit.has_conditional_text')}
                                        </Label>
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

                                        <Label htmlFor="is_active">
                                            {t('policy_snapshot_edit.active')}
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
                                        router.visit('/admin/policy-snapshot')
                                    }
                                >
                                    {t('policy_snapshot_edit.cancel')}
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    {t('policy_snapshot_edit.update_question')}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AdminLayout>
    );
}