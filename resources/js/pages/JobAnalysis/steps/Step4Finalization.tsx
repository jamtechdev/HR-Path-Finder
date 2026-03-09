import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, FileText, CheckCircle2, Network, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuccessModal from '@/components/Modals/SuccessModal';
import type { JobDefinition, OrgChartMapping } from '../hooks/useJobAnalysisState';

interface Step4FinalizationProps {
    projectId: number;
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    policyAnswers?: Record<number, { answer: string; conditional_text?: string }>;
    jobSelections?: {
        selected_job_keyword_ids: number[];
        custom_jobs: string[];
        grouped_jobs: Array<{ name: string; job_keyword_ids: number[] }>;
    };
    onContinue: () => void;
    onBack: () => void;
}

export default function Step4Finalization({
    projectId,
    jobDefinitions,
    orgMappings,
    policyAnswers = {},
    jobSelections = {
        selected_job_keyword_ids: [],
        custom_jobs: [],
        grouped_jobs: [],
    },
    onContinue,
    onBack,
}: Step4FinalizationProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [expandedMappings, setExpandedMappings] = useState<Set<string>>(new Set());
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleFinalize = () => {
        setIsSubmitting(true);
        
        // Prepare data for finalize endpoint
        const finalizeData = {
            policy_answers: Object.entries(policyAnswers).map(([questionId, answer]) => ({
                question_id: parseInt(questionId),
                answer: answer.answer,
                conditional_text: answer.conditional_text || null,
            })),
            job_selections: {
                selected_job_keyword_ids: jobSelections.selected_job_keyword_ids || [],
                custom_jobs: jobSelections.custom_jobs || [],
                grouped_jobs: jobSelections.grouped_jobs || [],
            },
            job_definitions: Object.values(jobDefinitions).map(job => ({
                job_keyword_id: job.job_keyword_id || null,
                job_name: job.job_name,
                grouped_job_keyword_ids: job.grouped_job_keyword_ids || null,
                job_description: job.job_description || null,
                job_specification: job.job_specification || null,
                competency_levels: job.competency_levels || null,
                csfs: job.csfs || null,
            })),
            org_chart_mappings: orgMappings.map(mapping => ({
                org_unit_name: mapping.org_unit_name,
                job_keyword_ids: mapping.job_keyword_ids || [],
                org_head_name: mapping.org_head_name || null,
                org_head_rank: mapping.org_head_rank || null,
                org_head_title: mapping.org_head_title || null,
                org_head_email: mapping.org_head_email || null,
                job_specialists: mapping.job_specialists || [],
            })),
        };

        router.post(`/hr-manager/job-analysis/${projectId}/finalize`, finalizeData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowSuccessModal(true);
                toast({ title: 'Job list finalized', description: 'Job definitions have been finalized successfully.' });
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Failed to finalize. Please try again.');
                toast({ title: 'Finalization failed', description: desc, variant: 'destructive' });
                setIsSubmitting(false);
            },
        });
    };

    const handleGoToPerformance = () => {
        setShowSuccessModal(false);
        router.visit(`/hr-manager/performance-system/${projectId}/overview`);
    };

    const jobCount = Object.keys(jobDefinitions).length;
    const hasJobs = jobCount > 0;

    return (
        <StepContainer
            stepNumber={4}
            stepName="Finalization of Job List"
            description="The job structure and Job Definition documents, reviewed and refined during the Job Definition stage, are finalized. The finalized job standards are used as baseline inputs for the subsequent design of the performance management system and the compensation system."
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                        Please review all job definitions below. Once you confirm, all jobs will be finalized globally. This is a global finalization of the entire job configuration, not a per-job confirmation.
                    </p>
                </div>

                {!hasJobs && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-red-900 font-semibold">
                                No job definitions found. Please go back to complete job definitions.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {hasJobs && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">
                                Job Definitions ({jobCount})
                            </Label>
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

                {/* Org Chart Mappings Section */}
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

                <Card className="border-2 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="finalization-confirm"
                                checked={confirmed}
                                onCheckedChange={(checked) => setConfirmed(checked === true)}
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor="finalization-confirm"
                                    className="text-base font-semibold cursor-pointer"
                                >
                                    I confirm that I have reviewed all job definitions and wish to finalize them globally.
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Once finalized, these job definitions will be used for the performance management and compensation systems.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        disabled={isSubmitting}
                    >
                        Back
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onContinue}
                            disabled={!confirmed || !hasJobs || isSubmitting}
                        >
                            Continue to Org Mapping
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={!confirmed || !hasJobs || isSubmitting}
                            className="min-w-[150px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Finalizing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Finalize & Submit
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title="Job Analysis Finalized Successfully!"
                    message="You have finalized job analysis. You can now proceed to Performance System."
                    nextStepLabel="Go to Performance System"
                    onNextStep={handleGoToPerformance}
                />
            </div>
        </StepContainer>
    );
}
