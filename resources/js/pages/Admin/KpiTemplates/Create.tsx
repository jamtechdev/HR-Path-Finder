import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { useTranslation } from 'react-i18next';

interface Company {
    id: number;
    name: string;
}

interface Props {
    companies: Company[];
}

export default function KpiTemplatesCreate({ companies }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        company_id: '' as string | number,
        org_unit_name: '',
        kpi_name: '',
        purpose: '',
        category: '',
        formula: '',
        measurement_method: '',
        weight: '',
        sort_order: '0',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/kpi-templates');
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <Head title={t('admin_kpi_templates_create.page_title')} />
                <main className="flex-1 overflow-auto bg-background">
                    <div className="mx-auto max-w-2xl p-6 md:p-8">
                        <div className="mb-6">
                            <Link href="/admin/kpi-templates" className="text-sm text-muted-foreground hover:underline">
                                &larr; {t('admin_kpi_templates_create.back')}
                            </Link>
                            <h1 className="mt-2 text-3xl font-bold">{t('admin_kpi_templates_create.heading')}</h1>
                        </div>
                        <form onSubmit={submit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin_kpi_templates_create.details_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.company_optional')}</Label>
                                        <select
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                                            value={data.company_id}
                                            onChange={(e) => setData('company_id', e.target.value)}
                                        >
                                            <option value="">{t('admin_kpi_templates_create.fields.global')}</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.org_unit_optional')}</Label>
                                        <Input
                                            value={data.org_unit_name}
                                            onChange={(e) => setData('org_unit_name', e.target.value)}
                                            placeholder={t('admin_kpi_templates_create.fields.org_unit_placeholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.kpi_name')}</Label>
                                        <Input
                                            value={data.kpi_name}
                                            onChange={(e) => setData('kpi_name', e.target.value)}
                                            required
                                        />
                                        {errors.kpi_name && <p className="mt-1 text-sm text-destructive">{errors.kpi_name}</p>}
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.purpose')}</Label>
                                        <Textarea
                                            value={data.purpose}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>{t('admin_kpi_templates_create.fields.category')}</Label>
                                            <Input
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                placeholder={t('admin_kpi_templates_create.fields.category_placeholder')}
                                            />
                                        </div>
                                        <div>
                                            <Label>{t('admin_kpi_templates_create.fields.weight')}</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={data.weight}
                                                onChange={(e) => setData('weight', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.formula')}</Label>
                                        <Input
                                            value={data.formula}
                                            onChange={(e) => setData('formula', e.target.value)}
                                            placeholder={t('admin_kpi_templates_create.fields.formula_placeholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.measurement_method')}</Label>
                                        <Textarea
                                            value={data.measurement_method}
                                            onChange={(e) => setData('measurement_method', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('admin_kpi_templates_create.fields.sort_order')}</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(v) => setData('is_active', !!v)}
                                        />
                                        <Label htmlFor="is_active">{t('admin_kpi_templates_create.fields.active')}</Label>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {t('common.create')}
                                        </Button>
                                        <Link href="/admin/kpi-templates">
                                            <Button type="button" variant="outline">
                                                {t('common.cancel')}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
