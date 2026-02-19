import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export default function JobListSelection({ project, suggestedJobs, selectedJobs, selectedJobs: initialSelectedJobs }: Props) {
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>(
        initialSelectedJobs.map(j => j.job_keyword_id).filter(Boolean)
    );
    const [customJob, setCustomJob] = useState('');
    const [groupedJobs, setGroupedJobs] = useState<Array<{ id: string; name: string; jobIds: number[] }>>(() => {
        // Initialize from existing grouped jobs
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

    const { data, setData, post, processing } = useForm({
        selected_job_keyword_ids: [] as number[],
        grouped_jobs: [] as Array<{ name: string; job_keyword_ids: number[] }>,
    });

    useEffect(() => {
        // Get ungrouped selected jobs
        const ungroupedJobIds = selectedJobIds.filter(id => 
            !groupedJobs.some(g => g.jobIds.includes(id))
        );
        setData('selected_job_keyword_ids', ungroupedJobIds);
        
        // Update grouped jobs data
        const groupedJobsData = groupedJobs.map(g => ({
            name: g.name,
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
            // In real implementation, this would create a new job keyword
            // For now, we'll just add it to the list
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
        if (groupId) {
            setDragOverGroupId(groupId);
        }
    };

    const handleDragLeave = () => {
        setDragOverGroupId(null);
    };

    const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
        e.preventDefault();
        setDragOverGroupId(null);

        if (!draggedJobId) return;

        // Remove job from any existing group
        const updatedGroups = groupedJobs.map(group => ({
            ...group,
            jobIds: group.jobIds.filter(id => id !== draggedJobId),
        })).filter(group => group.jobIds.length > 0);

        if (targetGroupId) {
            // Add to existing group
            const targetGroup = updatedGroups.find(g => g.id === targetGroupId);
            if (targetGroup) {
                targetGroup.jobIds.push(draggedJobId);
                setGroupedJobs(updatedGroups);
            }
        } else {
            // Create new group
            const jobName = suggestedJobs.find(j => j.id === draggedJobId)?.name || 'Grouped Role';
            updatedGroups.push({
                id: `group-${Date.now()}`,
                name: jobName,
                jobIds: [draggedJobId],
            });
            setGroupedJobs(updatedGroups);
        }

        setDraggedJobId(null);
    };

    const handleUpdateGroupName = (groupId: string, newName: string) => {
        setGroupedJobs(groupedJobs.map(g => 
            g.id === groupId ? { ...g, name: newName } : g
        ));
    };

    const handleRemoveFromGroup = (groupId: string, jobId: number) => {
        setGroupedJobs(groupedJobs.map(g => {
            if (g.id === groupId) {
                const updatedJobIds = g.jobIds.filter(id => id !== jobId);
                if (updatedJobIds.length === 0) {
                    return null; // Remove group if empty
                }
                return { ...g, jobIds: updatedJobIds };
            }
            return g;
        }).filter(Boolean) as Array<{ id: string; name: string; jobIds: number[] }>);
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroupedJobs(groupedJobs.filter(g => g.id !== groupId));
    };

    const handleSubmit = () => {
        post(`/hr-manager/job-analysis/${project.id}/job-list-selection`, {
            onSuccess: () => {
                router.visit(`/hr-manager/job-analysis/${project.id}/job-definition`);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Job List Selection - ${project?.company?.name || 'Job Analysis'}`} />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Job List Selection</h1>
                            <p className="text-muted-foreground">
                                Select relevant jobs from the suggested list. You can group multiple jobs into a single role.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Suggested Jobs</CardTitle>
                                <CardDescription>
                                    Based on your industry ({project.industry || 'N/A'}) and company size, the following jobs are suggested.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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

                                <div className="flex items-center gap-2 pt-4 border-t">
                                    <Input
                                        value={customJob}
                                        onChange={(e) => setCustomJob(e.target.value)}
                                        placeholder="Add custom job name"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddCustomJob();
                                            }
                                        }}
                                    />
                                    <Button onClick={handleAddCustomJob} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {selectedJobIds.length > 0 && (
                            <>
                                {/* Ungrouped Selected Jobs */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>Selected Jobs</CardTitle>
                                        <CardDescription>
                                            Drag jobs to group them together. Drop on an existing group or in the drop zone below to create a new group.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle>Grouped Jobs</CardTitle>
                                            <CardDescription>
                                                Jobs grouped together will be treated as a single role.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {groupedJobs.map((group) => (
                                                <div
                                                    key={group.id}
                                                    className={`p-4 border-2 rounded-lg ${
                                                        dragOverGroupId === group.id
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-muted'
                                                    }`}
                                                    onDragOver={(e) => handleDragOver(e, group.id)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, group.id)}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Input
                                                            value={group.name}
                                                            onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                                                            className="font-semibold"
                                                            placeholder="Group name"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteGroup(group.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
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
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Drop Zone for New Groups */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>Create New Group</CardTitle>
                                        <CardDescription>
                                            Drag a job here to create a new grouped role.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
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

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/policy-snapshot`)}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing || selectedJobIds.length === 0}>
                                Continue to Job Definition
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
        </AppLayout>
    );
}
