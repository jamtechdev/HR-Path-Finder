import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    List, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp,
    Eye,
    Shield
} from 'lucide-react';

interface Project {
    id: number;
    company?: {
        name: string;
    };
}

interface Question {
    id: number;
    question_text: string;
    order: number;
    has_conditional_text: boolean;
}

interface JobKeyword {
    id: number;
    name: string;
}

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
    grouped_job_keyword_ids?: number[];
    job_description?: string;
    job_specification?: any;
    competency_levels?: any[];
    csfs?: any[];
    job_keyword?: {
        id: number;
        name: string;
    };
}

interface OrgChartMapping {
    id: number;
    org_unit_name: string;
    job_keyword_ids: number[];
    org_head_name?: string;
    org_head_rank?: string;
    org_head_title?: string;
    org_head_email?: string;
    job_specialists?: any[];
}

interface Props {
    project: Project;
    introText?: {
        title?: string;
        content: string;
    };
    questions?: Question[];
    policyAnswers?: Record<number, { answer: string; conditional_text?: string }>;
    suggestedJobs?: JobKeyword[];
    jobDefinitions?: JobDefinition[];
    orgMappings?: OrgChartMapping[];
    industry?: string;
    sizeRange?: string;
    introCompleted?: boolean;
    stepStatuses?: any;
}

