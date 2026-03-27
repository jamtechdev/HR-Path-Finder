import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
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
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';

interface IndustryCategory {
    id: number;
    name: string;
}

interface IndustrySubCategory {
    id: number;
    name: string;
    order: number;
    industry_category_id: number;
    industryCategory?: IndustryCategory;
}

interface Props {
    subCategories: IndustrySubCategory[];
    categories: IndustryCategory[];
    currentCategory?: number;
}

export default function SubcategoriesIndex({
    subCategories,
    categories,
    currentCategory,
}: Props) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }

        if (flash?.error) {
            toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
        }
    }, [flash]);

    const handleDelete = (subCategoryId: number) => {
        if (confirm('Are you sure you want to delete this sub industry?')) {
            router.delete(`/admin/subcategories/${subCategoryId}`, {
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
                    <Head title="Sub Industries Management" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    Sub Industries Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage sub industries
                                </p>
                            </div>
                            <Link href="/admin/subcategories/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Sub Industry
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Filter by Industry</CardTitle>
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
                                                All Industries
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
                                <CardTitle>Sub Industries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {(subCategories || []).map(
                                        (subCategory) => (
                                            <div
                                                key={subCategory.id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                                            >
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-3">
                                                        <p className="font-medium">
                                                            {subCategory.name}
                                                        </p>
                                                        <Badge variant="outline">
                                                            {subCategory
                                                                .industryCategory
                                                                ?.name ||
                                                                'Unknown Industry'}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            Order:{' '}
                                                            {subCategory.order}
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
                                    {(!subCategories ||
                                        subCategories.length === 0) && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            No sub industries found.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
