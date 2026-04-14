import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPagination from '@/components/Admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface IndustrySubCategory {
    id: number;
    name: string;
}

interface IndustryCategory {
    id: number;
    name: string;
    created_at?: string | null;
    subCategories: IndustrySubCategory[];
}

interface Props {
    categories: {
        data: IndustryCategory[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function IndustriesIndex({ categories }: Props) {
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

    const handleDelete = (categoryId: number) => {
        if (
            confirm(t('admin_industries.confirm_delete'))
        ) {
            router.delete(`/admin/industries/${categoryId}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={t('admin_industries.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between flex-wrap flex-wrap">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t('admin_industries.heading')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('admin_industries.subheading')}
                                </p>
                            </div>
                            <Link href="/admin/industries/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin_industries.actions.add_industry')}
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {(categories.data || []).map((category) => (
                                <Card key={category.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <CardTitle>
                                                    {category.name}
                                                </CardTitle>
                                                <Badge variant="outline">
                                                    Created: {formatRelativeTime(category.created_at)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/industries/${category.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        {t('common.edit')}
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {category.subCategories &&
                                        category.subCategories.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                                    {t('admin_industries.fields.sub_industries')}:
                                                </p>
                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                    {category.subCategories.map(
                                                        (subCategory) => (
                                                            <div
                                                                key={
                                                                    subCategory.id
                                                                }
                                                                className="flex items-center justify-between flex-wrap rounded-lg border p-2"
                                                            >
                                                                <span className="text-sm">
                                                                    {
                                                                        subCategory.name
                                                                    }
                                                                </span>
                                                                
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {t('admin_industries.empty.no_sub_industries')}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!categories.data || categories.data.length === 0) && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            {t('admin_industries.empty.no_industries')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <AdminPagination links={categories.links} />
                    </div>
        </AdminLayout>
    );
}
