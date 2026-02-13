import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';

interface Diagnosis {
    id: number;
    total_executives?: number;
    executive_positions?: Array<{ role: string; count: number }> | Record<string, number>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

interface ExecutivePosition {
    id: string;
    role: string;
    count: number;
}

const DEFAULT_POSITIONS = ['CEO', 'CTO', 'COO', 'CFO'];

export default function Executives({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [positions, setPositions] = useState<ExecutivePosition[]>(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                return diagnosis.executive_positions.map((pos, index) => ({
                    id: `pos-${index}`,
                    role: pos.role || '',
                    count: pos.count || 0,
                }));
            } else {
                // Convert object to array
                return Object.entries(diagnosis.executive_positions).map(([role, count], index) => ({
                    id: `pos-${index}`,
                    role,
                    count: count as number,
                }));
            }
        }
        return [];
    });
    const [selectedDefaultPositions, setSelectedDefaultPositions] = useState<string[]>(() => {
        const selected: string[] = [];
        positions.forEach(pos => {
            if (DEFAULT_POSITIONS.includes(pos.role)) {
                selected.push(pos.role);
            }
        });
        return selected;
    });

    const { data, setData, post, processing, errors } = useForm({
        total_executives: diagnosis?.total_executives || 0,
        executive_positions: [] as Array<{ role: string; count: number }>,
    });

    // Sync selected default positions with positions array
    useEffect(() => {
        const newPositions = [...positions];
        
        // Remove unselected default positions
        newPositions.forEach((pos, index) => {
            if (DEFAULT_POSITIONS.includes(pos.role) && !selectedDefaultPositions.includes(pos.role)) {
                newPositions.splice(index, 1);
            }
        });

        // Add newly selected default positions
        selectedDefaultPositions.forEach(role => {
            if (!newPositions.find(p => p.role === role)) {
                newPositions.push({ id: `pos-${Date.now()}-${role}`, role, count: 1 });
            }
        });

        setPositions(newPositions);
    }, [selectedDefaultPositions]);

    // Update form data when positions change
    useEffect(() => {
        const positionsArray = positions
            .filter(pos => pos.role && pos.count > 0)
            .map(pos => ({ role: pos.role, count: pos.count }));
        setData('executive_positions', positionsArray);
    }, [positions]);

    // Removed auto-save - only save on review and submit

    const addCustomPosition = () => {
        setPositions([...positions, { id: `pos-${Date.now()}`, role: '', count: 1 }]);
    };

    const removePosition = (id: string) => {
        const pos = positions.find(p => p.id === id);
        if (pos && DEFAULT_POSITIONS.includes(pos.role)) {
            setSelectedDefaultPositions(selectedDefaultPositions.filter(r => r !== pos.role));
        }
        setPositions(positions.filter((p) => p.id !== id));
    };

    const updatePosition = (id: string, updates: Partial<ExecutivePosition>) => {
        setPositions(positions.map((p) => {
            if (p.id === id) {
                const updated = { ...p, ...updates };
                // Validate: cannot be "CXO"
                if (updated.role.toUpperCase() === 'CXO') {
                    return p; // Don't update if trying to set to CXO
                }
                return updated;
            }
            return p;
        }));
    };

    return (
        <>
            <Head title={`Executives - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Executives"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="workforce"
                nextRoute="leaders"
                formData={{
                    total_executives: data.total_executives,
                    executive_positions: data.executive_positions,
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="px-6">
                        {/* Total Executives */}
                        <div className="flex flex-col gap-3 mb-3">
                            <Label htmlFor="total_executives">Total Executives</Label>
                            <Input
                                id="total_executives"
                                type="number"
                                min="0"
                                value={data.total_executives || ''}
                                onChange={(e) => setData('total_executives', parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </div>

                        {/* Executive Positions - Default Options */}
                        <div className="flex flex-col gap-3 mb-3">
                            <Label>Executive Positions</Label>
                            <MultiSelectQuestion
                                question="Select default positions"
                                value={selectedDefaultPositions}
                                onChange={setSelectedDefaultPositions}
                                options={DEFAULT_POSITIONS}
                                columns={2}
                            />
                        </div>

                        {/* Custom Positions */}
                        <div className="flex flex-col gap-3 mb-3">
                            <div className="flex items-center justify-between">
                                <Label>Other Positions</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCustomPosition}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Custom Position
                                </Button>
                            </div>
                            <div className="flex flex-col gap-3 mb-3">
                                {positions
                                    .filter(pos => !DEFAULT_POSITIONS.includes(pos.role))
                                    .map((position) => (
                                        <div key={position.id} className="flex items-center gap-2">
                                            <Input
                                                placeholder="Position name (cannot be CXO)"
                                                value={position.role}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.toUpperCase() !== 'CXO') {
                                                        updatePosition(position.id, { role: value });
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Count"
                                                value={position.count || ''}
                                                onChange={(e) => updatePosition(position.id, { count: parseInt(e.target.value) || 0 })}
                                                min="0"
                                                className="w-24"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePosition(position.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Positions with Counts */}
                        <div className="flex flex-col gap-3 mb-3">
                            <Label>Position Counts</Label>
                            <div className="flex flex-col gap-3 mb-3">
                                {positions
                                    .filter(pos => pos.role)
                                    .map((position) => (
                                        <div key={position.id} className="flex items-center gap-2 p-2 border rounded-md">
                                            <span className="flex-1 font-medium">{position.role}</span>
                                            <Input
                                                type="number"
                                                value={position.count || ''}
                                                onChange={(e) => updatePosition(position.id, { count: parseInt(e.target.value) || 0 })}
                                                min="0"
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">people</span>
                                            {!DEFAULT_POSITIONS.includes(position.role) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removePosition(position.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