export default function CeoJobAnalysisIndex({
    project,
    introText,
    questions = [],
    policyAnswers = {},
    suggestedJobs = [],
    jobDefinitions = [],
    orgMappings = [],
    industry,
    sizeRange,
    introCompleted = false,
    stepStatuses = {},
}: Props) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro', 'policy-answers']));
    const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const toggleJob = (jobId: number) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(jobId)) {
            newExpanded.delete(jobId);
        } else {
            newExpanded.add(jobId);
        }
        setExpandedJobs(newExpanded);
    };

    const defaultContent = `This stage is not intended to redesign or change your current organizational structure. Its purpose is to organize and clarify the job standards and role expectations as they are currently operated within your company.

There are no right or wrong answers to any of the questions. Your responses will be used solely as baseline inputs for the subsequent design of the performance management and compensation systems.

All inputs are confidential and will not be shared with other employees.`;

    const displayText = introText?.content || defaultContent;
    const jobAnalysisStatus = stepStatuses?.job_analysis || 'not_started';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(jobAnalysisStatus);

    return (
        <AppLayout>
            <Head title={`Job Analysis - ${project?.company?.name || 'Review'}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-700">
                    <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                                    Job Analysis Review
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-slate-400">
                                    Review and verify the job analysis data submitted by HR Manager
                                </p>
                            </div>
                            {isSubmitted && (
                                <Badge className="bg-green-500 text-white px-4 py-2">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submitted
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Intro Section */}
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <Card className="border-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-700/50"
                            onClick={() => toggleSection('intro')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-primary" />
                                    <CardTitle className="text-xl dark:text-slate-100">Before You Begin</CardTitle>
                                </div>
                                {expandedSections.has('intro') ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                        {expandedSections.has('intro') && (
                            <CardContent className="space-y-4 dark:bg-slate-800">
                                <div className="prose prose-sm max-w-none dark:text-slate-300">
                                    {displayText.split('\n\n').map((paragraph, index) => (
                                        <p key={index} className="mb-4 text-base leading-relaxed dark:text-slate-300">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Policy Snapshot Answers */}
                {questions.length > 0 && (
                    <div className="max-w-5xl mx-auto px-6 md:px-8">
                        <Card className="border-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-700/50"
                                onClick={() => toggleSection('policy-answers')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-6 h-6 text-primary" />
                                        <CardTitle className="text-xl dark:text-slate-100">Policy Snapshot Answers</CardTitle>
                                    </div>
                                    {expandedSections.has('policy-answers') ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </CardHeader>
                            {expandedSections.has('policy-answers') && (
                                <CardContent className="space-y-4 dark:bg-slate-800">
                                    {questions
                                        .sort((a, b) => a.order - b.order)
                                        .map((question, index) => {
                                            const answer = policyAnswers[question.id];
                                            return (
                                                <div key={question.id} className="p-4 border-2 rounded-lg dark:border-slate-600 dark:bg-slate-700/50">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-2 dark:text-slate-200">{question.question_text}</p>
                                                            {answer ? (
                                                                <div className="space-y-2">
                                                                    <Badge variant={answer.answer === 'yes' ? 'default' : answer.answer === 'no' ? 'secondary' : 'outline'}>
                                                                        {answer.answer === 'yes' ? 'Yes' : answer.answer === 'no' ? 'No' : 'Not sure'}
                                                                    </Badge>
                                                                    {answer.conditional_text && (
                                                                        <p className="text-sm text-muted-foreground mt-2">
                                                                            <strong>Details:</strong> {answer.conditional_text}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <Badge variant="outline">Not answered</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </CardContent>
                            )}
                        </Card>
                    </div>
                )}

                {/* Job List Selection */}
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <Card className="border-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-700/50"
                            onClick={() => toggleSection('job-list')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <List className="w-6 h-6 text-primary" />
                                    <CardTitle className="text-xl dark:text-slate-100">Job List Selection</CardTitle>
                                    <Badge variant="secondary">
                                        {jobDefinitions.length} Job{jobDefinitions.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(`/ceo/review/job-analysis/${project.id}/job-list`);
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                    {expandedSections.has('job-list') ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        {expandedSections.has('job-list') && (
                            <CardContent className="dark:bg-slate-800">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4 dark:text-slate-400">
                                        Industry: <strong>{industry || 'N/A'}</strong> | Size: <strong>{sizeRange || 'N/A'}</strong>
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {jobDefinitions.map((job) => (
                                            <Badge key={job.id} variant="secondary" className="p-2 justify-center dark:bg-slate-700 dark:text-slate-200">
                                                {job.job_name}
                                                {job.grouped_job_keyword_ids && (
                                                    <span className="ml-1 text-xs">(Grouped)</span>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Job Definitions */}
                {jobDefinitions.length > 0 && (
                    <div className="max-w-5xl mx-auto px-6 md:px-8">
                        <Card className="border-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-700/50"
                                onClick={() => toggleSection('job-definitions')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-primary" />
                                        <CardTitle className="text-xl dark:text-slate-100">Job Definitions</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(`/ceo/review/job-analysis/${project.id}/job-definitions`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View All
                                        </Button>
                                        {expandedSections.has('job-definitions') ? (
                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            {expandedSections.has('job-definitions') && (
                                <CardContent className="space-y-4 dark:bg-slate-800">
                                    {jobDefinitions.map((job) => (
                                        <Card key={job.id} className="border dark:border-slate-600 dark:bg-slate-700/50">
                                            <CardHeader
                                                className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-600/50"
                                                onClick={() => toggleJob(job.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg dark:text-slate-200">{job.job_name}</CardTitle>
                                                    {expandedJobs.has(job.id) ? (
                                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                            {expandedJobs.has(job.id) && (
                                                <CardContent className="space-y-4 dark:bg-slate-700/30">
                                                    {job.job_description && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 dark:text-slate-200">Job Description</h4>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap dark:text-slate-400">
                                                                {job.job_description}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {job.competency_levels && job.competency_levels.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 dark:text-slate-200">Competency Levels</h4>
                                                            <div className="space-y-2">
                                                                {job.competency_levels.map((level: any, idx: number) => (
                                                                    <div key={idx} className="text-sm dark:text-slate-300">
                                                                        <strong>{level.level}:</strong> {level.description || 'No description'}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.csfs && job.csfs.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 dark:text-slate-200">Critical Success Factors</h4>
                                                            <div className="space-y-2">
                                                                {job.csfs.map((csf: any, idx: number) => (
                                                                    <div key={idx} className="text-sm p-2 bg-muted rounded dark:bg-slate-600/50">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <strong className="dark:text-slate-200">{csf.name}</strong>
                                                                            {csf.strategic_importance && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {csf.strategic_importance}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-muted-foreground dark:text-slate-400">{csf.description || 'No description'}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    </div>
                )}

                {/* Org Chart Mappings */}
                {orgMappings.length > 0 && (
                    <div className="max-w-5xl mx-auto px-6 md:px-8">
                        <Card className="border-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/30 transition-colors dark:hover:bg-slate-700/50"
                                onClick={() => toggleSection('org-mappings')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <List className="w-6 h-6 text-primary" />
                                        <CardTitle className="text-xl dark:text-slate-100">Organization Chart Mappings</CardTitle>
                                        <Badge variant="secondary">{orgMappings.length} Unit{orgMappings.length !== 1 ? 's' : ''}</Badge>
                                    </div>
                                    {expandedSections.has('org-mappings') ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </CardHeader>
                            {expandedSections.has('org-mappings') && (
                                <CardContent className="space-y-4 dark:bg-slate-800">
                                    {orgMappings.map((mapping) => (
                                        <Card key={mapping.id} className="border dark:border-slate-600 dark:bg-slate-700/50">
                                            <CardHeader>
                                                <CardTitle className="text-lg dark:text-slate-200">{mapping.org_unit_name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {mapping.org_head_name && (
                                                    <div className="dark:text-slate-300">
                                                        <strong>Organization Head:</strong> {mapping.org_head_name}
                                                        {mapping.org_head_rank && ` (${mapping.org_head_rank})`}
                                                        {mapping.org_head_title && ` - ${mapping.org_head_title}`}
                                                        {mapping.org_head_email && ` - ${mapping.org_head_email}`}
                                                    </div>
                                                )}
                                                {mapping.job_keyword_ids && mapping.job_keyword_ids.length > 0 && (
                                                    <div>
                                                        <strong className="dark:text-slate-200">Mapped Jobs:</strong>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {mapping.job_keyword_ids.map((jobId) => {
                                                                const job = jobDefinitions.find(j => 
                                                                    j.job_keyword_id === jobId || 
                                                                    j.grouped_job_keyword_ids?.includes(jobId)
                                                                );
                                                                return (
                                                                    <Badge key={jobId} variant="outline">
                                                                        {job?.job_name || `Job ${jobId}`}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    </div>
                )}

                {/* Action Buttons */}
                {isSubmitted && (
                    <div className="max-w-5xl mx-auto px-6 md:px-8">
                        <Card className="border-2 border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">Verification Actions</h3>
                                        <p className="text-sm text-muted-foreground dark:text-slate-400">
                                            Review the job analysis data and verify or request revisions if needed.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.post(`/ceo/revision/step/${project.id}`, {
                                                    step: 'job_analysis',
                                                }, {
                                                    onSuccess: () => {
                                                        alert('Job Analysis reopened for revision.');
                                                    },
                                                });
                                            }}
                                        >
                                            Request Revision
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                router.post(`/ceo/verify/step/${project.id}`, {
                                                    step: 'job_analysis',
                                                }, {
                                                    onSuccess: () => {
                                                        alert('Job Analysis verified and approved successfully.');
                                                        router.visit('/ceo/dashboard');
                                                    },
                                                });
                                            }}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Verify & Approve
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

