import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';

interface EvaluationStructure {
    // Organizational Evaluation
    org_evaluation_cycle?: 'annual' | 'semi_annual' | 'quarterly';
    org_evaluation_timing?: string; // 1-12
    org_evaluator_type?: 'top_down';
    org_evaluation_method?: 'absolute' | 'relative';
    org_rating_scale?: '3-level' | '4-level';
    org_rating_distribution?: number[]; // percentages
    org_evaluation_group?: 'team_level' | 'executive_level';
    org_use_of_results?: 'linked_to_org_manager' | 'linked_to_individual';
    // Individual Evaluation
    individual_evaluation_cycle?: 'annual' | 'semi_annual' | 'quarterly';
    individual_evaluation_timing?: string; // 1-12
    individual_evaluator_types?: ('top_down' | 'multi_rater')[];
    individual_evaluators?: ('self_evaluation' | 'primary' | 'secondary' | 'tertiary' | 'peer_same_dept' | 'peer_adjacent_dept')[];
    individual_evaluation_method?: 'absolute' | 'relative';
    individual_rating_scale?: '3-level' | '4-level' | '5-level';
    individual_rating_distribution?: number[]; // percentages
    individual_evaluation_groups?: ('company_wide' | 'job_family_based' | 'organization_based' | 'job_level_based')[];
    individual_use_of_results?: ('salary_adjustment' | 'bonus_allocation' | 'promotion' | 'position_assignment' | 'training_selection' | 'differentiated_benefits' | 'other')[];
    individual_use_of_results_other?: string;
    organization_leader_evaluation?: 'replaced_by_org' | 'conducted_separately';
    summary_note?: string;
}

interface Props {
    project: {
        id: number;
    };
    evaluationStructure?: EvaluationStructure;
    onContinue: (structure: EvaluationStructure) => void;
    onBack?: () => void;
}

