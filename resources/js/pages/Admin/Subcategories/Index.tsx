import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPagination from '@/components/Admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface IndustryCategory {
    id: number;
    name: string;
}

interface IndustrySubCategory {
    id: number;
    name: string;
    created_at?: string | null;
    industry_category_id: number;
    industryCategory?: IndustryCategory;
}

interface Props {
    subCategories: {
        data: IndustrySubCategory[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: IndustryCategory[];
    currentCategory?: number;
}

export default function SubcategoriesIndex({
    subCategories,
    categories,
    currentCategory,
}: Props) {
    const formatRelativeTime = (value?: string | null) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        const secs = Math.round((d.getTime() - Date.now()) / 1000);
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const abs = Math.abs(secs);
        if (abs < 60) return rtf.format(secs, 'second');
        const mins = Math.round(secs / 60);
        if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
        const hours = Math.round(mins / 60);
        if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
        const days = Math.round(hours / 24);
        return rtf.format(days, 'day');
    };

    const { t } = useTranslation();

    const handleDelete = (subCategoryId: number) => {
        if (confirm(t('admin_subcategories.confirm_delete'))) {
            router.delete(`/admin/subcategories/${subCategoryId}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={t('admin_misc_page_titles.subcategories_index')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between flex-wrap flex-wrap">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t('admin_misc_page_titles.subcategories_index')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('admin_subcategories.index_subheading')}
                                </p>
                            </div>
                            <Link href="/admin/subcategories/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin_subcategories.add_button')}
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap">
                                    <CardTitle>{t('admin_subcategories.filter_by_industry')}</CardTitle>
                                    <Select
                                        value={
                                            currentCategory?.toString() || 'all'
                                        }
                                        onValueChange={(value) => {
                                            router.visit(
                                                value === 'all'
                                                    ? '/admin/subcategories'
                                                    : `/admin/subcategories?category=${value}`,
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                {t('admin_subcategories.all_industries')}
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_subcategories.list_title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {(subCategories.data || []).map(
                                        (subCategory) => (
                                            <div
                                                key={subCategory.id}
                                                className="flex items-center justify-between flex-wrap rounded-lg border p-4 hover:bg-muted/50"
                                            >
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-3 flex-wrap">
                                                        <p className="font-medium">
                                                            {subCategory.name}
                                                        </p>
                                                        <Badge variant="outline">
                                                            {subCategory
                                                                .industryCategory
                                                                ?.name ||
                                                                t(
                                                                    'admin_subcategories.unknown_industry',
                                                                )}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            Created: {formatRelativeTime(subCategory.created_at)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/subcategories/${subCategory.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                subCategory.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                    {(!subCategories.data ||
                                        subCategories.data.length === 0) && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {t('admin_subcategories.empty_state')}
                                        </p>
                                    )}
                                </div>
                                <AdminPagination links={subCategories.links} />
                            </CardContent>
                        </Card>
                    </div>
        </AdminLayout>
    );
}
