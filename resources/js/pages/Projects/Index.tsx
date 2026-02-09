import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText } from 'lucide-react';

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
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="HR Projects" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold">HR Projects</h1>
                        </div>

                        {projects.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardHeader>
                                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <CardTitle>No Projects</CardTitle>
                                    <CardDescription>
                                        Create a company to start your first HR project.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => (
                                    <Card key={project.id}>
                                        <CardHeader>
                                            <CardTitle>{project.company.name}</CardTitle>
                                            <CardDescription>
                                                Project #{project.id} • {project.status}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {project.diagnosis && (
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Diagnosis: {project.diagnosis.status}
                                                </p>
                                            )}
                                            <Link href={`/hr-projects/${project.id}`}>
                                                <Button variant="outline" className="w-full">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Project
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
