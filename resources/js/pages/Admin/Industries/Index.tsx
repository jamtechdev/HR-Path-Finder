import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

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
    const handleDelete = (categoryId: number) => {
            if (confirm('Are you sure you want to delete this industry? This will also delete all sub industries.')) {
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
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Industries Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Industries Management</h1>
                                <p className="text-muted-foreground">
                                    Manage industries and sub industries
                                </p>
                            </div>
                            <Link href="/admin/industries/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Industry
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {(categories || []).map((category) => (
                                <Card key={category.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CardTitle>{category.name}</CardTitle>
                                                <Badge variant="outline">Order: {category.order}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/industries/${category.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {category.subCategories && category.subCategories.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                    Sub Industries:
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {category.subCategories.map((subCategory) => (
                                                        <div
                                                            key={subCategory.id}
                                                            className="flex items-center justify-between p-2 border rounded-lg"
                                                        >
                                                            <span className="text-sm">{subCategory.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {subCategory.order}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No sub industries yet. Edit to add sub industries.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!categories || categories.length === 0) && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            No industries found. Create one to get started.
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
