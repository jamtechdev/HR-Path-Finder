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
    const { flash } = usePage().props as any;
    const [companyFilter, setCompanyFilter] = useState<string>('');
    const [orgFilter, setOrgFilter] = useState<string>('');

    useEffect(() => {
        if (flash?.success) toast({ title: toastCopy.success, description: flash.success });
        if (flash?.error) toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
    }, [flash]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this KPI template?')) {
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
                    <Head title="KPI Templates" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">KPI Templates</h1>
                                <p className="text-muted-foreground">
                                    Recommended KPIs by organization unit. Managers see these when creating KPIs.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Use this page to define reusable default KPI suggestions. Use KPI Review for approving or revising live submitted KPI data by project.
                                </p>
                            </div>
                            <Link href="/admin/kpi-templates/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Template
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-4">
                                <div>
                                    <Label>Company</Label>
                                    <select
                                        className="mt-1 h-9 rounded-md border border-input bg-background px-3"
                                        value={companyFilter}
                                        onChange={(e) => setCompanyFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Org unit name</Label>
                                    <Input
                                        className="mt-1 w-48"
                                        value={orgFilter}
                                        onChange={(e) => setOrgFilter(e.target.value)}
                                        placeholder="Filter by org unit"
                                    />
                                </div>
                                <Button className="mt-6" onClick={applyFilters}>
                                    Apply
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Templates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {list.length === 0 ? (
                                        <p className="py-4 text-muted-foreground">No KPI templates yet. Create one to suggest KPIs to managers.</p>
                                    ) : (
                                        list.map((t) => (
                                            <div
                                                key={t.id}
                                                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="font-semibold">{t.kpi_name}</span>
                                                        {!t.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                        {t.org_unit_name && (
                                                            <Badge variant="outline">{t.org_unit_name}</Badge>
                                                        )}
                                                        {t.company && (
                                                            <Badge variant="outline">{t.company.name}</Badge>
                                                        )}
                                                    </div>
                                                    {t.purpose && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">{t.purpose}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Category: {t.category || '—'} · Weight: {t.weight}%
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/kpi-templates/${t.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(t.id)}
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
