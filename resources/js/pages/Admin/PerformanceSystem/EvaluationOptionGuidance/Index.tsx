import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

interface EvaluationOptionGuidance {
    id: number;
    option_key: string;
    option_value: string;
    concept?: string;
    key_characteristics?: string;
    example?: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
    is_active: boolean;
}

interface Props {
    guidances: EvaluationOptionGuidance[];
    optionKeys: string[];
}

export default function EvaluationOptionGuidanceIndex({ guidances, optionKeys }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKey, setFilterKey] = useState<string>('');

    const filteredGuidances = guidances.filter(g => {
        const matchesSearch = g.option_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             g.option_value.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !filterKey || g.option_key === filterKey;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = (guidanceId: number) => {
        if (confirm(t('admin_eval_option_guidance.confirm_delete'))) {
            router.delete(`/admin/evaluation-option-guidance/${guidanceId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Head title={t('admin_eval_option_guidance.page_title')} />
                    
                    <div className="mb-6 flex items-center justify-between flex-wrap flex-wrap">
                        <div>
                            <h1 className="text-3xl font-bold">{t('admin_eval_option_guidance.heading')}</h1>
                            <p className="text-muted-foreground mt-1">
                                {t('admin_eval_option_guidance.subheading')}
                            </p>
                        </div>
                        <Link href="/admin/evaluation-option-guidance/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('admin_eval_option_guidance.actions.add')}
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder={t('admin_eval_option_guidance.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterKey}
                                    onChange={(e) => setFilterKey(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="">{t('admin_eval_option_guidance.all_option_keys')}</option>
                                    {optionKeys.map(key => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredGuidances.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        {t('admin_eval_option_guidance.empty')}
                                    </div>
                                ) : (
                                    filteredGuidances.map((guidance) => (
                                        <Card key={guidance.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between flex-wrap">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline">{guidance.option_key}</Badge>
                                                        <span className="font-semibold">{guidance.option_value}</span>
                                                        {!guidance.is_active && (
                                                            <Badge variant="secondary">{t('admin_eval_option_guidance.badges.inactive')}</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/evaluation-option-guidance/${guidance.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(guidance.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {guidance.concept && (
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {guidance.concept}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
