import { useForm, router, Link } from '@inertiajs/react';
import { 
    CheckCircle2, 
    ChevronRight, 
    FileText, 
    User, 
    TrendingUp, 
    Target,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Lock,
    Unlock,
    Plus,
    Edit,
    ArrowLeft
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    onContinue: () => void;
}

export default function FinalizationContent({ project, jobDefinitions, finalizedJobs = [], hasJobsToFinalize = true, errors, onContinue }: Props) {
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
        if (!confirmed) {
            return;
        }
        post(`/hr-manager/job-analysis/${project.id}/finalize`, {
            onSuccess: () => {
                onContinue();
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBackToJobDefinition = () => {
        router.get(`/hr-manager/job-analysis/${project.id}/job-definition`);
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
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Step 4 — Global Finalization</h2>
                <p className="text-muted-foreground">
                    Review and finalize all job definitions. Once finalized, these will be used for performance management and compensation system design.
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
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total Jobs</p>
                                <p className="text-2xl font-bold text-blue-700">{totalJobs}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Pending Finalization</p>
                                <p className="text-2xl font-bold text-yellow-700">{jobDefinitions.length}</p>
                            </div>
                            <Unlock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900">Already Finalized</p>
                                <p className="text-2xl font-bold text-green-700">{finalizedJobs.length}</p>
                            </div>
                            <Lock className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Jobs to Finalize */}
            {jobDefinitions.length > 0 && (
                <Card className="mb-6 shadow-lg border-2 border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b-2 border-primary/20">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Unlock className="w-6 h-6 text-yellow-600" />
                                    Jobs Pending Finalization
                                </CardTitle>
                                <CardDescription className="mt-2 text-base">
                                    Review the details below. These jobs will be locked once you finalize.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-lg px-5 py-2.5 bg-yellow-50 border-yellow-300 text-yellow-700 font-semibold">
                                {jobDefinitions.length} {jobDefinitions.length === 1 ? 'Job' : 'Jobs'}
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
                                        className="border-2 border-primary/30 rounded-xl overflow-hidden hover:border-primary/60 transition-all shadow-sm hover:shadow-md bg-white"
                                    >
                                        <div 
                                            className="p-5 bg-gradient-to-r from-white via-gray-50/30 to-white cursor-pointer hover:bg-gray-50/50 transition-colors"
                                            onClick={() => toggleJobExpansion(job.id)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-foreground">{job.job_name}</h3>
                                                        {job.job_keyword && (
                                                            <Badge variant="secondary" className="text-xs font-medium">
                                                                {job.job_keyword.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {hasDescription && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {job.job_description}
                                                        </p>
                                                    )}
                                                    {!hasDescription && (
                                                        <p className="text-xs text-muted-foreground italic">
                                                            No description available
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        {hasDescription && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                Description
                                                            </Badge>
                                                        )}
                                                        {hasSpec && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <User className="w-3 h-3 mr-1" />
                                                                Spec
                                                            </Badge>
                                                        )}
                                                        {hasComp && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                                Levels: {job.competency_levels?.length || 0}
                                                            </Badge>
                                                        )}
                                                        {hasCSF && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Target className="w-3 h-3 mr-1" />
                                                                CSFs: {job.csfs?.length || 0}
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
                                                {hasDescription && (
                                                    <div>
                                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                            <FileText className="w-4 h-4" />
                                                            Job Description
                                                        </Label>
                                                        <div className="p-3 bg-muted rounded-lg">
                                                            <p className="text-sm whitespace-pre-wrap">{job.job_description}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {hasSpec && (
                                                    <div>
                                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                            <User className="w-4 h-4" />
                                                            Job Specification
                                                        </Label>
                                                        <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
                                                            {job.job_specification?.education?.required && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Education (Required)</p>
                                                                    <p className="text-sm font-medium">{job.job_specification.education.required}</p>
                                                                </div>
                                                            )}
                                                            {job.job_specification?.experience?.required && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Experience (Required)</p>
                                                                    <p className="text-sm font-medium">{job.job_specification.experience.required}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {hasComp && (
                                                    <div>
                                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                            <TrendingUp className="w-4 h-4" />
                                                            Competency Levels ({job.competency_levels?.length || 0})
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

                                                {hasCSF && (
                                                    <div>
                                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                                            <Target className="w-4 h-4" />
                                                            Critical Success Factors ({job.csfs?.length || 0})
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
                                                        No additional details available for this job.
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
                <Card className="mb-6 shadow-sm border border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-green-600" />
                                    Already Finalized Jobs
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    These jobs have already been finalized and locked.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 bg-green-50 border-green-300">
                                {finalizedJobs.length} {finalizedJobs.length === 1 ? 'Job' : 'Jobs'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {finalizedJobs.map((job) => (
                                <div 
                                    key={job.id} 
                                    className="p-3 border border-green-200 rounded-lg bg-green-50/50 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">{job.job_name}</span>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                                        Finalized
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Jobs Message */}
            {jobDefinitions.length === 0 && finalizedJobs.length === 0 && (
                <Card className="mb-6 shadow-lg border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No Job Definitions Found</h3>
                        <p className="text-muted-foreground mb-6 text-lg">
                            Please create job definitions before finalizing.
                        </p>
                        <Link
                            href={`/hr-manager/job-analysis/${project.id}/job-definition`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Go to Job Definition
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Finalization Action */}
            {hasJobsToFinalize && jobDefinitions.length > 0 && (
                <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg border-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Lock className="w-6 h-6 text-primary" />
                            Finalize Job Setup
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Once finalized, all job definitions will be locked and used as baseline inputs for performance management and compensation systems.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="flex items-start space-x-4 p-5 bg-white rounded-xl border-2 border-primary/30 shadow-sm hover:border-primary/50 transition-colors">
                            <Checkbox
                                id="confirm-finalize"
                                checked={confirmed}
                                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                className="mt-1 w-5 h-5"
                            />
                            <Label htmlFor="confirm-finalize" className="flex-1 cursor-pointer">
                                <span className="font-bold text-lg block mb-2 text-foreground">
                                    I confirm that all job definitions are complete and accurate
                                </span>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    By finalizing, you lock all <strong className="text-primary">{jobDefinitions.length} job definition{jobDefinitions.length !== 1 ? 's' : ''}</strong>. 
                                    They will be used as baseline inputs for the performance management and compensation systems. 
                                    You can request admin assistance if changes are needed after finalization.
                                </p>
                            </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleBackToJobDefinition}
                                variant="outline"
                                size="lg"
                                className="flex-1 border-2 hover:bg-muted/50"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Edit Jobs
                            </Button>
                            <Button
                                onClick={handleFinalize}
                                disabled={!confirmed || processing}
                                size="lg"
                                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Finalizing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Finalize {jobDefinitions.length} Job{jobDefinitions.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Add Job Option */}
                        <div className="pt-4 border-t border-border">
                            <Link
                                href={`/hr-manager/job-analysis/${project.id}/job-definition`}
                                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Need to add or edit more jobs? Click here to go back to Job Definition
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
