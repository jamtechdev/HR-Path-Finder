import React, { useState, useEffect } from 'react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrgChartMapping, JobDefinition } from '../hooks/useJobAnalysisState';

interface Step5OrgChartMappingProps {
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    onMappingsChange: (mappings: OrgChartMapping[]) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function Step5OrgChartMapping({
    jobDefinitions,
    orgMappings,
    onMappingsChange,
    onContinue,
    onBack,
}: Step5OrgChartMappingProps) {
    const [orgUnits, setOrgUnits] = useState<OrgChartMapping[]>(orgMappings);
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);

    // Get all job IDs from finalized definitions
    const allJobIds = React.useMemo(() => {
        const ids: number[] = [];
        Object.values(jobDefinitions).forEach(def => {
            if (def.job_keyword_id) {
                ids.push(def.job_keyword_id);
            }
            if (def.grouped_job_keyword_ids) {
                ids.push(...def.grouped_job_keyword_ids);
            }
        });
        return [...new Set(ids)];
    }, [jobDefinitions]);

    // Sync with parent
    useEffect(() => {
        onMappingsChange(orgUnits);
    }, [orgUnits, onMappingsChange]);

    const handleAddOrgUnit = () => {
        setOrgUnits([...orgUnits, {
            id: `unit-${Date.now()}`,
            org_unit_name: '',
            job_keyword_ids: [],
            job_specialists: [],
        }]);
    };

    const handleUpdateOrgUnit = (unitId: string, updates: Partial<OrgChartMapping>) => {
        setOrgUnits(orgUnits.map(u => u.id === unitId ? { ...u, ...updates } : u));
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
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, unitId: string) => {
        e.preventDefault();
        if (!draggedJobId) return;

        const unit = orgUnits.find(u => u.id === unitId);
        if (unit && !unit.job_keyword_ids.includes(draggedJobId)) {
            handleUpdateOrgUnit(unitId, {
                job_keyword_ids: [...unit.job_keyword_ids, draggedJobId],
            });
        }
        setDraggedJobId(null);
    };

    const handleRemoveJobFromUnit = (unitId: string, jobId: number) => {
        const unit = orgUnits.find(u => u.id === unitId);
        if (unit) {
            handleUpdateOrgUnit(unitId, {
                job_keyword_ids: unit.job_keyword_ids.filter(id => id !== jobId),
                job_specialists: unit.job_specialists.filter(s => s.job_keyword_id !== jobId),
            });
        }
    };

    const handleAddJobSpecialist = (unitId: string, jobId: number) => {
        const unit = orgUnits.find(u => u.id === unitId);
        if (unit) {
            const existing = unit.job_specialists.find(s => s.job_keyword_id === jobId);
            if (!existing) {
                handleUpdateOrgUnit(unitId, {
                    job_specialists: [...unit.job_specialists, {
                        job_keyword_id: jobId,
                        name: '',
                        rank: '',
                        title: '',
                        email: '',
                    }],
                });
            }
        }
    };

    const handleUpdateJobSpecialist = (unitId: string, jobId: number, field: string, value: string) => {
        const unit = orgUnits.find(u => u.id === unitId);
        if (unit) {
            const updated = unit.job_specialists.map(s =>
                s.job_keyword_id === jobId ? { ...s, [field]: value } : s
            );
            handleUpdateOrgUnit(unitId, { job_specialists: updated });
        }
    };

    const handleRemoveJobSpecialist = (unitId: string, jobId: number) => {
        const unit = orgUnits.find(u => u.id === unitId);
        if (unit) {
            handleUpdateOrgUnit(unitId, {
                job_specialists: unit.job_specialists.filter(s => s.job_keyword_id !== jobId),
            });
        }
    };

    const getJobName = (jobId: number): string => {
        const def = Object.values(jobDefinitions).find(d =>
            d.job_keyword_id === jobId || d.grouped_job_keyword_ids?.includes(jobId)
        );
        return def?.job_name || `Job ${jobId}`;
    };

