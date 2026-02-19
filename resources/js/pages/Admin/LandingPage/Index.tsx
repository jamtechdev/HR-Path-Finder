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
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';

interface LandingPageSection {
    id: number;
    section_key: string;
    section_type: string;
    content: string;
    locale: string;
    order: number;
    is_active: boolean;
    metadata?: any;
}

interface Props {
    sections: {
        data: LandingPageSection[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    locales: Record<string, string>;
    currentLocale: string;
    search: string;
    predefinedSections: Record<string, string>;
}

export default function LandingPageIndex({ 
    sections, 
    locales, 
    currentLocale, 
    search: initialSearch,
    predefinedSections
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [locale, setLocale] = useState(currentLocale);

    const handleFilterChange = (newLocale: string) => {
        router.get('/admin/landing-page', {
            locale: newLocale,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get('/admin/landing-page', {
            locale: locale,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (sectionId: number) => {
        if (confirm('Are you sure you want to delete this section?')) {
            router.delete(`/admin/landing-page/${sectionId}`, {
                preserveScroll: true,
            });
        }
    };

    const getSectionTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            text: 'bg-blue-100 text-blue-800',
            textarea: 'bg-green-100 text-green-800',
            html: 'bg-purple-100 text-purple-800',
            json: 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Landing Page Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Landing Page Management</h1>
                                <p className="text-muted-foreground">
                                    Manage all sections of the landing page (Hero, Features, Process, Benefits, CTA)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/" target="_blank">
                                    <Button variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview Landing Page
                                    </Button>
                                </Link>
                                <Link href="/admin/landing-page/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Section
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Language</label>
                                        <Select value={locale} onValueChange={(v) => {
                                            setLocale(v);
                                            handleFilterChange(v);
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
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">Search</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search by section key or content..."
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
                                        Landing Page Sections ({sections.total})
                                    </CardTitle>
                                    <Badge variant="outline">
                                        {locales[currentLocale]}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sections.data.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {section.section_key}
                                                    </Badge>
                                                    <Badge className={getSectionTypeBadge(section.section_type)}>
                                                        {section.section_type}
                                                    </Badge>
                                                    {!section.is_active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                    {predefinedSections[section.section_key] && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {predefinedSections[section.section_key]}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {section.content.length > 150 
                                                        ? section.content.substring(0, 150) + '...' 
                                                        : section.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                    <span>Order: {section.order}</span>
                                                    <span>Locale: {section.locale}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Link href={`/admin/landing-page/${section.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(section.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {sections.data.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {search ? 'No sections found matching your search.' : 'No sections found. Create your first landing page section!'}
                                        </div>
                                    )}
                                </div>

                                {sections.last_page > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {((sections.current_page - 1) * sections.per_page) + 1} to {Math.min(sections.current_page * sections.per_page, sections.total)} of {sections.total} sections
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={sections.current_page === 1}
                                                onClick={() => router.get('/admin/landing-page', {
                                                    locale,
                                                    search,
                                                    page: sections.current_page - 1,
                                                })}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={sections.current_page === sections.last_page}
                                                onClick={() => router.get('/admin/landing-page', {
                                                    locale,
                                                    search,
                                                    page: sections.current_page + 1,
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
