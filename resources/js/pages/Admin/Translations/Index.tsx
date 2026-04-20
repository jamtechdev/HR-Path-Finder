import { Head, router } from '@inertiajs/react';
import { Save, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    translations: Array<{
        key: string;
        en: string;
        ko: string;
    }>;
    pages: Record<string, string>;
    currentPage: string;
    search: string;
    currentRole: string;
    roles: Record<string, string>;
    searchMode: 'contains' | 'exact';
    currentStatus: string;
    statuses: Record<string, string>;
    stats: {
        total: number;
        complete: number;
        missing_any: number;
        missing_en: number;
        missing_ko: number;
        same_text: number;
    };
}

export default function TranslationsIndex({ 
    translations,
    pages, 
    currentPage,
    search: initialSearch,
    currentRole,
    roles,
    searchMode: initialSearchMode,
    currentStatus,
    statuses,
    stats,
}: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(initialSearch);
    const [entries, setEntries] = useState(translations);
    const [dirtyKeys, setDirtyKeys] = useState<Record<string, boolean>>({});
    const [role, setRole] = useState(currentRole);
    const [searchMode, setSearchMode] = useState<'contains' | 'exact'>(initialSearchMode);
    const [status, setStatus] = useState(currentStatus);

    useEffect(() => {
        setEntries(translations);
        setDirtyKeys({});
        setRole(currentRole);
        setSearch(initialSearch);
        setSearchMode(initialSearchMode);
        setStatus(currentStatus);
    }, [translations, currentRole, initialSearch, initialSearchMode, currentStatus]);

    const handleFilterChange = (
        newPage: string,
        newRole: string,
        newSearchMode: 'contains' | 'exact',
        newStatus: string,
    ) => {
        router.get('/admin/translations', {
            page: newPage,
            role: newRole,
            searchMode: newSearchMode,
            status: newStatus,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get('/admin/translations', {
            page: currentPage,
            role,
            searchMode,
            status,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateEntry = (key: string, field: 'en' | 'ko', value: string) => {
        setEntries((prev) =>
            prev.map((entry) => (entry.key === key ? { ...entry, [field]: value } : entry)),
        );
        setDirtyKeys((prev) => ({ ...prev, [key]: true }));
    };

    const handleSave = () => {
        const payload = entries
            .filter((entry) => dirtyKeys[entry.key])
            .map((entry) => ({
                key: entry.key,
                en: entry.en,
                ko: entry.ko,
            }));

        if (payload.length === 0) {
            return;
        }

        router.put(
            '/admin/translations',
            { entries: payload },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDirtyKeys({});
                },
            },
        );
    };

    const handleStatusShortcut = (nextStatus: string) => {
        setStatus(nextStatus);
        handleFilterChange(currentPage, role, searchMode, nextStatus);
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_misc_page_titles.translations_index')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between flex-wrap flex-wrap">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">
                                    Translation Center
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage English and Korean translations in one place.
                                </p>
                            </div>
                            <Button onClick={handleSave} disabled={Object.keys(dirtyKeys).length === 0}>
                                <Save className="w-4 h-4 mr-2" />
                                Save all changes
                            </Button>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Section
                                        </label>
                                        <Select value={currentPage} onValueChange={(v) => {
                                            handleFilterChange(v, role, searchMode, status);
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
                                        <label className="text-sm font-medium mb-2 block">Role</label>
                                        <Select
                                            value={role}
                                            onValueChange={(v) => {
                                                setRole(v);
                                                handleFilterChange(currentPage, v, searchMode, status);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(roles).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Search mode</label>
                                        <Select
                                            value={searchMode}
                                            onValueChange={(v: 'contains' | 'exact') => {
                                                setSearchMode(v);
                                                handleFilterChange(currentPage, role, v, status);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="contains">Contains</SelectItem>
                                                <SelectItem value="exact">Exact</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Status</label>
                                        <Select
                                            value={status}
                                            onValueChange={(v) => {
                                                setStatus(v);
                                                handleFilterChange(currentPage, role, searchMode, v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statuses).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Search key or value
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search..."
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

                        <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-3">
                            <Button
                                variant={status === 'all' ? 'default' : 'outline'}
                                className="justify-between"
                                onClick={() => handleStatusShortcut('all')}
                            >
                                All
                                <Badge variant="secondary">{stats.total}</Badge>
                            </Button>
                            <Button
                                variant={status === 'missing_any' ? 'default' : 'outline'}
                                className="justify-between"
                                onClick={() => handleStatusShortcut('missing_any')}
                            >
                                Missing Any
                                <Badge variant="secondary">{stats.missing_any}</Badge>
                            </Button>
                            <Button
                                variant={status === 'missing_en' ? 'default' : 'outline'}
                                className="justify-between"
                                onClick={() => handleStatusShortcut('missing_en')}
                            >
                                Missing EN
                                <Badge variant="secondary">{stats.missing_en}</Badge>
                            </Button>
                            <Button
                                variant={status === 'missing_ko' ? 'default' : 'outline'}
                                className="justify-between"
                                onClick={() => handleStatusShortcut('missing_ko')}
                            >
                                Missing KO
                                <Badge variant="secondary">{stats.missing_ko}</Badge>
                            </Button>
                            <Button
                                variant={status === 'same_text' ? 'default' : 'outline'}
                                className="justify-between"
                                onClick={() => handleStatusShortcut('same_text')}
                            >
                                Same Text
                                <Badge variant="secondary">{stats.same_text}</Badge>
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-between"
                                onClick={() => handleStatusShortcut('all')}
                            >
                                Complete
                                <Badge variant="secondary">{stats.complete}</Badge>
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap">
                                    <CardTitle>
                                        {entries.length} translations
                                    </CardTitle>
                                    <Badge variant="outline">
                                        {pages[currentPage]} | {roles[role]}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {entries.map((entry) => (
                                        <div
                                            key={entry.key}
                                            className="p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-xs break-all whitespace-normal"
                                                    >
                                                        {entry.key}
                                                    </Badge>
                                                    {dirtyKeys[entry.key] && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Edited
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-medium mb-1">English</p>
                                                        <Textarea
                                                            value={entry.en}
                                                            onChange={(e) =>
                                                                updateEntry(entry.key, 'en', e.target.value)
                                                            }
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium mb-1">Korean</p>
                                                        <Textarea
                                                            value={entry.ko}
                                                            onChange={(e) =>
                                                                updateEntry(entry.key, 'ko', e.target.value)
                                                            }
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {entries.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No translations found for this filter.
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
