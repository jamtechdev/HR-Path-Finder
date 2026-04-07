import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

interface Props {
    locales: Record<string, string>;
    namespaces: Record<string, string>;
}

export default function TranslationsCreate({ locales, namespaces }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        locale: 'ko',
        namespace: 'translation',
        key: '',
        value: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/translations', {
            onSuccess: () => {
                router.visit('/admin/translations');
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
                    <Head title={t('admin_misc_page_titles.translations_create')} />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/translations')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('admin_translations_mgmt.create_back')}
                            </Button>
                            <h1 className="text-3xl font-bold">
                                {t('admin_misc_page_titles.translations_create')}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin_translations_mgmt.details_card')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>
                                                {t('admin_translations_mgmt.label_language_req')}
                                            </Label>
                                            <Select
                                                value={data.locale}
                                                onValueChange={(v) => setData('locale', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(locales).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.locale && (
                                                <p className="text-sm text-destructive mt-1">{errors.locale}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>
                                                {t('admin_translations_mgmt.label_namespace_req')}
                                            </Label>
                                            <Select
                                                value={data.namespace}
                                                onValueChange={(v) => setData('namespace', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(namespaces).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.namespace && (
                                                <p className="text-sm text-destructive mt-1">{errors.namespace}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>
                                            {t('admin_translations_mgmt.label_key_req')}
                                        </Label>
                                        <Input
                                            value={data.key}
                                            onChange={(e) => setData('key', e.target.value)}
                                            required
                                            placeholder={t(
                                                'admin_translations_mgmt.key_placeholder',
                                            )}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('admin_translations_mgmt.key_hint')}
                                        </p>
                                        {errors.key && (
                                            <p className="text-sm text-destructive mt-1">{errors.key}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>
                                            {t('admin_translations_mgmt.label_value_req')}
                                        </Label>
                                        <Textarea
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder={t(
                                                'admin_translations_mgmt.value_placeholder',
                                            )}
                                        />
                                        {errors.value && (
                                            <p className="text-sm text-destructive mt-1">{errors.value}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            {t('admin_translations_mgmt.active_label')}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/translations')}
                                >
                                    {t('admin_subcategories.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {t('admin_translations_mgmt.create_submit')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
