import { Head, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Save } from 'lucide-react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { t as diagnosisT } from '@/config/diagnosisTranslations';

type Overrides = Record<string, string>;

interface Props {
    overrides: {
        en: Overrides;
        ko: Overrides;
    };
    locales: Record<string, string>;
}

function stringifyForSearch(v: unknown): string {
    if (typeof v === 'string') return v;
    return String(v ?? '');
}

export default function HrTranslationsIndex({ overrides, locales }: Props) {
    const { t } = useTranslation();
    // `diagnosisTranslations.ts` contains all default bilingual strings for HR/Diagnosis forms.
    const defaults = diagnosisT as Record<string, { en: string; ko: string }>;
    const keys = useMemo(() => Object.keys(defaults).sort(), [defaults]);

    const [search, setSearch] = useState('');
    const [enOverrides, setEnOverrides] = useState<Overrides>(overrides.en ?? {});
    const [koOverrides, setKoOverrides] = useState<Overrides>(overrides.ko ?? {});
    const [dirty, setDirty] = useState(false);

    const filteredKeys = useMemo(() => {
        if (!search.trim()) return keys;
        const s = search.toLowerCase();
        return keys.filter((k) => {
            const pair = defaults[k];
            return (
                k.toLowerCase().includes(s) ||
                stringifyForSearch(pair?.en).toLowerCase().includes(s) ||
                stringifyForSearch(pair?.ko).toLowerCase().includes(s) ||
                stringifyForSearch(enOverrides[k] ?? '').toLowerCase().includes(s) ||
                stringifyForSearch(koOverrides[k] ?? '').toLowerCase().includes(s)
            );
        });
    }, [search, keys, defaults, enOverrides, koOverrides]);

    const handleSave = () => {
        setDirty(false);

        router.put(
            '/admin/hr-translations',
            {
                overrides: {
                    en: enOverrides,
                    ko: koOverrides,
                },
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_hr_translations.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{t('admin_hr_translations.heading')}</h1>
                                <p className="text-muted-foreground">
                                    {t('admin_hr_translations.subheading')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline">
                                    {t('admin_hr_translations.keys_count', { count: keys.length })}
                                </Badge>
                                <Button onClick={handleSave} disabled={!dirty} className="bg-primary">
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('admin_hr_translations.save')}
                                </Button>
                            </div>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    {t('admin_hr_translations.search_title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('admin_hr_translations.label_contains')}</Label>
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('admin_hr_translations.search_placeholder')}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="outline" onClick={() => { setSearch(''); }} className="w-full">
                                            {t('admin_hr_translations.clear')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="rounded-lg border overflow-hidden">
                            <div className="grid grid-cols-[260px_1fr_1fr] gap-0 bg-muted/30 border-b">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">{t('admin_hr_translations.col_key')}</div>
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">{t('admin_hr_translations.col_en')}</div>
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">{t('admin_hr_translations.col_ko')}</div>
                            </div>
                            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {filteredKeys.map((key) => {
                                    const pair = defaults[key];
                                    const defaultEn = pair?.en ?? '';
                                    const defaultKo = pair?.ko ?? '';
                                    const currentEn = enOverrides[key] ?? defaultEn;
                                    const currentKo = koOverrides[key] ?? defaultKo;

                                    return (
                                        <div
                                            key={key}
                                            className="grid grid-cols-[260px_1fr_1fr] gap-0 border-b last:border-b-0"
                                        >
                                            <div className="px-3 py-3 border-r">
                                                <div className="font-mono text-xs text-muted-foreground break-all">
                                                    {key}
                                                </div>
                                            </div>
                                            <div className="px-3 py-3 border-r">
                                                <Textarea
                                                    value={currentEn}
                                                    rows={2}
                                                    className="font-mono text-sm"
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setEnOverrides((prev) => {
                                                            const next = { ...prev };
                                                            if (v === defaultEn) delete next[key];
                                                            else next[key] = v;
                                                            return next;
                                                        });
                                                        setDirty(true);
                                                    }}
                                                />
                                            </div>
                                            <div className="px-3 py-3">
                                                <Textarea
                                                    value={currentKo}
                                                    rows={2}
                                                    className="font-mono text-sm"
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setKoOverrides((prev) => {
                                                            const next = { ...prev };
                                                            if (v === defaultKo) delete next[key];
                                                            else next[key] = v;
                                                            return next;
                                                        });
                                                        setDirty(true);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

