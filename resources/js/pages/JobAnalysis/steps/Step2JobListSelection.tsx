import React, { useState, useEffect } from 'react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GripVertical, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobSelection } from '../hooks/useJobAnalysisState';

interface JobKeyword {
    id: number;
    name: string;
}

interface Step2JobListSelectionProps {
    suggestedJobs: JobKeyword[];
    jobSelections: JobSelection;
    onSelectionsChange: (selections: JobSelection) => void;
    onContinue: () => void;
    onBack: () => void;
    industry?: string;
    sizeRange?: string;
}

export default function Step2JobListSelection({
    suggestedJobs,
    jobSelections,
    onSelectionsChange,
    onContinue,
    onBack,
    industry,
    sizeRange,
}: Step2JobListSelectionProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>(jobSelections.selected_job_keyword_ids || []);
    const [customJobs, setCustomJobs] = useState<string[]>(jobSelections.custom_jobs || []);
    const [customJobInput, setCustomJobInput] = useState('');
    const [groupedJobs, setGroupedJobs] = useState<Array<{ id: string; name: string; jobIds: number[] }>>(
        (jobSelections.grouped_jobs || []).map((group, idx) => ({
            id: `group-${idx}`,
            name: group.name,
            jobIds: group.job_keyword_ids,
        }))
    );
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

    // Sync state with parent
    useEffect(() => {
        onSelectionsChange({
            selected_job_keyword_ids: selectedJobIds.filter(id => {
                // Exclude jobs that are in groups
                return !groupedJobs.some(g => g.jobIds.includes(id));
            }),
            custom_jobs: customJobs,
            grouped_jobs: groupedJobs.map(g => ({
                name: g.name,
                job_keyword_ids: g.jobIds,
            })),
        });
    }, [selectedJobIds, customJobs, groupedJobs, onSelectionsChange]);

    const handleJobToggle = (jobId: number) => {
        const isInGroup = groupedJobs.some(g => g.jobIds.includes(jobId));
        if (isInGroup) return;

        if (selectedJobIds.includes(jobId)) {
            setSelectedJobIds(selectedJobIds.filter(id => id !== jobId));
        } else {
            setSelectedJobIds([...selectedJobIds, jobId]);
        }
    };

    const handleAddCustomJob = () => {
        const jobName = customJobInput.trim();
        if (jobName && !customJobs.includes(jobName)) {
            setCustomJobs([...customJobs, jobName]);
            setCustomJobInput('');
        }
    };

    const handleRemoveCustomJob = (index: number) => {
        setCustomJobs(customJobs.filter((_, i) => i !== index));
    };

    const handleDragStart = (e: React.DragEvent, jobId: number) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedJobId(null);
        setDragOverGroupId(null);
    };

    const handleDragOver = (e: React.DragEvent, groupId?: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGroupId(groupId || null);
    };

    const handleDrop = (e: React.DragEvent, groupId?: string) => {
        e.preventDefault();
        setDragOverGroupId(null);

        if (!draggedJobId) return;

        const isInGroup = groupedJobs.some(g => g.jobIds.includes(draggedJobId));
        if (isInGroup) {
            setDraggedJobId(null);
            return;
        }

        if (groupId) {
            const group = groupedJobs.find(g => g.id === groupId);
            if (group && !group.jobIds.includes(draggedJobId)) {
                setGroupedJobs(groupedJobs.map(g =>
                    g.id === groupId
                        ? { ...g, jobIds: [...g.jobIds, draggedJobId] }
                        : g
                ));
                setSelectedJobIds(selectedJobIds.filter(id => id !== draggedJobId));
            }
        } else {
            // Create new group
            const job = suggestedJobs.find(j => j.id === draggedJobId);
            const defaultName = job ? `${job.name} Group` : 'Grouped Role';
            setGroupedJobs([...groupedJobs, {
                id: `group-${Date.now()}`,
                name: defaultName,
                jobIds: [draggedJobId],
            }]);
            setSelectedJobIds(selectedJobIds.filter(id => id !== draggedJobId));
        }

        setDraggedJobId(null);
    };

    const handleUpdateGroupName = (groupId: string, name: string) => {
        setGroupedJobs(groupedJobs.map(g =>
            g.id === groupId ? { ...g, name } : g
        ));
    };

    const handleRemoveFromGroup = (groupId: string, jobId: number) => {
        setGroupedJobs(groupedJobs.map(g =>
            g.id === groupId
                ? { ...g, jobIds: g.jobIds.filter(id => id !== jobId) }
                : g
        ));
        if (!selectedJobIds.includes(jobId)) {
            setSelectedJobIds([...selectedJobIds, jobId]);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        const group = groupedJobs.find(g => g.id === groupId);
        if (group) {
            setGroupedJobs(groupedJobs.filter(g => g.id !== groupId));
            // Add jobs back to selected
            const newSelectedIds = [...selectedJobIds];
            group.jobIds.forEach(jobId => {
                if (!newSelectedIds.includes(jobId)) {
                    newSelectedIds.push(jobId);
                }
            });
            setSelectedJobIds(newSelectedIds);
        }
    };

    const hasJobs = selectedJobIds.length > 0 || customJobs.length > 0 || groupedJobs.length > 0;
    const ungroupedSelectedIds = selectedJobIds.filter(id => !groupedJobs.some(g => g.jobIds.includes(id)));

    return (
        <StepContainer
            stepNumber={2}
            stepName="Job List Selection"
            description="Purpose: To define the scope of jobs that exist within the company based on industry characteristics. This stage is not intended to analyze individual jobs. Instead, it is the step where we confirm and finalize the range of jobs that will be designed and structured for the company."
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                        Based on your industry ({industry || 'N/A'}) and company size ({sizeRange || 'N/A'}), we suggest the following job roles that typically exist in similar companies. Please select and adjust only the jobs that are currently in operation at your company.
                    </p>
                </div>

                <div>
                    <Label className="text-lg font-semibold mb-3 block">Suggested Job Roles</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {suggestedJobs.map((job) => {
                            const isInGroup = groupedJobs.some(g => g.jobIds.includes(job.id));
                            const isSelected = ungroupedSelectedIds.includes(job.id);

                            return (
                                <div
                                    key={job.id}
                                    className={cn(
                                        'p-4 border-2 rounded-lg cursor-pointer transition-all',
                                        isSelected
                                            ? 'border-primary bg-primary/10 shadow-md'
                                            : isInGroup
                                            ? 'border-green-500 bg-green-50 opacity-60'
                                            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                                    )}
                                    onClick={() => !isInGroup && handleJobToggle(job.id)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isInGroup}
                                            onCheckedChange={() => !isInGroup && handleJobToggle(job.id)}
                                        />
                                        <span className="font-medium flex-1">{job.name}</span>
                                        {isInGroup && (
                                            <Badge variant="outline" className="ml-auto text-xs">
                                                In Group
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Label className="text-lg font-semibold mb-3 block">Add Custom Job</Label>
                    <div className="flex gap-2">
                        <Input
                            value={customJobInput}
                            onChange={(e) => setCustomJobInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomJob();
                                }
                            }}
                            placeholder="Enter custom job name (e.g., R&D Planning, Global Operations)"
                            className="flex-1"
                        />
                        <Button onClick={handleAddCustomJob} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </div>
                    {customJobs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {customJobs.map((job, index) => (
                                <Badge key={`custom-${index}`} variant="secondary" className="p-2 flex items-center gap-2">
                                    {job}
                                    <button
                                        onClick={() => handleRemoveCustomJob(index)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {ungroupedSelectedIds.length > 0 && (
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Selected Jobs</CardTitle>
                            <CardDescription>
                                Drag jobs to group them together. Drop on an existing group or in the drop zone below to create a new group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {ungroupedSelectedIds.map((jobId) => {
                                    const job = suggestedJobs.find(j => j.id === jobId);
                                    return job ? (
                                        <div
                                            key={jobId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, jobId)}
                                            onDragEnd={handleDragEnd}
                                            className="cursor-move"
                                        >
                                            <Badge variant="secondary" className="p-2 flex items-center gap-1">
                                                <GripVertical className="w-3 h-3" />
                                                {job.name}
                                                <button
                                                    onClick={() => handleJobToggle(jobId)}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {groupedJobs.length > 0 && (
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Grouped Jobs</CardTitle>
                            <CardDescription>
                                Jobs grouped together as a single role. You can drag more jobs into groups or remove jobs from groups.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {groupedJobs.map((group) => (
                                <div
                                    key={group.id}
                                    className={cn(
                                        'p-4 border-2 rounded-lg',
                                        dragOverGroupId === group.id ? 'border-primary bg-primary/10' : 'border-muted'
                                    )}
                                    onDragOver={(e) => handleDragOver(e, group.id)}
                                    onDrop={(e) => handleDrop(e, group.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Input
                                            value={group.name}
                                            onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                                            className="font-semibold max-w-xs"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteGroup(group.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.jobIds.map((jobId) => {
                                            const job = suggestedJobs.find(j => j.id === jobId);
                                            return job ? (
                                                <Badge key={jobId} variant="outline" className="p-2 flex items-center gap-1">
                                                    {job.name}
                                                    <button
                                                        onClick={() => handleRemoveFromGroup(group.id, jobId)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div
                    className={cn(
                        'p-8 border-2 border-dashed rounded-lg text-center',
                        dragOverGroupId === null && draggedJobId ? 'border-primary bg-primary/5' : 'border-muted'
                    )}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e)}
                >
                    <p className="text-muted-foreground">
                        Drop jobs here to create a new grouped role
                    </p>
                </div>

                <StepNavigation
                    onBack={onBack}
                    onNext={onContinue}
                    nextLabel="Continue to Job Definition"
                    nextDisabled={!hasJobs}
                />
            </div>
        </StepContainer>
    );
}
