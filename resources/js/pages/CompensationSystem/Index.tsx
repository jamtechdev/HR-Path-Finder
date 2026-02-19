import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import RecommendationBadge from '@/components/DesignSteps/RecommendationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, Plus, Trash2, AlertCircle, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceSystem {
    performance_method?: string;
    evaluation_unit?: string;
}

interface CompensationSystem {
    id?: number;
    compensation_structure?: string;
    differentiation_logic?: string;
    incentive_types?: string[];
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

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
}

interface CompensationSnapshotResponse {
    id: number;
    question_id: number;
    response?: string[] | string | null;
    text_response?: string | null;
    numeric_response?: number | null;
    question?: CompensationSnapshotQuestion;
}

interface BaseSalaryFramework {
    salary_structure_type?: string;
    salary_adjustment_unit?: string;
    salary_adjustment_grouping?: string;
    salary_adjustment_timing?: number[];
    salary_determination_standard?: string;
    common_salary_increase_rate?: string;
    common_increase_rate_basis?: string;
    performance_based_increase_differentiation?: string;
}

interface PayBand {
    id: number;
    job_grade: string;
    min_salary: number;
    max_salary: number;
    target_salary?: number;
    width?: number;
    factor_a?: number;
    factor_b?: number;
    min_setting_rate_1_2?: number;
    min_setting_rate_3_plus?: number;
    target_rate_increase_1_2?: number;
    target_rate_increase_3_plus?: number;
    zones?: PayBandZone[];
}

interface PayBandZone {
    id: number;
    zone_type: 'low' | 'middle' | 'high';
    min_value: number;
    max_value: number;
    percentage: number;
}

interface SalaryTable {
    id: number;
    job_role: string;
    grade: string;
    years_in_grade: number;
    level_1?: number;
    level_2?: number;
    level_3?: number;
    level_4?: number;
    level_5?: number;
    explanation?: string;
    performanceIncreases?: SalaryTablePerformanceIncrease[];
}

interface SalaryTablePerformanceIncrease {
    id: number;
    rating: 'S' | 'A' | 'B' | 'C' | 'D';
    increase_amount: number;
}

interface PayBandOperationCriteria {
    outlier_handling?: string;
    promotion_movement_rule?: string;
    band_review_cycle?: string;
}

interface BonusPoolConfiguration {
    payment_trigger_condition?: string;
    bonus_pool_determination_criteria?: string;
    bonus_pool_determination_method?: string;
    eligibility_scope?: string;
    eligibility_criteria?: string;
    inclusion_of_employees_on_leave?: string;
    bonus_calculation_unit?: string;
    allocation_scope?: string;
    allocation_criteria?: string[];
    bonus_pool_finalization_timing?: number;
    bonus_payment_month?: number;
    calculation_period_start?: string;
    calculation_period_end?: string;
}

interface BenefitsConfiguration {
    previous_year_total_salary?: number;
    previous_year_total_benefits_expense?: number;
    benefits_expense_ratio?: number;
    benefits_strategic_direction?: Array<{ value: string; priority: 'primary' | 'secondary' }>;
    current_benefits_programs?: Array<{ name: string; status: string }>;
    future_programs?: Array<{ name: string; status: string }>;
}

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        } | null;
        performanceSystem?: PerformanceSystem;
        compensation_snapshot_responses?: CompensationSnapshotResponse[];
        base_salary_framework?: BaseSalaryFramework;
        pay_bands?: PayBand[];
        salary_tables?: SalaryTable[];
        pay_band_operation_criteria?: PayBandOperationCriteria;
        bonus_pool_configuration?: BonusPoolConfiguration;
        benefits_configuration?: BenefitsConfiguration;
    };
    compensationSystem?: CompensationSystem;
    consultantRecommendation?: ConsultantRecommendation;
    algorithmRecommendations?: Record<string, AlgorithmRecommendation>;
    activeTab?: string;
    stepStatuses?: Record<string, string>;
    projectId?: number;
    snapshotQuestions?: CompensationSnapshotQuestion[];
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'snapshot', label: 'Stage 4-1: Strategic Compensation Snapshot' },
    { id: 'base-salary-framework', label: 'Base Salary Framework' },
    { id: 'pay-band-salary-table', label: 'Pay Band / Salary Table' },
    { id: 'bonus-pool', label: 'Bonus Pool Configuration' },
    { id: 'benefits', label: 'Benefits Configuration' },
    { id: 'review', label: 'Review & Submit' },
];


