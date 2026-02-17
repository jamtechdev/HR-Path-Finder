import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import RecommendationBadge from '@/components/DesignSteps/RecommendationBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Settings, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, Plus, Trash2, Edit, Send } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PerformanceSystem {
    id?: number;
    evaluation_unit?: string;
    performance_method?: string;
    evaluation_type?: string;
    evaluation_scale?: string;
}

interface ConsultantRecommendation {
    id: number;
    recommended_option: string;
    rationale: string;
    created_at: string;
}

interface AlgorithmRecommendation {
    score: number;
    reasons: string[];
    recommended: boolean;
}

interface PerformanceSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
}

interface PerformanceSnapshotResponse {
    id: number;
    question_id: number;
    response: string[] | string;
    text_response?: string;
    question?: PerformanceSnapshotQuestion;
}

interface OrganizationalKpi {
    id: number;
    organization_name: string;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    is_active: boolean;
    status: string;
    linked_job?: {
        id: number;
        job_name: string;
    };
}

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword?: {
        id: number;
        keyword: string;
    };
}

interface OrgChartMapping {
    id: number;
    org_unit_name: string;
    org_head_name?: string;
    org_head_email?: string;
}

interface EvaluationModelAssignment {
    id: number;
    job_definition_id: number;
    evaluation_model: 'mbo' | 'bsc' | 'okr';
    job_definition?: JobDefinition;
}

interface EvaluationStructure {
    org_evaluation_cycle?: string;
    org_evaluation_timing?: string;
    org_evaluator_type?: string;
    org_evaluation_method?: string;
    org_rating_scale?: string;
    org_rating_distribution?: Record<string, number>;
    org_evaluation_group?: string;
    org_use_of_results?: string[];
    individual_evaluation_cycle?: string;
    individual_evaluation_timing?: string;
    individual_evaluator_types?: string[];
    individual_evaluators?: string[];
    individual_evaluation_method?: string;
    individual_rating_scale?: string;
    individual_rating_distribution?: Record<string, number>;
    individual_evaluation_groups?: string[];
    individual_use_of_results?: string[];
    organization_leader_evaluation?: string;
}

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        } | null;
        organizationDesign?: {
            structure_type?: string;
            job_grade_structure?: string;
        };
        performance_snapshot_responses?: PerformanceSnapshotResponse[];
        organizational_kpis?: OrganizationalKpi[];
        evaluation_model_assignments?: EvaluationModelAssignment[];
        evaluation_structure?: EvaluationStructure;
    };
    performanceSystem?: PerformanceSystem;
    consultantRecommendation?: ConsultantRecommendation;
    algorithmRecommendations?: Record<string, AlgorithmRecommendation>;
    recommendations?: {
        performance_method?: string;
    };
    activeTab?: string;
    snapshotQuestions?: PerformanceSnapshotQuestion[];
    jobDefinitions?: JobDefinition[];
    orgChartMappings?: OrgChartMapping[];
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'snapshot', label: 'Stage 4-1: Strategic Performance Snapshot' },
    { id: 'kpi-review', label: 'Stage 4-2: KPI Review' },
    { id: 'model-assignment', label: 'Stage 4-3: Evaluation Model Assignment' },
    { id: 'evaluation-structure', label: 'Stage 4-4: Evaluation Structure' },
    { id: 'review', label: 'Review & Submit' },
];

const UNIT_OPTIONS = ['Individual', 'Team', 'Department', 'Organization'];
const METHOD_OPTIONS = [
    { value: 'kpi', label: 'KPI', desc: 'Key Performance Indicators - Track measurable targets.' },
    { value: 'mbo', label: 'MBO', desc: 'Management by Objectives - Goal-setting approach.' },
    { value: 'okr', label: 'OKR', desc: 'Objectives and Key Results - Align individual and team goals with strategic objectives.' },
    { value: 'bsc', label: 'BSC', desc: 'Balanced Scorecard - Holistic performance measurement across multiple perspectives.' },
];
const TYPE_OPTIONS = ['Quantitative', 'Qualitative', 'Hybrid'];
const SCALE_OPTIONS = ['Relative', 'Absolute', 'Hybrid'];

