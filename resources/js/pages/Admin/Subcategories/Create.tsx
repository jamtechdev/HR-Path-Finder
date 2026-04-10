import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface IndustryCategory {
    id: number;
    name: string;
}

interface Props {
    categories: IndustryCategory[];
}

export default function SubcategoriesCreate({ categories }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        industry_category_id: '',
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subcategories', {
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
                    <Head title={t('admin_misc_page_titles.subcategories_create')} />
                    <div className="p-6 md:p-8 max-w-3xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/subcategories">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('admin_subcategories.create_back')}
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">
                                {t('admin_misc_page_titles.subcategories_create')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('admin_subcategories.create_subheading')}
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_subcategories.details_card_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="industry_category_id">
                                            {t('admin_subcategories.label_industry')}
                                        </Label>
                                        <Select
                                            value={data.industry_category_id}
                                            onValueChange={(value) => setData('industry_category_id', value)}
                                        >
                                            <SelectTrigger className={errors.industry_category_id ? 'border-destructive' : ''}>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin_subcategories.placeholder_select_industry',
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.industry_category_id && (
                                            <p className="text-sm text-destructive mt-1">{errors.industry_category_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="name">
                                            {t('admin_subcategories.label_name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t(
                                                'admin_subcategories.placeholder_name',
                                            )}
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing
                                                ? t('admin_subcategories.creating')
                                                : t('admin_subcategories.create_submit')}
                                        </Button>
                                        <Link href="/admin/subcategories">
                                            <Button type="button" variant="outline">
                                                {t('admin_subcategories.cancel')}
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
