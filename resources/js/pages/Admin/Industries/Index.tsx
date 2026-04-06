import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import { useTranslation } from 'react-i18next';

interface IndustrySubCategory {
    id: number;
    name: string;
    order: number;
}

interface IndustryCategory {
    id: number;
    name: string;
    order: number;
    subCategories: IndustrySubCategory[];
}

interface Props {
    categories: IndustryCategory[];
}

export default function IndustriesIndex({ categories }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }

        if (flash?.error) {
            toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
        }
    }, [flash]);

    const handleDelete = (categoryId: number) => {
        if (
            confirm(t('admin_industries.confirm_delete'))
        ) {
            router.delete(`/admin/industries/${categoryId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_industries.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
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
                            {(categories || []).map((category) => (
                                <Card key={category.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CardTitle>
                                                    {category.name}
                                                </CardTitle>
                                                <Badge variant="outline">
                                                    {t('admin_industries.fields.order')}: {category.order}
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
                                                                className="flex items-center justify-between rounded-lg border p-2"
                                                            >
                                                                <span className="text-sm">
                                                                    {
                                                                        subCategory.name
                                                                    }
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        subCategory.order
                                                                    }
                                                                </Badge>
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
                            {(!categories || categories.length === 0) && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            {t('admin_industries.empty.no_industries')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
