import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { Plus, ArrowRight } from 'lucide-react';

interface Project {
    id: number;
    status: string;
    current_step: string;
    company?: {
        id: number;
        name: string;
    };
}

interface Props {
    projects: Project[];
}

export default function HrProjectsIndex({ projects }: Props) {
    return (
        <AppLayout>
            <Head title="HR Projects" />
            <div className="container mx-auto max-w-7xl py-8">
                <div className="mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">HR Projects</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your HR system design projects
                        </p>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">No HR projects yet.</p>
                            <p className="text-sm text-muted-foreground">
                                Your first project will be created automatically when you start the diagnosis process.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{project.company?.name || 'Unnamed Company'}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Project #{project.id}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                project.status === 'locked'
                                                    ? 'default'
                                                    : project.status === 'completed'
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                        >
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Step:</p>
                                            <p className="font-medium capitalize">
                                                {project.current_step?.replace('_', ' ') || 'Not started'}
                                            </p>
                                        </div>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/hr-projects/${project.id}`}>
                                                View Project
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
