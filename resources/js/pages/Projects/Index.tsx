import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';

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

export default function AdminHRProjects({ projects }: Props) {
    const { t } = useTranslation();
    const { props } = usePage();
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
                    <Head title={t('admin_hr_projects.title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold">
                                {t('admin_hr_projects.heading')}
                            </h1>
                        </div>

                        {projects.length === 0 ? (
                            <Card className="py-12 text-center">
                                <CardHeader>
                                    <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <CardTitle>
                                        {t('admin_hr_projects.no_projects')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'admin_hr_projects.no_projects_desc',
                                        )}
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
                                                {t(
                                                    'admin_hr_projects.project_number',
                                                )}{' '}
                                                #{project.id} • {project.status}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {project.diagnosis && (
                                                <p className="mb-4 text-sm text-muted-foreground">
                                                    {t(
                                                        'admin_hr_projects.diagnosis',
                                                    )}
                                                    : {project.diagnosis.status}
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
                                                    {t(
                                                        'admin_hr_projects.view_project',
                                                    )}
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
