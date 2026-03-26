import { useForm, router } from '@inertiajs/react';
import { Plus, X, GripVertical, Layout, List, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';
import ChartGallery from '@/components/CEO/Review/ChartGallery';
import DiagramEditor from '@/components/OrgChart/DiagramEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import { mergeJobAnalysisState, buildSubmitPayload } from '@/pages/JobAnalysis/utils/jobAnalysisStorage';

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
    onSubmit?: () => void;
}

export default function OrgChartMappingContent({ project, jobDefinitions, mappings, organizationalCharts, onSubmit: externalOnSubmit }: Props) {
    const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
    const [submitting, setSubmitting] = useState(false);
    const [orgUnits, setOrgUnits] = useState<Array<OrgChartMapping & { id?: number }>>(
        mappings.length > 0 ? mappings : [{ org_unit_name: '', job_keyword_ids: [], org_head: null, job_specialists: [] }]
    );
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [dragOverUnitIndex, setDragOverUnitIndex] = useState<number | null>(null);
    const [diagramNodes, setDiagramNodes] = useState<Node[]>([]);
    const [diagramEdges, setDiagramEdges] = useState<Edge[]>([]);
    const { toast } = useToast();

    const { setData } = useForm({
        mappings: [] as OrgChartMapping[],
    });

    useEffect(() => {
        setData('mappings', orgUnits.filter(unit => unit.org_unit_name));
    }, [orgUnits]);

    // Convert mappings to diagram nodes on mount and when switching to diagram view
    useEffect(() => {
        if (viewMode === 'diagram') {
            const sourceData = orgUnits.length > 0 && orgUnits[0].org_unit_name ? orgUnits : mappings;
            
            if (sourceData.length > 0) {
                const nodes: Node[] = sourceData.map((mapping, index) => ({
                    id: `node-${(mapping as any).id || index}`,
                    type: 'orgNode',
                    position: {
                        x: (index % 3) * 300,
                        y: Math.floor(index / 3) * 200,
                    },
                    data: {
                        label: mapping.org_unit_name || 'Organization',
                        orgUnitName: mapping.org_unit_name || '',
                        jobKeywordIds: mapping.job_keyword_ids || [],
                        orgHead: mapping.org_head || undefined,
                        jobSpecialists: mapping.job_specialists || [],
                        jobDefinitions,
                    },
                }));
                setDiagramNodes(nodes);
            }
        }
    }, [mappings, jobDefinitions, viewMode]);

    const handleDiagramSave = useCallback((nodes: Node[], edges: Edge[]) => {
        const updatedUnits = nodes.map((node) => ({
            org_unit_name: node.data.orgUnitName || node.data.label,
            job_keyword_ids: node.data.jobKeywordIds || [],
            org_head: node.data.orgHead || null,
            job_specialists: node.data.jobSpecialists || [],
        }));
        setOrgUnits(updatedUnits as Array<OrgChartMapping & { id?: number }>);
    }, []);

    const handleNodeUpdate = useCallback((nodeId: string, data: Partial<any>) => {
        setDiagramNodes((nds) => {
            const updatedNodes = nds.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            );
            
            if (data.jobKeywordIds !== undefined) {
                const updatedNode = updatedNodes.find(n => n.id === nodeId);
                if (updatedNode) {
                    const unitIndex = orgUnits.findIndex(u => u.org_unit_name === (updatedNode.data.orgUnitName || updatedNode.data.label));
                    if (unitIndex !== -1) {
                        const newUnits = [...orgUnits];
                        newUnits[unitIndex] = {
                            ...newUnits[unitIndex],
                            job_keyword_ids: data.jobKeywordIds,
                        };
                        setOrgUnits(newUnits);
                    }
                }
            }
            
            return updatedNodes;
        });
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
        const jobDef = jobDefinitions.find(j => j.id === jobId);
        if (jobDef?.job_keyword_id) {
            setDraggedJobId(jobId);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/job-id', jobDef.job_keyword_id.toString());
        }
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

        if (draggedJobId == null) return;

        const jobDef = jobDefinitions.find(j => j.id === draggedJobId);
        if (!jobDef?.job_keyword_id) {
            setDraggedJobId(null);
            return;
        }
        
        setOrgUnits((prev) => {
            if (unitIndex < 0 || unitIndex >= prev.length) return prev;
            const unit = prev[unitIndex];
            if (!unit) return prev;

            const currentJobIds = unit.job_keyword_ids || [];
            if (!currentJobIds.includes(jobDef.job_keyword_id)) {
                const newUnits = [...prev];
                newUnits[unitIndex] = {
                    ...unit,
                    job_keyword_ids: [...currentJobIds, jobDef.job_keyword_id],
                };

                toast({
                    title: toastCopy.success,
                    description: `${jobDef.job_name} has been assigned to ${unit.org_unit_name || 'organization unit'}. 직무가 할당되었습니다.`,
                });
                return newUnits;
            }

            toast({
                title: toastCopy.info,
                description: `${jobDef.job_name} is already assigned to this unit. 이미 이 조직에 포함되어 있습니다.`,
                variant: 'default',
            });
            return prev;
        });

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

    const buildOrgChartMappingsPayload = () =>
        orgUnits
            .filter(u => u.org_unit_name?.trim())
            .map(u => ({
                org_unit_name: u.org_unit_name,
                job_keyword_ids: u.job_keyword_ids || [],
                org_head_name: (u.org_head as { name?: string })?.name ?? undefined,
                org_head_rank: (u.org_head as { rank?: string })?.rank ?? undefined,
                org_head_title: (u.org_head as { title?: string })?.title ?? undefined,
                org_head_email: (u.org_head as { email?: string })?.email ?? undefined,
                job_specialists: (u.job_specialists || []).map(s => ({
                    job_keyword_id: s.job_keyword_id,
                    name: s.name,
                    rank: s.rank,
                    title: s.title,
                    email: s.email,
                })),
            }));

    const handleSubmit = () => {
        const org_chart_mappings = buildOrgChartMappingsPayload();
        const unitsForStorage = org_chart_mappings.map((u, i) => ({
            id: String(i),
            org_unit_name: u.org_unit_name,
            job_keyword_ids: u.job_keyword_ids,
            org_head_name: u.org_head_name,
            org_head_rank: u.org_head_rank,
            org_head_title: u.org_head_title,
            org_head_email: u.org_head_email,
            job_specialists: u.job_specialists,
        }));
        mergeJobAnalysisState(project.id, { orgMappings: unitsForStorage });

        setSubmitting(true);
        router.post(`/hr-manager/job-analysis/${project.id}/org-chart-mapping`, { org_chart_mappings }, {
            onSuccess: () => {
                if (externalOnSubmit) {
                    externalOnSubmit();
                    setSubmitting(false);
                    return;
                }
                const payload = buildSubmitPayload(project.id, orgUnits);
                router.post(`/hr-manager/job-analysis/${project.id}/submit`, payload, {
                    onSuccess: () => router.visit('/hr-manager/dashboard'),
                    onError: () => {
                        setSubmitting(false);
                        toast({
                            title: toastCopy.submitFailed,
                            description: 'Please review required fields and try again. 필수 항목을 확인해 주세요.',
                            variant: 'destructive',
                        });
                    },
                });
            },
            onError: () => {
                setSubmitting(false);
                toast({
                    title: toastCopy.saveFailed,
                    description: 'Could not save mapping. Please try again. 저장에 실패했습니다.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Professional Info Card */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:bg-blue-950/10 dark:border-blue-900 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Professional HR Consulting Workflow
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                This step connects your finalized job definitions to your organizational structure. Drag and drop job cards onto organizational units in the diagram or list view. Each unit can have multiple roles assigned. Complete this mapping to establish your organizational hierarchy before proceeding to the Performance Management stage.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-blue-700 dark:text-blue-300">
                                    {jobDefinitions.length} finalized {jobDefinitions.length === 1 ? 'job' : 'jobs'} available for assignment
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'diagram' | 'list')} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="diagram">
                        <Layout className="w-4 h-4 mr-2" />
                        Visual Diagram
                    </TabsTrigger>
                    <TabsTrigger value="list">
                        <List className="w-4 h-4 mr-2" />
                        List View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="diagram" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                        {/* Left Panel - Diagram Editor (70%) */}
                        <div className="lg:col-span-7 space-y-4">
                            <Card className="shadow-sm border">
                                <CardHeader>
                                    <CardTitle>Organization Chart Diagram</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <DiagramEditor
                                        initialNodes={diagramNodes}
                                        initialEdges={diagramEdges}
                                        onSave={handleDiagramSave}
                                        onNodeUpdate={handleNodeUpdate}
                                        jobDefinitions={jobDefinitions}
                                    />
                                </CardContent>
                            </Card>
                            {organizationalCharts && Object.keys(organizationalCharts).length > 0 && (
                                <ChartGallery charts={organizationalCharts} title="Reference Charts" />
                            )}
                        </div>

                        {/* Right Panel - Job Keywords (30%) */}
                        <div className="lg:col-span-3 space-y-4">
                            <Card className="shadow-sm border">
                                <CardHeader>
                                    <CardTitle>Finalized Jobs</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            Finalized Jobs
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Drag jobs onto organization nodes in the diagram or drop them into organization units below
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {jobDefinitions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No finalized jobs available. Please finalize job definitions first.
                                            </p>
                                        ) : (
                                            jobDefinitions.map((job) => (
                                                <div
                                                    key={job.id}
                                                    className="p-3 border-2 rounded-lg cursor-move hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 flex items-center gap-2 group bg-white shadow-sm hover:shadow-md"
                                                    draggable
                                                    onDragStart={(e) => {
                                                        handleDragStart(e, job.id);
                                                        e.currentTarget.classList.add('opacity-50');
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.currentTarget.classList.remove('opacity-50');
                                                    }}
                                                >
                                                    <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                    <span className="text-sm font-medium flex-1">{job.job_name}</span>
                                                    <Badge variant="outline" className="text-xs">Drag me</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Org Chart (70%) */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="shadow-sm border">
                                <CardHeader>
                                    <CardTitle>Organization Chart</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {organizationalCharts && Object.keys(organizationalCharts).length > 0 ? (
                                        <ChartGallery charts={organizationalCharts} title="" showTitle={false} />
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
                            <Card className="shadow-sm border">
                                <CardHeader>
                                    <CardTitle>Finalized Jobs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {jobDefinitions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No finalized jobs available. Please finalize job definitions first.
                                            </p>
                                        ) : (
                                            jobDefinitions.map((job) => (
                                                <div
                                                    key={job.id}
                                                    className="p-3 border-2 rounded-lg cursor-move hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 flex items-center gap-2 group bg-white shadow-sm hover:shadow-md"
                                                    draggable
                                                    onDragStart={(e) => {
                                                        handleDragStart(e, job.id);
                                                        e.currentTarget.classList.add('opacity-50');
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.currentTarget.classList.remove('opacity-50');
                                                    }}
                                                >
                                                    <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                    <span className="text-sm font-medium flex-1">{job.job_name}</span>
                                                    <Badge variant="outline" className="text-xs">Drag me</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Organization Units */}
            <Card className="mt-6 shadow-sm border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Organization Units</CardTitle>
                        <Button variant="outline" size="sm" onClick={addOrgUnit}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Unit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {orgUnits.map((unit, index) => (
                        <div
                            key={index}
                            className={`p-4 border-2 rounded-lg space-y-4 transition-all duration-200 ${
                                dragOverUnitIndex === index
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-lg scale-[1.02]'
                                    : 'border-muted hover:border-primary/30'
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

            <div className="mt-8 pt-6 border-t">
                <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-sm border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">Ready to Complete Job Analysis?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Make sure all finalized jobs are mapped to organizational units. Once submitted, you'll be able to proceed to the Performance System stage.
                                </p>
                            </div>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={submitting} 
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 min-w-[180px]"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Save & Complete
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
