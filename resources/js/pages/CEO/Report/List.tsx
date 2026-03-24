import { Head, Link } from '@inertiajs/react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface Project {
    id: number;
    company?: { id: number; name: string } | null;
    survey_completed: boolean;
    created_at: string;
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        survey_completed: number;
    };
}

export default function CeoReportList({ projects, stats }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Report - CEO" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Report</h1>
                            <p className="text-muted-foreground">Open company reports project-wise.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                                    <p className="text-3xl font-bold">{stats.total_projects}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">Survey Completed</p>
                                    <p className="text-3xl font-bold">{stats.survey_completed}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Projects</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">Company</th>
                                                <th className="px-4 py-3 font-semibold">Survey</th>
                                                <th className="px-4 py-3 font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map((project) => (
                                                <tr key={project.id} className="border-t">
                                                    <td className="px-4 py-3 font-medium">
                                                        {project.company?.name || `Project #${project.id}`}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Badge variant="secondary">Survey Completed</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Pending</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Link href={`/ceo/report/${project.id}`}>
                                                                <Button size="sm">View Report</Button>
                                                            </Link>
                                                        ) : (
                                                            <Button size="sm" variant="outline" disabled>
                                                                Complete survey first
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
