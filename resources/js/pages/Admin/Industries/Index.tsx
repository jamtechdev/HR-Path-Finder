import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
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
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({ title: 'Success', description: flash.success });
        }

        if (flash?.error) {
            toast({ title: 'Error', description: flash.error, variant: 'destructive' });
        }
    }, [flash]);

    const handleDelete = (categoryId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this industry? This will also delete all sub industries.',
            )
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
                    <Head title="Industries Management" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    Industries Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage industries and sub industries
                                </p>
                            </div>
                            <Link href="/admin/industries/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
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
                                                <CardTitle>
                                                    {category.name}
                                                </CardTitle>
                                                <Badge variant="outline">
                                                    Order: {category.order}
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
                                                        Edit
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
                                                    Sub Industries:
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
                                                No sub industries yet. Edit to
                                                add sub industries.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!categories || categories.length === 0) && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            No industries found. Create one to
                                            get started.
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
