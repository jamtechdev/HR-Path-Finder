import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

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
    category: IndustryCategory;
}

export default function IndustriesEdit({ category }: Props) {
    const [showAddSubCategory, setShowAddSubCategory] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<number | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        name: category?.name || '',
        order: category?.order?.toString() || '0',
    });

    const subCategoryForm = useForm({
        name: '',
        order: '',
    });

    const editSubCategoryForm = useForm({
        name: '',
        order: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/industries/${category.id}`, {
            preserveScroll: true,
        });
    };

    const handleAddSubCategory = (e: React.FormEvent) => {
        e.preventDefault();
        subCategoryForm.post(`/admin/industries/${category.id}/subcategories`, {
            preserveScroll: true,
            onSuccess: () => {
                subCategoryForm.reset();
                setShowAddSubCategory(false);
            },
        });
    };

    const handleEditSubCategory = (subCategory: IndustrySubCategory) => {
        setEditingSubCategory(subCategory.id);
        editSubCategoryForm.setData({
            name: subCategory.name,
            order: subCategory.order.toString(),
        });
    };

    const handleUpdateSubCategory = (e: React.FormEvent, subCategoryId: number) => {
        e.preventDefault();
        editSubCategoryForm.put(`/admin/industries/subcategories/${subCategoryId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSubCategory(null);
                editSubCategoryForm.reset();
            },
        });
    };

    const handleDeleteSubCategory = (subCategoryId: number) => {
        if (confirm('Are you sure you want to delete this subcategory?')) {
            router.delete(`/admin/industries/subcategories/${subCategoryId}`, {
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
                    <Head title={`Edit Industry - ${category?.name || 'Category'}`} />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/industries">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Industries
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">Edit Industry Category</h1>
                            <p className="text-muted-foreground">
                                Update category details and manage subcategories
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Edit Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Category Name *</Label>
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

                                        <div>
                                            <Label htmlFor="order">Order *</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                value={data.order}
                                                onChange={(e) => setData('order', e.target.value)}
                                                min="0"
                                            />
                                            {errors.order && (
                                                <p className="text-sm text-destructive mt-1">{errors.order}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 pt-4">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Updating...' : 'Update Category'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Subcategories */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Subcategories</CardTitle>
                                        <Button
                                            onClick={() => setShowAddSubCategory(!showAddSubCategory)}
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Subcategory
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {showAddSubCategory && (
                                        <form onSubmit={handleAddSubCategory} className="p-4 border rounded-lg space-y-3">
                                            <div>
                                                <Label htmlFor="sub_name">Subcategory Name *</Label>
                                                <Input
                                                    id="sub_name"
                                                    value={subCategoryForm.data.name}
                                                    onChange={(e) => subCategoryForm.setData('name', e.target.value)}
                                                    placeholder="e.g., Automotive"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="sub_order">Order (optional)</Label>
                                                <Input
                                                    id="sub_order"
                                                    type="number"
                                                    value={subCategoryForm.data.order}
                                                    onChange={(e) => subCategoryForm.setData('order', e.target.value)}
                                                    placeholder="Leave empty for auto-order"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="submit" size="sm" disabled={subCategoryForm.processing}>
                                                    Add
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowAddSubCategory(false);
                                                        subCategoryForm.reset();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="space-y-2">
                                        {(category.subCategories || []).map((subCategory) => (
                                            <div
                                                key={subCategory.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                {editingSubCategory === subCategory.id ? (
                                                    <form
                                                        onSubmit={(e) => handleUpdateSubCategory(e, subCategory.id)}
                                                        className="flex-1 flex items-center gap-3"
                                                    >
                                                        <Input
                                                            value={editSubCategoryForm.data.name}
                                                            onChange={(e) =>
                                                                editSubCategoryForm.setData('name', e.target.value)
                                                            }
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={editSubCategoryForm.data.order}
                                                            onChange={(e) =>
                                                                editSubCategoryForm.setData('order', e.target.value)
                                                            }
                                                            className="w-24"
                                                            min="0"
                                                        />
                                                        <Button type="submit" size="sm" disabled={editSubCategoryForm.processing}>
                                                            Save
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingSubCategory(null);
                                                                editSubCategoryForm.reset();
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <span>{subCategory.name}</span>
                                                            <Badge variant="outline">{subCategory.order}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditSubCategory(subCategory)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteSubCategory(subCategory.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {(!category.subCategories || category.subCategories.length === 0) && !showAddSubCategory && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No subcategories yet. Click "Add Subcategory" to create one.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
