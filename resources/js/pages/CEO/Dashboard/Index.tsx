import { Head, router, usePage, Link } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Clock, Lock, User, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface Company {
    id: number;
    name: string;
}

interface HrProject {
    id: number;
    company_id: number;
    company_name: string;
    company_industry?: string | null;
    hr_manager_id?: number | null;
    hr_manager_name?: string | null;
    hr_manager_email?: string | null;
    status: string;
    current_step?: string | null;
    step_statuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
    ceo_philosophy_status?: 'not_started' | 'in_progress' | 'completed' | 'locked';
    completed_steps: number;
    total_steps: number;
    progress_percentage: number;
    created_at: string;
    updated_at: string;
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    hrProjects: HrProject[];
}

export default function CEODashboard({ hrProjects = [] }: PageProps) {
    const { props } = usePage<PageProps>();
    const userName = props.auth?.user?.name?.split(' ')[0] || 'CEO';

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <RoleBasedSidebar />
            
            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="CEO Dashboard" />
                
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Review and approve your HR system design
                        </p>
                    </div>

                    {/* All HR Projects */}
                    {hrProjects.length > 0 && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <CardTitle>All HR Projects</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        {hrProjects.length} {hrProjects.length === 1 ? 'Project' : 'Projects'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {hrProjects.map((hrProject) => {
                                        // Check if this project needs CEO survey
                                        const needsCeoSurvey = hrProject.step_statuses?.diagnosis === 'submitted' && 
                                                              hrProject.ceo_philosophy_status === 'not_started';
                                        const surveyInProgress = hrProject.ceo_philosophy_status === 'in_progress';
                                        const surveyCompleted = hrProject.ceo_philosophy_status === 'completed';
                                        const surveyLocked = hrProject.ceo_philosophy_status === 'locked';
                                        
                                        return (
                                        <Card key={hrProject.id} className={`transition-all duration-300 ${needsCeoSurvey ? 'border-orange-500/50 bg-orange-50/30 dark:bg-orange-900/10' : surveyCompleted ? 'border-green-500/30 bg-green-50/20 dark:bg-green-900/10' : ''}`}>
                                            <CardContent className="p-6">
                                                {needsCeoSurvey && (
                                                    <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                                                Action Required: Complete Management Philosophy Survey
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-md">
                                                                <FileText className="w-7 h-7 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="text-lg font-bold text-foreground">{hrProject.company_name}</h3>
                                                                    {hrProject.company_industry && (
                                                                        <Badge variant="outline" className="text-xs">{hrProject.company_industry}</Badge>
                                                                    )}
                                                                    {needsCeoSurvey && (
                                                                        <Badge className="bg-orange-500 text-white text-xs">
                                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                                            Survey Pending
                                                                        </Badge>
                                                                    )}
                                                                    {surveyInProgress && (
                                                                        <Badge className="bg-blue-500 text-white text-xs">
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                            In Progress
                                                                        </Badge>
                                                                    )}
                                                                    {surveyCompleted && (
                                                                        <Badge className="bg-green-500 text-white text-xs">
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                            Completed
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {hrProject.hr_manager_name && (
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                                        <p className="text-sm text-muted-foreground">
                                                                            HR Manager: <span className="font-medium text-foreground">{hrProject.hr_manager_name}</span>
                                                                            {hrProject.hr_manager_email && (
                                                                                <span className="text-muted-foreground ml-1">({hrProject.hr_manager_email})</span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Management Philosophy Survey Status */}
                                                                <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm font-semibold text-foreground">Management Philosophy Survey</span>
                                                                        <Badge 
                                                                            variant={
                                                                                surveyCompleted ? 'default' : 
                                                                                surveyInProgress ? 'secondary' : 
                                                                                needsCeoSurvey ? 'outline' : 
                                                                                'secondary'
                                                                            }
                                                                            className={
                                                                                surveyCompleted ? 'bg-green-500 text-white' :
                                                                                needsCeoSurvey ? 'border-orange-500 text-orange-600' :
                                                                                ''
                                                                            }
                                                                        >
                                                                            {surveyCompleted ? (
                                                                                <>
                                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                                    Completed
                                                                                </>
                                                                            ) : surveyInProgress ? (
                                                                                <>
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    In Progress
                                                                                </>
                                                                            ) : needsCeoSurvey ? (
                                                                                <>
                                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                                    Pending
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Lock className="w-3 h-3 mr-1" />
                                                                                    Locked
                                                                                </>
                                                                            )}
                                                                        </Badge>
                                                                    </div>
                                                                    {surveyLocked && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Waiting for HR Manager to complete Step 1: Diagnosis
                                                                        </p>
                                                                    )}
                                                                    {needsCeoSurvey && (
                                                                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                                            Diagnosis completed. Please complete the survey to unlock Step 2.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-muted-foreground">Progress:</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-48 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                                                                                        style={{ width: `${hrProject.progress_percentage}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className="text-sm font-bold text-foreground min-w-[4rem]">{hrProject.completed_steps}/{hrProject.total_steps}</span>
                                                                                <span className="text-sm text-muted-foreground">({hrProject.progress_percentage}%)</span>
                                                                            </div>
                                                                        </div>
                                                                        {hrProject.current_step && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Current: {hrProject.current_step}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {[
                                                                            { key: 'diagnosis', label: 'Diagnosis' },
                                                                            { key: 'organization', label: 'Organization' },
                                                                            { key: 'performance', label: 'Performance' },
                                                                            { key: 'compensation', label: 'Compensation' },
                                                                        ].map((step) => {
                                                                            const status = hrProject.step_statuses[step.key as keyof typeof hrProject.step_statuses];
                                                                            return (
                                                                                <Badge 
                                                                                    key={step.key}
                                                                                    variant={status === 'submitted' ? 'default' : status === 'in_progress' ? 'secondary' : 'outline'} 
                                                                                    className="text-xs"
                                                                                >
                                                                                    {status === 'submitted' ? (
                                                                                        <><CheckCircle2 className="w-3 h-3 mr-1" /> {step.label}</>
                                                                                    ) : status === 'in_progress' ? (
                                                                                        <><Clock className="w-3 h-3 mr-1" /> {step.label}</>
                                                                                    ) : (
                                                                                        <><Lock className="w-3 h-3 mr-1" /> {step.label}</>
                                                                                    )}
                                                                                </Badge>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Created: {new Date(hrProject.created_at).toLocaleDateString()} | 
                                                                        Updated: {new Date(hrProject.updated_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                                        {needsCeoSurvey && (
                                                            <Link 
                                                                href={`/hr-projects/${hrProject.id}/ceo-philosophy`}
                                                                className="w-full"
                                                            >
                                                                <Button 
                                                                    size="lg"
                                                                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all"
                                                                >
                                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                                    Start Survey
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {surveyInProgress && (
                                                            <Link 
                                                                href={`/hr-projects/${hrProject.id}/ceo-philosophy`}
                                                                className="w-full"
                                                            >
                                                                <Button 
                                                                    size="lg"
                                                                    variant="outline"
                                                                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    <Clock className="w-4 h-4 mr-2" />
                                                                    Continue Survey
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Link 
                                                            href={`/ceo/hr-projects/${hrProject.id}/view`}
                                                            className="w-full"
                                                        >
                                                            <Button 
                                                                variant="outline"
                                                                size="lg"
                                                                className="w-full cursor-pointer hover:bg-primary hover:text-white transition-all"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )})}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
