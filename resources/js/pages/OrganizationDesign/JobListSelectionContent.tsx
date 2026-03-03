import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, GripVertical, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobKeyword {
    id: number;
    name: string;
}

interface JobDefinition {
    id: number;
    job_keyword_id: number;
    job_name: string;
    grouped_job_keyword_ids?: number[];
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    suggestedJobs: JobKeyword[];
    selectedJobs: JobDefinition[];
    industry?: string;
    sizeRange?: string;
    onContinue: () => void;
    onBack?: () => void;
}

export default function JobListSelectionContent({ project, suggestedJobs, selectedJobs, industry, onContinue, onBack }: Props) {
    const initialSelectedJobs = selectedJobs;
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>(
        initialSelectedJobs.map(j => j.job_keyword_id).filter(Boolean)
    );
    const [customJob, setCustomJob] = useState('');
    const [groupedJobs, setGroupedJobs] = useState<Array<{ id: string; name: string; jobIds: number[] }>>(() => {
        return initialSelectedJobs
            .filter(j => j.grouped_job_keyword_ids && j.grouped_job_keyword_ids.length > 0)
            .map(j => ({
                id: `group-${j.id}`,
                name: j.job_name,
                jobIds: j.grouped_job_keyword_ids || [],
            }));
    });
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        selected_job_keyword_ids: [] as number[],
        custom_jobs: [] as string[],
        grouped_jobs: [] as Array<{ name: string; job_keyword_ids: number[] }>,
    });

    useEffect(() => {
        const ungroupedJobIds = selectedJobIds.filter(id => 
            !groupedJobs.some(g => g.jobIds.includes(id))
        );
        setData('selected_job_keyword_ids', ungroupedJobIds);
        
        // Filter out grouped jobs with empty names or no job IDs before setting data
        const groupedJobsData = groupedJobs
            .filter(g => g.name.trim() !== '' && g.jobIds.length > 0)
            .map(g => ({
                name: g.name.trim(),
                job_keyword_ids: g.jobIds,
            }));
        setData('grouped_jobs', groupedJobsData);
    }, [selectedJobIds, groupedJobs]);

    const handleJobToggle = (jobId: number) => {
        if (selectedJobIds.includes(jobId)) {
            setSelectedJobIds(selectedJobIds.filter(id => id !== jobId));
        } else {
            setSelectedJobIds([...selectedJobIds, jobId]);
        }
    };

    const handleAddCustomJob = () => {
        if (customJob.trim()) {
            const currentCustomJobs = data.custom_jobs || [];
            setData('custom_jobs', [...currentCustomJobs, customJob.trim()]);
            setCustomJob('');
        }
    };

    const handleDragStart = (e: React.DragEvent, jobId: number) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, groupId?: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGroupId(groupId || null);
    };

    const handleDragLeave = () => {
        setDragOverGroupId(null);
    };

    const handleDrop = (e: React.DragEvent, groupId?: string) => {
        e.preventDefault();
        if (draggedJobId === null) return;

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
            // Create new group with default name from the job
            const job = suggestedJobs.find(j => j.id === draggedJobId);
            const defaultName = job ? `${job.name} Group` : 'Grouped Role';
            const newGroup = {
                id: `group-${Date.now()}`,
                name: defaultName,
                jobIds: [draggedJobId],
            };
            setGroupedJobs([...groupedJobs, newGroup]);
            setSelectedJobIds(selectedJobIds.filter(id => id !== draggedJobId));
        }
        setDraggedJobId(null);
        setDragOverGroupId(null);
    };

    const handleUpdateGroupName = (groupId: string, name: string) => {
        setGroupedJobs(groupedJobs.map(g => 
            g.id === groupId ? { ...g, name } : g
        ));
    };

    const handleDeleteGroup = (groupId: string) => {
        const group = groupedJobs.find(g => g.id === groupId);
        if (group) {
            setSelectedJobIds([...selectedJobIds, ...group.jobIds]);
        }
        setGroupedJobs(groupedJobs.filter(g => g.id !== groupId));
    };

    const handleRemoveFromGroup = (groupId: string, jobId: number) => {
        setGroupedJobs(groupedJobs.map(g => 
            g.id === groupId 
                ? { ...g, jobIds: g.jobIds.filter(id => id !== jobId) }
                : g
        ));
        setSelectedJobIds([...selectedJobIds, jobId]);
    };

    const handleContinue = () => {
        // Validate grouped jobs before proceeding
        const invalidGroups = groupedJobs.filter(g => !g.name.trim() || g.jobIds.length === 0);
        if (invalidGroups.length > 0) {
            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Validate that at least one job is selected
        const hasSelectedJobs = selectedJobIds.length > 0;
        const hasCustomJobs = data.custom_jobs && data.custom_jobs.length > 0;
        const hasGroupedJobs = groupedJobs.length > 0;

        if (!hasSelectedJobs && !hasCustomJobs && !hasGroupedJobs) {
            // Show error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Don't save data here - just proceed to next step
        // Data will be saved only when Review & Submit is clicked
        onContinue();
    };

    // Helper function to get error message for a specific field
    const getErrorMessage = (fieldPath: string): string | undefined => {
        const errorsObj = errors as Record<string, any>;
        if (errorsObj[fieldPath]) {
            return typeof errorsObj[fieldPath] === 'string' ? errorsObj[fieldPath] : undefined;
        }
        // Handle nested errors like grouped_jobs.0.name
        const errorKeys = Object.keys(errorsObj);
        const matchingKey = errorKeys.find(key => key.startsWith(fieldPath));
        return matchingKey && typeof errorsObj[matchingKey] === 'string' ? errorsObj[matchingKey] : undefined;
    };

    // Collect all validation errors
    const allErrors: Array<{ field: string; message: string }> = [];
    const errorsObj = errors as Record<string, any>;
    Object.keys(errorsObj).forEach(key => {
        const errorValue = errorsObj[key];
        if (typeof errorValue === 'string') {
            allErrors.push({ field: key, message: errorValue });
        } else if (Array.isArray(errorValue)) {
            errorValue.forEach((msg, idx) => {
                if (typeof msg === 'string') {
                    allErrors.push({ field: `${key}.${idx}`, message: msg });
                }
            });
        }
    });

    return (
        <div className="space-y-6">
            {/* Display All Validation Errors */}
            {allErrors.length > 0 && (
                <div className="mb-4 p-4 bg-destructive/10 border-2 border-destructive/50 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
                            <span className="text-destructive text-xs font-bold">!</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-destructive mb-2">Validation Errors</p>
                            <ul className="space-y-1">
                                {allErrors.map((error, idx) => (
                                    <li key={idx} className="text-sm text-destructive/90">
                                        • {error.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <Card className="shadow-sm border">
                <CardHeader>
                    <CardTitle>Step 2 — Job List Selection</CardTitle>
                    <CardDescription>
                        Based on your industry ({industry || 'N/A'}) and company size, the following jobs are suggested.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {suggestedJobs.map((job) => (
                            <div
                                key={job.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                    selectedJobIds.includes(job.id)
                                        ? 'border-primary bg-primary/10'
                                        : 'hover:border-primary/50'
                                }`}
                                onClick={() => handleJobToggle(job.id)}
                            >
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={selectedJobIds.includes(job.id)}
                                        onCheckedChange={() => handleJobToggle(job.id)}
                                    />
                                    <span className="font-medium">{job.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                        <Label className="text-sm font-medium">Add Custom Job</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={customJob}
                                onChange={(e) => setCustomJob(e.target.value)}
                                placeholder="Enter custom job name (e.g., R&D Planning, Global Operations)"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCustomJob();
                                    }
                                }}
                            />
                            <Button onClick={handleAddCustomJob} variant="outline" disabled={!customJob.trim()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                        {data.custom_jobs && data.custom_jobs.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.custom_jobs.map((customJobName, index) => (
                                    <Badge key={index} variant="secondary" className="p-2 flex items-center gap-1">
                                        {customJobName}
                                        <button
                                            onClick={() => {
                                                const newCustomJobs = data.custom_jobs.filter((_, i) => i !== index);
                                                setData('custom_jobs', newCustomJobs);
                                            }}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedJobIds.length > 0 && (
                <>
                    {/* Ungrouped Selected Jobs */}
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle>Selected Jobs</CardTitle>
                            <CardDescription>
                                Drag jobs to group them together. Drop on an existing group or in the drop zone below to create a new group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {selectedJobIds
                                    .filter(id => !groupedJobs.some(g => g.jobIds.includes(id)))
                                    .map((jobId) => {
                                        const job = suggestedJobs.find(j => j.id === jobId);
                                        return job ? (
                                            <div
                                                key={jobId}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, jobId)}
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

                    {/* Grouped Jobs */}
                    {groupedJobs.length > 0 && (
                        <Card className="shadow-sm border">
                            <CardHeader>
                                <CardTitle>Grouped Jobs</CardTitle>
                                <CardDescription>
                                    Jobs grouped together will be treated as a single role.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {groupedJobs.map((group, groupIndex) => {
                                    const groupError = getErrorMessage(`grouped_jobs.${groupIndex}.name`);
                                    return (
                                        <div
                                            key={group.id}
                                            className={`p-4 border-2 rounded-lg ${
                                                dragOverGroupId === group.id
                                                    ? 'border-primary bg-primary/10'
                                                    : groupError
                                                    ? 'border-destructive bg-destructive/5'
                                                    : 'border-muted'
                                            }`}
                                            onDragOver={(e) => handleDragOver(e, group.id)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, group.id)}
                                        >
                                            <div className="space-y-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={group.name}
                                                            onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                                                            className={`font-semibold ${groupError ? 'border-destructive' : ''}`}
                                                            placeholder="Group name (required)"
                                                        />
                                                        {groupError && (
                                                            <p className="text-xs text-destructive mt-1">{groupError}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        <div className="flex flex-wrap gap-2">
                                            {group.jobIds.map((jobId) => {
                                                const job = suggestedJobs.find(j => j.id === jobId);
                                                return job ? (
                                                    <Badge key={jobId} variant="outline" className="p-2">
                                                        {job.name}
                                                        <button
                                                            onClick={() => handleRemoveFromGroup(group.id, jobId)}
                                                            className="ml-2 hover:text-destructive"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Drop Zone for New Groups */}
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle>Create New Group</CardTitle>
                            <CardDescription>
                                Drag a job here to create a new grouped role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className={`p-8 border-2 border-dashed rounded-lg text-center ${
                                    dragOverGroupId === 'new-group'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-muted'
                                }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverGroupId('new-group');
                                }}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e)}
                            >
                                <p className="text-muted-foreground">
                                    Drop a job here to create a new group
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

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
                    disabled={selectedJobIds.length === 0 && (!data.custom_jobs || data.custom_jobs.length === 0) && groupedJobs.length === 0} 
                    size="lg"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                >
                    Continue to Job Definition
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
