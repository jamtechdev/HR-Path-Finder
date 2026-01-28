import { Head, Link, router } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, Clock, AlertCircle, ArrowRight, Users, FileText, Eye, CheckCircle2, Lock, User, BarChart3, Target, DollarSign, TrendingUp, Sparkles, Filter } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    industry?: string | null;
}

interface Project {
    id: number;
    company: Company;
    stepsComplete: number;
    totalSteps: number;
}

interface ProjectWithSteps {
    project: Project;
    stepsComplete: number;
    totalSteps: number;
    progressPercentage: number;
    stepStatuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
    hr_manager_name?: string | null;
    hr_manager_email?: string | null;
    has_review: boolean;
    latest_review_date?: string | null;
}

interface PageProps {
    allCompanies: Company[];
    activeCompanies: Company[];
    projectsWithSteps: ProjectWithSteps[];
    needsReview: Array<{
        id: number;
        company_name: string;
        status: string;
    }>;
    stats: {
        total_companies: number;
        active_companies: number;
        steps_complete: number;
        total_steps: number;
        ceo_survey_submitted: number;
        pending_review: number;
        reviewed: number;
        total_projects: number;
    };
    workflowStatus: {
        diagnosis: number;
        organization: number;
        performance: number;
        compensation: number;
    };
}

