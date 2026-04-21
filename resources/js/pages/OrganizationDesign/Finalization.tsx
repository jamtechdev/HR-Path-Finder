import { Head, useForm, router } from '@inertiajs/react';
import { 
    CheckCircle2, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    User, 
    TrendingUp, 
    Target,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Lock,
    Unlock
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { buildFinalizePayload } from '@/pages/JobAnalysis/utils/jobAnalysisStorage';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_specification?: {
        education?: { required?: string; preferred?: string };
        experience?: { required?: string; preferred?: string };
        skills?: { required?: string; preferred?: string };
        communication?: { required?: string; preferred?: string };
    };
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
    is_finalized?: boolean;
    job_keyword?: {
        id: number;
        name: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
    finalizedJobs?: JobDefinition[];
    hasJobsToFinalize?: boolean;
    errors?: {
        error?: string;
    };
}

export default function Finalization({ project, jobDefinitions, finalizedJobs = [], hasJobsToFinalize = true, errors }: Props) {
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const [confirmed, setConfirmed] = useState(false);
    const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());

    const { post, processing } = useForm({
        confirm: false,
    });

    const toggleJobExpansion = (jobId: number) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(jobId)) {
            newExpanded.delete(jobId);
        } else {
            newExpanded.add(jobId);
        }
        setExpandedJobs(newExpanded);
    };

    const handleFinalize = () => {
        const payload = buildFinalizePayload(project.id);
        post(`/hr-manager/job-analysis/${project.id}/finalize`, payload, {
            onSuccess: () => {
                router.visit(`/hr-manager/job-analysis/${project.id}/org-chart-mapping`);
            },
        });
    };

    const totalJobs = jobDefinitions.length + finalizedJobs.length;
    const hasSpecification = (job: JobDefinition) => {
        const spec = job.job_specification;
        return !!(spec?.education?.required || spec?.education?.preferred ||
                 spec?.experience?.required || spec?.experience?.preferred ||
                 spec?.skills?.required || spec?.skills?.preferred ||
                 spec?.communication?.required || spec?.communication?.preferred);
    };

    const hasCompetencyLevels = (job: JobDefinition) => {
        return !!(job.competency_levels && job.competency_levels.length > 0);
    };

    const hasCSFs = (job: JobDefinition) => {
        return !!(job.csfs && job.csfs.length > 0);
    };

    return (
        <AppLayout>
            <Head
                title={t('page_heads.finalization', {
                    company:
                        project?.company?.name ||
                        t('page_head_fallbacks.job_analysis'),
                })}
            />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {tx('org_design_finalization_legacy.title', 'Finalization of Job List')}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {tx('org_design_finalization_legacy.subtitle', 'Review and finalize all job definitions. Once finalized, these will be used for performance management and compensation system design.')}
                    </p>
                </div>

                {/* Error Alert */}
                {errors?.error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.error}</AlertDescription>
                    </Alert>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">{tx('org_design_finalization_legacy.total_jobs', 'Total Jobs')}</p>
                                    <p className="text-2xl font-bold text-blue-700">{totalJobs}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap">
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">{tx('org_design_finalization_legacy.pending_finalization', 'Pending Finalization')}</p>
                                    <p className="text-2xl font-bold text-yellow-700">{jobDefinitions.length}</p>
                                </div>
                                <Unlock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap">
                                <div>
                                    <p className="text-sm font-medium text-green-900">{tx('org_design_finalization_legacy.already_finalized', 'Already Finalized')}</p>
                                    <p className="text-2xl font-bold text-green-700">{finalizedJobs.length}</p>
                                </div>
                                <Lock className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs to Finalize */}
                {jobDefinitions.length > 0 && (
                    <Card className="mb-6 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                            <div className="flex items-center justify-between flex-wrap">
                                <div>
                                    <CardTitle className="text-2xl">{tx('org_design_finalization_legacy.jobs_pending', 'Jobs Pending Finalization')}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {tx('org_design_finalization_legacy.jobs_pending_desc', 'Review the details below. These jobs will be locked once you finalize.')}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    {jobDefinitions.length} {jobDefinitions.length === 1 ? tx('org_design_finalization_legacy.job_singular', 'Job') : tx('org_design_finalization_legacy.job_plural', 'Jobs')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {jobDefinitions.map((job) => {
                                    const isExpanded = expandedJobs.has(job.id);
                                    const hasDescription = !!job.job_description;
                                    const hasSpec = hasSpecification(job);
                                    const hasComp = hasCompetencyLevels(job);
                                    const hasCSF = hasCSFs(job);
                                    
                                    return (
                                        <div 
                                            key={job.id} 
                                            className="border-2 border-primary/20 rounded-lg overflow-hidden hover:border-primary/40 transition-colors"
                                        >
                                            <div 
                                                className="p-4 bg-gradient-to-r from-white to-gray-50/50 cursor-pointer"
                                                onClick={() => toggleJobExpansion(job.id)}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-foreground">{job.job_name}</h3>
                                                            {job.job_keyword && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {job.job_keyword.name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {hasDescription && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {job.job_description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {hasDescription && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    {tx('org_design_finalization_legacy.description', 'Description')}
                                                                </Badge>
                                                            )}
                                                            {hasSpec && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <User className="w-3 h-3 mr-1" />
                                                                    {tx('org_design_finalization_legacy.spec', 'Spec')}
                                                                </Badge>
                                                            )}
                                                            {hasComp && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                                    {tx('org_design_finalization_legacy.levels', 'Levels')}: {job.competency_levels?.length || 0}
                                                                </Badge>
                                                            )}
                                                            {hasCSF && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Target className="w-3 h-3 mr-1" />
                                                                    {tx('org_design_finalization_legacy.csfs', 'CSFs')}: {job.csfs?.length || 0}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isExpanded && (
                                                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                                                    {/* Job Description */}
                                                    {hasDescription && (
                                                        <div>
                                                            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                                <FileText className="w-4 h-4" />
                                                                {tx('org_design_finalization_legacy.job_description', 'Job Description')}
                                                            </Label>
                                                            <div className="p-3 bg-muted rounded-lg">
                                                                <p className="text-sm whitespace-pre-wrap">{job.job_description}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Job Specification Summary */}
                                                    {hasSpec && (
                                                        <div>
                                                            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                                <User className="w-4 h-4" />
                                                                {tx('org_design_finalization_legacy.job_specification', 'Job Specification')}
                                                            </Label>
                                                            <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
                                                                {job.job_specification?.education?.required && (
                                                                    <div>
                                                                    <p className="text-xs text-muted-foreground">{tx('org_design_finalization_legacy.education_required', 'Education (Required)')}</p>
                                                                        <p className="text-sm font-medium">{job.job_specification.education.required}</p>
                                                                    </div>
                                                                )}
                                                                {job.job_specification?.experience?.required && (
                                                                    <div>
                                                                    <p className="text-xs text-muted-foreground">{tx('org_design_finalization_legacy.experience_required', 'Experience (Required)')}</p>
                                                                        <p className="text-sm font-medium">{job.job_specification.experience.required}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Competency Levels */}
                                                    {hasComp && (
                                                        <div>
                                                            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                                <TrendingUp className="w-4 h-4" />
                                                                {tx('org_design_finalization_legacy.competency_levels', 'Competency Levels')} ({job.competency_levels?.length || 0})
                                                            </Label>
                                                            <div className="space-y-2">
                                                                {job.competency_levels?.map((level, idx) => (
                                                                    <div key={idx} className="p-2 bg-muted rounded border-l-2 border-primary">
                                                                        <p className="text-xs font-semibold text-primary">{level.level}</p>
                                                                        {level.description && (
                                                                            <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* CSFs */}
                                                    {hasCSF && (
                                                        <div>
                                                            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                                <Target className="w-4 h-4" />
                                                                {tx('org_design_finalization_legacy.critical_success_factors', 'Critical Success Factors')} ({job.csfs?.length || 0})
                                                            </Label>
                                                            <div className="space-y-2">
                                                                {job.csfs?.map((csf, idx) => (
                                                                    <div key={idx} className="p-2 bg-muted rounded">
                                                                        <p className="text-xs font-semibold">{csf.name}</p>
                                                                        {csf.description && (
                                                                            <p className="text-xs text-muted-foreground mt-1">{csf.description}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!hasDescription && !hasSpec && !hasComp && !hasCSF && (
                                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                                            {tx('org_design_finalization_legacy.no_additional_details', 'No additional details available for this job.')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Already Finalized Jobs */}
                {finalizedJobs.length > 0 && (
                    <Card className="mb-6 shadow-lg border-green-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
                            <div className="flex items-center justify-between flex-wrap">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-green-600" />
                                        {tx('org_design_finalization_legacy.already_finalized_jobs', 'Already Finalized Jobs')}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {tx('org_design_finalization_legacy.already_finalized_desc', 'These jobs have already been finalized and locked.')}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg px-4 py-2 bg-green-50 border-green-300">
                                    {finalizedJobs.length} {finalizedJobs.length === 1 ? tx('org_design_finalization_legacy.job_singular', 'Job') : tx('org_design_finalization_legacy.job_plural', 'Jobs')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {finalizedJobs.map((job) => (
                                    <div 
                                        key={job.id} 
                                        className="p-3 border border-green-200 rounded-lg bg-green-50/50 flex items-center justify-between flex-wrap"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span className="font-medium">{job.job_name}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                                            {tx('org_design_finalization_legacy.finalized', 'Finalized')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Jobs Message */}
                {jobDefinitions.length === 0 && finalizedJobs.length === 0 && (
                    <Card className="mb-6">
                        <CardContent className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{tx('org_design_finalization_legacy.no_job_definitions', 'No Job Definitions Found')}</h3>
                            <p className="text-muted-foreground mb-6">
                                {tx('org_design_finalization_legacy.no_job_definitions_desc', 'Please create job definitions before finalizing.')}
                            </p>
                            <Button onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/job-definition`)}>
                                {tx('org_design_finalization_legacy.go_to_job_definitions', 'Go to Job Definitions')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Finalization Action */}
                {hasJobsToFinalize && jobDefinitions.length > 0 && (
                    <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle>{tx('org_design_finalization_legacy.finalize_job_setup', 'Finalize Job Setup')}</CardTitle>
                            <CardDescription>
                                {tx('org_design_finalization_legacy.finalize_job_setup_desc', 'Once finalized, all job definitions will be locked and used as baseline inputs for performance management and compensation systems.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border-2 border-primary/20">
                                <Checkbox
                                    id="confirm-finalize"
                                    checked={confirmed}
                                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                    className="mt-1"
                                />
                                <Label htmlFor="confirm-finalize" className="flex-1 cursor-pointer">
                                    <span className="font-semibold text-base block mb-1">
                                        {tx('org_design_finalization_legacy.confirm_label', 'I confirm that all job definitions are complete and accurate')}
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        By finalizing, you lock all {jobDefinitions.length} job definition{jobDefinitions.length !== 1 ? 's' : ''}. 
                                        They will be used as baseline inputs for the performance management and compensation systems. 
                                        You can request admin assistance if changes are needed after finalization.
                                    </p>
                                </Label>
                            </div>

                            <Button
                                onClick={handleFinalize}
                                disabled={!confirmed || processing}
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        {tx('org_design_finalization_legacy.finalizing', 'Finalizing...')}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        {tx('org_design_finalization_legacy.finalize_jobs', 'Finalize {{count}} Jobs').replace('{{count}}', String(jobDefinitions.length))}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/job-definition`)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {tx('org_design_finalization_legacy.back_to_job_definitions', 'Back to Job Definitions')}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
