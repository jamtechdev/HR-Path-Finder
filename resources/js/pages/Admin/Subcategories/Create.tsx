import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface IndustryCategory {
    id: number;
    name: string;
}

interface Props {
    categories: IndustryCategory[];
}

export default function SubcategoriesCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        industry_category_id: '',
        name: '',
        order: '',
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
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Create Subcategory" />
                    <div className="p-6 md:p-8 max-w-3xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/subcategories">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Subcategories
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">Create Subcategory</h1>
                            <p className="text-muted-foreground">
                                Add a new industry subcategory
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Subcategory Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="industry_category_id">Category *</Label>
                                        <Select
                                            value={data.industry_category_id}
                                            onValueChange={(value) => setData('industry_category_id', value)}
                                        >
                                            <SelectTrigger className={errors.industry_category_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select a category" />
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
                                        <Label htmlFor="name">Subcategory Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Automotive"
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="order">Order (optional)</Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', e.target.value)}
                                            placeholder="Leave empty for auto-order"
                                            min="0"
                                        />
                                        {errors.order && (
                                            <p className="text-sm text-destructive mt-1">{errors.order}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Lower numbers appear first. Leave empty to add at the end.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create Subcategory'}
                                        </Button>
                                        <Link href="/admin/subcategories">
                                            <Button type="button" variant="outline">
                                                Cancel
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
