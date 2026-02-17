import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Building2, 
    CheckCircle2, 
    Clock, 
    FileText,
    ChevronRight,
    ChevronDown,
    Users,
    UserCheck,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
    id: number;
    company?: {
        id: number;
        name: string;
    };
    step_statuses?: Record<string, string>;
    ceoPhilosophy?: {
        completed_at: string | null;
    };
    diagnosis?: {
        status: string;
    };
    created_at: string;
}

interface Props {
    projects: Project[];
}

const STEP_NAMES: Record<string, string> = {
    'diagnosis': 'Step 1: Diagnosis',
    'job_analysis': 'Step 2: Job Analysis',
    'performance': 'Step 3: Performance',
    'compensation': 'Step 4: Compensation',
    'hr_policy_os': 'Step 5: HR Policy OS',
};

const STEP_ORDER = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];

export default function ProjectTree({ projects }: Props) {
    const [expandedProjects, setExpandedProjects] = React.useState<Set<number>>(new Set());

    const toggleProject = (projectId: number) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };

    const getStepStatus = (project: Project, stepKey: string): { status: string; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
        const status = project.step_statuses?.[stepKey] || 'not_started';
        
        // Special handling for diagnosis step - check CEO survey
        if (stepKey === 'diagnosis') {
            const diagnosisStatus = project.diagnosis?.status || status;
            if (diagnosisStatus === 'submitted' && !project.ceoPhilosophy?.completed_at) {
                return { status: 'waiting_ceo_survey', label: 'Waiting for CEO Survey', variant: 'secondary' };
            }
            if (project.ceoPhilosophy?.completed_at && diagnosisStatus === 'submitted') {
                return { status: 'completed', label: 'Completed', variant: 'default' };
            }
        }

        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'not_started': { label: 'Not Started', variant: 'outline' },
            'in_progress': { label: 'In Progress', variant: 'secondary' },
            'submitted': { label: 'Submitted', variant: 'secondary' },
            'approved': { label: 'Approved', variant: 'default' },
            'locked': { label: 'Locked', variant: 'default' },
            'completed': { label: 'Completed', variant: 'default' },
        };
        
        return statusMap[status] || { status, label: status, variant: 'outline' };
    };

    const getProjectProgress = (project: Project) => {
        let completed = 0;
        let total = STEP_ORDER.length;
        
        STEP_ORDER.forEach(stepKey => {
            const stepStatus = getStepStatus(project, stepKey);
            if (['approved', 'locked', 'completed'].includes(stepStatus.status)) {
                completed++;
            }
        });
        
        return { completed, total, percentage: (completed / total) * 100 };
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
            case 'locked':
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'waiting_ceo_survey':
                return <UserCheck className="w-4 h-4 text-amber-600" />;
            case 'submitted':
                return <Clock className="w-4 h-4 text-blue-600" />;
            case 'in_progress':
                return <TrendingUp className="w-4 h-4 text-blue-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Admin - Project Tree View" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Project Tree View</h1>
                            <p className="text-muted-foreground">
                                View all projects and their progress in a hierarchical tree structure
                            </p>
                        </div>

                        <div className="space-y-4">
                            {projects.map((project) => {
                                const isExpanded = expandedProjects.has(project.id);
                                const progress = getProjectProgress(project);
                                const companyName = project.company?.name || `Project #${project.id}`;

                                return (
                                    <Card key={project.id} className="overflow-hidden">
                                        <CardHeader 
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => toggleProject(project.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                    <Building2 className="w-5 h-5 text-primary" />
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg">{companyName}</CardTitle>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">Progress:</span>
                                                                <span className="text-sm font-semibold">
                                                                    {progress.completed} / {progress.total}
                                                                </span>
                                                            </div>
                                                            <div className="w-32 bg-muted rounded-full h-2">
                                                                <div 
                                                                    className={cn(
                                                                        "h-2 rounded-full transition-all",
                                                                        progress.percentage === 100 ? "bg-green-500" : "bg-primary"
                                                                    )}
                                                                    style={{ width: `${progress.percentage}%` }}
                                                                />
                                                            </div>
                                                            {progress.percentage === 100 && (
                                                                <Badge variant="default" className="bg-green-500">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Complete
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link 
                                                    href={`/admin/review/${project.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Badge variant="outline" className="hover:bg-muted">
                                                        View Details
                                                    </Badge>
                                                </Link>
                                            </div>
                                        </CardHeader>
                                        
                                        {isExpanded && (
                                            <CardContent className="pt-0">
                                                <div className="space-y-3 pl-8">
                                                    {STEP_ORDER.map((stepKey) => {
                                                        const stepStatus = getStepStatus(project, stepKey);
                                                        const statusIcon = getStatusIcon(stepStatus.status);

                                                        return (
                                                            <div 
                                                                key={stepKey}
                                                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    {statusIcon}
                                                                    <div>
                                                                        <p className="font-medium text-sm">
                                                                            {STEP_NAMES[stepKey]}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {stepStatus.label}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={stepStatus.variant}>
                                                                    {stepStatus.label}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    {/* CEO Survey Status */}
                                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {project.ceoPhilosophy?.completed_at ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <UserCheck className="w-4 h-4 text-amber-600" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    CEO Philosophy Survey
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {project.ceoPhilosophy?.completed_at 
                                                                        ? `Completed: ${new Date(project.ceoPhilosophy.completed_at).toLocaleDateString()}`
                                                                        : 'Pending'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant={project.ceoPhilosophy?.completed_at ? 'default' : 'secondary'}>
                                                            {project.ceoPhilosophy?.completed_at ? 'Completed' : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>

                        {projects.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No projects found</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