export default function ConsultantDashboard({ 
    allCompanies,
    activeCompanies,
    projectsWithSteps,
    needsReview = [],
    stats,
    workflowStatus 
}: PageProps) {
    const handleReviewSystem = (projectId: number) => {
        router.visit(`/hr-projects/${projectId}/consultant-review`);
    };

    const handleStartReview = () => {
        if (needsReview.length > 0) {
            router.visit(`/hr-projects/${needsReview[0].id}/consultant-review`);
        } else if (projectsWithSteps.length > 0) {
            const firstProject = projectsWithSteps[0].project;
            router.visit(`/hr-projects/${firstProject.id}/consultant-review`);
        }
    };

    const getStepIcon = (step: string) => {
        switch(step) {
            case 'diagnosis': return FileText;
            case 'organization': return Building2;
            case 'performance': return Target;
            case 'compensation': return DollarSign;
            default: return FileText;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <RoleBasedSidebar />
            
            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Consultant Dashboard" />
                
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                                Consultant Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Monitor and review HR system designs across all companies
                            </p>
                        </div>
                        {needsReview.length > 0 && (
                            <Button 
                                onClick={handleStartReview}
                                size="lg"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Review {needsReview.length} {needsReview.length === 1 ? 'Project' : 'Projects'}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        )}
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Companies</p>
                                        <p className="text-3xl font-bold text-foreground">{stats.total_companies}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{stats.active_companies} active</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Building2 className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Projects</p>
                                        <p className="text-3xl font-bold text-foreground">{stats.total_projects}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{stats.reviewed} reviewed</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <FileText className="w-8 h-8 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pending Review</p>
                                        <p className="text-3xl font-bold text-orange-500">{stats.pending_review}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                                    </div>
                                    <div className="p-3 bg-orange-500/10 rounded-xl">
                                        <AlertCircle className="w-8 h-8 text-orange-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">CEO Surveys</p>
                                        <p className="text-3xl font-bold text-green-500">{stats.ceo_survey_submitted}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Completed</p>
                                    </div>
                                    <div className="p-3 bg-green-500/10 rounded-xl">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Priority Section - Projects Needing Review */}
                    {needsReview.length > 0 && (
                        <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Projects Needing Review</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Priority items requiring your attention</p>
                                    </div>
                                    <Badge className="ml-auto bg-orange-500 text-white px-3 py-1">
                                        {needsReview.length} {needsReview.length === 1 ? 'Project' : 'Projects'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {needsReview.map((item) => {
                                        const projectData = projectsWithSteps.find(p => p.project.id === item.id);
                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-5 border-2 border-orange-500/20 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shadow-md">
                                                        <FileText className="w-6 h-6 text-orange-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-bold text-lg text-foreground">{item.company_name}</h3>
                                                            <Badge variant="outline" className="text-xs">Status: {item.status}</Badge>
                                                        </div>
                                                        {projectData && (
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">Progress:</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                                                                                style={{ width: `${projectData.progressPercentage}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs font-semibold">{projectData.stepsComplete}/{projectData.totalSteps} steps</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button 
                                                    onClick={() => router.visit(`/hr-projects/${item.id}/consultant-review`)}
                                                    size="lg"
                                                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all ml-4"
                                                >
                                                    Review Now
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* All Projects Overview - Enhanced */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">All HR Projects</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Complete overview of all projects</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-sm px-3 py-1">
                                    {projectsWithSteps.length} {projectsWithSteps.length === 1 ? 'Project' : 'Projects'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {projectsWithSteps.length > 0 ? (
                                <div className="space-y-4">
                                    {projectsWithSteps.map((item) => {
                                        const project = item.project;
                                        return (
                                            <div key={project.id} className="border-2 rounded-xl p-5 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-md">
                                                                <Building2 className="w-7 h-7 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="text-lg font-bold text-foreground">{project.company.name}</h3>
                                                                    {project.company.industry && (
                                                                        <Badge variant="outline" className="text-xs">{project.company.industry}</Badge>
                                                                    )}
                                                                    {item.has_review && (
                                                                        <Badge className="bg-green-500 text-white text-xs">
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                            Reviewed
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {item.hr_manager_name && (
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <User className="w-3 h-3 text-primary" />
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            HR Manager: <span className="font-semibold text-foreground">{item.hr_manager_name}</span>
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-muted-foreground">Progress:</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                                                                                        style={{ width: `${item.progressPercentage}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className="text-sm font-bold text-foreground min-w-[4rem]">{item.stepsComplete}/{item.totalSteps}</span>
                                                                                <span className="text-sm text-muted-foreground">({item.progressPercentage}%)</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {[
                                                                            { key: 'diagnosis', label: 'Diagnosis' },
                                                                            { key: 'organization', label: 'Organization' },
                                                                            { key: 'performance', label: 'Performance' },
                                                                            { key: 'compensation', label: 'Compensation' },
                                                                        ].map((step) => {
                                                                            const status = item.stepStatuses[step.key as keyof typeof item.stepStatuses];
                                                                            const Icon = getStepIcon(step.key);
                                                                            return (
                                                                                <Badge 
                                                                                    key={step.key}
                                                                                    variant={status === 'submitted' ? 'default' : status === 'in_progress' ? 'secondary' : 'outline'} 
                                                                                    className="text-xs flex items-center gap-1"
                                                                                >
                                                                                    {status === 'submitted' ? (
                                                                                        <><CheckCircle2 className="w-3 h-3" /> {step.label}</>
                                                                                    ) : status === 'in_progress' ? (
                                                                                        <><Clock className="w-3 h-3" /> {step.label}</>
                                                                                    ) : (
                                                                                        <><Lock className="w-3 h-3" /> {step.label}</>
                                                                                    )}
                                                                                </Badge>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {item.latest_review_date && (
                                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            Last reviewed: {new Date(item.latest_review_date).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <Button 
                                                            onClick={() => router.visit(`/hr-projects/${project.id}/consultant-review`)}
                                                            variant={item.has_review ? "outline" : "default"}
                                                            size="lg"
                                                            className={`cursor-pointer transition-all ${item.has_review ? '' : 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg'}`}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {item.has_review ? 'View Review' : 'Review'}
                                                        </Button>
                                                        <Button 
                                                            onClick={() => router.visit(`/hr-projects/${project.id}`)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer"
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground text-lg">No projects found</p>
                                    <p className="text-sm text-muted-foreground mt-2">Projects will appear here once HR Managers start creating them</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workflow Statistics - Enhanced */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Workflow Statistics</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Overview of step completion across all projects</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { key: 'diagnosis', label: 'Step 1: Diagnosis', icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10', count: workflowStatus.diagnosis },
                                    { key: 'organization', label: 'Step 2: Organization', icon: Building2, color: 'text-blue-500', bgColor: 'bg-blue-500/10', count: workflowStatus.organization },
                                    { key: 'performance', label: 'Step 3: Performance', icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-500/10', count: workflowStatus.performance },
                                    { key: 'compensation', label: 'Step 4: Compensation', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10', count: workflowStatus.compensation },
                                ].map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center p-6 border-2 rounded-xl hover:shadow-lg transition-all bg-white dark:bg-gray-800">
                                            <div className={`p-4 ${step.bgColor} rounded-xl mb-3`}>
                                                <Icon className={`w-10 h-10 ${step.color}`} />
                                            </div>
                                            <p className="text-sm font-semibold mb-2 text-center">{step.label}</p>
                                            <p className="text-3xl font-bold text-foreground">{step.count}</p>
                                            <p className="text-xs text-muted-foreground mt-1">submitted</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
