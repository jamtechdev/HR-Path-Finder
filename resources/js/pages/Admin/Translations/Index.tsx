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
import { Edit, Trash2, Search, Languages, FileText } from 'lucide-react';

interface Props {
    translations: Record<string, string>;
    locales: Record<string, string>;
    pages: Record<string, string>;
    currentLocale: string;
    currentPage: string;
    search: string;
}

export default function TranslationsIndex({ 
    translations,
    locales, 
    pages, 
    currentLocale, 
    currentPage,
    search: initialSearch 
}: Props) {
    const [search, setSearch] = useState(initialSearch);

    const handleFilterChange = (newLocale: string, newPage: string) => {
        router.get('/admin/translations', {
            locale: newLocale,
            page: newPage,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get('/admin/translations', {
            locale: currentLocale,
            page: currentPage,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (key: string) => {
        if (confirm('Are you sure you want to delete this translation?')) {
            router.delete('/admin/translations', {
                data: {
                    locale: currentLocale,
                    key: key,
                },
                preserveScroll: true,
            });
        }
    };

    const handleEdit = (key: string, value: string) => {
        router.visit(`/admin/translations/edit?locale=${currentLocale}&page=${currentPage}&key=${encodeURIComponent(key)}`);
    };

    // Filter translations by search
    const filteredTranslations = Object.entries(translations).filter(([key, value]) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return key.toLowerCase().includes(searchLower) || value.toLowerCase().includes(searchLower);
    });

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
                                    Manage UI translations stored in JSON files (Korean and English)
                                </p>
                            </div>
                            <Link href={`/admin/translations/edit?locale=${currentLocale}&page=${currentPage}`}>
                                <Button>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Edit Page Translations
                                </Button>
                            </Link>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Language</label>
                                        <Select value={currentLocale} onValueChange={(v) => {
                                            handleFilterChange(v, currentPage);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(locales).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <Languages className="w-4 h-4" />
                                                            {label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Page/Section</label>
                                        <Select value={currentPage} onValueChange={(v) => {
                                            handleFilterChange(currentLocale, v);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(pages).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
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
                                        Translations ({filteredTranslations.length})
                                    </CardTitle>
                                    <Badge variant="outline">
                                        {locales[currentLocale]} - {pages[currentPage]}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {filteredTranslations.map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {key}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm break-words">{value}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(key, value)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(key)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTranslations.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {search ? 'No translations found matching your search.' : 'No translations found for this page.'}
                                        </div>
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
