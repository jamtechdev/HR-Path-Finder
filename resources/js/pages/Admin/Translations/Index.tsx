import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Download, Upload } from 'lucide-react';

interface Translation {
    id: number;
    locale: string;
    namespace: string;
    key: string;
    value: string;
    is_active: boolean;
}

interface Props {
    translations: {
        data: Translation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    locales: Record<string, string>;
    namespaces: Record<string, string>;
    currentLocale: string;
    currentNamespace: string;
    search: string;
}

export default function TranslationsIndex({ 
    translations, 
    locales, 
    namespaces, 
    currentLocale, 
    currentNamespace,
    search: initialSearch 
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [locale, setLocale] = useState(currentLocale);
    const [namespace, setNamespace] = useState(currentNamespace);

    const handleFilterChange = (newLocale: string, newNamespace: string) => {
        router.get('/admin/translations', {
            locale: newLocale,
            namespace: newNamespace,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get('/admin/translations', {
            locale: locale,
            namespace: namespace,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (translationId: number) => {
        if (confirm('Are you sure you want to delete this translation?')) {
            router.delete(`/admin/translations/${translationId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleBulkImport = () => {
        // This will open a modal or page for bulk import
        router.visit('/admin/translations/bulk-import');
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Translations Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Translations Management</h1>
                                <p className="text-muted-foreground">
                                    Manage UI translations for Korean and English
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleBulkImport}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Bulk Import
                                </Button>
                                <Link href="/admin/translations/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Translation
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Language</label>
                                        <Select value={locale} onValueChange={(v) => {
                                            setLocale(v);
                                            handleFilterChange(v, namespace);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(locales).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Namespace</label>
                                        <Select value={namespace} onValueChange={(v) => {
                                            setNamespace(v);
                                            handleFilterChange(locale, v);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(namespaces).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">Search</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search by key or value..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSearch();
                                                    }
                                                }}
                                            />
                                            <Button onClick={handleSearch}>
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Translations ({translations.total})
                                    </CardTitle>
                                    <Badge variant="outline">
                                        {locales[currentLocale]} - {namespaces[currentNamespace]}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {translations.data.map((translation) => (
                                        <div
                                            key={translation.id}
                                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {translation.key}
                                                    </Badge>
                                                    {!translation.is_active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm">{translation.value}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Link href={`/admin/translations/${translation.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(translation.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {translations.data.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {search ? 'No translations found matching your search.' : 'No translations found. Create your first translation!'}
                                        </div>
                                    )}
                                </div>

                                {translations.last_page > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {((translations.current_page - 1) * translations.per_page) + 1} to {Math.min(translations.current_page * translations.per_page, translations.total)} of {translations.total} translations
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={translations.current_page === 1}
                                                onClick={() => router.get('/admin/translations', {
                                                    locale,
                                                    namespace,
                                                    search,
                                                    page: translations.current_page - 1,
                                                })}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={translations.current_page === translations.last_page}
                                                onClick={() => router.get('/admin/translations', {
                                                    locale,
                                                    namespace,
                                                    search,
                                                    page: translations.current_page + 1,
                                                })}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