export default function PerformanceSystemIndex({ 
    project, 
    performanceSystem, 
    consultantRecommendation,
    algorithmRecommendations,
    recommendations,
    activeTab: initialTab = 'overview',
    snapshotQuestions = [],
    jobDefinitions = [],
    orgChartMappings = [],
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);

    // Snapshot responses state
    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string>>(() => {
        const responses: Record<number, string[] | string> = {};
        project.performance_snapshot_responses?.forEach(resp => {
            responses[resp.question_id] = resp.response;
        });
        return responses;
    });

    // KPI state
    const [kpis, setKpis] = useState<OrganizationalKpi[]>(project.organizational_kpis || []);
    const [selectedOrg, setSelectedOrg] = useState<string>('');

    // Model assignments state
    const [modelAssignments, setModelAssignments] = useState<Record<number, 'mbo' | 'bsc' | 'okr'>>(() => {
        const assignments: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        project.evaluation_model_assignments?.forEach(assign => {
            assignments[assign.job_definition_id] = assign.evaluation_model;
        });
        return assignments;
    });

    // Evaluation structure state
    const [evalStructure, setEvalStructure] = useState<EvaluationStructure>(project.evaluation_structure || {});

    const { data, setData, post, processing } = useForm({
        evaluation_unit: performanceSystem?.evaluation_unit || '',
        performance_method: performanceSystem?.performance_method || '',
        evaluation_type: performanceSystem?.evaluation_type || '',
        evaluation_scale: performanceSystem?.evaluation_scale || '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.evaluation_unit || data.performance_method) {
                post(`/hr-manager/performance-system/${project.id}`, { preserveScroll: true });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [data.evaluation_unit, data.performance_method, data.evaluation_type, data.evaluation_scale]);

    const handleSubmit = () => {
        post(`/hr-manager/performance-system/${project.id}/submit`, {
            onSuccess: () => setCompletedTabs([...TABS.map(t => t.id)]),
        });
    };

    const handleSnapshotSave = () => {
        const responses = snapshotQuestions.map(q => ({
            question_id: q.id,
            response: snapshotResponses[q.id] || [],
            text_response: null,
        }));

        post(`/hr-manager/performance-system/${project.id}`, {
            data: { tab: 'snapshot', responses },
            preserveScroll: true,
        });
    };

    const handleKpiSave = () => {
        post(`/hr-manager/performance-system/${project.id}`, {
            data: { tab: 'kpi-review', kpis },
            preserveScroll: true,
        });
    };

    const handleModelAssignmentSave = () => {
        const assignments = Object.entries(modelAssignments).map(([jobId, model]) => ({
            job_definition_id: parseInt(jobId),
            evaluation_model: model,
        }));

        post(`/hr-manager/performance-system/${project.id}`, {
            data: { tab: 'model-assignment', assignments },
            preserveScroll: true,
        });
    };

    const handleEvaluationStructureSave = () => {
        post(`/hr-manager/performance-system/${project.id}`, {
            data: { tab: 'evaluation-structure', ...evalStructure },
            preserveScroll: true,
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
                    <Head title={`Performance System - ${project?.company?.name || 'Performance System'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href="/hr-manager/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Step 3: Performance System</h1>
                                <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Design your performance evaluation framework</p>
                        </div>

                        {/* Consultant Recommendation */}
                        {consultantRecommendation && (
                            <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">Consultant Recommendation</h3>
                                                <Badge variant="default" className="bg-primary">
                                                    {METHOD_OPTIONS.find(m => m.value === consultantRecommendation.recommended_option)?.label || consultantRecommendation.recommended_option.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Your consultant has prepared a recommendation based on your company's context, CEO philosophy, and job definitions.
                                            </p>
                                            <Collapsible open={isRationaleOpen} onOpenChange={setIsRationaleOpen}>
                                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                                                    <MessageSquare className="w-4 h-4" />
                                                    View Consultant's Rationale
                                                    {isRationaleOpen ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-3">
                                                    <div className="p-4 bg-background border rounded-lg">
                                                        <p className="text-sm whitespace-pre-line leading-relaxed">
                                                            {consultantRecommendation.rationale}
                                                        </p>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {project.organizationDesign && (
                            <Card className="mb-6 bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-muted-foreground">ℹ️</div>
                                        <div>
                                            <p className="font-medium mb-1">Organization Structure (Read-only)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Structure: <strong>{project.organizationDesign.structure_type || 'N/A'}</strong> | 
                                                Grade: <strong>{project.organizationDesign.job_grade_structure || 'N/A'}</strong>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <TabNavigation tabs={TABS} activeTab={activeTab} completedTabs={completedTabs} onTabChange={setActiveTab} />

                        <Card>
                            <CardContent className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="text-center py-12">
                                        <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Performance System Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Design your performance evaluation framework including evaluation units, management methods (KPI/MBO/OKR/BSC), and assessment structures.
                                        </p>
                                        <Button onClick={() => setActiveTab('unit')} size="lg">Start Design →</Button>
                                    </div>
                                )}

                                {activeTab === 'unit' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Evaluation Unit</h3>
                                        <RadioGroup value={data.evaluation_unit} onValueChange={(v) => setData('evaluation_unit', v)} className="grid grid-cols-2 gap-4">
                                            {UNIT_OPTIONS.map(opt => (
                                                <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                    <RadioGroupItem value={opt.toLowerCase()} id={opt} />
                                                    <Label htmlFor={opt} className="cursor-pointer flex-1">{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'method' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Performance Management Method</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select the performance management methodology for your organization.</p>
                                        <RadioGroup value={data.performance_method} onValueChange={(v) => setData('performance_method', v)} className="grid grid-cols-2 gap-4">
                                            {METHOD_OPTIONS.map(opt => {
                                                const isConsultantRecommended = consultantRecommendation?.recommended_option === opt.value;
                                                const isAlgorithmRecommended = algorithmRecommendations?.[opt.value]?.recommended;
                                                const isRecommended = recommendations?.performance_method === opt.value || isConsultantRecommended || isAlgorithmRecommended;
                                                return (
                                                    <div key={opt.value} className={`relative ${isConsultantRecommended ? 'ring-2 ring-primary' : ''}`}>
                                                        <label className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${isConsultantRecommended ? 'bg-primary/5 border-primary/30' : ''}`}>
                                                            <RadioGroupItem value={opt.value} id={opt.value} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-semibold">{opt.label}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        {isConsultantRecommended && (
                                                                            <Badge variant="default" className="bg-primary">
                                                                                Consultant Recommended
                                                                            </Badge>
                                                                        )}
                                                                        {!isConsultantRecommended && isAlgorithmRecommended && (
                                                                            <Badge variant="outline">Algorithm Recommended</Badge>
                                                                        )}
                                                                        {isRecommended && !isConsultantRecommended && !isAlgorithmRecommended && (
                                                                            <RecommendationBadge />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                                {isConsultantRecommended && (
                                                                    <p className="text-xs text-primary mt-1 font-medium">
                                                                        ✓ This is your consultant's recommended option
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'structure' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Evaluation Structure</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="mb-2 block">Evaluation Type</Label>
                                                    <RadioGroup value={data.evaluation_type} onValueChange={(v) => setData('evaluation_type', v)} className="grid grid-cols-3 gap-4">
                                                        {TYPE_OPTIONS.map(opt => (
                                                            <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                                <RadioGroupItem value={opt.toLowerCase()} id={`type-${opt}`} />
                                                                <Label htmlFor={`type-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                                <div>
                                                    <Label className="mb-2 block">Evaluation Scale</Label>
                                                    <RadioGroup value={data.evaluation_scale} onValueChange={(v) => setData('evaluation_scale', v)} className="grid grid-cols-3 gap-4">
                                                        {SCALE_OPTIONS.map(opt => (
                                                            <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                                <RadioGroupItem value={opt.toLowerCase()} id={`scale-${opt}`} />
                                                                <Label htmlFor={`scale-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'snapshot' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Strategic Performance Snapshot</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Please answer the following questions to help us understand your current performance management approach.
                                            </p>
                                        </div>
                                        {snapshotQuestions.map((question, idx) => (
                                            <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                                                <Label className="text-base font-medium">
                                                    {idx + 1}. {question.question_text}
                                                </Label>
                                                {question.answer_type === 'select_one' && (
                                                    <RadioGroup
                                                        value={Array.isArray(snapshotResponses[question.id]) 
                                                            ? snapshotResponses[question.id][0] 
                                                            : snapshotResponses[question.id] as string || ''}
                                                        onValueChange={(v) => setSnapshotResponses({ ...snapshotResponses, [question.id]: v })}
                                                    >
                                                        {question.options.map((option, optIdx) => (
                                                            <div key={optIdx} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`q${question.id}-opt${optIdx}`} />
                                                                <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer">{option}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                                {question.answer_type === 'select_up_to_2' && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIdx) => {
                                                            const selected = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).includes(option)
                                                                : false;
                                                            const selectedCount = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).length 
                                                                : 0;
                                                            return (
                                                                <div key={optIdx} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`q${question.id}-opt${optIdx}`}
                                                                        checked={selected}
                                                                        disabled={!selected && selectedCount >= 2}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = Array.isArray(snapshotResponses[question.id]) 
                                                                                ? snapshotResponses[question.id] as string[]
                                                                                : [];
                                                                            if (checked) {
                                                                                setSnapshotResponses({ ...snapshotResponses, [question.id]: [...current, option] });
                                                                            } else {
                                                                                setSnapshotResponses({ ...snapshotResponses, [question.id]: current.filter(v => v !== option) });
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer">{option}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {question.answer_type === 'select_all_that_apply' && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIdx) => {
                                                            const selected = Array.isArray(snapshotResponses[question.id]) 
                                                                ? (snapshotResponses[question.id] as string[]).includes(option)
                                                                : false;
                                                            return (
                                                                <div key={optIdx} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`q${question.id}-opt${optIdx}`}
                                                                        checked={selected}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = Array.isArray(snapshotResponses[question.id]) 
                                                                                ? snapshotResponses[question.id] as string[]
                                                                                : [];
                                                                            if (checked) {
                                                                                setSnapshotResponses({ ...snapshotResponses, [question.id]: [...current, option] });
                                                                            } else {
                                                                                setSnapshotResponses({ ...snapshotResponses, [question.id]: current.filter(v => v !== option) });
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer">{option}</Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <Button onClick={handleSnapshotSave} className="w-full">Save</Button>
                                    </div>
                                )}

                                {activeTab === 'kpi-review' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Organizational KPI Review</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Define KPIs for each organizational unit. Click on organization names to view/edit KPIs.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Select Organization</Label>
                                                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select organization" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {orgChartMappings.map((mapping) => (
                                                            <SelectItem key={mapping.id} value={mapping.org_unit_name}>
                                                                {mapping.org_unit_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-end">
                                                <Button onClick={() => {
                                                    if (selectedOrg) {
                                                        setKpis([...kpis, {
                                                            id: 0,
                                                            organization_name: selectedOrg,
                                                            kpi_name: '',
                                                            is_active: true,
                                                            status: 'draft',
                                                        } as OrganizationalKpi]);
                                                    }
                                                }}>
                                                    <Plus className="w-4 h-4 mr-2" /> Add KPI
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {kpis.filter(k => !selectedOrg || k.organization_name === selectedOrg).map((kpi, idx) => (
                                                <Card key={idx}>
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>KPI Name</Label>
                                                                <Input
                                                                    value={kpi.kpi_name}
                                                                    onChange={(e) => {
                                                                        const updated = [...kpis];
                                                                        updated[idx] = { ...updated[idx], kpi_name: e.target.value };
                                                                        setKpis(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Weight (%)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={kpi.weight || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...kpis];
                                                                        updated[idx] = { ...updated[idx], weight: parseFloat(e.target.value) || 0 };
                                                                        setKpis(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label>Purpose</Label>
                                                            <Textarea
                                                                value={kpi.purpose || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...kpis];
                                                                    updated[idx] = { ...updated[idx], purpose: e.target.value };
                                                                    setKpis(updated);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <Button variant="ghost" size="sm" onClick={() => {
                                                                setKpis(kpis.filter((_, i) => i !== idx));
                                                            }}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                        <Button onClick={handleKpiSave} className="w-full">Save</Button>
                                    </div>
                                )}

                                {activeTab === 'model-assignment' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Evaluation Model Assignment</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Assign the most appropriate performance model (MBO, BSC, or OKR) to each job role.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <Card className="p-4">
                                                <h4 className="font-semibold mb-2">MBO</h4>
                                                <p className="text-sm text-muted-foreground">Management by Objectives</p>
                                            </Card>
                                            <Card className="p-4">
                                                <h4 className="font-semibold mb-2">BSC</h4>
                                                <p className="text-sm text-muted-foreground">Balanced Scorecard</p>
                                            </Card>
                                            <Card className="p-4">
                                                <h4 className="font-semibold mb-2">OKR</h4>
                                                <p className="text-sm text-muted-foreground">Objectives and Key Results</p>
                                            </Card>
                                        </div>
                                        <div className="space-y-2">
                                            {jobDefinitions.map((job) => (
                                                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <Label className="font-medium">{job.job_name}</Label>
                                                        {job.job_keyword && (
                                                            <p className="text-sm text-muted-foreground">{job.job_keyword.keyword}</p>
                                                        )}
                                                    </div>
                                                    <Select
                                                        value={modelAssignments[job.id] || ''}
                                                        onValueChange={(value: 'mbo' | 'bsc' | 'okr') => {
                                                            setModelAssignments({ ...modelAssignments, [job.id]: value });
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Select model" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="mbo">MBO</SelectItem>
                                                            <SelectItem value="bsc">BSC</SelectItem>
                                                            <SelectItem value="okr">OKR</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </div>
                                        <Button onClick={handleModelAssignmentSave} className="w-full">Save</Button>
                                    </div>
                                )}

                                {activeTab === 'evaluation-structure' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Organizational Evaluation</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                This evaluation structure defines the common performance evaluation framework applied across the entire company.
                                            </p>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Evaluation Cycle</Label>
                                                    <Select
                                                        value={evalStructure.org_evaluation_cycle || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_cycle: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select cycle" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="annual">Annual</SelectItem>
                                                            <SelectItem value="semi_annual">Semi-annual</SelectItem>
                                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Evaluation Method</Label>
                                                    <Select
                                                        value={evalStructure.org_evaluation_method || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_method: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="absolute">Absolute evaluation</SelectItem>
                                                            <SelectItem value="relative">Relative evaluation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Rating Scale</Label>
                                                    <Select
                                                        value={evalStructure.org_rating_scale || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, org_rating_scale: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select scale" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3_level">3-level</SelectItem>
                                                            <SelectItem value="4_level">4-level</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Individual Evaluation</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Evaluation Cycle</Label>
                                                    <Select
                                                        value={evalStructure.individual_evaluation_cycle || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_evaluation_cycle: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select cycle" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="annual">Annual</SelectItem>
                                                            <SelectItem value="semi_annual">Semi-annual</SelectItem>
                                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Evaluation Method</Label>
                                                    <Select
                                                        value={evalStructure.individual_evaluation_method || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_evaluation_method: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="absolute">Absolute evaluation</SelectItem>
                                                            <SelectItem value="relative">Relative evaluation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Rating Scale</Label>
                                                    <Select
                                                        value={evalStructure.individual_rating_scale || ''}
                                                        onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_rating_scale: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select scale" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3_level">3-level</SelectItem>
                                                            <SelectItem value="4_level">4-level</SelectItem>
                                                            <SelectItem value="5_level">5-level</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={handleEvaluationStructureSave} className="w-full">Save</Button>
                                    </div>
                                )}

                                {activeTab === 'review' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Review & Submit Performance System</h3>
                                        <div className="space-y-3">
                                            <Card><CardContent className="p-4"><strong>Evaluation Unit:</strong> {data.evaluation_unit || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Performance Method:</strong> {data.performance_method || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Evaluation Structure:</strong> Type: {data.evaluation_type || '-'} | Scale: {data.evaluation_scale || '-'}</CardContent></Card>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                            <Button variant="outline" onClick={() => {
                                const idx = TABS.findIndex(t => t.id === activeTab);
                                if (idx > 0) setActiveTab(TABS[idx - 1].id);
                            }} disabled={activeTab === 'overview'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button onClick={() => {
                                    const idx = TABS.findIndex(t => t.id === activeTab);
                                    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                                }}>Next →</Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing}>Submit</Button>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
