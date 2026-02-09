import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
}

interface OrgChartMapping {
    id: number;
    org_unit_name: string;
    job_keyword_ids?: number[];
    org_head?: {
        name: string;
        rank: string;
        title: string;
        email: string;
    };
    job_specialists?: Array<{
        name: string;
        rank: string;
        title: string;
        email: string;
        job_keyword_id: number;
    }>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
    mappings: OrgChartMapping[];
    organizationalCharts?: Record<string, string>;
}

export default function OrgChartMapping({ project, jobDefinitions, mappings, organizationalCharts }: Props) {
    const [orgUnits, setOrgUnits] = useState<Array<OrgChartMapping & { id?: number }>>(
        mappings.length > 0 ? mappings : [{ org_unit_name: '', job_keyword_ids: [], org_head: null, job_specialists: [] }]
    );
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [dragOverUnitIndex, setDragOverUnitIndex] = useState<number | null>(null);

    const { data, setData, post, processing } = useForm({
        mappings: [] as OrgChartMapping[],
    });

    useEffect(() => {
        setData('mappings', orgUnits.filter(unit => unit.org_unit_name));
    }, [orgUnits]);

    const addOrgUnit = () => {
        setOrgUnits([...orgUnits, { org_unit_name: '', job_keyword_ids: [], org_head: null, job_specialists: [] }]);
    };

    const updateOrgUnit = (index: number, updates: Partial<OrgChartMapping>) => {
        const newUnits = [...orgUnits];
        newUnits[index] = { ...newUnits[index], ...updates };
        setOrgUnits(newUnits);
    };

    const handleDragStart = (e: React.DragEvent, jobId: number) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, unitIndex: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverUnitIndex(unitIndex);
    };

    const handleDragLeave = () => {
        setDragOverUnitIndex(null);
    };

    const handleDrop = (e: React.DragEvent, unitIndex: number) => {
        e.preventDefault();
        setDragOverUnitIndex(null);

        if (!draggedJobId) return;

        const jobDef = jobDefinitions.find(j => j.id === draggedJobId);
        if (!jobDef) return;

        const newUnits = [...orgUnits];
        const unit = newUnits[unitIndex];
        
        // Add job to unit's job_keyword_ids if not already present
        const currentJobIds = unit.job_keyword_ids || [];
        if (jobDef.job_keyword_id && !currentJobIds.includes(jobDef.job_keyword_id)) {
            newUnits[unitIndex] = {
                ...unit,
                job_keyword_ids: [...currentJobIds, jobDef.job_keyword_id],
            };
            setOrgUnits(newUnits);
        }

        setDraggedJobId(null);
    };

    const removeJobFromUnit = (unitIndex: number, jobKeywordId: number) => {
        const newUnits = [...orgUnits];
        const unit = newUnits[unitIndex];
        newUnits[unitIndex] = {
            ...unit,
            job_keyword_ids: (unit.job_keyword_ids || []).filter(id => id !== jobKeywordId),
        };
        setOrgUnits(newUnits);
    };

    const addJobSpecialist = (unitIndex: number) => {
        const newUnits = [...orgUnits];
        if (!newUnits[unitIndex].job_specialists) {
            newUnits[unitIndex].job_specialists = [];
        }
        newUnits[unitIndex].job_specialists.push({
            name: '',
            rank: '',
            title: '',
            email: '',
            job_keyword_id: jobDefinitions[0]?.job_keyword_id || 0,
        });
        setOrgUnits(newUnits);
    };

    const handleSubmit = () => {
        post(`/hr-manager/job-analysis/${project.id}/org-chart-mapping`, {
            onSuccess: () => {
                // After saving, submit the Job Analysis step
                router.post(`/hr-manager/job-analysis/${project.id}/submit`, {}, {
                    onSuccess: () => {
                        router.visit('/hr-manager/dashboard');
                    },
                });
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Org Chart Mapping - ${project?.company?.name || 'Job Analysis'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Organization Chart Mapping</h1>
                            <p className="text-muted-foreground">
                                Map finalized job definitions to organizational units and assign personnel.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Panel - Org Chart (70%) */}
                            <div className="lg:col-span-2 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organization Chart</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {organizationalCharts && Object.keys(organizationalCharts).length > 0 ? (
                                            <div className="space-y-2">
                                                {Object.entries(organizationalCharts).map(([year, path]) => (
                                                    <div key={year} className="p-2 border rounded">
                                                        <p className="text-sm font-medium">{year}</p>
                                                        <img src={`/storage/${path}`} alt={`Org chart ${year}`} className="mt-2 max-w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">
                                                Organization chart will be displayed here. For MVP, admin can manually create diagrams.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Panel - Job Keywords (30%) */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Finalized Jobs</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {jobDefinitions.map((job) => (
                                                <div
                                                    key={job.id}
                                                    className="p-2 border rounded cursor-move hover:bg-muted flex items-center gap-2"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, job.id)}
                                                >
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <span>{job.job_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Organization Units */}
                        <Card className="mt-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Organization Units</CardTitle>
                                    <Button variant="outline" size="sm" onClick={addOrgUnit}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Unit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {orgUnits.map((unit, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 border-2 rounded-lg space-y-4 ${
                                            dragOverUnitIndex === index
                                                ? 'border-primary bg-primary/10'
                                                : 'border-muted'
                                        }`}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        <Input
                                            placeholder="Organization Unit Name"
                                            value={unit.org_unit_name || ''}
                                            onChange={(e) => updateOrgUnit(index, { org_unit_name: e.target.value })}
                                        />

                                        {/* Assigned Jobs */}
                                        {unit.job_keyword_ids && unit.job_keyword_ids.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Assigned Jobs</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {unit.job_keyword_ids.map((jobKeywordId) => {
                                                        const jobDef = jobDefinitions.find(j => j.job_keyword_id === jobKeywordId);
                                                        return jobDef ? (
                                                            <Badge key={jobKeywordId} variant="secondary" className="p-2">
                                                                {jobDef.job_name}
                                                                <button
                                                                    onClick={() => removeJobFromUnit(index, jobKeywordId)}
                                                                    className="ml-2 hover:text-destructive"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Drop Zone Hint */}
                                        {(!unit.job_keyword_ids || unit.job_keyword_ids.length === 0) && (
                                            <div className="p-4 border-2 border-dashed rounded text-center text-muted-foreground">
                                                Drag a job here to assign it to this unit
                                            </div>
                                        )}

                                        {/* Organization Head */}
                                        <div className="space-y-2">
                                            <Label>Organization Head</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Name"
                                                    value={unit.org_head?.name || ''}
                                                    onChange={(e) => updateOrgUnit(index, {
                                                        org_head: { ...unit.org_head, name: e.target.value },
                                                    })}
                                                />
                                                <Input
                                                    placeholder="Rank"
                                                    value={unit.org_head?.rank || ''}
                                                    onChange={(e) => updateOrgUnit(index, {
                                                        org_head: { ...unit.org_head, rank: e.target.value },
                                                    })}
                                                />
                                                <Input
                                                    placeholder="Title"
                                                    value={unit.org_head?.title || ''}
                                                    onChange={(e) => updateOrgUnit(index, {
                                                        org_head: { ...unit.org_head, title: e.target.value },
                                                    })}
                                                />
                                                <Input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={unit.org_head?.email || ''}
                                                    onChange={(e) => updateOrgUnit(index, {
                                                        org_head: { ...unit.org_head, email: e.target.value },
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        {/* Job Specialists */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Job Specialists</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addJobSpecialist(index)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Specialist
                                                </Button>
                                            </div>
                                            {unit.job_specialists?.map((specialist, specIndex) => (
                                                <div key={specIndex} className="p-3 border rounded space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            placeholder="Name"
                                                            value={specialist.name}
                                                            onChange={(e) => {
                                                                const newSpecialists = [...(unit.job_specialists || [])];
                                                                newSpecialists[specIndex].name = e.target.value;
                                                                updateOrgUnit(index, { job_specialists: newSpecialists });
                                                            }}
                                                        />
                                                        <Input
                                                            placeholder="Rank"
                                                            value={specialist.rank}
                                                            onChange={(e) => {
                                                                const newSpecialists = [...(unit.job_specialists || [])];
                                                                newSpecialists[specIndex].rank = e.target.value;
                                                                updateOrgUnit(index, { job_specialists: newSpecialists });
                                                            }}
                                                        />
                                                        <Input
                                                            placeholder="Title"
                                                            value={specialist.title}
                                                            onChange={(e) => {
                                                                const newSpecialists = [...(unit.job_specialists || [])];
                                                                newSpecialists[specIndex].title = e.target.value;
                                                                updateOrgUnit(index, { job_specialists: newSpecialists });
                                                            }}
                                                        />
                                                        <Input
                                                            type="email"
                                                            placeholder="Email"
                                                            value={specialist.email}
                                                            onChange={(e) => {
                                                                const newSpecialists = [...(unit.job_specialists || [])];
                                                                newSpecialists[specIndex].email = e.target.value;
                                                                updateOrgUnit(index, { job_specialists: newSpecialists });
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newSpecialists = unit.job_specialists?.filter((_, i) => i !== specIndex) || [];
                                                            updateOrgUnit(index, { job_specialists: newSpecialists });
                                                        }}
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleSubmit} disabled={processing} size="lg">
                                Save & Complete
                            </Button>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
