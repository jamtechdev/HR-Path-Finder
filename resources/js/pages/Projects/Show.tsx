import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

interface Project {
    id: number;
    status: string;
    step_statuses?: Record<string, string>;
    company: {
        id: number;
        name: string;
    };
    diagnosis?: {
        id: string;
        status: string;
    };
    organizationDesign?: {
        id: string;
        status: string;
    };
    performanceSystem?: {
        id: string;
        status: string;
    };
    compensationSystem?: {
        id: string;
        status: string;
    };
}

interface Props {
    project: Project;
}

export default function ShowProject({ project }: Props) {
    const { t } = useTranslation();
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    const user = (props as any).auth?.user;
    const isAdmin =
        user?.roles?.some((role: { name: string }) => role.name === 'admin') ||
        false;
    const projectsListPath = isAdmin ? '/admin/hr-projects' : '/hr-projects';

    const steps = [
        {
            key: 'diagnosis',
            label: t('admin_hr_project_details.diagnosis'),
            status:
                project.diagnosis?.status || project.step_statuses?.diagnosis,
        },
        {
            key: 'organization',
            label: t('admin_hr_project_details.organization_design'),
            status:
                project.organizationDesign?.status ||
                project.step_statuses?.organization,
        },
        {
            key: 'performance',
            label: t('admin_hr_project_details.performance_system'),
            status:
                project.performanceSystem?.status ||
                project.step_statuses?.performance,
        },
        {
            key: 'compensation',
            label: t('admin_hr_project_details.compensation_system'),
            status:
                project.compensationSystem?.status ||
                project.step_statuses?.compensation,
        },
    ];

    const getStatusIcon = (status?: string) => {
        if (!status) return <Clock className="h-4 w-4 text-muted-foreground" />;
        if (status === 'locked' || status === 'approved')
            return <Lock className="h-4 w-4 text-green-600" />;
        if (status === 'submitted')
            return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
        return <Clock className="h-4 w-4 text-yellow-600" />;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={t('projects_show.page_title', { company: project.company.name })} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href={projectsListPath}>
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('projects_show.back')}
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold">{project.company.name}</h1>
                            <p className="text-muted-foreground">{t('projects_show.project_id', { id: project.id })}</p>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t('projects_show.project_status')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium capitalize">
                                    {project.status}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('projects_show.workflow_steps')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {steps.map((step) => (
                                            <div
                                                key={step.key}
                                                className="flex items-center justify-between flex-wrap rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(step.status)}
                                                    <span className="font-medium">
                                                        {step.label}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {step.status || t('projects_show.not_started')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {project.diagnosis && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('projects_show.quick_actions')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex gap-4">
                                        {isAdmin ? (
                                            <>
                                                <Link href={`/admin/review/${project.id}`}>
                                                    <Button>{t('projects_show.review_project')}</Button>
                                                </Link>
                                                <Link href={`/admin/hr-system/${project.id}`}>
                                                    <Button variant="outline">{t('projects_show.view_overview')}</Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href={`/hr-manager/diagnosis/${project.id}/overview`}>
                                                    <Button>{t('projects_show.continue_diagnosis')}</Button>
                                                </Link>
                                                <Link href={`/hr-system/${project.id}`}>
                                                    <Button variant="outline">{t('projects_show.view_overview')}</Button>
                                                </Link>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
