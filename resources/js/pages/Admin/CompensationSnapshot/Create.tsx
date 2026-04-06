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
import { useTranslation } from 'react-i18next'; // assuming react-i18next

interface Props {
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotCreate({ answerTypes }: Props) {
    const { t } = useTranslation(); // translation hook
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
        if (['select_one', 'select_up_to_2', 'multiple'].includes(answerType)) {
            setData('options', options);
        } else {
            setData('options', null);
        }
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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('compensation_snapshot_create.page_title')} />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/compensation-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('common.back_to_questions')}
                            </Button>
                            <h1 className="text-3xl font-bold">{t('compensation_snapshot_create.header_title')}</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('compensation_snapshot_create.card_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            {t('compensation_snapshot_create.question_text')} <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder={t('compensation_snapshot_create.question_text_placeholder')}
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>{t('compensation_snapshot_create.answer_type')} <span className="text-destructive">*</span></Label>
                                        <Select value={answerType} onValueChange={setAnswerType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(answerTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {t(`answer_types.${key}`, label)}
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
                                            <Label>{t('compensation_snapshot_create.answer_options')} <span className="text-destructive">*</span></Label>
                                            <p className="text-xs text-muted-foreground mb-2">{t('compensation_snapshot_create.answer_options_description')}</p>
                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder={t('compensation_snapshot_create.answer_option_placeholder')}
                                                addLabel={t('compensation_snapshot_create.add_option')}
                                            />
                                            {errors.options && (
                                                <p className="text-sm text-destructive mt-1">{errors.options}</p>
                                            )}
                                            {options.length === 0 && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {t('compensation_snapshot_create.options_required')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {!requiresOptions && (
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                {answerType === 'numeric'
                                                    ? t('compensation_snapshot_create.numeric_explanation')
                                                    : t('compensation_snapshot_create.text_explanation')}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label>{t('compensation_snapshot_create.order')}</Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                            placeholder={t('compensation_snapshot_create.order_placeholder')}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('compensation_snapshot_create.order_description')}
                                        </p>
                                    </div>

                                    <div>
                                        <Label>{t('compensation_snapshot_create.version')}</Label>
                                        <Input
                                            value={data.version}
                                            onChange={(e) => setData('version', e.target.value)}
                                            placeholder={t('compensation_snapshot_create.version_placeholder')}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('compensation_snapshot_create.version_description')}
                                        </p>
                                    </div>

                                    <div>
                                        <Label>{t('compensation_snapshot_create.explanation')}</Label>
                                        <Textarea
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
                                            rows={4}
                                            placeholder={t('compensation_snapshot_create.explanation_placeholder')}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('compensation_snapshot_create.explanation_description')}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            {t('compensation_snapshot_create.active_label')}
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
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing || (requiresOptions && options.length === 0)}>
                                    {t('common.create_question')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}