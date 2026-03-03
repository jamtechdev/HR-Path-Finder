import React, { useState, useEffect, useMemo } from 'react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, User, TrendingUp, Target, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobDefinition, JobSelection } from '../hooks/useJobAnalysisState';

interface JobKeyword {
    id: number;
    name: string;
}

interface Template {
    job_description?: string;
    job_specification?: {
        education: { required: string; preferred: string };
        experience: { required: string; preferred: string };
        skills: { required: string; preferred: string };
        communication: { required: string; preferred: string };
    };
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
}

interface Step3JobDefinitionProps {
    jobSelections: JobSelection;
    suggestedJobs: JobKeyword[];
    templates: Record<number | string, Template>;
    jobDefinitions: Record<string, JobDefinition>;
    onDefinitionsChange: (definitions: Record<string, JobDefinition>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function Step3JobDefinition({
    jobSelections,
    suggestedJobs,
    templates,
    jobDefinitions,
    onDefinitionsChange,
    onContinue,
    onBack,
}: Step3JobDefinitionProps) {
    const [activeJobKey, setActiveJobKey] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'description' | 'specification' | 'competency' | 'csfs'>('description');
    const [localDefinitions, setLocalDefinitions] = useState<Record<string, JobDefinition>>(jobDefinitions);

    // Generate all jobs list (selected, custom, grouped)
    const allJobs = useMemo(() => {
        const jobs: Array<{ key: string; name: string; job_keyword_id?: number; grouped_job_keyword_ids?: number[] }> = [];
        const addedJobIds = new Set<number>();

        // Add individual selected jobs
        jobSelections.selected_job_keyword_ids.forEach((jobId, index) => {
            if (!addedJobIds.has(jobId)) {
                const job = suggestedJobs.find(j => j.id === jobId);
                if (job) {
                    jobs.push({ key: `job-${jobId}`, name: job.name, job_keyword_id: jobId });
                    addedJobIds.add(jobId);
                }
            }
        });

        // Add custom jobs
        jobSelections.custom_jobs.forEach((customJob, index) => {
            jobs.push({ key: `custom-${index}-${customJob}`, name: customJob });
        });

        // Add grouped jobs
        jobSelections.grouped_jobs.forEach((group, index) => {
            const sortedIds = [...group.job_keyword_ids].sort((a, b) => a - b).join('-');
            jobs.push({
                key: `group-${sortedIds}-${index}`,
                name: group.name,
                grouped_job_keyword_ids: group.job_keyword_ids,
            });
        });

        return jobs;
    }, [jobSelections, suggestedJobs]);

    // Initialize active job
    useEffect(() => {
        if (!activeJobKey && allJobs.length > 0) {
            setActiveJobKey(allJobs[0].key);
        }
    }, [activeJobKey, allJobs]);

    // Initialize definitions from templates
    useEffect(() => {
        const newDefinitions: Record<string, JobDefinition> = { ...localDefinitions };

        allJobs.forEach(job => {
            if (!newDefinitions[job.key]) {
                const template = templates[job.job_keyword_id || job.key] || {};
                newDefinitions[job.key] = {
                    job_keyword_id: job.job_keyword_id,
                    job_name: job.name,
                    grouped_job_keyword_ids: job.grouped_job_keyword_ids,
                    job_description: template.job_description || '',
                    job_specification: template.job_specification || {
                        education: { required: '', preferred: '' },
                        experience: { required: '', preferred: '' },
                        skills: { required: '', preferred: '' },
                        communication: { required: '', preferred: '' },
                    },
                    competency_levels: template.competency_levels || [
                        { level: 'LV1', description: '' },
                        { level: 'LV2', description: '' },
                        { level: 'LV3', description: '' },
                    ],
                    csfs: template.csfs || [],
                };
            }
        });

        setLocalDefinitions(newDefinitions);
        onDefinitionsChange(newDefinitions);
    }, [allJobs, templates]);

    const currentJob = allJobs.find(j => j.key === activeJobKey);
    const currentJobDef = activeJobKey ? localDefinitions[activeJobKey] : null;

    const updateJobDefinition = (key: string, updates: Partial<JobDefinition>) => {
        const updated = {
            ...localDefinitions,
            [key]: { ...localDefinitions[key], ...updates },
        };
        setLocalDefinitions(updated);
        onDefinitionsChange(updated);
    };

    const handleAddCompetencyLevel = () => {
        if (!activeJobKey || !currentJobDef) return;
        const levels = currentJobDef.competency_levels || [];
        const newLevel = `LV${levels.length + 1}`;
        updateJobDefinition(activeJobKey, {
            competency_levels: [...levels, { level: newLevel, description: '' }],
        });
    };

    const handleRemoveCompetencyLevel = (index: number) => {
        if (!activeJobKey || !currentJobDef) return;
        const levels = currentJobDef.competency_levels || [];
        updateJobDefinition(activeJobKey, {
            competency_levels: levels.filter((_, i) => i !== index),
        });
    };

    const handleUpdateCompetencyLevel = (index: number, field: 'level' | 'description', value: string) => {
        if (!activeJobKey || !currentJobDef) return;
        const levels = [...(currentJobDef.competency_levels || [])];
        levels[index] = { ...levels[index], [field]: value };
        updateJobDefinition(activeJobKey, { competency_levels: levels });
    };

    const handleAddCSF = () => {
        if (!activeJobKey || !currentJobDef) return;
        const csfs = currentJobDef.csfs || [];
        updateJobDefinition(activeJobKey, {
            csfs: [...csfs, { name: '', description: '', strategic_importance: 'medium' }],
        });
    };

    const handleRemoveCSF = (index: number) => {
        if (!activeJobKey || !currentJobDef) return;
        const csfs = currentJobDef.csfs || [];
        updateJobDefinition(activeJobKey, {
            csfs: csfs.filter((_, i) => i !== index),
        });
    };

    const handleUpdateCSF = (index: number, field: string, value: any) => {
        if (!activeJobKey || !currentJobDef) return;
        const csfs = [...(currentJobDef.csfs || [])];
        csfs[index] = { ...csfs[index], [field]: value };
        updateJobDefinition(activeJobKey, { csfs });
    };

    if (!currentJob || !currentJobDef) {
        return (
            <StepContainer stepNumber={3} stepName="Job Definition">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs selected. Please go back to Job List Selection.</p>
                </div>
            </StepContainer>
        );
    }

    return (
        <StepContainer
            stepNumber={3}
            stepName="Job Definition"
            description="For each selected role, create and finalize a Job Definition Document including Job Description, Job Specification, Job Competency Levels, and Critical Success Factors (CSFs)."
        >
            <div className="space-y-6">
                <div>
                    <Label className="text-lg font-semibold mb-3 block">Select Job to Define</Label>
                    <div className="flex flex-wrap gap-2">
                        {allJobs.map((job, index) => (
                            <Button
                                key={`job-btn-${job.key}-${index}`}
                                variant={activeJobKey === job.key ? 'default' : 'outline'}
                                onClick={() => {
                                    setActiveJobKey(job.key);
                                    setActiveTab('description');
                                }}
                                className="flex items-center gap-2"
                            >
                                {job.name}
                                {job.grouped_job_keyword_ids && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        Grouped
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="description" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Description
                        </TabsTrigger>
                        <TabsTrigger value="specification" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Specification
                        </TabsTrigger>
                        <TabsTrigger value="competency" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Competency
                        </TabsTrigger>
                        <TabsTrigger value="csfs" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            CSFs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="space-y-4 mt-6">
                        <div>
                            <Label className="text-base font-semibold mb-2 block">Job Description</Label>
                            <Textarea
                                value={currentJobDef.job_description || ''}
                                onChange={(e) => updateJobDefinition(activeJobKey, { job_description: e.target.value })}
                                placeholder="Enter job purpose and key responsibilities..."
                                className="min-h-[200px]"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="specification" className="space-y-6 mt-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="p-4">
                                <Label className="text-sm font-semibold mb-3 block">Education</Label>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Required</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.education?.required || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    education: {
                                                        ...currentJobDef.job_specification!.education,
                                                        required: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Required education"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Preferred</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.education?.preferred || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    education: {
                                                        ...currentJobDef.job_specification!.education,
                                                        preferred: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Preferred education"
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <Label className="text-sm font-semibold mb-3 block">Experience</Label>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Required</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.experience?.required || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    experience: {
                                                        ...currentJobDef.job_specification!.experience,
                                                        required: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Required experience"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Preferred</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.experience?.preferred || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    experience: {
                                                        ...currentJobDef.job_specification!.experience,
                                                        preferred: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Preferred experience"
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <Label className="text-sm font-semibold mb-3 block">Skills</Label>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Required</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.skills?.required || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    skills: {
                                                        ...currentJobDef.job_specification!.skills,
                                                        required: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Required skills"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Preferred</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.skills?.preferred || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    skills: {
                                                        ...currentJobDef.job_specification!.skills,
                                                        preferred: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Preferred skills"
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <Label className="text-sm font-semibold mb-3 block">Communication</Label>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Required</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.communication?.required || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    communication: {
                                                        ...currentJobDef.job_specification!.communication,
                                                        required: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Required communication"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Preferred</Label>
                                        <Input
                                            value={currentJobDef.job_specification?.communication?.preferred || ''}
                                            onChange={(e) => updateJobDefinition(activeJobKey, {
                                                job_specification: {
                                                    ...currentJobDef.job_specification!,
                                                    communication: {
                                                        ...currentJobDef.job_specification!.communication,
                                                        preferred: e.target.value,
                                                    },
                                                },
                                            })}
                                            placeholder="Preferred communication"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="competency" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Competency Levels</Label>
                            <Button onClick={handleAddCompetencyLevel} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Level
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {(currentJobDef.competency_levels || []).map((level, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Input
                                            value={level.level}
                                            onChange={(e) => handleUpdateCompetencyLevel(index, 'level', e.target.value)}
                                            className="w-24 flex-shrink-0"
                                            placeholder="LV1"
                                        />
                                        <Textarea
                                            value={level.description}
                                            onChange={(e) => handleUpdateCompetencyLevel(index, 'description', e.target.value)}
                                            placeholder="Enter competency level description..."
                                            className="flex-1"
                                        />
                                        {(currentJobDef.competency_levels || []).length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCompetencyLevel(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="csfs" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Critical Success Factors (CSFs)</Label>
                            <Button onClick={handleAddCSF} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add CSF
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {(currentJobDef.csfs || []).map((csf, index) => (
                                <Card key={index} className="p-5 border-2">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <Label className="text-sm font-semibold">CSF Name</Label>
                                                    <Input
                                                        value={csf.name}
                                                        onChange={(e) => handleUpdateCSF(index, 'name', e.target.value)}
                                                        placeholder="Enter CSF name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-semibold">Description</Label>
                                                    <Textarea
                                                        value={csf.description}
                                                        onChange={(e) => handleUpdateCSF(index, 'description', e.target.value)}
                                                        placeholder="Enter CSF description..."
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-semibold mb-2 block">Strategic Importance</Label>
                                                    <RadioGroup
                                                        value={csf.strategic_importance || 'medium'}
                                                        onValueChange={(value) => handleUpdateCSF(index, 'strategic_importance', value)}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="high" id={`csf-${index}-high`} />
                                                            <Label htmlFor={`csf-${index}-high`}>High</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="medium" id={`csf-${index}-medium`} />
                                                            <Label htmlFor={`csf-${index}-medium`}>Medium</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="low" id={`csf-${index}-low`} />
                                                            <Label htmlFor={`csf-${index}-low`}>Low</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCSF(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {(!currentJobDef.csfs || currentJobDef.csfs.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No CSFs added yet. Click "Add CSF" to add critical success factors.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <StepNavigation
                    onBack={onBack}
                    onNext={onContinue}
                    nextLabel="Continue to Finalization"
                />
            </div>
        </StepContainer>
    );
}
