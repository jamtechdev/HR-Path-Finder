import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Building2, 
    FolderKanban, 
    CheckCircle2, 
    Clock, 
    FileText, 
    Users,
    TrendingUp,
    ArrowRight,
    Eye,
    UserPlus
} from 'lucide-react';

interface Project {
    id: number;
    company?: {
        name: string;
    };
    step_statuses?: Record<string, string>;
    created_at: string;
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        total_companies: number;
        active_projects: number;
        completed_projects: number;
        pending_diagnosis: number;
        pending_ceo_survey: number;
    };
    recentProjects: Project[];
}

export default function AdminDashboard({ projects, stats, recentProjects }: Props) {
    const [showCreateCeoDialog, setShowCreateCeoDialog] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
    });

    const handleCreateCeo = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/ceo/create', {
            onSuccess: () => {
                reset();
                setShowCreateCeoDialog(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'not_started': { label: 'Not Started', variant: 'outline' },
            'in_progress': { label: 'In Progress', variant: 'secondary' },
            'submitted': { label: 'Submitted', variant: 'default' },
            'completed': { label: 'Completed', variant: 'default' },
            'locked': { label: 'Locked', variant: 'default' },
        };
        return statusMap[status] || { label: status, variant: 'outline' };
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Admin Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                                <p className="text-muted-foreground">
                                    Overview of all HR projects and system statistics
                                </p>
                            </div>
                            <Dialog open={showCreateCeoDialog} onOpenChange={setShowCreateCeoDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create CEO
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New CEO</DialogTitle>
                                        <DialogDescription>
                                            Create a new CEO user account. A temporary password will be generated.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateCeo} className="space-y-4">
                                        <div>
                                            <Label htmlFor="ceo-name">Name</Label>
                                            <Input
                                                id="ceo-name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="CEO Name"
                                                required
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="ceo-email">Email</Label>
                                            <Input
                                                id="ceo-email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="ceo@example.com"
                                                required
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowCreateCeoDialog(false);
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Creating...' : 'Create CEO'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                                            <p className="text-3xl font-bold">{stats.total_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
                                            <p className="text-3xl font-bold">{stats.total_companies}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
                                            <p className="text-3xl font-bold">{stats.active_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                            <p className="text-3xl font-bold">{stats.completed_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Pending Diagnosis Review
                                        </CardTitle>
                                        <Badge variant="secondary">{stats.pending_diagnosis}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Projects waiting for CEO diagnosis review
                                    </p>
                                    <Link href="/admin/review">
                                        <Button variant="outline" className="w-full">
                                            Review Projects
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Pending CEO Survey
                                        </CardTitle>
                                        <Badge variant="secondary">{stats.pending_ceo_survey}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Projects waiting for CEO philosophy survey
                                    </p>
                                    <Link href="/hr-projects">
                                        <Button variant="outline" className="w-full">
                                            View All Projects
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Projects */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Projects</CardTitle>
                                    <Link href="/hr-projects">
                                        <Button variant="ghost" size="sm">
                                            View All
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentProjects.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentProjects.map((project) => {
                                            const diagnosisStatus = project.step_statuses?.diagnosis || 'not_started';
                                            const statusBadge = getStatusBadge(diagnosisStatus);
                                            
                                            return (
                                                <Link
                                                    key={project.id}
                                                    href={`/admin/review/${project.id}`}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-medium">
                                                                {project.company?.name || `Project #${project.id}`}
                                                            </p>
                                                            <Badge variant={statusBadge.variant}>
                                                                {statusBadge.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Created {new Date(project.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No projects yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
