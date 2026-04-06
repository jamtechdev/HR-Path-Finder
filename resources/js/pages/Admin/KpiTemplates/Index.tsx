import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import { useTranslation } from 'react-i18next';

interface Company {
    id: number;
    name: string;
}

interface KpiTemplate {
    id: number;
    company_id: number | null;
    org_unit_name: string | null;
    kpi_name: string;
    purpose: string | null;
    category: string | null;
    formula: string | null;
    measurement_method: string | null;
    weight: string | number;
    sort_order: number;
    is_active: boolean;
    company?: Company | null;
}

interface PaginatedTemplates {
    data: KpiTemplate[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

interface Props {
    templates: PaginatedTemplates;
    companies: Company[];
}

export default function KpiTemplatesIndex({ templates, companies }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [companyFilter, setCompanyFilter] = useState<string>('');
    const [orgFilter, setOrgFilter] = useState<string>('');

    useEffect(() => {
        if (flash?.success) toast({ title: toastCopy.success, description: flash.success });
        if (flash?.error) toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
    }, [flash]);

    const handleDelete = (id: number) => {
        if (confirm(t('admin_kpi_templates.confirm_delete'))) {
            router.delete(`/admin/kpi-templates/${id}`, { preserveScroll: true });
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (companyFilter) params.set('company_id', companyFilter);
        if (orgFilter) params.set('org_unit_name', orgFilter);
        router.get(`/admin/kpi-templates?${params.toString()}`);
    };

    const list = templates.data || [];

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_kpi_templates.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">{t('admin_kpi_templates.heading')}</h1>
                                <p className="text-muted-foreground">
                                    {t('admin_kpi_templates.subheading')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {t('admin_kpi_templates.helper')}
                                </p>
                            </div>
                            <Link href="/admin/kpi-templates/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin_kpi_templates.actions.add_template')}
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t('admin_kpi_templates.filters.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-4">
                                <div>
                                    <Label>{t('admin_kpi_templates.filters.company')}</Label>
                                    <select
                                        className="mt-1 h-9 rounded-md border border-input bg-background px-3"
                                        value={companyFilter}
                                        onChange={(e) => setCompanyFilter(e.target.value)}
                                    >
                                        <option value="">{t('admin_kpi_templates.filters.all')}</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>{t('admin_kpi_templates.filters.org_unit_name')}</Label>
                                    <Input
                                        className="mt-1 w-48"
                                        value={orgFilter}
                                        onChange={(e) => setOrgFilter(e.target.value)}
                                        placeholder={t('admin_kpi_templates.filters.org_unit_placeholder')}
                                    />
                                </div>
                                <Button className="mt-6" onClick={applyFilters}>
                                    {t('admin_kpi_templates.filters.apply')}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_kpi_templates.templates_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {list.length === 0 ? (
                                        <p className="py-4 text-muted-foreground">{t('admin_kpi_templates.empty')}</p>
                                    ) : (
                                        list.map((tpl) => (
                                            <div
                                                key={tpl.id}
                                                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="font-semibold">{tpl.kpi_name}</span>
                                                        {!tpl.is_active && <Badge variant="secondary">{t('admin_kpi_templates.badges.inactive')}</Badge>}
                                                        {tpl.org_unit_name && (
                                                            <Badge variant="outline">{tpl.org_unit_name}</Badge>
                                                        )}
                                                        {tpl.company && (
                                                            <Badge variant="outline">{tpl.company.name}</Badge>
                                                        )}
                                                    </div>
                                                    {tpl.purpose && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">{tpl.purpose}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('admin_kpi_templates.fields.category')}: {tpl.category || '—'} · {t('admin_kpi_templates.fields.weight')}: {tpl.weight}%
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/kpi-templates/${tpl.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(tpl.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {templates.links && templates.links.length > 1 && (
                                    <div className="mt-4 flex justify-center gap-2">
                                        {templates.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={
                                                    link.active
                                                        ? 'rounded border bg-primary px-3 py-1 text-primary-foreground'
                                                        : 'rounded border px-3 py-1 hover:bg-muted'
                                                }
                                            >
                                                {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