    return (
        <StepContainer
            stepNumber={5}
            stepName="Organization Chart Mapping"
            description="The finalized Job Definition documents are mapped to the current organizational structure, and the responsible owners for each organization unit and role are identified. This stage is not intended to change the organizational structure or make HR/personnel decisions."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Organizational Units</Label>
                            <Button onClick={handleAddOrgUnit} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Unit
                            </Button>
                        </div>

                        {orgUnits.length === 0 && (
                            <Card className="p-8 text-center border-dashed">
                                <p className="text-muted-foreground mb-4">
                                    No organizational units added yet.
                                </p>
                                <Button onClick={handleAddOrgUnit} variant="outline">
                                    Add First Unit
                                </Button>
                            </Card>
                        )}

                        <div className="space-y-4">
                            {orgUnits.map((unit) => (
                                <Card
                                    key={unit.id}
                                    className={cn(
                                        'border-2',
                                        draggedJobId ? 'border-primary/50' : 'border-muted'
                                    )}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, unit.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            <Input
                                                value={unit.org_unit_name}
                                                onChange={(e) => handleUpdateOrgUnit(unit.id, { org_unit_name: e.target.value })}
                                                placeholder="Organization Unit Name"
                                                className="font-semibold"
                                            />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-semibold mb-2 block">Organization Head</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input
                                                    value={unit.org_head_name || ''}
                                                    onChange={(e) => handleUpdateOrgUnit(unit.id, { org_head_name: e.target.value })}
                                                    placeholder="Name"
                                                />
                                                <Input
                                                    value={unit.org_head_rank || ''}
                                                    onChange={(e) => handleUpdateOrgUnit(unit.id, { org_head_rank: e.target.value })}
                                                    placeholder="Rank"
                                                />
                                                <Input
                                                    value={unit.org_head_title || ''}
                                                    onChange={(e) => handleUpdateOrgUnit(unit.id, { org_head_title: e.target.value })}
                                                    placeholder="Title"
                                                />
                                                <Input
                                                    type="email"
                                                    value={unit.org_head_email || ''}
                                                    onChange={(e) => handleUpdateOrgUnit(unit.id, { org_head_email: e.target.value })}
                                                    placeholder="Email"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-semibold mb-2 block">Mapped Jobs</Label>
                                            {unit.job_keyword_ids.length === 0 ? (
                                                <div className="p-4 border-2 border-dashed rounded text-center text-muted-foreground text-sm">
                                                    Drag jobs from the right panel to map them to this unit
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {unit.job_keyword_ids.map((jobId) => (
                                                        <Badge
                                                            key={jobId}
                                                            variant="secondary"
                                                            className="p-2 flex items-center gap-1"
                                                        >
                                                            {getJobName(jobId)}
                                                            <button
                                                                onClick={() => handleRemoveJobFromUnit(unit.id, jobId)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {unit.job_keyword_ids.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Job Specialists</Label>
                                                <div className="space-y-2">
                                                    {unit.job_keyword_ids.map((jobId) => {
                                                        const specialist = unit.job_specialists.find(s => s.job_keyword_id === jobId);
                                                        return (
                                                            <Card key={jobId} className="p-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="font-medium text-sm">{getJobName(jobId)}</span>
                                                                    {!specialist && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleAddJobSpecialist(unit.id, jobId)}
                                                                        >
                                                                            <Plus className="w-3 h-3 mr-1" />
                                                                            Add Specialist
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                {specialist && (
                                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                                        <Input
                                                                            value={specialist.name}
                                                                            onChange={(e) => handleUpdateJobSpecialist(unit.id, jobId, 'name', e.target.value)}
                                                                            placeholder="Name"
                                                                            size={10}
                                                                        />
                                                                        <Input
                                                                            value={specialist.rank || ''}
                                                                            onChange={(e) => handleUpdateJobSpecialist(unit.id, jobId, 'rank', e.target.value)}
                                                                            placeholder="Rank"
                                                                            size={10}
                                                                        />
                                                                        <Input
                                                                            value={specialist.title || ''}
                                                                            onChange={(e) => handleUpdateJobSpecialist(unit.id, jobId, 'title', e.target.value)}
                                                                            placeholder="Title"
                                                                            size={10}
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                type="email"
                                                                                value={specialist.email || ''}
                                                                                onChange={(e) => handleUpdateJobSpecialist(unit.id, jobId, 'email', e.target.value)}
                                                                                placeholder="Email"
                                                                                size={10}
                                                                                className="flex-1"
                                                                            />
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleRemoveJobSpecialist(unit.id, jobId)}
                                                                                className="text-destructive"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setOrgUnits(orgUnits.filter(u => u.id !== unit.id))}
                                            className="text-destructive hover:text-destructive w-full"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Remove Unit
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Finalized Jobs</Label>
                        <Card className="border-2">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    {allJobIds.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No finalized jobs available.
                                        </p>
                                    ) : (
                                        allJobIds.map((jobId) => (
                                            <div
                                                key={jobId}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, jobId)}
                                                onDragEnd={handleDragEnd}
                                                className="p-3 border-2 rounded-lg cursor-move hover:border-primary/50 hover:bg-primary/5 transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{getJobName(jobId)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <StepNavigation
                    onBack={onBack}
                    onNext={onContinue}
                    nextLabel="Continue to Review & Submit"
                />
            </div>
        </StepContainer>
    );
}
