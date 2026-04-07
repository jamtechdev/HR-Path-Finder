import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    translations: Record<string, any>;
    locales: Record<string, string>;
    pages: Record<string, string>;
    currentLocale: string;
    currentPage: string;
}

export default function TranslationsEdit({ translations, locales, pages, currentLocale, currentPage }: Props) {
    const { t } = useTranslation();
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
        if (confirm(t('admin_translations_mgmt.edit_confirm_delete_key'))) {
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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_misc_page_titles.translations_edit')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/translations')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('admin_translations_mgmt.edit_back')}
                            </Button>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">
                                        {t('admin_misc_page_titles.translations_edit')}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        {locales[currentLocale]} - {pages[currentPage]}
                                    </p>
                                </div>
                                <Button onClick={handleSave} disabled={Object.keys(editedTranslations).length === 0}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('admin_translations_mgmt.save_changes')}
                                </Button>
                            </div>
                        </div>

                        {/* Add New Translation */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t('admin_translations_mgmt.add_new_card')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>{t('admin_translations_mgmt.label_key')}</Label>
                                        <Input
                                            value={newKey}
                                            onChange={(e) => setNewKey(e.target.value)}
                                            placeholder={t(
                                                'admin_translations_mgmt.key_placeholder_short',
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('admin_translations_mgmt.label_value')}</Label>
                                        <Input
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder={t(
                                                'admin_translations_mgmt.value_placeholder_short',
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddNew} className="w-full">
                                            {t('admin_translations_mgmt.add_translation_btn')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Translations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('admin_translations_mgmt.translations_list_count', {
                                        count: Object.keys(allTranslations).length,
                                    })}
                                </CardTitle>
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
                                                {t('admin_translations_mgmt.delete')}
                                            </Button>
                                        </div>
                                    ))}
                                    {Object.keys(allTranslations).length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {t('admin_translations_mgmt.edit_empty_hint')}
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

