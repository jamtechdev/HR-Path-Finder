import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Eye, Languages } from 'lucide-react';

interface Props {
    translations: Record<string, any>;
    locales: Record<string, string>;
    currentLocale: string;
}

export default function LandingPageIndex({ 
    translations,
    locales, 
    currentLocale
}: Props) {
    const [editedTranslations, setEditedTranslations] = useState<Record<string, any>>({});
    const [locale, setLocale] = useState(currentLocale);

    useEffect(() => {
        setEditedTranslations({});
    }, [translations, locale]);

    const handleValueChange = (key: string, value: any) => {
        setEditedTranslations(prev => {
            const newState = { ...prev };
            const keys = key.split('.');
            let current = newState;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const getNestedValue = (obj: any, path: string): any => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return '';
            }
        }
        return current;
    };

    const flattenTranslations = (obj: any, prefix = ''): Array<{ key: string; value: any; isObject: boolean }> => {
        const result: Array<{ key: string; value: any; isObject: boolean }> = [];
        
        for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                result.push({ key: fullKey, value: obj[key], isObject: true });
                result.push(...flattenTranslations(obj[key], fullKey));
            } else {
                result.push({ key: fullKey, value: obj[key], isObject: false });
            }
        }
        
        return result;
    };

    const handleSave = () => {
        // Merge edited translations with original
        const merged = JSON.parse(JSON.stringify(translations));
        
        const mergeObject = (target: any, source: any) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeObject(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        
        mergeObject(merged, editedTranslations);

        router.put('/admin/landing-page', {
            locale: locale,
            translations: merged,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditedTranslations({});
            },
        });
    };

    const flatItems = flattenTranslations(translations).filter(item => !item.isObject);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Landing Page Translations" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Landing Page Translations</h1>
                                <p className="text-muted-foreground">
                                    Edit landing page content stored in JSON files (Korean and English)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview Landing Page
                                    </Button>
                                </a>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={Object.keys(editedTranslations).length === 0}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Language Selection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Label>Language</Label>
                                    <Select 
                                        value={locale} 
                                        onValueChange={(v) => {
                                            setLocale(v);
                                            router.get('/admin/landing-page', { locale: v }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-48">
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
                                    <Badge variant="outline">
                                        {flatItems.length} translations
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Landing Page Sections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Hero Section */}
                                    <div className="border-l-4 border-primary pl-4">
                                        <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                                        <div className="space-y-4">
                                            {['hero.badge', 'hero.title_highlight', 'hero.title', 'hero.description', 'hero.cta_primary', 'hero.cta_secondary'].map((key) => {
                                                const currentValue = getNestedValue(translations, key);
                                                const editedValue = getNestedValue(editedTranslations, key);
                                                const displayValue = editedValue !== undefined ? editedValue : currentValue;
                                                
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-sm font-mono text-muted-foreground">
                                                            {key}
                                                        </Label>
                                                        {key.includes('description') ? (
                                                            <Textarea
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                rows={3}
                                                                className="font-mono text-sm"
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                className="font-mono text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Everything Section */}
                                    <div className="border-l-4 border-green-500 pl-4">
                                        <h3 className="text-lg font-semibold mb-4">Everything Section</h3>
                                        <div className="space-y-4">
                                            {['everything.title', 'everything.description'].map((key) => {
                                                const currentValue = getNestedValue(translations, key);
                                                const editedValue = getNestedValue(editedTranslations, key);
                                                const displayValue = editedValue !== undefined ? editedValue : currentValue;
                                                
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-sm font-mono text-muted-foreground">
                                                            {key}
                                                        </Label>
                                                        {key.includes('description') ? (
                                                            <Textarea
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                rows={3}
                                                                className="font-mono text-sm"
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                className="font-mono text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Why Section */}
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-lg font-semibold mb-4">Why Section</h3>
                                        <div className="space-y-4">
                                            {['why.title', 'why.description'].map((key) => {
                                                const currentValue = getNestedValue(translations, key);
                                                const editedValue = getNestedValue(editedTranslations, key);
                                                const displayValue = editedValue !== undefined ? editedValue : currentValue;
                                                
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-sm font-mono text-muted-foreground">
                                                            {key}
                                                        </Label>
                                                        {key.includes('description') ? (
                                                            <Textarea
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                rows={3}
                                                                className="font-mono text-sm"
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                className="font-mono text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* CTA Section */}
                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-lg font-semibold mb-4">CTA Section</h3>
                                        <div className="space-y-4">
                                            {['cta.title', 'cta.description', 'cta.button'].map((key) => {
                                                const currentValue = getNestedValue(translations, key);
                                                const editedValue = getNestedValue(editedTranslations, key);
                                                const displayValue = editedValue !== undefined ? editedValue : currentValue;
                                                
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-sm font-mono text-muted-foreground">
                                                            {key}
                                                        </Label>
                                                        {key.includes('description') ? (
                                                            <Textarea
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                rows={3}
                                                                className="font-mono text-sm"
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={displayValue || ''}
                                                                onChange={(e) => handleValueChange(key, e.target.value)}
                                                                className="font-mono text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Header & Footer */}
                                    <div className="border-l-4 border-gray-500 pl-4">
                                        <h3 className="text-lg font-semibold mb-4">Header & Footer</h3>
                                        <div className="space-y-4">
                                            {['header.logo', 'header.company', 'header.sign_in', 'header.get_started', 'footer.copyright'].map((key) => {
                                                const currentValue = getNestedValue(translations, key);
                                                const editedValue = getNestedValue(editedTranslations, key);
                                                const displayValue = editedValue !== undefined ? editedValue : currentValue;
                                                
                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-sm font-mono text-muted-foreground">
                                                            {key}
                                                        </Label>
                                                        <Input
                                                            value={displayValue || ''}
                                                            onChange={(e) => handleValueChange(key, e.target.value)}
                                                            className="font-mono text-sm"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(editedTranslations).length > 0 && (
                                    <div className="mt-6 flex justify-end">
                                        <Button onClick={handleSave}>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save {Object.keys(editedTranslations).length} Changes
                                        </Button>
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
