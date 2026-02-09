import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

export default function SubcategoriesIndex({ subCategories, categories, currentCategory }: Props) {
    const handleDelete = (subCategoryId: number) => {
        if (confirm('Are you sure you want to delete this subcategory?')) {
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
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Subcategories Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Subcategories Management</h1>
                                <p className="text-muted-foreground">
                                    Manage industry subcategories
                                </p>
                            </div>
                            <Link href="/admin/subcategories/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Subcategory
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Filter by Category</CardTitle>
                                    <Select
                                        value={currentCategory?.toString() || 'all'}
                                        onValueChange={(value) => {
                                            router.visit(value === 'all'
                                                ? '/admin/subcategories'
                                                : `/admin/subcategories?category=${value}`
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
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
                                <CardTitle>Subcategories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {(subCategories || []).map((subCategory) => (
                                        <div
                                            key={subCategory.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-medium">{subCategory.name}</p>
                                                    <Badge variant="outline">
                                                        {subCategory.industryCategory?.name || 'Unknown Category'}
                                                    </Badge>
                                                    <Badge variant="secondary">Order: {subCategory.order}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/subcategories/${subCategory.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(subCategory.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!subCategories || subCategories.length === 0) && (
                                        <p className="text-center text-muted-foreground py-8">
                                            No subcategories found.
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
