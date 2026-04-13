import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DynamicList from '@/components/Forms/DynamicList';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

interface Props {
    answerTypes: Record<string, string>;
}

export default function PerformanceSnapshotCreate({ answerTypes }: Props) {
    const { t } = useTranslation();
    const key = 'admin_performance_snapshot_question_create';

    const [answerType, setAnswerType] = useState<string>('select_one');
    const [options, setOptions] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        question_text: '',
        answer_type: 'select_one',
        options: [] as string[],
        order: null as number | null,
        is_active: true,
        version: '',
        metadata: null as any,
    });

    useEffect(() => {
        setData('answer_type', answerType);
        setData('options', options);
    }, [answerType, options]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/performance-snapshot', {
            onSuccess: () => router.visit('/admin/performance-snapshot'),
        });
    };

    return (
        <AdminLayout>
            <Head title={t(`${key}.page_title`)} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/performance-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t(`${key}.back_to_questions`)}
                            </Button>
                            <h1 className="text-3xl font-bold">{t(`${key}.header_title`)}</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t(`${key}.question_details`)}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            {t(`${key}.question_text`)} <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder={t(`${key}.question_text_placeholder`)}
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>
                                            {t(`${key}.answer_type`)} <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={answerType} onValueChange={setAnswerType}>
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

                                    <div>
                                        <Label>{t(`${key}.answer_options`)} <span className="text-destructive">*</span></Label>
                                        <p className="text-xs text-muted-foreground mb-2">{t(`${key}.answer_options_description`)}</p>
                                        <DynamicList
                                            label=""
                                            items={options}
                                            onChange={setOptions}
                                            placeholder={t(`${key}.option_placeholder`)}
                                            addLabel={t(`${key}.add_option`)}
                                        />
                                        {errors.options && (
                                            <p className="text-sm text-destructive mt-1">{errors.options}</p>
                                        )}
                                        {options.length === 0 && (
                                            <p className="text-sm text-muted-foreground mt-1">{t(`${key}.options_required`)}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>{t(`${key}.version_optional`)}</Label>
                                        <Input
                                            value={data.version}
                                            onChange={(e) => setData('version', e.target.value)}
                                            placeholder={t(`${key}.version_placeholder`)}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">{t(`${key}.version_description`)}</p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            {t(`${key}.is_active_label`)}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.visit('/admin/performance-snapshot')}>
                                    {t(`${key}.cancel`)}
                                </Button>
                                <Button type="submit" disabled={processing || options.length === 0}>
                                    {t(`${key}.create_question`)}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AdminLayout>
    );
}