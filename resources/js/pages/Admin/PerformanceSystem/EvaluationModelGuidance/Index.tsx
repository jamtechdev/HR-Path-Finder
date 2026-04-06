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

interface EvaluationModelGuidance {
    id: number;
    model_type: 'mbo' | 'bsc' | 'okr';
    concept: string;
    key_characteristics: string;
    example: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
    recommended_job_keyword_ids?: number[];
    version?: string;
    is_active: boolean;
}

interface Props {
    guidances: EvaluationModelGuidance[];
    modelTypes: Record<string, string>;
}

export default function EvaluationModelGuidanceIndex({ guidances, modelTypes }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuidances = guidances.filter(g =>
        g.model_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.concept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (guidanceId: number) => {
        if (confirm(t('admin_eval_model_guidance.confirm_delete'))) {
            router.delete(`/admin/evaluation-model-guidance/${guidanceId}`, {
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
                    <Head title={t('admin_eval_model_guidance.page_title')} />
                    
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{t('admin_eval_model_guidance.heading')}</h1>
                            <p className="text-muted-foreground mt-1">
                                {t('admin_eval_model_guidance.subheading')}
                            </p>
                        </div>
                        <Link href="/admin/evaluation-model-guidance/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('admin_eval_model_guidance.actions.add')}
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder={t('admin_eval_model_guidance.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredGuidances.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        {t('admin_eval_model_guidance.empty')}
                                    </div>
                                ) : (
                                    filteredGuidances.map((guidance) => (
                                        <Card key={guidance.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={guidance.is_active ? 'default' : 'secondary'}>
                                                            {modelTypes[guidance.model_type]}
                                                        </Badge>
                                                        {guidance.version && (
                                                            <span className="text-sm text-muted-foreground">
                                                                v{guidance.version}
                                                            </span>
                                                        )}
                                                        {!guidance.is_active && (
                                                            <Badge variant="outline">{t('admin_eval_model_guidance.badges.inactive')}</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/evaluation-model-guidance/${guidance.id}/edit`}>
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
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold">{t('admin_eval_model_guidance.fields.concept')}:</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {guidance.concept}
                                                    </p>
                                                    <p className="text-sm font-semibold mt-3">{t('admin_eval_model_guidance.fields.key_characteristics')}:</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {guidance.key_characteristics}
                                                    </p>
                                                </div>
                                            </CardContent>
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
