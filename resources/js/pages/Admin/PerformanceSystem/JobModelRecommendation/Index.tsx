import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { useTranslation } from 'react-i18next';

interface JobEvaluationModelRecommendation {
    id: number;
    job_keyword_id: number;
    recommended_model: 'mbo' | 'bsc' | 'okr';
    is_active: boolean;
    job_keyword?: {
        id: number;
        name: string;
    };
}

interface Props {
    recommendations: JobEvaluationModelRecommendation[];
    jobKeywords: Array<{ id: number; name: string }>;
    modelTypes: Record<string, string>;
}

export default function JobModelRecommendationIndex({ recommendations, jobKeywords, modelTypes }: Props) {
    const { t } = useTranslation();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        job_keyword_id: '',
        recommended_model: '',
        is_active: true,
    });

    const handleAdd = () => {
        setShowAddDialog(true);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/job-model-recommendation', {
            onSuccess: () => {
                setShowAddDialog(false);
                reset();
            },
        });
    };

    const handleUpdate = (recommendation: JobEvaluationModelRecommendation) => {
        router.put(`/admin/job-model-recommendation/${recommendation.id}`, {
            recommended_model: recommendation.recommended_model === 'mbo' ? 'bsc' : recommendation.recommended_model === 'bsc' ? 'okr' : 'mbo',
            is_active: !recommendation.is_active,
        });
    };

    const handleDelete = (recommendationId: number) => {
        if (confirm(t('admin_job_model_recommendation.confirm_delete'))) {
            router.delete(`/admin/job-model-recommendation/${recommendationId}`);
        }
    };

    const availableJobKeywords = jobKeywords.filter(
        job => !recommendations.some(rec => rec.job_keyword_id === job.id)
    );

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Head title={t('admin_job_model_recommendation.page_title')} />
                    
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{t('admin_job_model_recommendation.heading')}</h1>
                            <p className="text-muted-foreground mt-1">
                                {t('admin_job_model_recommendation.subheading')}
                            </p>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('admin_job_model_recommendation.actions.add_recommendation')}
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin_job_model_recommendation.list_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendations.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        {t('admin_job_model_recommendation.empty')}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">{t('admin_job_model_recommendation.table.job_keyword')}</th>
                                                    <th className="text-left p-3">{t('admin_job_model_recommendation.table.recommended_model')}</th>
                                                    <th className="text-left p-3">{t('admin_job_model_recommendation.table.status')}</th>
                                                    <th className="text-right p-3">{t('admin_job_model_recommendation.table.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recommendations.map((rec) => (
                                                    <tr key={rec.id} className="border-b hover:bg-muted/50">
                                                        <td className="p-3">{rec.job_keyword?.name || t('admin_job_model_recommendation.na')}</td>
                                                        <td className="p-3">
                                                            <Badge>{modelTypes[rec.recommended_model]}</Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge variant={rec.is_active ? 'default' : 'secondary'}>
                                                                {rec.is_active ? t('admin_job_model_recommendation.status.active') : t('admin_job_model_recommendation.status.inactive')}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdate(rec)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(rec.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>{t('admin_job_model_recommendation.dialog.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('admin_job_model_recommendation.dialog.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="job_keyword_id">{t('admin_job_model_recommendation.dialog.job_keyword')}</Label>
                                    <Select
                                        value={data.job_keyword_id}
                                        onValueChange={(value) => setData('job_keyword_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('admin_job_model_recommendation.dialog.job_keyword_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableJobKeywords.map((job) => (
                                                <SelectItem key={job.id} value={job.id.toString()}>
                                                    {job.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.job_keyword_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.job_keyword_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="recommended_model">{t('admin_job_model_recommendation.dialog.recommended_model')}</Label>
                                    <Select
                                        value={data.recommended_model}
                                        onValueChange={(value) => setData('recommended_model', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('admin_job_model_recommendation.dialog.model_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(modelTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.recommended_model && (
                                        <p className="text-sm text-destructive mt-1">{errors.recommended_model}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {t('common.create')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
