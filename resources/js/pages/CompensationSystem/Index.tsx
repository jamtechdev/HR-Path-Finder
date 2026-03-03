import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import StepHeader from '@/components/StepHeader/StepHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, TrendingUp, FileText, Shield, Settings, Award, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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

    // Validate tab completion
    const validateTabCompletion = (tabId: string): boolean => {
        switch (tabId) {
            case 'overview':
                return false;
            case 'snapshot':
                return !!(project.compensation_snapshot_responses && project.compensation_snapshot_responses.length > 0) ||
                       tabCompletions['snapshot'] === true;
            case 'base-salary-framework':
                return !!project.base_salary_framework || tabCompletions['base-salary-framework'] === true;
            case 'pay-band-salary-table':
                return !!(project.pay_bands && project.pay_bands.length > 0) ||
                       !!(project.salary_tables && project.salary_tables.length > 0) ||
                       tabCompletions['pay-band-salary-table'] === true;
            case 'bonus-pool':
                return !!project.bonus_pool_configuration || tabCompletions['bonus-pool'] === true;
            case 'benefits':
                return !!project.benefits_configuration || tabCompletions['benefits'] === true;
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

    // Auto-save handlers
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
    }, [baseSalaryFramework, activeTab, project.id]);

    useEffect(() => {
        if (activeTab !== 'pay-band-salary-table') return;
        
        const timer = setTimeout(() => {
            if (payBands.length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'pay-band',
                    pay_bands: payBands as any,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
            if (salaryTables.length > 0) {
                router.post(`/hr-manager/compensation-system/${project.id}`, {
                    tab: 'salary-table',
                    salary_tables: salaryTables as any,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['project'],
                });
            }
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
    }, [payBands, salaryTables, operationCriteria, activeTab, project.id]);

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
    }, [bonusPool, activeTab, project.id]);

    useEffect(() => {
        if (activeTab !== 'benefits') return;
        
        const timer = setTimeout(() => {
            if (Object.keys(benefits).length > 0) {
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
    }, [benefits, activeTab, project.id]);

    const handleSubmit = () => {
        post(`/hr-manager/compensation-system/${project.id}/submit`, {
            onSuccess: () => {
                setTabCompletions({ ...tabCompletions, review: true });
                setShowSuccessModal(true);
            },
        });
    };

    const completedTabsCount = TABS.filter(tab => {
        if (tab.id === 'overview') return false;
        return validateTabCompletion(tab.id);
    }).length;

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

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Step 4: Compensation System - ${project.company?.name || 'Compensation System'}`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                {errors?.error && (
                    <Alert className="mb-6 border-destructive/50 bg-destructive/10 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.error}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6">
                    <StepHeader
                        title="Step 4: Compensation System"
                        description="Define compensation structure, differentiation methods, and incentive components."
                        status={getStatusForHeader()}
                        backHref="/hr-manager/dashboard"
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{completedTabsCount} of {TABS.filter(t => t.id !== 'overview').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(completedTabsCount / TABS.filter(t => t.id !== 'overview').length) * 100}%` }}
                        />
                    </div>
                </div>

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

                        <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth mb-6" style={{ scrollbarWidth: 'thin' }}>
                            {TABS.map((tab, index) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                const isEnabled = isTabEnabled(tab.id, index);
                                const isCompleted = validateTabCompletion(tab.id) && tab.id !== 'overview';
                                const TabIcon = isCompleted ? CheckCircle2 : Icon;
                                
                                if (!isEnabled) {
                                    return (
                                        <button
                                            key={tab.id}
                                            disabled
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all bg-muted/50 text-muted-foreground/50 cursor-not-allowed relative"
                                        >
                                            <TabIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                }
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer relative",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                                                : isCompleted
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {isCompleted && !isActive && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <TabIcon className={cn(
                                            "w-4 h-4 flex-shrink-0",
                                            isActive && "text-primary-foreground",
                                            isCompleted && !isActive && "text-green-600"
                                        )} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

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
                        <ReviewTab
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

                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                                const idx = TABS.findIndex(t => t.id === activeTab);
                                if (idx > 0) handleTabChange(TABS[idx - 1].id);
                        }} 
                        disabled={activeTab === 'overview'}
                    >
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

                    {/* Success Modal */}
                    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center mb-4">
                                    Compensation System Submitted Successfully!
                                </DialogTitle>
                                <DialogDescription className="text-base space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                                        <p className="text-gray-800 leading-relaxed">
                                            Your company now has a structured and professionally designed HR system, including performance management, compensation structure, and benefits framework.
                                        </p>
                                        <p className="text-gray-800 leading-relaxed">
                                            This system can now serve as the official foundation for your organization's HR operations.
                                        </p>
                                        <p className="text-gray-800 leading-relaxed">
                                            In the future, you may enhance and maintain your HR system through our optional subscription service, which includes ongoing HR policy management, organizational diagnostics, and professional HR advisory support.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => window.open('https://better.odw.co.kr', '_blank')}
                                        >
                                            Learn About Subscription Service
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => window.open('https://better.odw.co.kr', '_blank')}
                                        >
                                            Powered By BetterCompany
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            className="flex-1 text-primary"
                                            onClick={() => window.open('https://better.odw.co.kr', '_blank')}
                                        >
                                            → link to 'better.odw.co.kr'
                                        </Button>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button onClick={() => setShowSuccessModal(false)} className="w-full sm:w-auto">
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
        </AppLayout>
    );
}
