import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
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
    profile_photo_path?: string | null;
}

interface Props {
    ceo: Ceo;
    companies: Company[];
}

export default function Edit({ ceo, companies }: Props) {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        ceo.profile_photo_path ? `/storage/${ceo.profile_photo_path}` : null
    );
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: ceo.name,
        email: ceo.email,
        company_id: ceo.companies?.[0]?.id ?? null,
        profile_photo: null as File | null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/ceos/${ceo.id}`, {
            forceFormData: true,
        });
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
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                clearInertiaFieldError(clearErrors, 'name');
                                            }}
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
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                clearInertiaFieldError(clearErrors, 'email');
                                            }}
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

                                    <div>
                                        <Label>Profile Photo</Label>
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Profile"
                                                className="mt-2 mb-2 h-20 w-20 rounded-full object-cover border"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null;
                                                setData('profile_photo', file);
                                                if (file) {
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                        />
                                        {errors.profile_photo && (
                                            <p className="text-sm text-red-500">{errors.profile_photo}</p>
                                        )}
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
