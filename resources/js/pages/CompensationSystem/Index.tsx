import React, { useState, useEffect, useMemo } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, TrendingUp, FileText, Settings, Award, Users, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import InlineErrorSummary from '@/components/forms/InlineErrorSummary';

// Import types
import type {
    HrProject,
    CompensationSystem,
    ConsultantRecommendation,
    AlgorithmRecommendation,
    CompensationSnapshotQuestion,
    CompensationSnapshotResponse,
    BaseSalaryFramework,
    PayBand,
    SalaryTable,
    PayBandOperationCriteria,
    BonusPoolConfiguration,
    BenefitsConfiguration,
} from './types';

// Import tab components
import CompensationOverview from './CompensationOverview';
import SnapshotTab from './tabs/SnapshotTab';
import BaseSalaryFrameworkTab from './tabs/BaseSalaryFrameworkTab';
import PayBandSalaryTableTab from './tabs/PayBandSalaryTableTab';
import BonusPoolTab from './tabs/BonusPoolTab';
import BenefitsTab from './tabs/BenefitsTab';
import ReviewTab from './tabs/ReviewTab';

interface Props {
    project: HrProject;
    compensationSystem?: CompensationSystem;
    consultantRecommendation?: ConsultantRecommendation;
    algorithmRecommendations?: Record<string, AlgorithmRecommendation>;
    activeTab?: string;
    stepStatuses?: Record<string, string>;
    projectId?: number;
    snapshotQuestions?: CompensationSnapshotQuestion[];
    errors?: {
        error?: string;
    };
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'snapshot', label: 'Stage 4-1: Strategic Compensation Snapshot', icon: FileText },
    { id: 'base-salary-framework', label: 'Base Salary Framework', icon: Settings },
    { id: 'pay-band-salary-table', label: 'Pay Band / Salary Table', icon: TrendingUp },
    { id: 'bonus-pool', label: 'Bonus Pool Configuration', icon: Award },
    { id: 'benefits', label: 'Benefits Configuration', icon: Users },
    { id: 'review', label: 'Review & Submit', icon: CheckCircle2 },
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
    errors,
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<Record<string, boolean>>({});
    const [localTabDone, setLocalTabDone] = useState<Record<string, boolean>>({});
    const [compError, setCompError] = useState<string | null>(null);
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // State for each step
    const [baseSalaryFramework, setBaseSalaryFramework] = useState<BaseSalaryFramework>(project.base_salary_framework || {});
    const [payBands, setPayBands] = useState<PayBand[]>(project.pay_bands || []);
    const [salaryTables, setSalaryTables] = useState<SalaryTable[]>(project.salary_tables || []);
    const [operationCriteria, setOperationCriteria] = useState<PayBandOperationCriteria>(project.pay_band_operation_criteria || {});
    const [bonusPool, setBonusPool] = useState<BonusPoolConfiguration>(project.bonus_pool_configuration || {});
    const [benefits, setBenefits] = useState<BenefitsConfiguration>(project.benefits_configuration || {});
    
    // Snapshot responses state
    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string | number | object | null>>(() => {
        const responses: Record<number, string[] | string | number | object | null> = {};
        project.compensation_snapshot_responses?.forEach(resp => {
            if (resp.numeric_response !== null && resp.numeric_response !== undefined) {
                responses[resp.question_id] = resp.numeric_response;
            } else if (resp.text_response) {
                responses[resp.question_id] = resp.text_response;
            } else {
                responses[resp.question_id] = resp.response || null;
            }
        });
        return responses;
    });

    const { post, processing } = useForm({});
    const [saving, setSaving] = useState(false);

    const handleSaveAndContinue = () => {
        setCompError(null);
        const idx = TABS.findIndex(t => t.id === activeTab);
        const nextTabId = idx < TABS.length - 1 ? TABS[idx + 1].id : activeTab;
        if (activeTab !== 'overview' && activeTab !== 'review') {
            setLocalTabDone((d) => ({ ...d, [activeTab]: true }));
        }
        if (activeTab === 'overview') {
            handleTabChange('snapshot');
            return;
        }
        handleTabChange(nextTabId);
    };

    // Validate tab completion
    const validateTabCompletion = (tabId: string): boolean => {
        switch (tabId) {
            case 'overview':
                return false;
            case 'snapshot':
                return (
                    !!(project.compensation_snapshot_responses && project.compensation_snapshot_responses.length > 0) ||
                    tabCompletions['snapshot'] === true ||
                    localTabDone['snapshot'] === true
                );
            case 'base-salary-framework':
                return (
                    !!project.base_salary_framework ||
                    tabCompletions['base-salary-framework'] === true ||
                    localTabDone['base-salary-framework'] === true
                );
            case 'pay-band-salary-table':
                return (
                    !!(project.pay_bands && project.pay_bands.length > 0) ||
                    !!(project.salary_tables && project.salary_tables.length > 0) ||
                    tabCompletions['pay-band-salary-table'] === true ||
                    localTabDone['pay-band-salary-table'] === true
                );
            case 'bonus-pool':
                return (
                    !!project.bonus_pool_configuration ||
                    tabCompletions['bonus-pool'] === true ||
                    localTabDone['bonus-pool'] === true
                );
            case 'benefits':
                return (
                    !!project.benefits_configuration ||
                    tabCompletions['benefits'] === true ||
                    localTabDone['benefits'] === true
                );
            case 'review':
                return validateTabCompletion('benefits');
            default:
                return false;
        }
    };

    const isTabEnabled = (tabId: string, tabIndex: number): boolean => {
        if (tabId === 'overview') return true;
        
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = TABS[i];
            if (prevTab.id === 'overview') continue;
            
            if (!validateTabCompletion(prevTab.id)) {
                return false;
            }
        }
        
        return true;
    };

    useEffect(() => {
        const completions: Record<string, boolean> = {};
        TABS.forEach(tab => {
            completions[tab.id] = validateTabCompletion(tab.id);
        });
        setTabCompletions(completions);
    }, [project.compensation_snapshot_responses, project.base_salary_framework, project.pay_bands, project.salary_tables, project.bonus_pool_configuration, project.benefits_configuration]);

    const handleTabChange = (newTab: string) => {
        const tabIndex = TABS.findIndex(t => t.id === newTab);
        if (tabIndex === -1) return;
        
        if (!isTabEnabled(newTab, tabIndex)) {
            return;
        }
        
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

    const handleSubmit = () => {
        setCompError(null);
        setSaving(true);
        const pid = project.id;
        const opts = { preserveScroll: true, preserveState: true, only: ['project'] as const };
        const fail = (msg: string) => {
            setSaving(false);
            setCompError(msg);
        };

        const responseData = (snapshotQuestions || []).map((q: { id: number; answer_type?: string }) => {
            const response = snapshotResponses[q.id];
            if (q.answer_type === 'numeric') {
                return {
                    question_id: q.id,
                    response: null,
                    text_response: null,
                    numeric_response: typeof response === 'object' ? null : (response as number) ?? null,
                    response_data: typeof response === 'object' ? response : null,
                };
            }
            if (q.answer_type === 'text') {
                return { question_id: q.id, response: null, text_response: (response as string) ?? null, numeric_response: null, response_data: null };
            }
            return {
                question_id: q.id,
                response: Array.isArray(response) ? response : response ? [response] : null,
                text_response: null,
                numeric_response: null,
                response_data: null,
            };
        });

        const updatedBenefits = { ...benefits };
        if (updatedBenefits.previous_year_total_salary && updatedBenefits.previous_year_total_benefits_expense && updatedBenefits.previous_year_total_salary > 0) {
            updatedBenefits.benefits_expense_ratio =
                (updatedBenefits.previous_year_total_benefits_expense / updatedBenefits.previous_year_total_salary) * 100;
        }

        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'snapshot', responses: responseData } as never, {
            ...opts,
            onSuccess: () => {
                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'base-salary-framework', ...baseSalaryFramework } as never, {
                    ...opts,
                    onSuccess: () => {
                        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'pay-band', pay_bands: payBands } as never, {
                            ...opts,
                            onSuccess: () => {
                                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'salary-table', salary_tables: salaryTables } as never, {
                                    ...opts,
                                    onSuccess: () => {
                                        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'operation-criteria', ...operationCriteria } as never, {
                                            ...opts,
                                            onSuccess: () => {
                                                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'bonus-pool', ...bonusPool } as never, {
                                                    ...opts,
                                                    onSuccess: () => {
                                                        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'benefits', ...updatedBenefits } as never, {
                                                            ...opts,
                                                            onSuccess: () => {
                                                                post(`/hr-manager/compensation-system/${pid}/submit`, {
                                                                    onSuccess: () => {
                                                                        setSaving(false);
                                                                        setTabCompletions((c) => ({ ...c, review: true }));
                                                                        setShowSuccessModal(true);
                                                                    },
                                                                    onError: () => fail('Submit failed. Check all sections and try again.'),
                                                                });
                                                            },
                                                            onError: () => fail('Could not save benefits. Please check required fields.'),
                                                        });
                                                    },
                                                    onError: () => fail('Could not save bonus pool.'),
                                                });
                                            },
                                            onError: () => fail('Could not save pay structure.'),
                                        });
                                    },
                                    onError: () => fail('Could not save salary tables.'),
                                });
                            },
                            onError: () => fail('Could not save pay bands.'),
                        });
                    },
                    onError: () => fail('Could not save base salary framework.'),
                });
            },
            onError: () => fail('Could not save compensation snapshot. Answer all questions.'),
        });
    };

    const completedTabsCount = TABS.filter(tab => {
        if (tab.id === 'overview') return false;
        return validateTabCompletion(tab.id);
    }).length;

    const completedSteps = useMemo(() => {
        const set = new Set<string>();
        TABS.forEach(tab => {
            if (tab.id !== 'overview' && validateTabCompletion(tab.id)) set.add(tab.id);
        });
        return set;
    }, [project.compensation_snapshot_responses, project.base_salary_framework, project.pay_bands, project.salary_tables, project.bonus_pool_configuration, project.benefits_configuration]);

    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        const status = stepStatuses?.compensation || 'not_started';
        if (status === 'submitted' || status === 'approved' || status === 'locked') {
            return 'submitted';
        }
        if (status === 'in_progress' || completedTabsCount > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    // Get benefits programs from snapshot Q17
    const q17Question = snapshotQuestions.find((q, i) => i === 16);
    const snapshotBenefitsPrograms = q17Question 
        ? (snapshotResponses[q17Question.id] as string[] || [])
        : [];

    const isOverview = activeTab === 'overview';

    return (
        <AppLayout
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Step 4: Compensation System - ${project.company?.name || 'Compensation System'}`} />
            <div className={cn('min-h-full', isOverview ? 'bg-[#f5f3ef]' : 'bg-[#f7f8fa]')}>
                {errors?.error && (
                    <Alert className="mb-6 border-destructive/50 bg-destructive/10 text-destructive mx-auto max-w-7xl px-6 pt-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.error}</AlertDescription>
                    </Alert>
                )}

                {isOverview ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6 pt-6 max-w-7xl mx-auto">
                            <Link
                                href="/hr-manager/dashboard"
                                className="text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] flex items-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                        <CompensationOverview
                            projectId={project.id}
                            stepStatuses={stepStatuses}
                            completedSteps={completedSteps}
                            onStepClick={handleTabChange}
                        />
                    </div>
                ) : (
                    <>
                        {/* Dark bar: step icon + status only (breadcrumb shows once in AppHeader) */}
                        <header className="bg-[#0f1c30] text-white flex items-center justify-between flex-wrap gap-2 text-sm px-6 md:px-10 py-3.5">
                            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#0f1c30] font-black text-xs shrink-0" aria-hidden>C</div>
                            <span
                                className="rounded-[20px] px-3.5 py-1 text-[11px] font-semibold text-white shrink-0"
                                style={{ background: '#c8963e', paddingTop: 4, paddingBottom: 4, paddingLeft: 14, paddingRight: 14 }}
                            >
                                {getStatusForHeader().replace('_', ' ').toUpperCase()}
                            </span>
                        </header>

                        {/* Dark stage nav - includes Overview so user can go back from any step */}
                        <div className="bg-[#0f1c30] border-b border-white/5">
                            <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-thin">
                                <nav className="flex items-center gap-0 min-w-max">
                                    {TABS.map((tab, idx) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        const isDone = tab.id === 'overview' ? false : validateTabCompletion(tab.id);
                                        const stepNum = tab.id === 'overview' ? null : idx; // Overview = O, Snapshot = 1, ... Review = 6
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => handleTabChange(tab.id)}
                                                disabled={!isTabEnabled(tab.id, idx)}
                                                className={cn(
                                                    'flex items-center gap-2 px-5 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                                                    isActive && 'text-white border-[#2ec4a0] bg-white/5',
                                                    isDone && !isActive && 'text-[#2ec4a0] border-transparent',
                                                    !isActive && !isDone && 'text-white/40 border-transparent hover:text-white/70',
                                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                                )}
                                            >
                                                <span className={cn(
                                                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                                                    tab.id === 'overview' && 'bg-white/10 text-white',
                                                    isDone && tab.id !== 'overview' && 'bg-[#2ec4a0] text-[#0f1c30]',
                                                    isActive && !isDone && 'bg-white/10 text-white',
                                                    !isDone && !isActive && tab.id !== 'overview' && 'bg-white/5 text-white/30'
                                                )}>
                                                    {tab.id === 'overview' ? 'O' : isDone ? '✓' : (stepNum ?? idx)}
                                                </span>
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                                <div className="h-0.5 bg-white/5">
                                    <div
                                        className="h-full bg-[#2ec4a0] rounded-r transition-all duration-300"
                                        style={{ width: `${(completedTabsCount / (TABS.length - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto px-6 py-6 pb-28">
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

                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="hidden">
                                {TABS.map((tab) => (
                                    <TabsTrigger key={tab.id} value={tab.id} />
                                ))}
                            </TabsList>

                            <TabsContent value="overview" className="mt-0">
                                <Card className="shadow-sm border">
                                    <CardContent className="p-6">
                                        <div className="text-center py-12">
                                            <DollarSign className="w-16 h-16 mx-auto mb-4 text-primary" />
                                            <h2 className="text-2xl font-bold mb-2">Compensation & Benefits System Design</h2>
                                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                                Design your complete compensation and benefits framework including base salary structure, pay bands, bonus pools, and benefits programs.
                                            </p>
                                            <Button onClick={() => handleTabChange('snapshot')} size="lg">Start Design →</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="snapshot" className="mt-0">
                        <SnapshotTab
                            projectId={project.id}
                            questions={snapshotQuestions}
                            responses={project.compensation_snapshot_responses || []}
                            snapshotResponses={snapshotResponses}
                            onSnapshotResponsesChange={setSnapshotResponses}
                            onNext={() => handleTabChange('base-salary-framework')}
                        />
                            </TabsContent>

                            <TabsContent value="base-salary-framework" className="mt-0">
                        <BaseSalaryFrameworkTab
                            framework={baseSalaryFramework}
                            onUpdate={setBaseSalaryFramework}
                        />
                    </TabsContent>

                    <TabsContent value="pay-band-salary-table" className="mt-0">
                        <PayBandSalaryTableTab
                            projectId={project.id}
                            salaryDeterminationStandard={baseSalaryFramework.salary_determination_standard}
                            payBands={payBands}
                            salaryTables={salaryTables}
                            operationCriteria={operationCriteria}
                            onPayBandsUpdate={setPayBands}
                            onSalaryTablesUpdate={setSalaryTables}
                            onOperationCriteriaUpdate={setOperationCriteria}
                        />
                                                </TabsContent>

                    <TabsContent value="bonus-pool" className="mt-0">
                        <BonusPoolTab
                            configuration={bonusPool}
                            onUpdate={setBonusPool}
                        />
                                                </TabsContent>

                    <TabsContent value="benefits" className="mt-0">
                        <BenefitsTab
                            configuration={benefits}
                            onUpdate={setBenefits}
                            snapshotBenefitsPrograms={snapshotBenefitsPrograms}
                        />
                    </TabsContent>

                    <TabsContent value="review" className="mt-0">
                        {compError && <InlineErrorSummary message={compError} className="mb-4" />}
                        <ReviewTab
                            project={project}
                            snapshotQuestions={snapshotQuestions}
                            snapshotResponses={snapshotResponses}
                            baseSalaryFramework={baseSalaryFramework}
                            payBands={payBands}
                            salaryTables={salaryTables}
                            bonusPool={bonusPool}
                            benefits={benefits}
                        />
                    </TabsContent>
                </Tabs>

                        </div>

                        {/* Sticky footer: starts after sidebar (same as overview content area) */}
                        <footer
                            className="fixed bottom-0 right-0 bg-white border-t border-[#e8eaed] px-6 py-3.5 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(15,28,48,0.06)]"
                            style={{ left: 'var(--sidebar-width, 16rem)' }}
                        >
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const idx = TABS.findIndex(t => t.id === activeTab);
                                    if (idx > 0) handleTabChange(TABS[idx - 1].id);
                                    else if (activeTab === 'snapshot') handleTabChange('overview');
                                }}
                                className="border-[#d4d8de] text-[#4b5563] hover:bg-[#f7f8fa]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button onClick={handleSaveAndContinue} className="bg-[#152540] hover:bg-[#1e3a62] text-white">
                                    Continue
                                    <svg className="w-3.5 h-3.5 ml-1.5" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing || saving} className="bg-[#152540] hover:bg-[#1e3a62] text-white">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit & Lock Step 4
                                </Button>
                            )}
                        </footer>
                    </>
                )}
            </div>

                    {/* Success Modal — clean, focused UI */}
                    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 shadow-xl rounded-2xl [&>button]:text-white [&>button]:top-6 [&>button]:right-6 [&>button]:opacity-80 hover:[&>button]:opacity-100">
                            <div className="bg-gradient-to-b from-[#0f1c30] to-[#1a2f52] px-8 pt-10 pb-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#2ec4a0]/20 border-2 border-[#2ec4a0] flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle2 className="w-9 h-9 text-[#2ec4a0]" strokeWidth={2} />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    Compensation system submitted
                                </h2>
                                <p className="text-sm text-white/70 mt-1.5">
                                    Step 4 is complete. Your consultant will review and the CEO can approve.
                                </p>
                            </div>
                            <div className="px-8 py-6 space-y-5">
                                <p className="text-sm text-[#4A5B78] leading-relaxed">
                                    Your company now has a structured HR system: performance management, compensation, and benefits. You can enhance it later through our optional subscription—HR policy management, diagnostics, and advisory support.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            router.get('/hr-manager/dashboard');
                                        }}
                                        className="w-full h-11 font-semibold rounded-lg bg-[#152540] hover:bg-[#1e3a62] text-white"
                                    >
                                        Okay
                                    </Button>
                                    <a
                                        href="https://better.odw.co.kr"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#6B82A0] hover:text-[#2ec4a0] text-center transition-colors"
                                    >
                                        Learn about subscription · Powered by BetterCompany
                                    </a>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
        </AppLayout>
    );
}
