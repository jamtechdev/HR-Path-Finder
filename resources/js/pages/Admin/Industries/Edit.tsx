import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { useTranslation } from 'react-i18next';

interface IndustrySubCategory {
    id: number;
    name: string;
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories: IndustrySubCategory[];
}

interface Props {
    category: IndustryCategory;
}

export default function IndustriesEdit({ category }: Props) {
    const { t } = useTranslation();
    const [showAddSubCategory, setShowAddSubCategory] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<number | null>(null);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: category?.name || '',
    });

    const subCategoryForm = useForm({
        name: '',
    });

    const editSubCategoryForm = useForm({
        name: '',
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
        if (confirm(t('admin_industries_edit.confirm_delete_sub_industry'))) {
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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_industries_edit.page_title', { name: category?.name || t('admin_industries_edit.fallback_industry') })} />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link href="/admin/industries">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('admin_industries_edit.back')}
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold mb-2">{t('admin_industries_edit.heading')}</h1>
                            <p className="text-muted-foreground">
                                {t('admin_industries_edit.subheading')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Edit Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin_industries_edit.details_title')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">{t('admin_industries_edit.fields.name')}</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => {
                                                    setData('name', e.target.value);
                                                    clearInertiaFieldError(clearErrors, 'name');
                                                }}
                                                className={errors.name ? 'border-destructive' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 pt-4">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? t('admin_industries_edit.actions.updating') : t('admin_industries_edit.actions.update_industry')}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Subcategories */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{t('admin_industries_edit.sub_industries.title')}</CardTitle>
                                        <Button
                                            onClick={() => setShowAddSubCategory(!showAddSubCategory)}
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('admin_industries_edit.sub_industries.add')}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {showAddSubCategory && (
                                        <form onSubmit={handleAddSubCategory} className="p-4 border rounded-lg space-y-3">
                                            <div>
                                                <Label htmlFor="sub_name">{t('admin_industries_edit.sub_industries.name_required')}</Label>
                                                <Input
                                                    id="sub_name"
                                                    value={subCategoryForm.data.name}
                                                    onChange={(e) => {
                                                        subCategoryForm.setData('name', e.target.value);
                                                        clearInertiaFieldError(subCategoryForm.clearErrors, 'name');
                                                    }}
                                                    placeholder={t('admin_industries_edit.sub_industries.name_placeholder')}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="submit" size="sm" disabled={subCategoryForm.processing}>
                                                    {t('admin_industries_edit.actions.add')}
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
                                                    {t('common.cancel')}
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
                                                            onChange={(e) => {
                                                                editSubCategoryForm.setData('name', e.target.value);
                                                                clearInertiaFieldError(editSubCategoryForm.clearErrors, 'name');
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Button type="submit" size="sm" disabled={editSubCategoryForm.processing}>
                                                            {t('common.save')}
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
                                                            {t('common.cancel')}
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <span>{subCategory.name}</span>
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
                                                {t('admin_industries_edit.sub_industries.empty')}
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
