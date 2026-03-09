import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { FileText, Network, Target, CheckCircle2, AlertCircle, ArrowRight, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PolicyAnswer, JobSelection, JobDefinition, OrgChartMapping } from '../hooks/useJobAnalysisState';

interface Step6ReviewSubmitProps {
    projectId: number;
    policyAnswers: Record<number, PolicyAnswer>;
    jobSelections: JobSelection;
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    onBack: () => void;
}

export default function Step6ReviewSubmit({
    projectId,
    policyAnswers,
    jobSelections,
    jobDefinitions,
    orgMappings,
    onBack,
}: Step6ReviewSubmitProps) {
    const [processing, setProcessing] = useState(false);
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [expandedMappings, setExpandedMappings] = useState<Set<string>>(new Set());
    const [expandedPolicy, setExpandedPolicy] = useState(false);

    const jobsCount = Object.keys(jobDefinitions).length;
    const orgUnitsCount = orgMappings.length;
    const csfsCount = Object.values(jobDefinitions).reduce((acc, job) => acc + (job.csfs?.length || 0), 0);
    const roleOwnersCount = orgMappings.filter(m => m.org_head_name).length;

    const toggleJobExpansion = (key: string) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedJobs(newExpanded);
    };

    const toggleMappingExpansion = (id: string) => {
        const newExpanded = new Set(expandedMappings);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedMappings(newExpanded);
    };

    const handleSubmit = () => {
        if (processing) return;
        setProcessing(true);

        const finalData = {
            policy_answers: Object.entries(policyAnswers).map(([questionId, answer]) => ({
                question_id: parseInt(questionId),
                answer: answer.answer,
                conditional_text: answer.conditional_text,
            })),
            job_selections: jobSelections,
            job_definitions: Object.values(jobDefinitions),
            org_chart_mappings: orgMappings.map(unit => ({
                org_unit_name: unit.org_unit_name,
                job_keyword_ids: unit.job_keyword_ids,
                org_head_name: unit.org_head_name,
                org_head_rank: unit.org_head_rank,
                org_head_title: unit.org_head_title,
                org_head_email: unit.org_head_email,
                job_specialists: unit.job_specialists.map(s => ({
                    job_keyword_id: s.job_keyword_id,
                    name: s.name,
                    rank: s.rank,
                    title: s.title,
                    email: s.email,
                })),
            })),
        };

        router.post(`/hr-manager/job-analysis/${projectId}/submit`, finalData, {
            onSuccess: () => {
                toast({ title: 'Job Analysis submitted', description: 'Job Analysis has been completed successfully.' });
                router.visit('/hr-manager/dashboard');
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Error submitting data. Please try again.');
                toast({ title: 'Submission failed', description: desc, variant: 'destructive' });
                setProcessing(false);
            },
        });
    };

    return (
        <StepContainer
            stepNumber={6}
            stepName="Review & Submit"
            description="Review all collected data before final submission. Once submitted, the Job Analysis step will be completed."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-900 mb-1">Jobs Defined</p>
                                <p className="text-2xl font-bold text-blue-700">{jobsCount}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-green-900 mb-1">Org Units Mapped</p>
                                <p className="text-2xl font-bold text-green-700">{orgUnitsCount}</p>
                            </div>
                            <Network className="w-8 h-8 text-green-600" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-purple-50 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-purple-900 mb-1">CSFs Generated</p>
                                <p className="text-2xl font-bold text-purple-700">{csfsCount}</p>
                            </div>
                            <Target className="w-8 h-8 text-purple-600" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-orange-900 mb-1">Role Owners</p>
                                <p className="text-2xl font-bold text-orange-700">{roleOwnersCount}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-orange-600" />
                        </div>
                    </Card>
                </div>

                {jobsCount === 0 && (
                    <Card className="p-4 bg-red-50 border-red-200">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-900 font-semibold">
                                No jobs have been finalized. Please go back to finalize jobs.
                            </p>
                        </div>
                    </Card>
                )}

                {/* Policy Snapshot Answers */}
                {Object.keys(policyAnswers).length > 0 && (
                    <Card className="border-2">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => setExpandedPolicy(!expandedPolicy)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-primary" />
                                    <CardTitle className="text-xl">Policy Snapshot Answers</CardTitle>
                                    <Badge variant="secondary">{Object.keys(policyAnswers).length} Answers</Badge>
                                </div>
                                {expandedPolicy ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                        {expandedPolicy && (
                            <CardContent className="space-y-4">
                                {Object.entries(policyAnswers).map(([questionId, answer], index) => (
                                    <div key={questionId} className="p-4 border-2 rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold mb-2">Question {index + 1}</p>
                                                <Badge variant={answer.answer === 'yes' ? 'default' : answer.answer === 'no' ? 'secondary' : 'outline'}>
                                                    {answer.answer === 'yes' ? 'Yes' : answer.answer === 'no' ? 'No' : 'Not sure'}
                                                </Badge>
                                                {answer.conditional_text && (
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        <strong>Details:</strong> {answer.conditional_text}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Job Definitions */}
                {jobsCount > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Job Definitions ({jobsCount})</Label>
                        </div>
                        {Object.entries(jobDefinitions).map(([key, job]) => (
                            <Card key={key} className="border-2">
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => toggleJobExpansion(key)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-lg">{job.job_name}</CardTitle>
                                            {job.grouped_job_keyword_ids && (
                                                <Badge variant="secondary">Grouped Role</Badge>
                                            )}
                                        </div>
                                        {expandedJobs.has(key) ? (
                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {expandedJobs.has(key) && (
                                    <CardContent className="space-y-4">
                                        {job.job_description && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Job Description</Label>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {job.job_description}
                                                </p>
                                            </div>
                                        )}
                                        {job.job_specification && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Job Specification</Label>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <strong>Education:</strong> {job.job_specification.education?.required || 'N/A'} (Required), {job.job_specification.education?.preferred || 'N/A'} (Preferred)
                                                    </div>
                                                    <div>
                                                        <strong>Experience:</strong> {job.job_specification.experience?.required || 'N/A'} (Required), {job.job_specification.experience?.preferred || 'N/A'} (Preferred)
                                                    </div>
                                                    <div>
                                                        <strong>Skills:</strong> {job.job_specification.skills?.required || 'N/A'} (Required), {job.job_specification.skills?.preferred || 'N/A'} (Preferred)
                                                    </div>
                                                    <div>
                                                        <strong>Communication:</strong> {job.job_specification.communication?.required || 'N/A'} (Required), {job.job_specification.communication?.preferred || 'N/A'} (Preferred)
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {job.competency_levels && job.competency_levels.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Competency Levels</Label>
                                                <div className="space-y-2">
                                                    {job.competency_levels.map((level, idx) => (
                                                        <div key={idx} className="text-sm">
                                                            <strong>{level.level}:</strong> {level.description || 'No description'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {job.csfs && job.csfs.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Critical Success Factors</Label>
                                                <div className="space-y-2">
                                                    {job.csfs.map((csf, idx) => (
                                                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <strong>{csf.name}</strong>
                                                                {csf.strategic_importance && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {csf.strategic_importance}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-muted-foreground">{csf.description || 'No description'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Org Chart Mappings */}
                {orgMappings.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                                <Network className="w-5 h-5 text-primary" />
                                Organization Chart Mappings ({orgMappings.length})
                            </Label>
                        </div>
                        {orgMappings.map((mapping) => (
                            <Card key={mapping.id} className="border-2">
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => toggleMappingExpansion(mapping.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Network className="w-5 h-5 text-primary" />
                                            <CardTitle className="text-lg">{mapping.org_unit_name}</CardTitle>
                                        </div>
                                        {expandedMappings.has(mapping.id) ? (
                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {expandedMappings.has(mapping.id) && (
                                    <CardContent className="space-y-3">
                                        {mapping.org_head_name && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-1 block">Organization Head</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {mapping.org_head_name}
                                                    {mapping.org_head_rank && ` (${mapping.org_head_rank})`}
                                                    {mapping.org_head_title && ` - ${mapping.org_head_title}`}
                                                    {mapping.org_head_email && ` - ${mapping.org_head_email}`}
                                                </p>
                                            </div>
                                        )}
                                        {mapping.job_keyword_ids && mapping.job_keyword_ids.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Mapped Jobs</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {mapping.job_keyword_ids.map((jobId) => {
                                                        const job = Object.values(jobDefinitions).find(j => 
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
                                        {mapping.job_specialists && mapping.job_specialists.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Job Specialists</Label>
                                                <div className="space-y-2">
                                                    {mapping.job_specialists.map((specialist, idx) => {
                                                        const job = Object.values(jobDefinitions).find(j => 
                                                            j.job_keyword_id === specialist.job_keyword_id
                                                        );
                                                        return (
                                                            <div key={idx} className="text-sm p-2 bg-muted rounded">
                                                                <strong>{job?.job_name || `Job ${specialist.job_keyword_id}`}:</strong> {specialist.name}
                                                                {specialist.rank && ` (${specialist.rank})`}
                                                                {specialist.email && ` - ${specialist.email}`}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                <StepNavigation
                    onBack={onBack}
                    onNext={handleSubmit}
                    nextLabel="Submit Job Analysis"
                    nextDisabled={processing || jobsCount === 0}
                    nextLoading={processing}
                    showNext={true}
                />
            </div>
        </StepContainer>
    );
}