export default function EvaluationStructureTab({
    project,
    evaluationStructure: initialStructure,
    onContinue,
    onBack,
}: Props) {
    // Handle null/undefined evaluationStructure and flatten nested structure from backend
    const normalizeStructure = (structure: any): EvaluationStructure => {
        if (!structure) return {};
        
        // If structure has nested organizational_evaluation and individual_evaluation (from backend)
        if (structure.organizational_evaluation || structure.individual_evaluation) {
            return {
                // Organizational Evaluation
                org_evaluation_cycle: structure.organizational_evaluation?.evaluation_cycle,
                org_evaluation_timing: structure.organizational_evaluation?.evaluation_timing,
                org_evaluator_type: structure.organizational_evaluation?.evaluator_type,
                org_evaluation_method: structure.organizational_evaluation?.evaluation_method,
                org_rating_scale: structure.organizational_evaluation?.rating_scale,
                org_rating_distribution: structure.organizational_evaluation?.rating_distribution,
                org_evaluation_group: structure.organizational_evaluation?.evaluation_group,
                org_use_of_results: structure.organizational_evaluation?.use_of_results,
                // Individual Evaluation
                individual_evaluation_cycle: structure.individual_evaluation?.evaluation_cycle,
                individual_evaluation_timing: structure.individual_evaluation?.evaluation_timing,
                individual_evaluator_types: structure.individual_evaluation?.evaluator_types,
                individual_evaluators: structure.individual_evaluation?.evaluators,
                individual_evaluation_method: structure.individual_evaluation?.evaluation_method,
                individual_rating_scale: structure.individual_evaluation?.rating_scale,
                individual_rating_distribution: structure.individual_evaluation?.rating_distribution,
                individual_evaluation_groups: structure.individual_evaluation?.evaluation_groups,
                individual_use_of_results: structure.individual_evaluation?.use_of_results,
                individual_use_of_results_other: structure.individual_evaluation?.use_of_results_other,
                organization_leader_evaluation: structure.individual_evaluation?.organization_leader_evaluation,
                summary_note: structure.summary_note,
            };
        }
        
        // Otherwise, return as-is (already flattened)
        return structure || {};
    };
    
    const [structure, setStructure] = useState<EvaluationStructure>(() => normalizeStructure(initialStructure));
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);

    // Update structure when initialStructure prop changes (e.g., after save/reload)
    useEffect(() => {
        if (initialStructure !== undefined) {
            setStructure(normalizeStructure(initialStructure));
        }
    }, [initialStructure]);

    const handleOptionClick = async (optionKey: string, optionValue: string) => {
        // Fetch guidance content for this option (would be implemented with API call)
        setRightPanelContent({
            concept: `Guidance for: ${optionKey} - ${optionValue}`,
            key_characteristics: 'Key characteristics will be loaded from admin configuration.',
            example: 'Example usage will be shown here.',
        });
        setRightPanelOpen(true);
    };

    const generateSummaryNote = (): string => {
        let orgSummary = '';
        let individualSummary = '';

        if (structure.org_evaluation_cycle && structure.org_evaluation_method && structure.org_rating_scale) {
            orgSummary = `Considering the organizational characteristics and management objectives of the company, the organizational evaluation will be conducted on a ${structure.org_evaluation_cycle} basis, applying a ${structure.org_evaluation_method} method, and using a ${structure.org_rating_scale} rating structure to assess performance at the organizational level.`;
        }

        if (structure.individual_evaluation_cycle && structure.individual_evaluation_method && structure.individual_rating_scale) {
            individualSummary = `The individual evaluation will be conducted based on the organizational evaluation framework, operating on a ${structure.individual_evaluation_cycle} basis, applying a ${structure.individual_evaluation_method} method, and using a ${structure.individual_rating_scale} rating structure to assess individual performance.`;
        }

        return `${orgSummary}\n\n${individualSummary}`.trim();
    };

    const handleContinue = () => {
        const summaryNote = generateSummaryNote();
        onContinue({ ...structure, summary_note: summaryNote });
    };

    const updateOrgRatingDistribution = (scale: '3-level' | '4-level', values: number[]) => {
        setStructure({
            ...structure,
            org_rating_scale: scale,
            org_rating_distribution: values,
        });
    };

    const updateIndividualRatingDistribution = (scale: '3-level' | '4-level' | '5-level', values: number[]) => {
        setStructure({
            ...structure,
            individual_rating_scale: scale,
            individual_rating_distribution: values,
        });
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                        <CardTitle className="text-2xl font-bold">Evaluation Structure</CardTitle>
                        <CardDescription className="text-base mt-2">
                            This evaluation structure defines the common performance evaluation framework applied across the entire company.
                            Regardless of the evaluation model used (such as OKR, MBO, or BSC), it establishes the foundational evaluation framework
                            to ensure that all employees are assessed fairly and consistently using the same standards and procedures.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Organizational Evaluation */}
                        <Card className="border-yellow-200 bg-yellow-50/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Organizational Evaluation (Precedes Individual Evaluation)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Cycle</Label>
                                        <Select
                                            value={structure.org_evaluation_cycle || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_evaluation_cycle: v as any });
                                                handleOptionClick('org_evaluation_cycle', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="annual">Annual</SelectItem>
                                                <SelectItem value="semi_annual">Semi-annual</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Timing</Label>
                                        <Select
                                            value={structure.org_evaluation_timing || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_evaluation_timing: v });
                                                handleOptionClick('org_evaluation_timing', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <SelectItem key={month} value={month.toString()}>
                                                        {month}月
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluator</Label>
                                        <Select
                                            value={structure.org_evaluator_type || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_evaluator_type: v as any });
                                                handleOptionClick('org_evaluator_type', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top_down">Top-down evaluation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Method</Label>
                                        <Select
                                            value={structure.org_evaluation_method || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_evaluation_method: v as any });
                                                handleOptionClick('org_evaluation_method', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="absolute">Absolute evaluation</SelectItem>
                                                <SelectItem value="relative">Relative evaluation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Rating Scale</Label>
                                        <Select
                                            value={structure.org_rating_scale || ''}
                                            onValueChange={(v) => {
                                                const scale = v as '3-level' | '4-level';
                                                setStructure({
                                                    ...structure,
                                                    org_rating_scale: scale,
                                                    org_rating_distribution: scale === '3-level' ? [30, 40, 30] : [20, 50, 20, 10],
                                                });
                                                handleOptionClick('org_rating_scale', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3-level">3-level</SelectItem>
                                                <SelectItem value="4-level">4-level</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {structure.org_rating_scale && (
                                        <div>
                                            <Label className="text-sm font-semibold mb-2 block">Rating Distribution (%)</Label>
                                            <div className="flex items-center gap-2">
                                                {structure.org_rating_scale === '3-level' ? (
                                                    <>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">A</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[0] || 30}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [30, 40, 30])];
                                                                    dist[0] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('3-level', dist);
                                                                }}
                                                                className="w-full"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">B</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[1] || 40}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [30, 40, 30])];
                                                                    dist[1] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('3-level', dist);
                                                                }}
                                                                className="w-full"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">C</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[2] || 30}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [30, 40, 30])];
                                                                    dist[2] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('3-level', dist);
                                                                }}
                                                                className="w-full"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">A</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[0] || 20}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [20, 50, 20, 10])];
                                                                    dist[0] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('4-level', dist);
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">B</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[1] || 50}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [20, 50, 20, 10])];
                                                                    dist[1] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('4-level', dist);
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">C</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[2] || 20}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [20, 50, 20, 10])];
                                                                    dist[2] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('4-level', dist);
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">D</Label>
                                                            <Input
                                                                type="number"
                                                                value={structure.org_rating_distribution?.[3] || 10}
                                                                onChange={(e) => {
                                                                    const dist = [...(structure.org_rating_distribution || [20, 50, 20, 10])];
                                                                    dist[3] = parseFloat(e.target.value) || 0;
                                                                    updateOrgRatingDistribution('4-level', dist);
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Total: {structure.org_rating_distribution?.reduce((a, b) => a + b, 0) || 0}%
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Group</Label>
                                        <Select
                                            value={structure.org_evaluation_group || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_evaluation_group: v as any });
                                                handleOptionClick('org_evaluation_group', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="team_level">Team-level organizational unit</SelectItem>
                                                <SelectItem value="executive_level">Executive-level organizational unit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Use of Evaluation Results</Label>
                                        <Select
                                            value={structure.org_use_of_results || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, org_use_of_results: v as any });
                                                handleOptionClick('org_use_of_results', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="linked_to_org_manager">Linked to organization manager evaluation</SelectItem>
                                                <SelectItem value="linked_to_individual">Linked to individual evaluation distribution</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Individual Evaluation */}
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Individual Evaluation (Follows Organizational Evaluation)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Cycle</Label>
                                        <Select
                                            value={structure.individual_evaluation_cycle || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, individual_evaluation_cycle: v as any });
                                                handleOptionClick('individual_evaluation_cycle', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="annual">Annual</SelectItem>
                                                <SelectItem value="semi_annual">Semi-annual</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Timing</Label>
                                        <Select
                                            value={structure.individual_evaluation_timing || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, individual_evaluation_timing: v });
                                                handleOptionClick('individual_evaluation_timing', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <SelectItem key={month} value={month.toString()}>
                                                        {month}月
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluator</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="eval-top-down"
                                                    checked={structure.individual_evaluator_types?.includes('top_down') || false}
                                                    onCheckedChange={(checked) => {
                                                        const types = structure.individual_evaluator_types || [];
                                                        if (checked) {
                                                            setStructure({ ...structure, individual_evaluator_types: [...types, 'top_down'] });
                                                        } else {
                                                            setStructure({ ...structure, individual_evaluator_types: types.filter(t => t !== 'top_down') });
                                                        }
                                                        handleOptionClick('individual_evaluator_types', 'top_down');
                                                    }}
                                                />
                                                <Label htmlFor="eval-top-down" className="cursor-pointer">Top-down evaluation</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="eval-multi-rater"
                                                    checked={structure.individual_evaluator_types?.includes('multi_rater') || false}
                                                    onCheckedChange={(checked) => {
                                                        const types = structure.individual_evaluator_types || [];
                                                        if (checked) {
                                                            setStructure({ ...structure, individual_evaluator_types: [...types, 'multi_rater'] });
                                                        } else {
                                                            setStructure({ ...structure, individual_evaluator_types: types.filter(t => t !== 'multi_rater') });
                                                        }
                                                        handleOptionClick('individual_evaluator_types', 'multi_rater');
                                                    }}
                                                />
                                                <Label htmlFor="eval-multi-rater" className="cursor-pointer">Multi-rater evaluation</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluators</Label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'self_evaluation', label: 'Self-evaluation' },
                                                { value: 'primary', label: 'Primary evaluator' },
                                                { value: 'secondary', label: 'Secondary evaluator' },
                                                { value: 'tertiary', label: 'Tertiary evaluator' },
                                                { value: 'peer_same_dept', label: 'Peer (same department)' },
                                                { value: 'peer_adjacent_dept', label: 'Peer (adjacent department)' },
                                            ].map((evalOption) => (
                                                <div key={evalOption.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`eval-${evalOption.value}`}
                                                        checked={structure.individual_evaluators?.includes(evalOption.value as any) || false}
                                                        onCheckedChange={(checked) => {
                                                            const evaluators = structure.individual_evaluators || [];
                                                            if (checked) {
                                                                setStructure({ ...structure, individual_evaluators: [...evaluators, evalOption.value as any] });
                                                            } else {
                                                                setStructure({ ...structure, individual_evaluators: evaluators.filter(e => e !== evalOption.value) });
                                                            }
                                                            handleOptionClick('individual_evaluators', evalOption.value);
                                                        }}
                                                    />
                                                    <Label htmlFor={`eval-${evalOption.value}`} className="cursor-pointer text-sm">
                                                        {evalOption.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Method</Label>
                                        <Select
                                            value={structure.individual_evaluation_method || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, individual_evaluation_method: v as any });
                                                handleOptionClick('individual_evaluation_method', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="absolute">Absolute evaluation</SelectItem>
                                                <SelectItem value="relative">Relative evaluation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Rating Scale</Label>
                                        <Select
                                            value={structure.individual_rating_scale || ''}
                                            onValueChange={(v) => {
                                                const scale = v as '3-level' | '4-level' | '5-level';
                                                const defaultDist: Record<string, number[]> = {
                                                    '3-level': [30, 40, 30],
                                                    '4-level': [20, 50, 20, 10],
                                                    '5-level': [10, 15, 60, 10, 5],
                                                };
                                                setStructure({
                                                    ...structure,
                                                    individual_rating_scale: scale,
                                                    individual_rating_distribution: defaultDist[scale],
                                                });
                                                handleOptionClick('individual_rating_scale', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3-level">3-level</SelectItem>
                                                <SelectItem value="4-level">4-level</SelectItem>
                                                <SelectItem value="5-level">5-level</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {structure.individual_rating_scale && (
                                        <div>
                                            <Label className="text-sm font-semibold mb-2 block">Rating Distribution (%)</Label>
                                            <div className="flex items-center gap-2">
                                                {structure.individual_rating_scale === '3-level' && (
                                                    <>
                                                        {['A', 'B', 'C'].map((label, idx) => (
                                                            <div key={label} className="flex-1">
                                                                <Label className="text-xs">{label}</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={structure.individual_rating_distribution?.[idx] || (idx === 0 ? 30 : idx === 1 ? 40 : 30)}
                                                                    onChange={(e) => {
                                                                        const dist = [...(structure.individual_rating_distribution || [30, 40, 30])];
                                                                        dist[idx] = parseFloat(e.target.value) || 0;
                                                                        updateIndividualRatingDistribution('3-level', dist);
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                                {structure.individual_rating_scale === '4-level' && (
                                                    <>
                                                        {['A', 'B', 'C', 'D'].map((label, idx) => (
                                                            <div key={label} className="flex-1">
                                                                <Label className="text-xs">{label}</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={structure.individual_rating_distribution?.[idx] || (idx === 0 ? 20 : idx === 1 ? 50 : idx === 2 ? 20 : 10)}
                                                                    onChange={(e) => {
                                                                        const dist = [...(structure.individual_rating_distribution || [20, 50, 20, 10])];
                                                                        dist[idx] = parseFloat(e.target.value) || 0;
                                                                        updateIndividualRatingDistribution('4-level', dist);
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                                {structure.individual_rating_scale === '5-level' && (
                                                    <>
                                                        {['S', 'A', 'B', 'C', 'D'].map((label, idx) => (
                                                            <div key={label} className="flex-1">
                                                                <Label className="text-xs">{label}</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={structure.individual_rating_distribution?.[idx] || (idx === 0 ? 10 : idx === 1 ? 15 : idx === 2 ? 60 : idx === 3 ? 10 : 5)}
                                                                    onChange={(e) => {
                                                                        const dist = [...(structure.individual_rating_distribution || [10, 15, 60, 10, 5])];
                                                                        dist[idx] = parseFloat(e.target.value) || 0;
                                                                        updateIndividualRatingDistribution('5-level', dist);
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Total: {structure.individual_rating_distribution?.reduce((a, b) => a + b, 0) || 0}%
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Evaluation Group</Label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'company_wide', label: 'Company-wide single pool' },
                                                { value: 'job_family_based', label: 'Job family-based pool' },
                                                { value: 'organization_based', label: 'Organization-based pool' },
                                                { value: 'job_level_based', label: 'Job level-based pool' },
                                            ].map((groupOption) => (
                                                <div key={groupOption.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`group-${groupOption.value}`}
                                                        checked={structure.individual_evaluation_groups?.includes(groupOption.value as any) || false}
                                                        onCheckedChange={(checked) => {
                                                            const groups = structure.individual_evaluation_groups || [];
                                                            if (checked) {
                                                                setStructure({ ...structure, individual_evaluation_groups: [...groups, groupOption.value as any] });
                                                            } else {
                                                                setStructure({ ...structure, individual_evaluation_groups: groups.filter(g => g !== groupOption.value) });
                                                            }
                                                            handleOptionClick('individual_evaluation_groups', groupOption.value);
                                                        }}
                                                    />
                                                    <Label htmlFor={`group-${groupOption.value}`} className="cursor-pointer text-sm">
                                                        {groupOption.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Use of Evaluation Results</Label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'salary_adjustment', label: 'Salary adjustment' },
                                                { value: 'bonus_allocation', label: 'Bonus allocation' },
                                                { value: 'promotion', label: 'Promotion' },
                                                { value: 'position_assignment', label: 'Position assignment' },
                                                { value: 'training_selection', label: 'Training selection' },
                                                { value: 'differentiated_benefits', label: 'Differentiated benefits' },
                                                { value: 'other', label: 'Other' },
                                            ].map((useOption) => (
                                                <div key={useOption.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`use-${useOption.value}`}
                                                        checked={structure.individual_use_of_results?.includes(useOption.value as any) || false}
                                                        onCheckedChange={(checked) => {
                                                            const uses = structure.individual_use_of_results || [];
                                                            if (checked) {
                                                                setStructure({ ...structure, individual_use_of_results: [...uses, useOption.value as any] });
                                                            } else {
                                                                setStructure({ ...structure, individual_use_of_results: uses.filter(u => u !== useOption.value) });
                                                            }
                                                            handleOptionClick('individual_use_of_results', useOption.value);
                                                        }}
                                                    />
                                                    <Label htmlFor={`use-${useOption.value}`} className="cursor-pointer text-sm">
                                                        {useOption.label}
                                                    </Label>
                                                </div>
                                            ))}
                                            {structure.individual_use_of_results?.includes('other') && (
                                                <Input
                                                    value={structure.individual_use_of_results_other || ''}
                                                    onChange={(e) => setStructure({ ...structure, individual_use_of_results_other: e.target.value })}
                                                    placeholder="Specify other use..."
                                                    className="ml-6 mt-2"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Organization Leader Evaluation</Label>
                                        <Select
                                            value={structure.organization_leader_evaluation || ''}
                                            onValueChange={(v) => {
                                                setStructure({ ...structure, organization_leader_evaluation: v as any });
                                                handleOptionClick('organization_leader_evaluation', v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="replaced_by_org">Replaced by organizational evaluation</SelectItem>
                                                <SelectItem value="conducted_separately">Conducted separately as individual evaluation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Consultant-Reviewed Final Report Notice */}
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Consultant-Reviewed Final Report Notice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Based on your inputs and organizational context, a final HR design report incorporating professional consultant review and judgment will be provided.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Summary Note */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Summary Note</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={structure.summary_note || generateSummaryNote()}
                                    onChange={(e) => setStructure({ ...structure, summary_note: e.target.value })}
                                    rows={6}
                                    placeholder="Summary note will be auto-generated based on your selections..."
                                    className="w-full"
                                />
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
                        Save & Next Step
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title="Option Guidance"
            />
        </>
    );
}
