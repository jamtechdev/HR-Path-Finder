import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, FileText } from 'lucide-react';
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
    company: {
        id: number;
        name: string;
    };
    diagnosis?: {
        id: number;
        status: string;
    };
}

interface Props {
    projects: Project[];
}

export default function ProjectsIndex({ projects }: Props) {
    const { t } = useTranslation();
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    const user = (props as any).auth?.user;

    const projectBasePath = '/admin/hr-projects';

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={t('projects_index.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold">{t('projects_index.heading')}</h1>
                        </div>

                        {projects.length === 0 ? (
                            <Card className="py-12 text-center">
                                <CardHeader>
                                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <CardTitle>{t('projects_index.empty_title')}</CardTitle>
                                    <CardDescription>
                                        {t('projects_index.empty_description')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => (
                                    <Card key={project.id}>
                                        <CardHeader>
                                            <CardTitle>
                                                {project.company.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {t('projects_index.project_line', { id: project.id, status: project.status })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {project.diagnosis && (
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {t('projects_index.diagnosis')}: {project.diagnosis.status}
                                                </p>
                                            )}
                                            <Link
                                                href={`${projectBasePath}/${project.id}`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    {t('projects_index.view_project')}
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
