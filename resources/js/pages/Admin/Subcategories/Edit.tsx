import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface IndustryCategory {
    id: number;
    name: string;
}

interface IndustrySubCategory {
    id: number;
    name: string;
    industry_category_id: number;
    industryCategory?: IndustryCategory;
}

interface Props {
    subCategory: IndustrySubCategory;
    categories: IndustryCategory[];
}

export default function SubcategoriesEdit({ subCategory, categories }: Props) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        industry_category_id: subCategory?.industry_category_id?.toString() || '',
        name: subCategory?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/subcategories/${subCategory.id}`);
    };

    return (
        <AdminLayout>
            <Head title={t('page_heads.edit_sub_industry', { name: subCategory?.name || t('page_head_fallbacks.sub_industry') })} />
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/subcategories">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('admin_subcategories.create_back')}
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">
                                {t('admin_subcategories.edit_heading')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('admin_subcategories.edit_subheading')}
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
                                                <SelectValue />
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
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing
                                                ? t('admin_subcategories.updating')
                                                : t('admin_subcategories.update_submit')}
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
        </AdminLayout>
    );
}
