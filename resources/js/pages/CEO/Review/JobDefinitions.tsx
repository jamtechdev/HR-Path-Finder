import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    job_description?: string;
    job_specification?: Record<string, any>;
    competency_levels?: Record<string, any>;
    csfs?: Record<string, any>;
    is_finalized?: boolean;
    job_keyword?: JobKeyword;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
    industry?: string;
    sizeRange?: string;
}

export default function CeoReviewJobDefinitions({ 
    project, 
    jobDefinitions,
    industry,
    sizeRange 
}: Props) {
    const { t } = useTranslation();
    const [selectedJobId, setSelectedJobId] = React.useState<number | null>(
        jobDefinitions.length > 0 ? jobDefinitions[0].id : null
    );

    const selectedJob = jobDefinitions.find(job => job.id === selectedJobId) || jobDefinitions[0];

    return (
        <AppLayout>
            <Head title={t('ceo_review_job_definitions.page_title', { company: project?.company?.name || t('ceo_review_job_definitions.fallback_job_analysis') })} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto dark:bg-slate-900 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 dark:text-slate-100">{t('ceo_review_job_definitions.heading')}</h1>
                    <p className="text-muted-foreground dark:text-slate-400">
                        {t('ceo_review_job_definitions.subheading')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Job List Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader className="dark:bg-slate-800">
                                <CardTitle className="dark:text-slate-100">{t('ceo_review_job_definitions.job_list.title')}</CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    {t('ceo_review_job_definitions.job_list.count_defined', { count: jobDefinitions.length })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 dark:bg-slate-800">
                                <div className="max-h-[600px] overflow-y-auto">
                                    {jobDefinitions.map((job) => (
                                        <button
                                            key={job.id}
                                            onClick={() => setSelectedJobId(job.id)}
                                            className={`w-full text-left p-4 border-b last:border-b-0 transition-colors dark:border-slate-700 ${
                                                selectedJobId === job.id
                                                    ? 'bg-primary/10 border-primary dark:bg-primary/20'
                                                    : 'hover:bg-muted/50 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                                <div className="flex-1">
                                                    <p className="font-medium dark:text-slate-200">{job.job_name}</p>
                                                    {job.is_finalized && (
                                                        <Badge variant="secondary" className="mt-1 text-xs dark:bg-slate-700 dark:text-slate-200">
                                                            {t('ceo_review_job_definitions.labels.finalized')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {selectedJobId === job.id && (
                                                    <CheckCircle2 className="w-4 h-4 text-primary ml-2" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Job Details */}
                    <div className="lg:col-span-2">
                        {selectedJob ? (
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardHeader className="dark:bg-slate-800">
                                    <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                        <div>
                                            <CardTitle className="dark:text-slate-100">{selectedJob.job_name}</CardTitle>
                                            {selectedJob.job_keyword && (
                                                <CardDescription className="dark:text-slate-400">
                                                    {t('ceo_review_job_definitions.labels.based_on')}: {selectedJob.job_keyword.name}
                                                </CardDescription>
                                            )}
                                        </div>
                                        {selectedJob.is_finalized && (
                                            <Badge>{t('ceo_review_job_definitions.labels.finalized')}</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="dark:bg-slate-800">
                                    <Tabs defaultValue="description" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="description">{t('ceo_review_job_definitions.tabs.description')}</TabsTrigger>
                                            <TabsTrigger value="specification">{t('ceo_review_job_definitions.tabs.specification')}</TabsTrigger>
                                            <TabsTrigger value="competency">{t('ceo_review_job_definitions.tabs.competency')}</TabsTrigger>
                                            <TabsTrigger value="csfs">CSFs</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="description" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">{t('ceo_review_job_definitions.sections.job_description')}</h3>
                                                <div className="p-4 bg-muted rounded-lg">
                                                    {selectedJob.job_description ? (
                                                        <p className="whitespace-pre-wrap text-sm">
                                                            {selectedJob.job_description}
                                                        </p>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm italic">
                                                            {t('ceo_review_job_definitions.empty.no_description')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="specification" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">{t('ceo_review_job_definitions.sections.job_specification')}</h3>
                                                {selectedJob.job_specification && Object.keys(selectedJob.job_specification).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.job_specification).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            {t('ceo_review_job_definitions.empty.no_specification')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="competency" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">{t('ceo_review_job_definitions.sections.competency_levels')}</h3>
                                                {selectedJob.competency_levels && Object.keys(selectedJob.competency_levels).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.competency_levels).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            {t('ceo_review_job_definitions.empty.no_competency')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="csfs" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">{t('ceo_review_job_definitions.sections.csfs')}</h3>
                                                {selectedJob.csfs && Object.keys(selectedJob.csfs).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.csfs).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            {t('ceo_review_job_definitions.empty.no_csfs')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">{t('ceo_review_job_definitions.empty.no_jobs')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(`/ceo/review/job-analysis/${project.id}/job-list`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('ceo_review_job_definitions.back_to_job_list')}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
