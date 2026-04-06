import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { CheckCircle2, Users, FolderTree } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import { useTranslation } from 'react-i18next';

interface JobKeyword {
    id: number;
    name: string;
}

interface JobDefinition {
    id: number;
    job_keyword_id?: number;
    job_name: string;
    grouped_job_keyword_ids?: number[];
    job_keyword?: JobKeyword;
    is_finalized?: boolean;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    suggestedJobs: JobKeyword[];
    selectedJobs: JobDefinition[];
    industry?: string;
    sizeRange?: string;
}

export default function CeoReviewJobListSelection({ 
    project, 
    suggestedJobs, 
    selectedJobs,
    industry,
    sizeRange 
}: Props) {
    const { t } = useTranslation();
    // Separate selected jobs into ungrouped and grouped
    const ungroupedJobs = selectedJobs.filter(job => !job.grouped_job_keyword_ids || job.grouped_job_keyword_ids.length === 0);
    const groupedJobs = selectedJobs.filter(job => job.grouped_job_keyword_ids && job.grouped_job_keyword_ids.length > 0);

    // Get selected job keyword IDs
    const selectedJobKeywordIds = selectedJobs
        .flatMap(job => {
            if (job.grouped_job_keyword_ids && job.grouped_job_keyword_ids.length > 0) {
                return job.grouped_job_keyword_ids;
            }
            return job.job_keyword_id ? [job.job_keyword_id] : [];
        })
        .filter(Boolean);

    return (
        <AppLayout>
            <Head title={t('ceo_review_job_list.page_title', { company: project?.company?.name || t('ceo_review_job_list.fallback') })} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto dark:bg-slate-900 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 dark:text-slate-100">{t('ceo_review_job_list.heading')}</h1>
                    <p className="text-muted-foreground dark:text-slate-400">
                        {t('ceo_review_job_list.subheading')}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground dark:text-slate-400">{t('ceo_review_job_list.summary.total_selected')}</p>
                                    <p className="text-2xl font-bold dark:text-slate-100">{selectedJobs.length}</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground dark:text-slate-400">{t('ceo_review_job_list.summary.ungrouped')}</p>
                                    <p className="text-2xl font-bold dark:text-slate-100">{ungroupedJobs.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground dark:text-slate-400">{t('ceo_review_job_list.summary.grouped')}</p>
                                    <p className="text-2xl font-bold dark:text-slate-100">{groupedJobs.length}</p>
                                </div>
                                <FolderTree className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Suggested Jobs */}
                <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="dark:bg-slate-800">
                        <CardTitle className="dark:text-slate-100">{t('ceo_review_job_list.suggested.title')}</CardTitle>
                        <CardDescription className="dark:text-slate-400">
                            {t('ceo_review_job_list.suggested.description', { industry: industry || 'N/A', size: sizeRange || 'N/A' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="dark:bg-slate-800">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {suggestedJobs.map((job) => {
                                const isSelected = selectedJobKeywordIds.includes(job.id);
                                return (
                                    <div
                                        key={job.id}
                                        className={`p-3 border rounded-lg dark:border-slate-600 ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                                : 'border-muted bg-muted/30 dark:bg-slate-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            )}
                                            <span className={`font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'} dark:${isSelected ? '' : 'text-slate-400'}`}>
                                                {job.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Jobs - Ungrouped */}
                {ungroupedJobs.length > 0 && (
                    <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="dark:bg-slate-800">
                            <CardTitle className="dark:text-slate-100">{t('ceo_review_job_list.ungrouped.title')}</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                {t('ceo_review_job_list.ungrouped.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="dark:bg-slate-800">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {ungroupedJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="p-3 border border-primary rounded-lg bg-primary/10 dark:bg-primary/20 dark:border-primary"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="font-medium text-primary dark:text-primary-foreground">
                                                {job.job_name}
                                            </span>
                                        </div>
                                        {job.is_finalized && (
                                            <Badge variant="secondary" className="mt-2 dark:bg-slate-700 dark:text-slate-200">
                                                {t('ceo_review_job_list.finalized')}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Selected Jobs - Grouped */}
                {groupedJobs.length > 0 && (
                    <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="dark:bg-slate-800">
                            <CardTitle className="dark:text-slate-100">{t('ceo_review_job_list.grouped.title')}</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                {t('ceo_review_job_list.grouped.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="dark:bg-slate-800">
                            <div className="space-y-4">
                                {groupedJobs.map((job) => {
                                    const groupedJobNames = job.grouped_job_keyword_ids
                                        ?.map(id => suggestedJobs.find(j => j.id === id)?.name)
                                        .filter(Boolean) || [];
                                    
                                    return (
                                        <div
                                            key={job.id}
                                            className="p-4 border border-green-500 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-green-900 dark:text-green-100">
                                                    {job.job_name}
                                                </h4>
                                                {job.is_finalized && (
                                                    <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">{t('ceo_review_job_list.finalized')}</Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {groupedJobNames.map((name, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                                                        {name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(`/ceo/job-analysis/${project.id}/intro`)}
                        className="dark:border-slate-600 dark:text-slate-300"
                    >
                        {t('ceo_review_job_list.back')}
                    </Button>
                    <Button
                        onClick={() => router.visit(`/ceo/review/job-analysis/${project.id}/job-definitions`)}
                    >
                        {t('ceo_review_job_list.view_job_definitions')}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
