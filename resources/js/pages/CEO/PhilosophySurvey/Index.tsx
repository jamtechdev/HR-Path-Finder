import { Head, router } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Mail, Building2, AlertCircle, CheckCircle2, Clock, Lock } from 'lucide-react';

interface Project {
    id: number;
    company_id: number;
    company_name: string;
    company_industry?: string | null;
    hr_manager_id?: number | null;
    hr_manager_name?: string | null;
    hr_manager_email?: string | null;
    diagnosis_status: string;
    ceo_philosophy_status: 'not_started' | 'in_progress' | 'completed' | 'locked';
    created_at: string;
    updated_at: string;
}

interface PageProps {
    projects: Project[];
}

export default function PhilosophySurveyIndex({ projects }: PageProps) {
    const handleStartSurvey = (projectId: number) => {
        router.visit(`/hr-projects/${projectId}/ceo-philosophy`);
    };

    const handleContinueSurvey = (projectId: number) => {
        router.visit(`/hr-projects/${projectId}/ceo-philosophy`);
    };

    const pendingProjects = projects.filter(p => p.ceo_philosophy_status === 'not_started' && p.diagnosis_status === 'submitted');
    const inProgressProjects = projects.filter(p => p.ceo_philosophy_status === 'in_progress');
    const completedProjects = projects.filter(p => p.ceo_philosophy_status === 'completed');
    const lockedProjects = projects.filter(p => p.ceo_philosophy_status === 'locked');

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Management Philosophy Survey" />

                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-display font-bold tracking-tight">
                                Management Philosophy Survey
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Complete the management philosophy survey for each company to unlock HR system design steps
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                        <Card className="border-orange-600">
                            <CardContent className="px-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pending</p>
                                        <p className="text-2xl font-bold text-orange-600">{pendingProjects.length}</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-600">
                            <CardContent className="px-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">In Progress</p>
                                        <p className="text-2xl font-bold text-blue-600">{inProgressProjects.length}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-blue-600 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-600">
                            <CardContent className="px-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">{completedProjects.length}</p>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-600">
                            <CardContent className="px-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Locked</p>
                                        <p className="text-2xl font-bold text-gray-600">{lockedProjects.length}</p>
                                    </div>
                                    <Lock className="w-8 h-8 text-gray-600 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pending Projects - Priority Section */}
                    {pendingProjects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                Action Required ({pendingProjects.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {pendingProjects.map((project) => (
                                    <Card key={project.id} className="border-2 border-orange-500/50 bg-orange-50/30 dark:bg-orange-900/10">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2 mb-2">
                                                        <Building2 className="w-5 h-5 text-primary" />
                                                        {project.company_name}
                                                    </CardTitle>
                                                    {project.company_industry && (
                                                        <Badge variant="outline" className="text-xs mb-2">
                                                            {project.company_industry}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge className="bg-orange-500 text-white">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* HR Manager Info */}
                                            {project.hr_manager_name && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-semibold text-foreground">HR Manager</span>
                                                    </div>
                                                    <p className="text-sm text-foreground font-medium ml-6">
                                                        {project.hr_manager_name}
                                                    </p>
                                                    {project.hr_manager_email && (
                                                        <div className="flex items-center gap-2 mt-1 ml-6">
                                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                                            <p className="text-xs text-muted-foreground">
                                                                {project.hr_manager_email}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Status Info */}
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    <strong>Diagnosis Status:</strong> {project.diagnosis_status === 'submitted' ? 'Completed' : project.diagnosis_status}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    HR Manager has completed Step 1: Diagnosis. Please complete the survey to unlock Step 2.
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <Button
                                                onClick={() => handleStartSurvey(project.id)}
                                                size="lg"
                                                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Start Survey
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Progress Projects */}
                    {inProgressProjects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                In Progress ({inProgressProjects.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {inProgressProjects.map((project) => (
                                    <Card key={project.id} className="border-2 border-blue-500/30">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-primary" />
                                                    {project.company_name}
                                                </CardTitle>
                                                <Badge className="bg-blue-500 text-white">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    In Progress
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {project.hr_manager_name && (
                                                <div className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-semibold">HR Manager:</span>
                                                    </div>
                                                    <p className="text-sm ml-6">{project.hr_manager_name}</p>
                                                    {project.hr_manager_email && (
                                                        <p className="text-xs text-muted-foreground ml-6">{project.hr_manager_email}</p>
                                                    )}
                                                </div>
                                            )}
                                            <Button
                                                onClick={() => handleContinueSurvey(project.id)}
                                                size="lg"
                                                variant="outline"
                                                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Clock className="w-4 h-4 mr-2" />
                                                Continue Survey
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Projects */}
                    {completedProjects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Completed ({completedProjects.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {completedProjects.map((project) => (
                                    <Card key={project.id} className="border-2 border-green-500/30 bg-green-50/20 dark:bg-green-900/10">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-primary" />
                                                    {project.company_name}
                                                </CardTitle>
                                                <Badge className="bg-green-500 text-white">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {project.hr_manager_name && (
                                                <div className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-semibold">HR Manager:</span>
                                                    </div>
                                                    <p className="text-sm ml-6">{project.hr_manager_name}</p>
                                                    {project.hr_manager_email && (
                                                        <p className="text-xs text-muted-foreground ml-6">{project.hr_manager_email}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    Survey completed. Step 2: Organization Design has been unlocked for HR Manager.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locked Projects */}
                    {lockedProjects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-500" />
                                Waiting for Diagnosis ({lockedProjects.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {lockedProjects.map((project) => (
                                    <Card key={project.id} className="opacity-60">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-muted-foreground" />
                                                    {project.company_name}
                                                </CardTitle>
                                                <Badge variant="outline">
                                                    <Lock className="w-3 h-3 mr-1" />
                                                    Locked
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {project.hr_manager_name && (
                                                <div className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-semibold">HR Manager:</span>
                                                    </div>
                                                    <p className="text-sm ml-6">{project.hr_manager_name}</p>
                                                    {project.hr_manager_email && (
                                                        <p className="text-xs text-muted-foreground ml-6">{project.hr_manager_email}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                                <p className="text-sm text-muted-foreground">
                                                    Waiting for HR Manager to complete Step 1: Diagnosis.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Projects */}
                    {projects.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                                <p className="text-muted-foreground">
                                    You don't have any HR projects assigned yet. Contact your HR Manager to get started.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
