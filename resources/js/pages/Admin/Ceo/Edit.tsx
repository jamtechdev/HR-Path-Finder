import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';


interface Company {
    id: number;
    name: string;
}

interface Ceo {
    id: number;
    name: string;
    email: string;
    companies: Company[];
}

interface Props {
    ceo: Ceo;
    companies: Company[];
}

export default function Edit({ ceo, companies }: Props) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: ceo.name,
        email: ceo.email,
        company_id: ceo.companies?.[0]?.id ?? null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(`/admin/ceos/${ceo.id}`);
    }

    return (
        <SidebarProvider defaultOpen>
            <Sidebar collapsible="icon">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col">
                <AppHeader />

                <main className="flex-1 p-6 md:p-8">
                    <Head title={t('admin_misc_page_titles.ceo_edit')} />

                    <div className="mx-auto max-w-3xl">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <Link href="/admin/ceo">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('admin_ceo_form.back')}
                                </Button>
                            </Link>

                            <h1 className="text-2xl font-bold">{t('admin_ceo_form.heading')}</h1>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_ceo_form.card_title')}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <Label>{t('admin_ceo_form.name')}</Label>

                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                        />

                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>{t('admin_ceo_form.email')}</Label>

                                        <Input
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />

                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>{t('admin_ceo_form.company')}</Label>

                                        <Select
                                            value={
                                                data.company_id
                                                    ? String(data.company_id)
                                                    : 'none'
                                            }
                                            onValueChange={(value) =>
                                                setData(
                                                    'company_id',
                                                    value === 'none'
                                                        ? null
                                                        : Number(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin_ceo_form.placeholder_company',
                                                    )}
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="none">
                                                    {t('admin_ceo_form.no_company')}
                                                </SelectItem>

                                                {companies.map((company) => (
                                                    <SelectItem
                                                        key={company.id}
                                                        value={String(
                                                            company.id,
                                                        )}
                                                    >
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {t('admin_ceo_form.update_ceo')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
