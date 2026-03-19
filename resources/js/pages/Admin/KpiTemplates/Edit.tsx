import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Head, Link, useForm } from '@inertiajs/react';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import React from 'react';

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
}

interface Props {
    template: KpiTemplate;
    companies: Company[];
}

export default function KpiTemplatesEdit({ template, companies }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        company_id: template.company_id ?? '',
        org_unit_name: template.org_unit_name ?? '',
        kpi_name: template.kpi_name,
        purpose: template.purpose ?? '',
        category: template.category ?? '',
        formula: template.formula ?? '',
        measurement_method: template.measurement_method ?? '',
        weight: String(template.weight ?? ''),
        sort_order: String(template.sort_order ?? 0),
        is_active: template.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/kpi-templates/${template.id}`, {
            ...data,
            company_id: data.company_id === '' ? null : Number(data.company_id),
        });
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <Head title="Edit KPI Template" />
                <main className="flex-1 overflow-auto bg-background">
                    <div className="mx-auto max-w-2xl p-6 md:p-8">
                        <div className="mb-6">
                            <Link href="/admin/kpi-templates" className="text-sm text-muted-foreground hover:underline">
                                &larr; Back to KPI Templates
                            </Link>
                            <h1 className="mt-2 text-3xl font-bold">Edit KPI Template</h1>
                        </div>
                        <form onSubmit={submit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Company (optional)</Label>
                                        <select
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                                            value={data.company_id}
                                            onChange={(e) => setData('company_id', e.target.value)}
                                        >
                                            <option value="">Global</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Org unit name (optional)</Label>
                                        <Input
                                            value={data.org_unit_name}
                                            onChange={(e) => setData('org_unit_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>KPI Name *</Label>
                                        <Input
                                            value={data.kpi_name}
                                            onChange={(e) => setData('kpi_name', e.target.value)}
                                            required
                                        />
                                        {errors.kpi_name && <p className="mt-1 text-sm text-destructive">{errors.kpi_name}</p>}
                                    </div>
                                    <div>
                                        <Label>Purpose</Label>
                                        <Textarea value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} rows={2} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Category</Label>
                                            <Input value={data.category} onChange={(e) => setData('category', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Weight (%)</Label>
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
                                        <Label>Formula</Label>
                                        <Input value={data.formula} onChange={(e) => setData('formula', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Measurement method</Label>
                                        <Textarea
                                            value={data.measurement_method}
                                            onChange={(e) => setData('measurement_method', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Sort order</Label>
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
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            Update
                                        </Button>
                                        <Link href="/admin/kpi-templates">
                                            <Button type="button" variant="outline">
                                                Cancel
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
