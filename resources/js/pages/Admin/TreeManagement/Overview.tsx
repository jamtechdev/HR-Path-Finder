import { Head } from '@inertiajs/react';
import { Building2, Users, TrendingUp } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import D3TreeView from '@/components/Tree/D3TreeView';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_group?: string;
    reporting_structure?: {
        executive_director?: string;
        reporting_hierarchy?: string;
    };
}

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
    };
    performance_management: {
        model?: string;
        cycle?: string;
        rating_scale?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
    };
    hr_system_report: {
        status: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    jobDefinitions: JobDefinition[];
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function TreeManagementOverview({
    project,
    stepStatuses,
    projectId,
    jobDefinitions,
    hrSystemSnapshot,
}: Props) {
    const { t } = useTranslation();
    return (
        <SidebarProvider defaultOpen={true}>
            <Head title={t('admin_misc_page_titles.tree_management_overview')} />
            <div className="flex h-screen w-full">
                <RoleBasedSidebar />
                <SidebarInset className="flex-1 overflow-auto bg-background">
                    <AppHeader />
                    <div className="px-6 bg-background">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold">{t('admin_tree.heading')}</h1>
                            <p className="text-sm text-muted-foreground">
                                {t('admin_tree.subheading', {
                                    company: project.company.name,
                                })}
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="border-blue-200 bg-blue-50 mb-6">
                            <CardContent className="pt-6">
                                <p className="text-sm text-blue-800">
                                    <strong>{t('admin_tree.notice_strong')}</strong>{' '}
                                    {t('admin_tree.notice_body')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* HR System Tree View */}
                        <div className="mb-6">
                            <D3TreeView hrSystemSnapshot={hrSystemSnapshot} />
                        </div>

                        {/* Job Definitions Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    {t('admin_tree.job_definitions')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin_tree.job_definitions_desc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {jobDefinitions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin_tree.no_jobs')}
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {jobDefinitions.map((job) => (
                                            <div key={job.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{job.job_name}</h3>
                                                        {job.job_group && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {job.job_group}
                                                            </Badge>
                                                        )}
                                                        {job.job_description && (
                                                            <p className="text-sm text-muted-foreground mt-2">
                                                                {job.job_description}
                                                            </p>
                                                        )}
                                                        {job.reporting_structure && (
                                                            <div className="mt-3 space-y-1">
                                                                {job.reporting_structure.executive_director && (
                                                                    <p className="text-sm">
                                                                        <strong>
                                                                            {t(
                                                                                'admin_tree.executive_director',
                                                                            )}
                                                                        </strong>{' '}
                                                                        {job.reporting_structure.executive_director}
                                                                    </p>
                                                                )}
                                                                {job.reporting_structure.reporting_hierarchy && (
                                                                    <p className="text-sm">
                                                                        <strong>
                                                                            {t('admin_tree.hierarchy')}
                                                                        </strong>{' '}
                                                                        {job.reporting_structure.reporting_hierarchy}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_tree.project_status')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(stepStatuses).map(([step, status]) => (
                                        <div key={step} className="flex items-center justify-between">
                                            <span className="text-sm capitalize">{step.replace('_', ' ')}</span>
                                            <Badge variant={status === 'locked' ? 'default' : 'secondary'}>
                                                {status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
