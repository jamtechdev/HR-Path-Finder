import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import ModelCard from '@/components/PerformanceSystem/ModelCard';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
    job_keyword?: { id: number; name: string };
}

interface ModelGuidance {
    concept: string;
    key_characteristics: string;
    example: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
    recommended_job_keyword_ids?: number[];
}

interface Props {
    project: {
        id: number;
    };
    jobDefinitions?: JobDefinition[];
    modelGuidance?: {
        mbo?: ModelGuidance;
        bsc?: ModelGuidance;
        okr?: ModelGuidance;
    };
    jobRecommendations?: Record<number, 'mbo' | 'bsc' | 'okr'>;
    onContinue: (assignments: Record<number, 'mbo' | 'bsc' | 'okr'>) => void;
    onBack?: () => void;
}

export default function EvaluationModelAssignmentTab({
    project,
    jobDefinitions = [],
    modelGuidance = {},
    jobRecommendations = {},
    onContinue,
    onBack,
}: Props) {
    const [assignments, setAssignments] = useState<Record<number, 'mbo' | 'bsc' | 'okr'>>({});
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);

    useEffect(() => {
        // Initialize assignments from recommendations
        const initialAssignments: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        jobDefinitions.forEach(job => {
            if (job.job_keyword_id && jobRecommendations[job.job_keyword_id]) {
                initialAssignments[job.id] = jobRecommendations[job.job_keyword_id];
            }
        });
        setAssignments(initialAssignments);
    }, [jobDefinitions, jobRecommendations]);

    const handleDragStart = (e: React.DragEvent, jobId: number) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('jobId', jobId.toString());
    };

    const handleDrop = (modelType: 'mbo' | 'bsc' | 'okr') => {
        if (draggedJobId) {
            setAssignments({ ...assignments, [draggedJobId]: modelType });
            setDraggedJobId(null);
        }
    };

    const handleModelCardClick = (modelType: 'mbo' | 'bsc' | 'okr') => {
        const guidance = modelGuidance[modelType];
        if (guidance) {
            setRightPanelContent({
                concept: guidance.concept,
                key_characteristics: guidance.key_characteristics,
                example: guidance.example,
                pros: guidance.pros,
                cons: guidance.cons,
                best_fit_organizations: guidance.best_fit_organizations,
            });
            setRightPanelOpen(true);
        }
    };

    const handleJobClick = (job: JobDefinition) => {
        // Show guidance for job if available
        if (job.job_keyword_id && jobRecommendations[job.job_keyword_id]) {
            const recommendedModel = jobRecommendations[job.job_keyword_id];
            const guidance = modelGuidance[recommendedModel];
            if (guidance) {
                setRightPanelContent({
                    concept: `Recommended model for ${job.job_name}: ${recommendedModel.toUpperCase()}`,
                    key_characteristics: guidance.key_characteristics,
                    example: guidance.example,
                });
                setRightPanelOpen(true);
            }
        }
    };

    const handleSelectChange = (jobId: number, modelType: 'mbo' | 'bsc' | 'okr' | '' | null) => {
        if (modelType && modelType !== 'remove') {
            setAssignments({ ...assignments, [jobId]: modelType as 'mbo' | 'bsc' | 'okr' });
        } else {
            const newAssignments = { ...assignments };
            delete newAssignments[jobId];
            setAssignments(newAssignments);
        }
    };

    const handleContinue = () => {
        onContinue(assignments);
    };

    const mboJobs = jobDefinitions.filter(j => assignments[j.id] === 'mbo');
    const bscJobs = jobDefinitions.filter(j => assignments[j.id] === 'bsc');
    const okrJobs = jobDefinitions.filter(j => assignments[j.id] === 'okr');
    const unassignedJobs = jobDefinitions.filter(j => !assignments[j.id]);

    const mboGuidance = modelGuidance.mbo || {
        concept: 'Management by Objectives (MBO) evaluates performance based on clearly defined individual goals.',
        key_characteristics: 'Goals are typically quantitative, specific, and individually assigned.',
        example: 'CSF: Revenue Growth → Goal (MBO): Achieve $1.5M in annual sales revenue',
        best_fit_organizations: 'Sales Manager, Recruiter, Production Operator',
    };

    const bscGuidance = modelGuidance.bsc || {
        concept: 'Balanced Scorecard (BSC) defines 1–2 core missions derived from organizational KPIs.',
        key_characteristics: 'Multi-dimensional performance evaluation across Financial, Customer, Internal Process, and Organizational Capability.',
        example: 'Core Mission: Improve recruitment process effectiveness',
        best_fit_organizations: 'HR Manager, Finance Manager, Operations Manager',
    };

    const okrGuidance = modelGuidance.okr || {
        concept: 'Objectives and Key Results (OKR) aligns individual and team efforts with strategic priorities.',
        key_characteristics: 'Goals include qualitative objectives supported by measurable key results.',
        example: 'Objective: Successfully launch a new product feature → Key Result: Release feature by Q3',
        best_fit_organizations: 'R&D Engineer, Product Manager, Software Engineer',
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                        <CardTitle className="text-2xl font-bold">Evaluation Model Assignment</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Assign the most appropriate performance model to each job role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Model Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ModelCard
                                modelType="mbo"
                                title="MBO"
                                concept={mboGuidance.concept}
                                keyCharacteristics={mboGuidance.key_characteristics}
                                example={mboGuidance.example}
                                recommendedJobs={mboGuidance.best_fit_organizations?.split(', ') || []}
                                assignedJobs={mboJobs.map(j => ({ id: j.id, name: j.job_name }))}
                                onDrop={(jobId) => handleDrop('mbo')}
                                onClick={() => handleModelCardClick('mbo')}
                                guidance={mboGuidance}
                            />
                            <ModelCard
                                modelType="bsc"
                                title="BSC"
                                concept={bscGuidance.concept}
                                keyCharacteristics={bscGuidance.key_characteristics}
                                example={bscGuidance.example}
                                recommendedJobs={bscGuidance.best_fit_organizations?.split(', ') || []}
                                assignedJobs={bscJobs.map(j => ({ id: j.id, name: j.job_name }))}
                                onDrop={(jobId) => handleDrop('bsc')}
                                onClick={() => handleModelCardClick('bsc')}
                                guidance={bscGuidance}
                            />
                            <ModelCard
                                modelType="okr"
                                title="OKR"
                                concept={okrGuidance.concept}
                                keyCharacteristics={okrGuidance.key_characteristics}
                                example={okrGuidance.example}
                                recommendedJobs={okrGuidance.best_fit_organizations?.split(', ') || []}
                                assignedJobs={okrJobs.map(j => ({ id: j.id, name: j.job_name }))}
                                onDrop={(jobId) => handleDrop('okr')}
                                onClick={() => handleModelCardClick('okr')}
                                guidance={okrGuidance}
                            />
                        </div>

                        {/* Job Role Pool */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle>Available Job Roles</CardTitle>
                                <CardDescription>
                                    Drag and drop jobs into model cards above, or use the dropdown to assign.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {jobDefinitions.map((job) => {
                                        const assignedModel = assignments[job.id];
                                        const recommendedModel = job.job_keyword_id ? jobRecommendations[job.job_keyword_id] : null;
                                        
                                        return (
                                            <div
                                                key={job.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, job.id)}
                                                className={`
                                                    p-3 border-2 rounded-lg cursor-move transition-all
                                                    ${assignedModel ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}
                                                `}
                                                onClick={() => handleJobClick(job)}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{job.job_name}</span>
                                                </div>
                                                {recommendedModel && !assignedModel && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Recommended: {recommendedModel.toUpperCase()}
                                                    </Badge>
                                                )}
                                                {assignedModel && (
                                                    <Badge variant="default" className="text-xs mt-1">
                                                        Assigned: {assignedModel.toUpperCase()}
                                                    </Badge>
                                                )}
                                                <Select
                                                    value={assignedModel || ''}
                                                    onValueChange={(value) => {
                                                        if (value === 'remove') {
                                                            handleSelectChange(job.id, null);
                                                        } else {
                                                            handleSelectChange(job.id, value as 'mbo' | 'bsc' | 'okr');
                                                        }
                                                    }}
                                                    className="mt-2"
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Assign..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mbo">MBO</SelectItem>
                                                        <SelectItem value="bsc">BSC</SelectItem>
                                                        <SelectItem value="okr">OKR</SelectItem>
                                                        {assignedModel && <SelectItem value="remove">Remove</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assigned Mapping Summary */}
                        <Card className="border-2 border-primary/20">
                            <CardHeader>
                                <CardTitle>Assigned Mapping Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="font-semibold mb-2">MBO:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {mboJobs.length > 0 ? (
                                            mboJobs.map(job => (
                                                <Badge key={job.id} variant="secondary">
                                                    {job.job_name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No jobs assigned</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">BSC:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bscJobs.length > 0 ? (
                                            bscJobs.map(job => (
                                                <Badge key={job.id} variant="secondary">
                                                    {job.job_name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No jobs assigned</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">OKR:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {okrJobs.length > 0 ? (
                                            okrJobs.map(job => (
                                                <Badge key={job.id} variant="secondary">
                                                    {job.job_name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No jobs assigned</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                    {onBack && (
                        <Button 
                            onClick={onBack} 
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button 
                        onClick={handleContinue} 
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                    >
                        Confirm & Proceed
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title="Model Guidance"
            />
        </>
    );
}
