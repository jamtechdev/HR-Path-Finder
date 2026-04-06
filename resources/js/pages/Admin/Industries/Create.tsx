import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { useTranslation } from 'react-i18next';

export default function IndustriesCreate() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        order: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/industries', {
            preserveScroll: true,
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
                    <Head title={t('admin_industries_create.page_title')} />
                    <div className="p-6 md:p-8 max-w-3xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/industries">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('admin_industries_create.back')}
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">{t('admin_industries_create.heading')}</h1>
                            <p className="text-muted-foreground">
                                {t('admin_industries_create.subheading')}
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_industries_create.details_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">{t('admin_industries_create.fields.name')}</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t('admin_industries_create.fields.name_placeholder')}
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="order">{t('admin_industries_create.fields.order_optional')}</Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', e.target.value)}
                                            placeholder={t('admin_industries_create.fields.order_placeholder')}
                                            min="0"
                                        />
                                        {errors.order && (
                                            <p className="text-sm text-destructive mt-1">{errors.order}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('admin_industries_create.fields.order_help')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? t('admin_industries_create.actions.creating') : t('admin_industries_create.actions.create')}
                                        </Button>
                                        <Link href="/admin/industries">
                                            <Button type="button" variant="outline">
                                                {t('common.cancel')}
                                            </Button>
                                        </Link>
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
