import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import RecommendationBadge from '@/components/DesignSteps/RecommendationBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Settings, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, Plus, Trash2, Edit, Send, AlertCircle } from 'lucide-react';
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
    stepStatuses?: Record<string, string>;
    projectId?: number;
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'snapshot', label: 'Stage 4-1: Strategic Performance Snapshot' },
    { id: 'kpi-review', label: 'Stage 4-2: Organizational KPI Suggestions' },
    { id: 'model-assignment', label: 'Stage 4-5: Evaluation Model Assignment' },
    { id: 'evaluation-structure', label: 'Stage 4-6: Evaluation Structure' },
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
    stepStatuses = {},
    projectId,
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);

    // Sync activeTab with URL when it changes
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get(`/hr-manager/performance-system/${project.id}/${newTab}`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['activeTab'],
            replace: true,
        });
    };

    // Update activeTab when initialTab changes (from URL)
    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

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
    const [kpisInitialized, setKpisInitialized] = useState(false);

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

    // Auto-save evaluation unit and performance method - smooth auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.evaluation_unit || data.performance_method || data.evaluation_type || data.evaluation_scale) {
                post(`/hr-manager/performance-system/${project.id}`, {
                    data: {
                        tab: 'overview',
                        evaluation_units: data.evaluation_unit ? [data.evaluation_unit] : [],
                        performance_methods: data.performance_method ? [data.performance_method] : [],
                        assessment_structure: {
                            type: data.evaluation_type,
                            scale: data.evaluation_scale,
                        }
                    },
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project', 'performanceSystem'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [data.evaluation_unit, data.performance_method, data.evaluation_type, data.evaluation_scale]);

    // Auto-save snapshot responses - smooth auto-save
    useEffect(() => {
        if (activeTab !== 'snapshot') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(snapshotResponses).length > 0) {
                const responses = snapshotQuestions.map(q => ({
                    question_id: q.id,
                    response: snapshotResponses[q.id] || [],
                    text_response: null,
                }));
                post(`/hr-manager/performance-system/${project.id}`, {
                    data: { tab: 'snapshot', responses },
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [snapshotResponses, activeTab]);

    // Auto-save model assignments - smooth auto-save
    useEffect(() => {
        if (activeTab !== 'model-assignment') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(modelAssignments).length > 0) {
                const assignments = Object.entries(modelAssignments).map(([jobId, model]) => ({
                    job_definition_id: parseInt(jobId),
                    evaluation_model: model,
                }));
                post(`/hr-manager/performance-system/${project.id}`, {
                    data: { tab: 'model-assignment', assignments },
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [modelAssignments, activeTab]);

    // Auto-save evaluation structure - smooth auto-save
    useEffect(() => {
        if (activeTab !== 'evaluation-structure') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(evalStructure).length > 0) {
                post(`/hr-manager/performance-system/${project.id}`, {
                    data: { tab: 'evaluation-structure', ...evalStructure },
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [evalStructure, activeTab]);

    // Auto-save KPIs - smooth auto-save (only when user makes changes, not on initial load)
    useEffect(() => {
        if (!kpisInitialized && kpis.length > 0) {
            setKpisInitialized(true);
            return;
        }
    }, [kpis.length, kpisInitialized]);
    
    useEffect(() => {
        if (activeTab !== 'kpi-review' || !kpisInitialized) return;
        
        const timer = setTimeout(() => {
            if (kpis.length > 0) {
                post(`/hr-manager/performance-system/${project.id}`, {
                    data: { tab: 'kpi-review', kpis },
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [kpis, activeTab, kpisInitialized]);

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
            preserveState: true,
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
            preserveState: true,
        });
    };

    const handleEvaluationStructureSave = () => {
        post(`/hr-manager/performance-system/${project.id}`, {
            data: { tab: 'evaluation-structure', ...evalStructure },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={project.id}
        >
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

                        <TabNavigation tabs={TABS} activeTab={activeTab} completedTabs={completedTabs} onTabChange={handleTabChange} />

                        <Card>
                            <CardContent className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="text-center py-12">
                                        <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Performance System Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Design your performance evaluation framework including evaluation units, management methods (KPI/MBO/OKR/BSC), and assessment structures.
                                        </p>
                                        <Button onClick={() => handleTabChange('snapshot')} size="lg">Start Design →</Button>
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
                                        {snapshotQuestions && snapshotQuestions.length > 0 ? (
                                            snapshotQuestions.map((question, idx) => (
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
                                            ))
                                        ) : (
                                            <Card className="border-yellow-200 bg-yellow-50">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                                        <div>
                                                            <p className="font-medium text-yellow-800 mb-1">No Questions Available</p>
                                                            <p className="text-sm text-yellow-700">
                                                                Performance snapshot questions have not been configured yet. Please contact the administrator to set up the questions in the admin panel.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                        {/* Save button removed - data auto-saves, only submit on Review & Submit tab */}
                                    </div>
                                )}

                                {activeTab === 'kpi-review' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Organizational KPI Suggestions</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Define KPIs for each organizational unit. Add/Delete KPIs and activate them for review.
                                            </p>
                                        </div>
                                        
                                        {/* Organization Selection and Add KPI */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Select Organization</Label>
                                                <Select value={selectedOrg || ''} onValueChange={setSelectedOrg}>
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
                                            <div className="flex items-end gap-2">
                                                <Button onClick={() => {
                                                    if (selectedOrg) {
                                                        setKpis([...kpis, {
                                                            id: 0,
                                                            organization_name: selectedOrg,
                                                            kpi_name: '',
                                                            category: '',
                                                            purpose: '',
                                                            linked_job_id: undefined,
                                                            linked_csf: '',
                                                            formula: '',
                                                            measurement_method: '',
                                                            weight: 0,
                                                            is_active: false,
                                                            status: 'draft',
                                                        } as OrganizationalKpi]);
                                                    }
                                                }} disabled={!selectedOrg}>
                                                    <Plus className="w-4 h-4 mr-2" /> Add KPI
                                                </Button>
                                                <Button variant="outline" onClick={() => setSelectedOrg(null)}>
                                                    Show All
                                                </Button>
                                            </div>
                                        </div>

                                        {/* KPI Table */}
                                        <Card>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Purpose</TableHead>
                                                            <TableHead>Linked Job</TableHead>
                                                            <TableHead>Linked CSF</TableHead>
                                                            <TableHead>Formula</TableHead>
                                                            <TableHead>Measurement Method</TableHead>
                                                            <TableHead>Weight</TableHead>
                                                            <TableHead>Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {kpis.filter(k => !selectedOrg || k.organization_name === selectedOrg).map((kpi, idx) => {
                                                            const actualIdx = kpis.findIndex(k => k === kpi);
                                                            const linkedJob = jobDefinitions.find(j => j.id === kpi.linked_job_id);
                                                            const csfs = linkedJob?.csfs || [];
                                                            return (
                                                                <TableRow key={actualIdx}>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.category || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], category: e.target.value };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="Category"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.kpi_name}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], kpi_name: e.target.value };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="KPI Name"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Textarea
                                                                            value={kpi.purpose || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], purpose: e.target.value };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="Purpose"
                                                                            className="min-w-[150px]"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Select
                                                                            value={kpi.linked_job_id?.toString() || 'none'}
                                                                            onValueChange={(v) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], linked_job_id: v === 'none' ? undefined : parseInt(v) };
                                                                                setKpis(updated);
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="min-w-[120px]">
                                                                                <SelectValue placeholder="Select Job" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">None</SelectItem>
                                                                                {jobDefinitions.map((job) => (
                                                                                    <SelectItem key={job.id} value={job.id.toString()}>
                                                                                        {job.job_name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Select
                                                                            value={kpi.linked_csf || 'none'}
                                                                            onValueChange={(v) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], linked_csf: v === 'none' ? '' : v };
                                                                                setKpis(updated);
                                                                            }}
                                                                            disabled={!kpi.linked_job_id}
                                                                        >
                                                                            <SelectTrigger className="min-w-[120px]">
                                                                                <SelectValue placeholder="Select CSF" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">None</SelectItem>
                                                                                {csfs.map((csf, csfIdx) => (
                                                                                    <SelectItem key={csfIdx} value={csf.name}>
                                                                                        {csf.name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.formula || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], formula: e.target.value };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="Formula"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.measurement_method || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], measurement_method: e.target.value };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="Measurement Method"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            value={kpi.weight || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...kpis];
                                                                                updated[actualIdx] = { ...updated[actualIdx], weight: parseFloat(e.target.value) || 0 };
                                                                                setKpis(updated);
                                                                            }}
                                                                            placeholder="Weight %"
                                                                            className="w-20"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant={kpi.is_active ? "default" : "outline"}
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const updated = [...kpis];
                                                                                    updated[actualIdx] = { ...updated[actualIdx], is_active: !kpi.is_active };
                                                                                    setKpis(updated);
                                                                                }}
                                                                            >
                                                                                {kpi.is_active ? 'Active' : 'Activate'}
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setKpis(kpis.filter((_, i) => i !== actualIdx));
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                                {kpis.filter(k => !selectedOrg || k.organization_name === selectedOrg).length === 0 && (
                                                    <div className="p-8 text-center text-muted-foreground">
                                                        No KPIs defined yet. Select an organization and click "Add KPI" to get started.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Leader Review Section */}
                                        <Card>
                                            <CardContent className="p-6">
                                                <h4 className="font-semibold mb-4">Leader Review Status</h4>
                                                <div className="space-y-3">
                                                    {Array.from(new Set(kpis.map(k => k.organization_name))).map((orgName) => {
                                                        const orgKpis = kpis.filter(k => k.organization_name === orgName);
                                                        const orgMapping = orgChartMappings.find(m => m.org_unit_name === orgName);
                                                        const allApproved = orgKpis.every(k => k.status === 'approved');
                                                        const hasRevisionRequest = orgKpis.some(k => k.status === 'revision_requested');
                                                        const status = allApproved ? 'approved' : hasRevisionRequest ? 'revision_requested' : 'not_reviewed';
                                                        return (
                                                            <div key={orgName} className="flex items-center justify-between p-4 border rounded-lg">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-medium">{orgName}</span>
                                                                        <Badge variant={
                                                                            status === 'approved' ? 'default' :
                                                                            status === 'revision_requested' ? 'destructive' : 'secondary'
                                                                        }>
                                                                            {status === 'approved' ? 'Approved' :
                                                                             status === 'revision_requested' ? 'Revision Requested' : 'Not Reviewed'}
                                                                        </Badge>
                                                                    </div>
                                                                    {hasRevisionRequest && orgKpis.some(k => k.revision_comment) && (
                                                                        <p className="text-sm text-muted-foreground mt-2">
                                                                            {orgKpis.find(k => k.revision_comment)?.revision_comment}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end">
                                            <Button onClick={() => {
                                                // Data is auto-saved, so we can directly send the email
                                                // TODO: Implement email sending
                                                alert('Review request emails will be sent to organization leaders.');
                                            }}>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Review Request Email to Organization Leader
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'model-assignment' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Evaluation Model Assignment</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Assign the most appropriate performance model to each job role. Drag job roles into model cards or use the dropdown selector.
                                            </p>
                                        </div>

                                        {/* Model Cards with Descriptions */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <Card className="p-6 border-2">
                                                <CardContent className="p-0">
                                                    <h4 className="font-bold text-lg mb-3">MBO</h4>
                                                    <p className="text-sm font-medium mb-2">Management by Objectives</p>
                                                    <p className="text-xs text-muted-foreground mb-4">
                                                        Evaluates performance based on clearly defined individual goals. Employees are assessed based on the extent to which they achieve predefined, measurable objectives within a specific period.
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold">Recommended Job Types:</p>
                                                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                                                            <li>Sales Manager</li>
                                                            <li>Recruiter</li>
                                                            <li>Production Operator</li>
                                                            <li>Customer Success Manager</li>
                                                            <li>Business Development Manager</li>
                                                        </ul>
                                                    </div>
                                                    <div className="mt-4 p-3 bg-muted rounded">
                                                        <p className="text-xs font-semibold mb-1">Assigned Jobs:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'mbo').map(job => (
                                                                <Badge key={job.id} variant="secondary" className="text-xs mr-1 mb-1">
                                                                    {job.job_name}
                                                                </Badge>
                                                            ))}
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'mbo').length === 0 && (
                                                                <p className="text-xs text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="p-6 border-2">
                                                <CardContent className="p-0">
                                                    <h4 className="font-bold text-lg mb-3">BSC</h4>
                                                    <p className="text-sm font-medium mb-2">Balanced Scorecard</p>
                                                    <p className="text-xs text-muted-foreground mb-4">
                                                        Defines 1–2 core missions derived from organizational KPIs and evaluates how effectively those missions contribute across four balanced perspectives: Financial, Customer, Internal Process, and Organizational Capability.
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold">Recommended Job Types:</p>
                                                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                                                            <li>HR Manager</li>
                                                            <li>Finance Manager</li>
                                                            <li>Operations Manager</li>
                                                            <li>Quality Manager</li>
                                                            <li>Administrative Manager</li>
                                                        </ul>
                                                    </div>
                                                    <div className="mt-4 p-3 bg-muted rounded">
                                                        <p className="text-xs font-semibold mb-1">Assigned Jobs:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'bsc').map(job => (
                                                                <Badge key={job.id} variant="secondary" className="text-xs mr-1 mb-1">
                                                                    {job.job_name}
                                                                </Badge>
                                                            ))}
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'bsc').length === 0 && (
                                                                <p className="text-xs text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="p-6 border-2">
                                                <CardContent className="p-0">
                                                    <h4 className="font-bold text-lg mb-3">OKR</h4>
                                                    <p className="text-sm font-medium mb-2">Objectives and Key Results</p>
                                                    <p className="text-xs text-muted-foreground mb-4">
                                                        A goal-setting framework that aligns individual and team efforts with strategic priorities. Emphasizes ambitious goals and measurable progress through key results.
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold">Recommended Job Types:</p>
                                                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                                                            <li>R&D Engineer</li>
                                                            <li>Product Manager</li>
                                                            <li>Software Engineer</li>
                                                            <li>Marketing Specialist</li>
                                                            <li>Strategy Manager</li>
                                                        </ul>
                                                    </div>
                                                    <div className="mt-4 p-3 bg-muted rounded">
                                                        <p className="text-xs font-semibold mb-1">Assigned Jobs:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'okr').map(job => (
                                                                <Badge key={job.id} variant="secondary" className="text-xs mr-1 mb-1">
                                                                    {job.job_name}
                                                                </Badge>
                                                            ))}
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'okr').length === 0 && (
                                                                <p className="text-xs text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Job Role Pool */}
                                        <Card>
                                            <CardContent className="p-6">
                                                <h4 className="font-semibold mb-4">Available Job Roles</h4>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Click on a job role to assign it to a model, or use the dropdown selector.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {jobDefinitions.map((job) => (
                                                        <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                                            <div className="flex-1">
                                                                <Label className="font-medium text-sm">{job.job_name}</Label>
                                                                {job.job_keyword && (
                                                                    <p className="text-xs text-muted-foreground">{job.job_keyword.keyword}</p>
                                                                )}
                                                            </div>
                                                            <Select
                                                                value={modelAssignments[job.id] || ''}
                                                                onValueChange={(value: 'mbo' | 'bsc' | 'okr') => {
                                                                    setModelAssignments({ ...modelAssignments, [job.id]: value });
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue placeholder="Select" />
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
                                            </CardContent>
                                        </Card>

                                        {/* Assigned Mapping Summary */}
                                        <Card className="bg-muted/50">
                                            <CardContent className="p-6">
                                                <h4 className="font-semibold mb-4">Assigned Mapping Summary</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">MBO:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'mbo').length > 0 ? (
                                                                jobDefinitions.filter(j => modelAssignments[j.id] === 'mbo').map(job => (
                                                                    <p key={job.id} className="text-sm text-muted-foreground">• {job.job_name}</p>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">BSC:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'bsc').length > 0 ? (
                                                                jobDefinitions.filter(j => modelAssignments[j.id] === 'bsc').map(job => (
                                                                    <p key={job.id} className="text-sm text-muted-foreground">• {job.job_name}</p>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">OKR:</p>
                                                        <div className="space-y-1">
                                                            {jobDefinitions.filter(j => modelAssignments[j.id] === 'okr').length > 0 ? (
                                                                jobDefinitions.filter(j => modelAssignments[j.id] === 'okr').map(job => (
                                                                    <p key={job.id} className="text-sm text-muted-foreground">• {job.job_name}</p>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">No jobs assigned</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Save button removed - data auto-saves, only submit on Review & Submit tab */}
                                    </div>
                                )}

                                {activeTab === 'evaluation-structure' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Evaluation Structure</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                This evaluation structure defines the common performance evaluation framework applied across the entire company. Regardless of the evaluation model used (such as OKR, MBO, or BSC), it establishes the foundational evaluation framework to ensure that all employees are assessed fairly and consistently using the same standards and procedures.
                                            </p>
                                        </div>

                                        {/* Organizational Evaluation */}
                                        <Card>
                                            <CardContent className="p-6">
                                                <h4 className="text-lg font-semibold mb-4">Organizational Evaluation (Precedes Individual Evaluation)</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Evaluation Cycle</Label>
                                                        <Select
                                                            value={evalStructure.org_evaluation_cycle || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_cycle: v })}
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
                                                        <Label>Evaluation Timing</Label>
                                                        <Select
                                                            value={evalStructure.org_evaluation_timing || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_timing: v })}
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
                                                        <Label>Evaluator Type</Label>
                                                        <Select
                                                            value={evalStructure.org_evaluator_type || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluator_type: v })}
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
                                                        <Label>Evaluation Method</Label>
                                                        <Select
                                                            value={evalStructure.org_evaluation_method || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_method: v })}
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
                                                        <Label>Rating Scale</Label>
                                                        <Select
                                                            value={evalStructure.org_rating_scale || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_rating_scale: v })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select One" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="3_level">3-level (A B C)</SelectItem>
                                                                <SelectItem value="4_level">4-level (A B C D)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Rating Distribution (%)</Label>
                                                        <Input
                                                            type="text"
                                                            value={evalStructure.org_rating_distribution || ''}
                                                            onChange={(e) => setEvalStructure({ ...evalStructure, org_rating_distribution: e.target.value })}
                                                            placeholder="e.g., 30% 40% 30%"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Evaluation Group</Label>
                                                        <Select
                                                            value={evalStructure.org_evaluation_group || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_evaluation_group: v })}
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
                                                        <Label>Use of Evaluation Results</Label>
                                                        <Select
                                                            value={evalStructure.org_use_of_results || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_use_of_results: v })}
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
                                        <Card>
                                            <CardContent className="p-6">
                                                <h4 className="text-lg font-semibold mb-4">Individual Evaluation (Follows Organizational Evaluation)</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Evaluation Cycle</Label>
                                                        <Select
                                                            value={evalStructure.individual_evaluation_cycle || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_evaluation_cycle: v })}
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
                                                        <Label>Evaluation Timing</Label>
                                                        <Select
                                                            value={evalStructure.individual_evaluation_timing || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_evaluation_timing: v })}
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
                                                        <Label>Evaluator Type (Multi Choice)</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {['top_down', 'multi_rater'].map(type => (
                                                                <div key={type} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`eval-type-${type}`}
                                                                        checked={(evalStructure.individual_evaluator_types || []).includes(type)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = evalStructure.individual_evaluator_types || [];
                                                                            setEvalStructure({
                                                                                ...evalStructure,
                                                                                individual_evaluator_types: checked
                                                                                    ? [...current, type]
                                                                                    : current.filter(t => t !== type)
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`eval-type-${type}`} className="cursor-pointer">
                                                                        {type === 'top_down' ? 'Top-down evaluation' : 'Multi-rater evaluation'}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Evaluators (Multi Choice)</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {['self_evaluation', 'primary_evaluator', 'secondary_evaluator', 'tertiary_evaluator', 'peer_same_dept', 'peer_adjacent_dept'].map(evaluator => (
                                                                <div key={evaluator} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`evaluator-${evaluator}`}
                                                                        checked={(evalStructure.individual_evaluators || []).includes(evaluator)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = evalStructure.individual_evaluators || [];
                                                                            setEvalStructure({
                                                                                ...evalStructure,
                                                                                individual_evaluators: checked
                                                                                    ? [...current, evaluator]
                                                                                    : current.filter(e => e !== evaluator)
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`evaluator-${evaluator}`} className="cursor-pointer text-sm">
                                                                        {evaluator === 'self_evaluation' ? 'Self-evaluation' :
                                                                         evaluator === 'primary_evaluator' ? 'Primary evaluator' :
                                                                         evaluator === 'secondary_evaluator' ? 'Secondary evaluator' :
                                                                         evaluator === 'tertiary_evaluator' ? 'Tertiary evaluator' :
                                                                         evaluator === 'peer_same_dept' ? 'Peer (same department)' :
                                                                         'Peer (adjacent department)'}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Evaluation Method</Label>
                                                        <Select
                                                            value={evalStructure.individual_evaluation_method || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_evaluation_method: v })}
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
                                                        <Label>Rating Scale</Label>
                                                        <Select
                                                            value={evalStructure.individual_rating_scale || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, individual_rating_scale: v })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select One" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="3_level">3-level (A B C)</SelectItem>
                                                                <SelectItem value="4_level">4-level (A B C D)</SelectItem>
                                                                <SelectItem value="5_level">5-level (S A B C D)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Rating Distribution (%)</Label>
                                                        <Input
                                                            type="text"
                                                            value={evalStructure.individual_rating_distribution || ''}
                                                            onChange={(e) => setEvalStructure({ ...evalStructure, individual_rating_distribution: e.target.value })}
                                                            placeholder="e.g., 10% 15% 60% 10% 5%"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Evaluation Group (Multi Choice)</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {['company_wide', 'job_family', 'organization', 'job_level'].map(group => (
                                                                <div key={group} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`eval-group-${group}`}
                                                                        checked={(evalStructure.individual_evaluation_groups || []).includes(group)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = evalStructure.individual_evaluation_groups || [];
                                                                            setEvalStructure({
                                                                                ...evalStructure,
                                                                                individual_evaluation_groups: checked
                                                                                    ? [...current, group]
                                                                                    : current.filter(g => g !== group)
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`eval-group-${group}`} className="cursor-pointer text-sm">
                                                                        {group === 'company_wide' ? 'Company-wide single pool' :
                                                                         group === 'job_family' ? 'Job family-based pool' :
                                                                         group === 'organization' ? 'Organization-based pool' :
                                                                         'Job level-based pool'}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Use of Evaluation Results (Multi Choice)</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {['salary_adjustment', 'bonus_allocation', 'promotion', 'position_assignment', 'training_selection', 'differentiated_benefits', 'other'].map(use => (
                                                                <div key={use} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`use-result-${use}`}
                                                                        checked={(evalStructure.individual_use_of_results || []).includes(use)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = evalStructure.individual_use_of_results || [];
                                                                            setEvalStructure({
                                                                                ...evalStructure,
                                                                                individual_use_of_results: checked
                                                                                    ? [...current, use]
                                                                                    : current.filter(u => u !== use)
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`use-result-${use}`} className="cursor-pointer text-sm">
                                                                        {use === 'salary_adjustment' ? 'Salary adjustment' :
                                                                         use === 'bonus_allocation' ? 'Bonus allocation' :
                                                                         use === 'promotion' ? 'Promotion' :
                                                                         use === 'position_assignment' ? 'Position assignment' :
                                                                         use === 'training_selection' ? 'Training selection' :
                                                                         use === 'differentiated_benefits' ? 'Differentiated benefits' :
                                                                         'Other (text)'}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label>Organization Leader Evaluation</Label>
                                                        <Select
                                                            value={evalStructure.org_leader_evaluation || ''}
                                                            onValueChange={(v) => setEvalStructure({ ...evalStructure, org_leader_evaluation: v })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select One" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="replaced_by_org">Replaced by organizational evaluation</SelectItem>
                                                                <SelectItem value="separate_individual">Conducted separately as individual evaluation</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-primary/5 border-primary/20">
                                            <CardContent className="p-6">
                                                <p className="text-sm font-medium text-primary">
                                                    Consultant-Reviewed Final Report Notice: Based on your inputs and organizational context, a final HR design report incorporating professional consultant review and judgment will be provided.
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Save button removed - data auto-saves, only submit on Review & Submit tab */}
                                    </div>
                                )}

                                {activeTab === 'review' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">Review & Submit Performance System</h3>
                                            <p className="text-muted-foreground">Please review all the information below before submitting.</p>
                                        </div>

                                        {/* Overview Section */}
                                        <Card>
                                            <CardContent className="p-6">
                                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    Overview
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Evaluation Unit</p>
                                                        <p className="font-medium">{data.evaluation_unit || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Performance Method</p>
                                                        <p className="font-medium">
                                                            {METHOD_OPTIONS.find(m => m.value === data.performance_method)?.label || data.performance_method || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Evaluation Type</p>
                                                        <p className="font-medium">{data.evaluation_type || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Evaluation Scale</p>
                                                        <p className="font-medium">{data.evaluation_scale || '-'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Snapshot Responses Summary */}
                                        {snapshotQuestions.length > 0 && (
                                            <Card>
                                                <CardContent className="p-6">
                                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        Strategic Performance Snapshot
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {snapshotQuestions.map((question) => {
                                                            const response = snapshotResponses[question.id];
                                                            const responseText = Array.isArray(response) 
                                                                ? response.join(', ') 
                                                                : response || 'Not answered';
                                                            return (
                                                                <div key={question.id} className="border-b pb-3 last:border-0">
                                                                    <p className="text-sm font-medium mb-1">{question.question_text}</p>
                                                                    <p className="text-sm text-muted-foreground">{responseText}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* KPIs Summary */}
                                        {kpis.length > 0 && (
                                            <Card>
                                                <CardContent className="p-6">
                                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        Organizational KPIs ({kpis.length} total)
                                                    </h4>
                                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                                        {Object.entries(
                                                            kpis.reduce((acc, kpi) => {
                                                                if (!acc[kpi.organization_name]) {
                                                                    acc[kpi.organization_name] = [];
                                                                }
                                                                acc[kpi.organization_name].push(kpi);
                                                                return acc;
                                                            }, {} as Record<string, OrganizationalKpi[]>)
                                                        ).map(([orgName, orgKpis]) => (
                                                            <div key={orgName} className="border-b pb-3 last:border-0">
                                                                <p className="font-medium mb-2">{orgName}</p>
                                                                <div className="space-y-1 ml-4">
                                                                    {orgKpis.map((kpi) => (
                                                                        <p key={kpi.id} className="text-sm text-muted-foreground">
                                                                            • {kpi.kpi_name} {kpi.is_active ? '(Active)' : '(Inactive)'}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Model Assignments Summary */}
                                        {Object.keys(modelAssignments).length > 0 && (
                                            <Card>
                                                <CardContent className="p-6">
                                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        Evaluation Model Assignments
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {['mbo', 'bsc', 'okr'].map((model) => {
                                                            const assignedJobs = jobDefinitions.filter(j => modelAssignments[j.id] === model);
                                                            return (
                                                                <div key={model} className="border rounded-lg p-4">
                                                                    <p className="font-semibold mb-2 uppercase">{model}</p>
                                                                    <div className="space-y-1">
                                                                        {assignedJobs.length > 0 ? (
                                                                            assignedJobs.map((job) => (
                                                                                <p key={job.id} className="text-sm text-muted-foreground">
                                                                                    • {job.job_name}
                                                                                </p>
                                                                            ))
                                                                        ) : (
                                                                            <p className="text-sm text-muted-foreground italic">No jobs assigned</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Evaluation Structure Summary */}
                                        {Object.keys(evalStructure).length > 0 && (
                                            <Card>
                                                <CardContent className="p-6">
                                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        Evaluation Structure
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {/* Organizational Evaluation */}
                                                        <div>
                                                            <h5 className="font-medium mb-3">Organizational Evaluation</h5>
                                                            <div className="space-y-2 text-sm">
                                                                {evalStructure.org_evaluation_cycle && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Cycle: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.org_evaluation_cycle.replace('_', '-')}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.org_evaluation_timing && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Timing: </span>
                                                                        <span className="font-medium">{evalStructure.org_evaluation_timing}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.org_evaluator_type && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Evaluator: </span>
                                                                        <span className="font-medium">{evalStructure.org_evaluator_type}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.org_evaluation_method && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Method: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.org_evaluation_method}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.org_rating_scale && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Rating Scale: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.org_rating_scale.replace('_', '-')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Individual Evaluation */}
                                                        <div>
                                                            <h5 className="font-medium mb-3">Individual Evaluation</h5>
                                                            <div className="space-y-2 text-sm">
                                                                {evalStructure.individual_evaluation_cycle && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Cycle: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.individual_evaluation_cycle.replace('_', '-')}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.individual_evaluation_timing && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Timing: </span>
                                                                        <span className="font-medium">{evalStructure.individual_evaluation_timing}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.individual_evaluator_types && evalStructure.individual_evaluator_types.length > 0 && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Evaluator Types: </span>
                                                                        <span className="font-medium">{evalStructure.individual_evaluator_types.join(', ')}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.individual_evaluation_method && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Method: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.individual_evaluation_method}</span>
                                                                    </div>
                                                                )}
                                                                {evalStructure.individual_rating_scale && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Rating Scale: </span>
                                                                        <span className="font-medium capitalize">{evalStructure.individual_rating_scale.replace('_', '-')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Submit Notice */}
                                        <Card className="bg-primary/5 border-primary/20">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-primary mb-1">Ready to Submit</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            After submission, your performance system will be reviewed by the consultant. Once approved, you can proceed to the next step.
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                            <Button variant="outline" onClick={() => {
                                const idx = TABS.findIndex(t => t.id === activeTab);
                                if (idx > 0) {
                                    handleTabChange(TABS[idx - 1].id);
                                }
                            }} disabled={activeTab === 'overview'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button onClick={() => {
                                    const idx = TABS.findIndex(t => t.id === activeTab);
                                    if (idx < TABS.length - 1) {
                                        handleTabChange(TABS[idx + 1].id);
                                    }
                                }}>Next →</Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing}>Submit</Button>
                            )}
                        </div>
                    </div>
        </AppLayout>
    );
}
