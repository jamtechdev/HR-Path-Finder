import { Head, Link } from '@inertiajs/react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function CeoTreeList({ projects, stats }: Props) {
    // Stats are provided by backend, but this page is table-first to match other CEO list pages.
    void stats;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Tree - CEO" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="text-3xl font-bold mb-1">Tree</h1>
                            <p className="text-muted-foreground text-sm">Open HR Tree view project-wise.</p>
                        </div>
                        {projects.length > 0 ? (
                            <div className="rounded-lg border overflow-hidden bg-background">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold">Projects</h2>
                                </div>
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
                                                <tr key={project.id} className="border-t hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium">
                                                        {project.company?.name || `Project #${project.id}`}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                Survey Completed
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Pending</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Link href={`/ceo/tree/${project.id}`}>
                                                                <Button size="sm" variant="outline">View Tree</Button>
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
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-background p-12 text-center">
                                <p className="text-lg font-medium mb-2">No Tree Projects Available</p>
                                <p className="text-muted-foreground">Projects will appear here once assigned.</p>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
