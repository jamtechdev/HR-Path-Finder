import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Save } from 'lucide-react';

interface Props {
    translations: Record<string, any>;
    locales: Record<string, string>;
    pages: Record<string, string>;
    currentLocale: string;
    currentPage: string;
}

export default function TranslationsEdit({ translations, locales, pages, currentLocale, currentPage }: Props) {
    const [editedTranslations, setEditedTranslations] = useState<Record<string, string>>({});
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    // Flatten nested translations for editing
    const flattenTranslations = (obj: any, prefix = ''): Record<string, string> => {
        const result: Record<string, string> = {};
        for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(result, flattenTranslations(obj[key], fullKey));
            } else {
                result[fullKey] = String(obj[key]);
            }
        }
        return result;
    };

    const flatTranslations = flattenTranslations(translations);
    const [allTranslations, setAllTranslations] = useState<Record<string, string>>(flatTranslations);

    useEffect(() => {
        setAllTranslations(flattenTranslations(translations));
        setEditedTranslations({});
    }, [translations]);

    const handleValueChange = (key: string, value: string) => {
        setEditedTranslations(prev => ({ ...prev, [key]: value }));
        setAllTranslations(prev => ({ ...prev, [key]: value }));
    };

    const handleAddNew = () => {
        if (newKey && newValue) {
            const fullKey = currentPage === 'all' ? newKey : `${currentPage}.${newKey}`;
            setAllTranslations(prev => ({ ...prev, [fullKey]: newValue }));
            setEditedTranslations(prev => ({ ...prev, [fullKey]: newValue }));
            setNewKey('');
            setNewValue('');
        }
    };

    const handleSave = () => {
        // Reconstruct nested structure from flat keys
        const nested: Record<string, any> = {};
        
        Object.entries(allTranslations).forEach(([key, value]) => {
            const keys = key.split('.');
            let current = nested;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
        });

        router.put('/admin/translations', {
            locale: currentLocale,
            page: currentPage,
            translations: nested,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditedTranslations({});
            },
        });
    };

    const handleDelete = (key: string) => {
        if (confirm('Are you sure you want to delete this translation key?')) {
            router.delete('/admin/translations', {
                data: {
                    locale: currentLocale,
                    key: key,
                },
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
                    <Head title="Edit Translations" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/translations')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Translations
                            </Button>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">Edit Translations</h1>
                                    <p className="text-muted-foreground mt-1">
                                        {locales[currentLocale]} - {pages[currentPage]}
                                    </p>
                                </div>
                                <Button onClick={handleSave} disabled={Object.keys(editedTranslations).length === 0}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        {/* Add New Translation */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Add New Translation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Key</Label>
                                        <Input
                                            value={newKey}
                                            onChange={(e) => setNewKey(e.target.value)}
                                            placeholder="e.g., title, subtitle"
                                        />
                                    </div>
                                    <div>
                                        <Label>Value</Label>
                                        <Input
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder="Translation text"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddNew} className="w-full">
                                            Add Translation
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Translations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Translations ({Object.keys(allTranslations).length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(allTranslations).map(([key, value]) => (
                                        <div key={key} className="flex gap-4 items-start p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <Label className="text-xs text-muted-foreground mb-1 block">
                                                    {key}
                                                </Label>
                                                <Textarea
                                                    value={value}
                                                    onChange={(e) => handleValueChange(key, e.target.value)}
                                                    rows={2}
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(key)}
                                                className="text-destructive"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                                    {Object.keys(allTranslations).length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No translations found. Add your first translation above.
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