export default function CompensationSystemIndex({ 
    project, 
    compensationSystem,
    consultantRecommendation,
    algorithmRecommendations,
    activeTab: initialTab = 'overview',
    stepStatuses = {},
    projectId,
    snapshotQuestions = [],
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);
    const [salaryTableType, setSalaryTableType] = useState<'pay_band' | 'salary_table'>('pay_band');

    // Sync activeTab with URL
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get(`/hr-manager/compensation-system/${project.id}/${newTab}`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['activeTab'],
            replace: true,
        });
    };

    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Snapshot responses state
    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string | number | null>>(() => {
        const responses: Record<number, string[] | string | number | null> = {};
        project.compensation_snapshot_responses?.forEach(resp => {
            if (resp.numeric_response !== null && resp.numeric_response !== undefined) {
                responses[resp.question_id] = resp.numeric_response;
            } else if (resp.text_response) {
                responses[resp.question_id] = resp.text_response;
            } else {
                responses[resp.question_id] = resp.response;
            }
        });
        return responses;
    });

    // Base Salary Framework state
    const [baseSalaryFramework, setBaseSalaryFramework] = useState<BaseSalaryFramework>(project.base_salary_framework || {});

    // Pay Bands state
    const [payBands, setPayBands] = useState<PayBand[]>(project.pay_bands || []);

    // Salary Tables state
    const [salaryTables, setSalaryTables] = useState<SalaryTable[]>(project.salary_tables || []);

    // Operation Criteria state
    const [operationCriteria, setOperationCriteria] = useState<PayBandOperationCriteria>(project.pay_band_operation_criteria || {});

    // Bonus Pool state
    const [bonusPool, setBonusPool] = useState<BonusPoolConfiguration>(project.bonus_pool_configuration || {});

    // Benefits state
    const [benefits, setBenefits] = useState<BenefitsConfiguration>(project.benefits_configuration || {});

    const { data, setData, post, processing } = useForm({
        compensation_structure: compensationSystem?.compensation_structure || '',
        differentiation_logic: compensationSystem?.differentiation_logic || '',
        incentive_types: compensationSystem?.incentive_types || [] as string[],
    });

    // Auto-save snapshot responses
    useEffect(() => {
        if (activeTab !== 'snapshot') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(snapshotResponses).length > 0) {
                const responses = snapshotQuestions.map(q => ({
                    question_id: q.id,
                    response: q.answer_type === 'numeric' ? null : (snapshotResponses[q.id] || null),
                    text_response: q.answer_type === 'text' ? (snapshotResponses[q.id] as string || null) : null,
                    numeric_response: q.answer_type === 'numeric' ? (snapshotResponses[q.id] as number || null) : null,
                }));
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'snapshot',
                    responses,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [snapshotResponses, activeTab]);

    // Auto-save base salary framework
    useEffect(() => {
        if (activeTab !== 'base-salary-framework') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(baseSalaryFramework).length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'base-salary-framework',
                    ...baseSalaryFramework,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [baseSalaryFramework, activeTab]);

    // Auto-save pay bands
    useEffect(() => {
        if (activeTab !== 'pay-band-salary-table' || salaryTableType !== 'pay_band') return;
        
        const timer = setTimeout(() => {
            if (payBands.length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'pay-band',
                    pay_bands: payBands,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [payBands, activeTab, salaryTableType]);

    // Auto-save salary tables
    useEffect(() => {
        if (activeTab !== 'pay-band-salary-table' || salaryTableType !== 'salary_table') return;
        
        const timer = setTimeout(() => {
            if (salaryTables.length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'salary-table',
                    salary_tables: salaryTables,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [salaryTables, activeTab, salaryTableType]);

    // Auto-save operation criteria
    useEffect(() => {
        if (activeTab !== 'pay-band-salary-table') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(operationCriteria).length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'operation-criteria',
                    ...operationCriteria,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [operationCriteria, activeTab]);

    // Auto-save bonus pool
    useEffect(() => {
        if (activeTab !== 'bonus-pool') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(bonusPool).length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'bonus-pool',
                    ...bonusPool,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [bonusPool, activeTab]);

    // Auto-save benefits
    useEffect(() => {
        if (activeTab !== 'benefits') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(benefits).length > 0) {
                // Auto-calculate benefits expense ratio
                const updatedBenefits = { ...benefits };
                if (updatedBenefits.previous_year_total_salary && updatedBenefits.previous_year_total_benefits_expense) {
                    if (updatedBenefits.previous_year_total_salary > 0) {
                        updatedBenefits.benefits_expense_ratio = (updatedBenefits.previous_year_total_benefits_expense / updatedBenefits.previous_year_total_salary) * 100;
                    }
                }
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'benefits',
                    ...updatedBenefits,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [benefits, activeTab]);

    const handleSubmit = () => {
        post(`/hr-manager/compensation-system/${project.id}/submit`, {
            onSuccess: () => setCompletedTabs([...TABS.map(t => t.id)]),
        });
    };

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Compensation System - ${project.company?.name || 'Compensation System'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href="/hr-manager/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Step 4: Compensation System</h1>
                                <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Design your compensation and rewards framework.</p>
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
                                                    {consultantRecommendation.recommended_option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Your consultant has prepared a recommendation based on your performance system selection and company context.
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

                        {project.performanceSystem && (
                            <Card className="mb-6 bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-muted-foreground">ℹ️</div>
                                        <div>
                                            <p className="font-medium mb-1">Performance System (Read-only)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Method: <strong>{project.performanceSystem.performance_method || 'N/A'}</strong> | 
                                                Unit: <strong>{project.performanceSystem.evaluation_unit || 'N/A'}</strong>
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
                                        <DollarSign className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Compensation & Benefits System Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Design your complete compensation and benefits framework including base salary structure, pay bands, bonus pools, and benefits programs.
                                        </p>
                                        <Button onClick={() => handleTabChange('snapshot')} size="lg">Start Design →</Button>
                                    </div>
                                )}

                                {activeTab === 'snapshot' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Strategic Compensation Snapshot</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Please answer the following questions to help us understand your current compensation approach.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 space-y-4">
                                                {snapshotQuestions && snapshotQuestions.length > 0 ? (
                                                    snapshotQuestions.map((question, idx) => (
                                                        <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                                                            <Label className="text-base font-medium">
                                                                {idx + 1}. {question.question_text}
                                                            </Label>
                                                    {question.answer_type === 'select_one' && question.options && (
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
                                                    {question.answer_type === 'select_up_to_2' && question.options && (
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
                                                    {question.answer_type === 'multiple' && question.options && (
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
                                                    {question.answer_type === 'numeric' && (
                                                        <Input
                                                            type="number"
                                                            value={snapshotResponses[question.id] as number || ''}
                                                            onChange={(e) => setSnapshotResponses({ ...snapshotResponses, [question.id]: parseFloat(e.target.value) || 0 })}
                                                            placeholder="Enter amount (KRW)"
                                                            className="max-w-md"
                                                        />
                                                    )}
                                                    {question.answer_type === 'text' && (
                                                        <Textarea
                                                            value={snapshotResponses[question.id] as string || ''}
                                                            onChange={(e) => setSnapshotResponses({ ...snapshotResponses, [question.id]: e.target.value })}
                                                            placeholder="Enter your response"
                                                            rows={3}
                                                        />
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
                                                                        Compensation snapshot questions have not been configured yet. Please contact the administrator to set up the questions in the admin panel.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                            <div className="lg:col-span-1">
                                                <Card className="sticky top-6">
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Explanation Panel</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            {snapshotQuestions && snapshotQuestions.length > 0 ? (
                                                                snapshotQuestions.map((question, idx) => {
                                                                    const explanation = question.metadata?.explanation;
                                                                    if (!explanation) return null;
                                                                    return (
                                                                        <div key={question.id} className="p-3 bg-muted/50 rounded-lg">
                                                                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                                                                                Question {idx + 1}
                                                                            </p>
                                                                            <p className="text-sm whitespace-pre-line">
                                                                                {explanation}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Explanations will appear here when questions are configured with explanations.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'base-salary-framework' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Base Salary Framework</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Define the core principles that determine how base salaries are structured and adjusted within your organization.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="mb-2 block">Salary Structure Type</Label>
                                                <Select value={baseSalaryFramework.salary_structure_type || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, salary_structure_type: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select structure type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="annual_accumulated">Annual Salary System (Accumulated)</SelectItem>
                                                        <SelectItem value="annual_non_accumulated">Annual Salary System (Non-Accumulated)</SelectItem>
                                                        <SelectItem value="annual_hybrid">Annual Salary System (Hybrid)</SelectItem>
                                                        <SelectItem value="seniority_based">Seniority-based Pay System</SelectItem>
                                                        <SelectItem value="job_based">Job-based Pay System</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Salary Adjustment Unit</Label>
                                                <Select value={baseSalaryFramework.salary_adjustment_unit || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, salary_adjustment_unit: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                        <SelectItem value="krw">KRW</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Salary Adjustment Grouping</Label>
                                                <Select value={baseSalaryFramework.salary_adjustment_grouping || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, salary_adjustment_grouping: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select grouping" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single group (entire organization adjusted at once)</SelectItem>
                                                        <SelectItem value="dual">Dual group (employees divided into two groups based on hire timing)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Salary Determination Standard</Label>
                                                <Select value={baseSalaryFramework.salary_determination_standard || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, salary_determination_standard: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select standard" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pay_band">Pay Band</SelectItem>
                                                        <SelectItem value="salary_table">Salary Table</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Common Salary Increase Rate</Label>
                                                <Select value={baseSalaryFramework.common_salary_increase_rate || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, common_salary_increase_rate: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="required">Required</SelectItem>
                                                        <SelectItem value="not_required">Not Required</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Common Increase Rate Basis</Label>
                                                <Select value={baseSalaryFramework.common_increase_rate_basis || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, common_increase_rate_basis: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select basis" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="inflation">Follows inflation rate</SelectItem>
                                                        <SelectItem value="company_performance">Linked to company performance</SelectItem>
                                                        <SelectItem value="management_discretion">Determined at management discretion each year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Performance-based Increase Differentiation Level</Label>
                                                <Select value={baseSalaryFramework.performance_based_increase_differentiation || ''} onValueChange={(v) => setBaseSalaryFramework({ ...baseSalaryFramework, performance_based_increase_differentiation: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="strong">Strong differentiation</SelectItem>
                                                        <SelectItem value="moderate">Moderate differentiation</SelectItem>
                                                        <SelectItem value="none">No differentiation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pay-band-salary-table' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Pay Band / Salary Table</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {baseSalaryFramework.salary_determination_standard === 'pay_band' 
                                                    ? 'Create and configure your pay band structure with visual representation.'
                                                    : 'Create and configure your salary table structure.'}
                                            </p>
                                            <Tabs value={salaryTableType} onValueChange={(v) => setSalaryTableType(v as 'pay_band' | 'salary_table')}>
                                                <TabsList>
                                                    <TabsTrigger value="pay_band">Pay Band</TabsTrigger>
                                                    <TabsTrigger value="salary_table">Salary Table</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="pay_band" className="mt-6">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="text-base font-semibold">Pay Band Structure</Label>
                                                            <Button onClick={() => setPayBands([...payBands, { id: Date.now(), job_grade: '', min_salary: 0, max_salary: 0, order: payBands.length }])} size="sm">
                                                                <Plus className="w-4 h-4 mr-2" /> Add Pay Band
                                                            </Button>
                                                        </div>
                                                        {payBands.map((band, idx) => (
                                                            <Card key={band.id || idx}>
                                                                <CardContent className="p-4">
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                        <div>
                                                                            <Label>Job Grade</Label>
                                                                            <Input value={band.job_grade} onChange={(e) => {
                                                                                const updated = [...payBands];
                                                                                updated[idx].job_grade = e.target.value;
                                                                                setPayBands(updated);
                                                                            }} />
                                                                        </div>
                                                                        <div>
                                                                            <Label>Min Salary (KRW)</Label>
                                                                            <Input type="number" value={band.min_salary} onChange={(e) => {
                                                                                const updated = [...payBands];
                                                                                updated[idx].min_salary = parseFloat(e.target.value) || 0;
                                                                                setPayBands(updated);
                                                                            }} />
                                                                        </div>
                                                                        <div>
                                                                            <Label>Max Salary (KRW)</Label>
                                                                            <Input type="number" value={band.max_salary} onChange={(e) => {
                                                                                const updated = [...payBands];
                                                                                updated[idx].max_salary = parseFloat(e.target.value) || 0;
                                                                                setPayBands(updated);
                                                                            }} />
                                                                        </div>
                                                                        <div>
                                                                            <Label>Target Salary (KRW)</Label>
                                                                            <Input type="number" value={band.target_salary || ''} onChange={(e) => {
                                                                                const updated = [...payBands];
                                                                                updated[idx].target_salary = parseFloat(e.target.value) || undefined;
                                                                                setPayBands(updated);
                                                                            }} />
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setPayBands(payBands.filter((_, i) => i !== idx))}>
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                        {payBands.length === 0 && (
                                                            <Card className="border-dashed">
                                                                <CardContent className="p-8 text-center">
                                                                    <p className="text-muted-foreground">No pay bands configured. Click "Add Pay Band" to get started.</p>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="salary_table" className="mt-6">
                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="text-base font-semibold">Salary Table Structure</Label>
                                                            <Button onClick={() => setSalaryTables([...salaryTables, { id: Date.now(), job_role: '', grade: '', years_in_grade: 1, order: salaryTables.length }])} size="sm">
                                                                <Plus className="w-4 h-4 mr-2" /> Add Row
                                                            </Button>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Job Role</TableHead>
                                                                        <TableHead>Grade</TableHead>
                                                                        <TableHead>Years in Grade</TableHead>
                                                                        <TableHead>LV.1</TableHead>
                                                                        <TableHead>LV.2</TableHead>
                                                                        <TableHead>LV.3</TableHead>
                                                                        <TableHead>Actions</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {salaryTables.map((table, idx) => (
                                                                        <TableRow key={table.id || idx}>
                                                                            <TableCell>
                                                                                <Input value={table.job_role} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].job_role = e.target.value;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-32" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input value={table.grade} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].grade = e.target.value;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-24" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input type="number" value={table.years_in_grade} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].years_in_grade = parseInt(e.target.value) || 1;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-20" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input type="number" value={table.level_1 || ''} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].level_1 = parseFloat(e.target.value) || undefined;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-24" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input type="number" value={table.level_2 || ''} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].level_2 = parseFloat(e.target.value) || undefined;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-24" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input type="number" value={table.level_3 || ''} onChange={(e) => {
                                                                                    const updated = [...salaryTables];
                                                                                    updated[idx].level_3 = parseFloat(e.target.value) || undefined;
                                                                                    setSalaryTables(updated);
                                                                                }} className="w-24" />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Button variant="ghost" size="sm" onClick={() => setSalaryTables(salaryTables.filter((_, i) => i !== idx))}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        {salaryTables.length === 0 && (
                                                            <Card className="border-dashed">
                                                                <CardContent className="p-8 text-center">
                                                                    <p className="text-muted-foreground">No salary table rows configured. Click "Add Row" to get started.</p>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                        <Card className="mt-6">
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold mb-4">Operation Criteria</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label className="mb-2 block">Outlier (Above Max, Below Min)</Label>
                                                        <Select value={operationCriteria.outlier_handling || ''} onValueChange={(v) => setOperationCriteria({ ...operationCriteria, outlier_handling: v })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="not_allowed">Not allowed</SelectItem>
                                                                <SelectItem value="allowed_with_ceo_approval">Allowed by CEO's Approval</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label className="mb-2 block">Promotion Movement Rule</Label>
                                                        <Select value={operationCriteria.promotion_movement_rule || ''} onValueChange={(v) => setOperationCriteria({ ...operationCriteria, promotion_movement_rule: v })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="guarantee_minimum">Minimum of the new pay band is guaranteed</SelectItem>
                                                                <SelectItem value="below_minimum_allowed">Below minimum allowed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label className="mb-2 block">Band Review Cycle</Label>
                                                        <Select value={operationCriteria.band_review_cycle || ''} onValueChange={(v) => setOperationCriteria({ ...operationCriteria, band_review_cycle: v })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select cycle" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="annual">Annual</SelectItem>
                                                                <SelectItem value="every_2_years">Every 2 years</SelectItem>
                                                                <SelectItem value="ad_hoc">Ad-hoc only</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'bonus-pool' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Bonus Pool Configuration</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Define the core operating principles governing how performance bonuses are determined, who is eligible, and how and when bonuses are distributed.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="mb-2 block">Payment Trigger Condition</Label>
                                                <Select value={bonusPool.payment_trigger_condition || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, payment_trigger_condition: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select condition" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="profit_generated">Paid when profit is generated</SelectItem>
                                                        <SelectItem value="company_targets">Paid when company-wide targets are achieved</SelectItem>
                                                        <SelectItem value="org_targets">Paid when organizational targets are achieved</SelectItem>
                                                        <SelectItem value="ceo_discretion">Discretionary (CEO decision)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Bonus Pool Determination Criteria</Label>
                                                <Select value={bonusPool.bonus_pool_determination_criteria || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, bonus_pool_determination_criteria: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select criteria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="revenue">Revenue</SelectItem>
                                                        <SelectItem value="operating_profit">Operating profit</SelectItem>
                                                        <SelectItem value="net_profit">Net profit</SelectItem>
                                                        <SelectItem value="projected_revenue">Projected revenue</SelectItem>
                                                        <SelectItem value="projected_operating_profit">Projected operating profit (after tax)</SelectItem>
                                                        <SelectItem value="projected_net_profit">Projected net profit (after tax)</SelectItem>
                                                        <SelectItem value="ebitda">EBITDA</SelectItem>
                                                        <SelectItem value="ceo_discretion">Discretionary (CEO decision)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Eligibility Scope</Label>
                                                <Select value={bonusPool.eligibility_scope || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, eligibility_scope: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select scope" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all_employees">All employees (excluding executives / including contract employees)</SelectItem>
                                                        <SelectItem value="regular_only">Regular employees only</SelectItem>
                                                        <SelectItem value="above_job_level">Employees above specific job level</SelectItem>
                                                        <SelectItem value="specific_org_units">Specific organizational units only</SelectItem>
                                                        <SelectItem value="other">Other (manual input)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Allocation Scope</Label>
                                                <Select value={bonusPool.allocation_scope || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, allocation_scope: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select scope" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="equal_company_wide">Equal allocation company-wide</SelectItem>
                                                        <SelectItem value="differentiated_by_org">Differentiated by organization</SelectItem>
                                                        <SelectItem value="differentiated_by_individual">Differentiated by individual performance</SelectItem>
                                                        <SelectItem value="differentiated_by_both">Differentiated by organization and individual</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Bonus Pool Finalization Timing (Month)</Label>
                                                <Select value={bonusPool.bonus_pool_finalization_timing?.toString() || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, bonus_pool_finalization_timing: parseInt(v) })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select month" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                            <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                </div>
                                            <div>
                                                <Label className="mb-2 block">Bonus Payment Month</Label>
                                                <Select value={bonusPool.bonus_payment_month?.toString() || ''} onValueChange={(v) => setBonusPool({ ...bonusPool, bonus_payment_month: parseInt(v) })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select month" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                            <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'benefits' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Benefits Strategic Direction</h3>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Define the overall operating principles governing the level, structure, and strategic direction of employee benefits.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="mb-2 block">Previous Year Total Salary (KRW)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={benefits.previous_year_total_salary || ''} 
                                                    onChange={(e) => setBenefits({ ...benefits, previous_year_total_salary: parseFloat(e.target.value) || undefined })}
                                                    placeholder="Auto-calculated from Step 5-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Previous Year Total Benefits Expense (KRW)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={benefits.previous_year_total_benefits_expense || ''} 
                                                    onChange={(e) => setBenefits({ ...benefits, previous_year_total_benefits_expense: parseFloat(e.target.value) || undefined })}
                                                    placeholder="Auto-calculated from Step 5-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Benefits Expense Ratio</Label>
                                                <Input 
                                                    type="number" 
                                                    value={benefits.benefits_expense_ratio?.toFixed(2) || ''} 
                                                    disabled
                                                    placeholder="Auto-calculated"
                                                    className="bg-muted"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">Auto-calculated: (Benefits Expense / Total Salary) × 100</p>
                                            </div>
                                        </div>
                                        <Card>
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold mb-4">Benefits Strategic Direction</h4>
                                                <p className="text-sm text-muted-foreground mb-4">Select up to 2 (Primary / Secondary objective)</p>
                                                <div className="space-y-2">
                                                    {['Improve employee satisfaction and retention', 'Strengthen performance-based rewards', 'Enhance tax efficiency (company / employees)', 'Strengthen talent attraction and employer competitiveness'].map((option) => {
                                                        const selected = benefits.benefits_strategic_direction?.find(d => d.value === option);
                                                        const selectedCount = benefits.benefits_strategic_direction?.length || 0;
                                                        return (
                                                            <div key={option} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    checked={!!selected}
                                                                    disabled={!selected && selectedCount >= 2}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = benefits.benefits_strategic_direction || [];
                                                                        if (checked) {
                                                                            setBenefits({ ...benefits, benefits_strategic_direction: [...current, { value: option, priority: selectedCount === 0 ? 'primary' : 'secondary' }] });
                                                                        } else {
                                                                            setBenefits({ ...benefits, benefits_strategic_direction: current.filter(d => d.value !== option) });
                                                                        }
                                                                    }}
                                                                />
                                                                <Label className="cursor-pointer">{option}</Label>
                                                                {selected && (
                                                                    <Badge variant="outline" className="ml-2">{selected.priority === 'primary' ? 'Primary' : 'Secondary'}</Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'review' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold mb-4">Review & Submit Compensation System</h3>
                                        
                                        {/* Snapshot Summary */}
                                        <div>
                                            <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Strategic Compensation Snapshot
                                            </h4>
                                            {snapshotQuestions.length > 0 ? (
                                                snapshotQuestions.slice(0, 3).map((question) => (
                                                    <Card key={question.id} className="mb-2">
                                                        <CardContent className="p-4">
                                                            <p className="font-medium">{question.question_text}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {Array.isArray(snapshotResponses[question.id])
                                                                    ? (snapshotResponses[question.id] as string[]).join(', ')
                                                                    : snapshotResponses[question.id] || '-'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No snapshot questions answered.</p>
                                            )}
                                        </div>

                                        {/* Base Salary Framework Summary */}
                                        <div>
                                            <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Base Salary Framework
                                            </h4>
                                            <Card><CardContent className="p-4">
                                                <strong>Salary Structure Type:</strong> {baseSalaryFramework.salary_structure_type || '-'} | 
                                                <strong> Adjustment Unit:</strong> {baseSalaryFramework.salary_adjustment_unit || '-'} | 
                                                <strong> Determination Standard:</strong> {baseSalaryFramework.salary_determination_standard || '-'}
                                            </CardContent></Card>
                                        </div>

                                        {/* Pay Band/Salary Table Summary */}
                                        <div>
                                            <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> {baseSalaryFramework.salary_determination_standard === 'pay_band' ? 'Pay Band Structure' : 'Salary Table Structure'}
                                            </h4>
                                            {baseSalaryFramework.salary_determination_standard === 'pay_band' ? (
                                                payBands.length > 0 ? (
                                                    <Card><CardContent className="p-4">
                                                        <p className="text-sm"><strong>{payBands.length}</strong> pay bands configured</p>
                                                    </CardContent></Card>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No pay bands configured.</p>
                                                )
                                            ) : (
                                                salaryTables.length > 0 ? (
                                                    <Card><CardContent className="p-4">
                                                        <p className="text-sm"><strong>{salaryTables.length}</strong> salary table rows configured</p>
                                                    </CardContent></Card>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No salary table rows configured.</p>
                                                )
                                            )}
                                        </div>

                                        {/* Bonus Pool Summary */}
                                        <div>
                                            <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Bonus Pool Configuration
                                            </h4>
                                            <Card><CardContent className="p-4">
                                                <strong>Payment Trigger:</strong> {bonusPool.payment_trigger_condition || '-'} | 
                                                <strong> Determination Criteria:</strong> {bonusPool.bonus_pool_determination_criteria || '-'} | 
                                                <strong> Eligibility Scope:</strong> {bonusPool.eligibility_scope || '-'}
                                            </CardContent></Card>
                                        </div>

                                        {/* Benefits Summary */}
                                        <div>
                                            <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Benefits Configuration
                                            </h4>
                                            <Card><CardContent className="p-4">
                                                <strong>Benefits Expense Ratio:</strong> {benefits.benefits_expense_ratio?.toFixed(2) || '-'}% | 
                                                <strong> Strategic Direction:</strong> {benefits.benefits_strategic_direction?.map(d => d.value).join(', ') || '-'}
                                            </CardContent></Card>
                                        </div>

                                        <Card className="bg-success/10 border-success/20 mt-6">
                                            <CardContent className="p-4">
                                                <p className="text-sm font-medium text-success">
                                                    Congratulations! After submission, all 4 steps will be complete. The consultant will review your HR system, and then the CEO can give final approval.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                            <Button variant="outline" onClick={() => {
                                const idx = TABS.findIndex(t => t.id === activeTab);
                                if (idx > 0) handleTabChange(TABS[idx - 1].id);
                            }} disabled={activeTab === 'overview'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button onClick={() => {
                                    const idx = TABS.findIndex(t => t.id === activeTab);
                                    if (idx < TABS.length - 1) handleTabChange(TABS[idx + 1].id);
                                }}>Next →</Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit & Lock Step 4
                                </Button>
                            )}
                        </div>
                    </div>
        </AppLayout>
    );
}
