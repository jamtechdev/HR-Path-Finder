import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
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
import { useTranslation } from 'react-i18next';

interface Props {
    optionKeys: Record<string, string>;
}

export default function EvaluationOptionGuidanceCreate({ optionKeys }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        option_key: '',
        option_value: '',
        concept: '',
        key_characteristics: '',
        example: '',
        pros: '',
        cons: '',
        best_fit_organizations: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/evaluation-option-guidance');
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-4xl mx-auto">
                    <Head title={t('admin_eval_option_guidance_create.page_title')} />
                    
                    <div className="mb-6">
                        <Link href="/admin/evaluation-option-guidance">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('admin_eval_option_guidance_create.back')}
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">{t('admin_eval_option_guidance_create.heading')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('admin_eval_option_guidance_create.subheading')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_eval_option_guidance_create.details_title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="option_key">{t('admin_eval_option_guidance_create.fields.option_key')}</Label>
                                    <Select value={data.option_key} onValueChange={(value) => setData('option_key', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('admin_eval_option_guidance_create.fields.option_key_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(optionKeys).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.option_key && <p className="text-sm text-destructive mt-1">{errors.option_key}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="option_value">{t('admin_eval_option_guidance_create.fields.option_value')}</Label>
                                    <Input
                                        id="option_value"
                                        value={data.option_value}
                                        onChange={(e) => setData('option_value', e.target.value)}
                                        placeholder={t('admin_eval_option_guidance_create.fields.option_value_placeholder')}
                                    />
                                    {errors.option_value && <p className="text-sm text-destructive mt-1">{errors.option_value}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="concept">{t('admin_eval_option_guidance_create.fields.concept')}</Label>
                                    <Textarea
                                        id="concept"
                                        value={data.concept}
                                        onChange={(e) => setData('concept', e.target.value)}
                                        rows={3}
                                        placeholder={t('admin_eval_option_guidance_create.fields.concept_placeholder')}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="key_characteristics">{t('admin_eval_option_guidance_create.fields.key_characteristics')}</Label>
                                    <Textarea
                                        id="key_characteristics"
                                        value={data.key_characteristics}
                                        onChange={(e) => setData('key_characteristics', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="example">{t('admin_eval_option_guidance_create.fields.example')}</Label>
                                    <Textarea
                                        id="example"
                                        value={data.example}
                                        onChange={(e) => setData('example', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pros">{t('admin_eval_option_guidance_create.fields.pros')}</Label>
                                    <Textarea
                                        id="pros"
                                        value={data.pros}
                                        onChange={(e) => setData('pros', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cons">{t('admin_eval_option_guidance_create.fields.cons')}</Label>
                                    <Textarea
                                        id="cons"
                                        value={data.cons}
                                        onChange={(e) => setData('cons', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="best_fit_organizations">{t('admin_eval_option_guidance_create.fields.best_fit')}</Label>
                                    <Textarea
                                        id="best_fit_organizations"
                                        value={data.best_fit_organizations}
                                        onChange={(e) => setData('best_fit_organizations', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        {t('admin_eval_option_guidance_create.fields.active')}
                                    </Label>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href="/admin/evaluation-option-guidance">
                                        <Button type="button" variant="outline">
                                            {t('common.cancel')}
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {t('admin_eval_option_guidance_create.actions.create')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
