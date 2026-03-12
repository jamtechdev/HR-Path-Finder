import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
    FileText, 
    Target, 
    Users, 
    CheckCircle2,
    Settings,
    Check,
    ChevronLeft,
    LayoutGrid,
} from 'lucide-react';
import Overview from './steps/Overview';
import PerformanceSnapshotTab from './tabs/PerformanceSnapshotTab';
import KpiReviewTab from './tabs/KpiReviewTab';
import EvaluationModelAssignmentTab from './tabs/EvaluationModelAssignmentTab';
import EvaluationStructureTab from './tabs/EvaluationStructureTab';
import ReviewSubmitTab from './tabs/ReviewSubmitTab';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ProjectWithResponses {
    id: number;
    performance_snapshot_responses?: any[];
    organizational_kpis?: any[];
    evaluation_model_assignments?: any[];
    evaluation_structure?: any;
    company?: {
        name: string;
    };
}

interface Props {
    project: ProjectWithResponses;
    performanceSystem?: any;
    activeTab?: string;
    snapshotQuestions?: any[];
    snapshotResponses?: Record<number, { response: string[]; text_response?: string }>;
    jobDefinitions?: any[];
    organizationalKpis?: any[];
    kpiEditHistory?: Record<number, any[]>;
    orgChartMappings?: any[];
    kpiReviewTokens?: any;
    evaluationModelAssignments?: any[];
    modelGuidance?: {
        mbo?: any;
        bsc?: any;
        okr?: any;
    };
    jobRecommendations?: Record<number, 'mbo' | 'bsc' | 'okr'>;
    stepStatuses?: any;
    projectId?: number;
}

const TABS = [
    { id: 'performance-snapshot', label: 'Strategic Performance Snapshot', icon: FileText },
    { id: 'kpi-review', label: 'KPI Review', icon: Target },
    { id: 'model-assignment', label: 'Evaluation Model Assignment', icon: Settings },
    { id: 'evaluation-structure', label: 'Evaluation Structure', icon: CheckCircle2 },
    { id: 'review-submit', label: 'Review & Submit', icon: Send },
];

export default function PerformanceSystemIndex({
    project,
    performanceSystem,
    activeTab: initialTab = 'overview',
    snapshotQuestions = [],
    snapshotResponses = {},
    jobDefinitions = [],
    organizationalKpis = [],
    orgChartMappings = [],
    kpiReviewTokens = {},
    evaluationModelAssignments = [],
    modelGuidance = {},
    jobRecommendations = {},
    stepStatuses = {},
    projectId,
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<Record<string, boolean>>({});
    const [snapshotAnsweredCount, setSnapshotAnsweredCount] = useState(() => {
        const total = (snapshotQuestions as any[])?.length ?? 0;
        if (total === 0) return 0;
        let n = 0;
        for (const q of snapshotQuestions as any[]) {
            const r = snapshotResponses?.[q.id];
            const arr = Array.isArray(r?.response) ? r.response : [];
            if (arr.length > 0) {
                const hasOther = (q.options || []).some((o: string) => String(o).toLowerCase().includes('other'));
                const selectedOther = arr.some((s: string) => String(s).toLowerCase().includes('other'));
                if (hasOther && selectedOther) {
                    if ((r?.text_response ?? '').trim()) n++;
                } else n++;
            }
        }
        return n;
    });
    const snapshotTotalCount = (snapshotQuestions as any[])?.length ?? 0;

    // Validate tab completion based on data
    const validateTabCompletion = (tabId: string): boolean => {
        switch (tabId) {
            case 'performance-snapshot':
                return Object.keys(snapshotResponses).length > 0 || tabCompletions['performance-snapshot'] === true;
            case 'kpi-review':
                return organizationalKpis.length > 0 || tabCompletions['kpi-review'] === true;
            case 'model-assignment':
                return evaluationModelAssignments.length > 0 || tabCompletions['model-assignment'] === true;
            case 'evaluation-structure':
                return !!project.evaluation_structure || tabCompletions['evaluation-structure'] === true;
            case 'review-submit':
                return tabCompletions['evaluation-structure'] === true || !!project.evaluation_structure;
            default:
                return false;
        }
    };

    // Check if tab is enabled (previous tabs completed)
    const isTabEnabled = (tabId: string, tabIndex: number): boolean => {
        // Overview and review-submit are always enabled
        if (tabId === 'overview' || tabId === 'review-submit') return true;
        if (tabIndex === 0) return true;
        
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = TABS[i];
            if (prevTab.id === 'overview' || prevTab.id === 'review-submit') continue;
            if (!validateTabCompletion(prevTab.id)) {
                return false;
            }
        }
        
        return true;
    };

    // Update tab completions when data changes
    useEffect(() => {
        const completions: Record<string, boolean> = {};
        TABS.forEach(tab => {
            completions[tab.id] = validateTabCompletion(tab.id);
        });
        setTabCompletions(completions);
    }, [snapshotResponses, organizationalKpis, evaluationModelAssignments, project.evaluation_structure]);

    const handleTabChange = (tab: string, force: boolean = false) => {
        const tabIndex = TABS.findIndex(t => t.id === tab);
        if (tabIndex === -1) return;
        
        if (!force && !isTabEnabled(tab, tabIndex)) {
            return;
        }
        
        setActiveTab(tab);
        router.get(`/hr-manager/performance-system/${project.id}/${tab}`, {}, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const calculateProgress = () => {
        const completedTabs = TABS.filter(tab => validateTabCompletion(tab.id));
        return Math.round((completedTabs.length / TABS.length) * 100);
    };

    const progress = calculateProgress();
    const completedTabsCount = TABS.filter(tab => validateTabCompletion(tab.id)).length;
    
    // Update active tab when initialTab changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        const status = stepStatuses?.performance || 'not_started';
        if (status === 'submitted' || status === 'approved' || status === 'locked') {
            return 'submitted';
        }
        if (status === 'in_progress' || completedTabsCount > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    // Handlers for tab continue actions
    const handleSnapshotContinue = async (responses: Record<number, { response: string[]; text_response?: string }>) => {
        const responsesArray = Object.entries(responses).map(([questionId, data]) => ({
            question_id: parseInt(questionId),
            response: data.response,
            text_response: data.text_response,
        }));

        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'performance-snapshot',
            responses: responsesArray,
        }, {
            onSuccess: () => {
                setTabCompletions({ ...tabCompletions, 'performance-snapshot': true });
                // Controller will redirect to kpi-review, so we don't need to handle it here
            },
            onError: (errors) => {
                console.error('Error saving performance snapshot:', errors);
            },
        });
    };

    const handleKpiReviewContinue = async (kpis: any[]) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'kpi-review',
            kpis: kpis,
        }, {
            onSuccess: () => {
                setTabCompletions({ ...tabCompletions, 'kpi-review': true });
                setTimeout(() => {
                    handleTabChange('model-assignment', true);
                }, 200);
            },
        });
    };

    const handleModelAssignmentContinue = async (assignments: Record<number, 'mbo' | 'bsc' | 'okr'>) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'model-assignment',
            assignments: assignments,
        }, {
            onSuccess: () => {
                setTabCompletions({ ...tabCompletions, 'model-assignment': true });
                setTimeout(() => {
                    handleTabChange('evaluation-structure', true);
                }, 200);
            },
        });
    };

    const handleEvaluationStructureContinue = async (structure: any) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'evaluation-structure',
            ...structure,
        }, {
            onSuccess: () => {
                setTabCompletions({ ...tabCompletions, 'evaluation-structure': true });
                handleTabChange('review-submit', true);
            },
        });
    };

    const handleReviewSubmit = async () => {
        router.post(`/hr-manager/performance-system/${project.id}/submit`, {}, {
            onSuccess: () => {
                router.visit('/hr-manager/dashboard');
            },
            onError: (errors) => {
                console.error('Submit error:', errors);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Performance System - ${project?.company?.name || 'HR Manager'}`} />
            {/* Match Job Analysis: on overview = full-page cream bg, no tab bar. Else = header + tab bar + content */}
            {activeTab === 'overview' ? (
                <div className="min-h-full bg-[#f5f3ef]">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/hr-manager/dashboard"
                                className="text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                        {/* Full-page overview: hero + progress + cards (same structure as Job Analysis Overview) */}
                        <div className="flex flex-col min-h-full">
                            <section className="bg-[#0f172a] text-white px-6 py-10 pb-20 md:px-[10%] rounded-xl overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                                    <div className="font-bold text-lg">
                                        HR Path-Finder <span className="font-normal text-[#64748b] ml-2">/ Performance System</span>
                                    </div>
                                    <div className="bg-white/10 border border-white/20 px-3 py-1 rounded-[20px] text-xs text-[#94a3b8]">
                                        {getStatusForHeader() === 'submitted' ? 'SUBMITTED' : getStatusForHeader() === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED'}
                                    </div>
                                </div>
                                <div className="text-[#b38e5d] uppercase text-xs font-bold tracking-wider mb-1">
                                    ● STAGE 3 OF 5 — PERFORMANCE
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-2">Performance System Overview</h1>
                                <p className="text-[#94a3b8] max-w-[600px] leading-relaxed">
                                    Define evaluation units, performance management methods, and assessment structures. Complete each step in sequence to build a consultant-ready performance framework.
                                </p>
                                <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10 max-w-[720px]">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#b38e5d] mb-2">
                                        Before you begin
                                    </div>
                                    <p className="text-[#e2e8f0] text-sm leading-relaxed m-0">
                                        This stage builds on your Job Analysis. You will set up strategic performance snapshots, review organizational KPIs, assign evaluation models to jobs, and configure the evaluation structure. Complete each step in order.
                                    </p>
                                </div>
                                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                                    <div className="border-r-0 md:border-r md:border-white/10 pr-0 md:pr-10">
                                        <div className="text-[11px] text-[#94a3b8] uppercase">Steps Done</div>
                                        <strong className="text-2xl text-[#b38e5d]">
                                            {completedTabsCount} / {TABS.length}
                                        </strong>
                                        <div className="text-[11px] text-[#64748b]">steps completed</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span>Overall Progress</span>
                                            <span>{Math.round((completedTabsCount / TABS.length) * 100)}%</span>
                                        </div>
                                        <div className="h-1 w-full rounded-sm bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full rounded-sm bg-[#b38e5d] transition-all duration-300"
                                                style={{ width: `${(completedTabsCount / TABS.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div className="flex-1 max-w-[1000px] mx-auto px-5 -mt-10 relative w-full pb-8">
                                <Overview
                                    projectId={project.id}
                                    stepStatuses={stepStatuses}
                                    completedSteps={new Set(Object.keys(tabCompletions).filter(k => tabCompletions[k]))}
                                    onStepClick={handleTabChange}
                                    snapshotResponses={snapshotResponses}
                                    organizationalKpis={organizationalKpis}
                                    evaluationModelAssignments={evaluationModelAssignments}
                                    evaluationStructure={project.evaluation_structure}
                                    jobCount={jobDefinitions?.length ?? 0}
                                    snapshotQuestionsCount={snapshotQuestions?.length ?? 10}
                                    completedTabsCount={completedTabsCount}
                                    tabsLength={TABS.length}
                                    hideProgressCard
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                <div className="mb-0 rounded-t-xl overflow-hidden">
                    <div className="bg-[#151535] text-white px-5 py-4 md:px-6 flex items-start gap-4">
                        <button
                            type="button"
                            onClick={() => handleTabChange('overview')}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors shrink-0 mt-0.5"
                            aria-label="Back to overview"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                                    Performance System
                                </h1>
                                <span
                                    className={cn(
                                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                                        getStatusForHeader() === 'in_progress'
                                            ? 'bg-amber-500/90 text-white'
                                            : getStatusForHeader() === 'submitted'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white/10 text-slate-300'
                                    )}
                                >
                                    {getStatusForHeader() === 'in_progress'
                                        ? 'In Progress'
                                        : getStatusForHeader() === 'submitted'
                                        ? 'Submitted'
                                        : 'Not Started'}
                                </span>
                            </div>
                            <p className="text-slate-300 mt-1 text-sm">
                                Design evaluation units, performance management methods, and assessment structures.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#e5e7eb] border-t-0 rounded-b-xl shadow-sm mb-6 overflow-hidden">
                        <div className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
                            <div className="flex gap-1 overflow-x-auto scroll-smooth shrink-0" style={{ scrollbarWidth: 'thin' }}>
                                <button
                                    onClick={() => handleTabChange('overview')}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-[9px]',
                                        activeTab === 'overview'
                                            ? 'text-[#121431] border-[#059669] font-semibold'
                                            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Overview</span>
                                </button>
                                {TABS.map((tab, index) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const isEnabled = isTabEnabled(tab.id, index);
                                    const isCompleted = validateTabCompletion(tab.id);
                                    const TabIcon = isCompleted ? CheckCircle2 : Icon;
                                    if (!isEnabled) {
                                        return (
                                            <button
                                                key={tab.id}
                                                disabled
                                                className="flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed border-b-2 border-transparent -mb-[9px]"
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
                                                'flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-[9px]',
                                                isActive
                                                    ? 'text-[#121431] border-[#059669] font-semibold'
                                                    : isCompleted
                                                    ? 'text-[#059669] border-transparent hover:text-[#047857]'
                                                    : 'text-[#6b7280] border-transparent hover:text-[#374151]'
                                            )}
                                        >
                                            <TabIcon className="w-4 h-4 flex-shrink-0" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {activeTab === 'performance-snapshot' && snapshotTotalCount > 0 && (
                                <span className="text-sm text-[#6b7280] font-medium shrink-0">
                                    {snapshotAnsweredCount}/{snapshotTotalCount} questions answered
                                </span>
                            )}
                        </div>
                        <div className="h-1 w-full bg-[#e5e7eb]">
                            <div
                                className="h-full bg-[#059669] transition-all duration-300"
                                style={{ width: `${(completedTabsCount / TABS.length) * 100}%` }}
                            />
                        </div>
                    </div>

                {/* Tab Content (non-overview) */}
                {activeTab !== 'overview' && (
                <div>
                    {activeTab === 'performance-snapshot' && (
                        <PerformanceSnapshotTab
                            project={project}
                            questions={snapshotQuestions}
                            savedResponses={snapshotResponses}
                            onContinue={handleSnapshotContinue}
                            onBack={activeTab !== 'overview' ? () => handleTabChange('overview') : undefined}
                            onAnsweredChange={(answered, total) => setSnapshotAnsweredCount(answered)}
                        />
                    )}

                    {activeTab === 'kpi-review' && (
                        <KpiReviewTab
                            project={project}
                            jobDefinitions={jobDefinitions}
                            orgChartMappings={orgChartMappings}
                            kpiReviewTokens={kpiReviewTokens}
                            organizationalKpis={organizationalKpis}
                            onContinue={handleKpiReviewContinue}
                            onBack={() => handleTabChange('performance-snapshot')}
                        />
                    )}


                    {activeTab === 'model-assignment' && (
                        <EvaluationModelAssignmentTab
                            project={project}
                            jobDefinitions={jobDefinitions}
                            modelGuidance={modelGuidance}
                            jobRecommendations={jobRecommendations}
                            onContinue={handleModelAssignmentContinue}
                            onBack={() => handleTabChange('ceo-kpi-review')}
                        />
                    )}

                    {activeTab === 'evaluation-structure' && (
                        <EvaluationStructureTab
                            project={project}
                            evaluationStructure={project.evaluation_structure || null}
                            onContinue={handleEvaluationStructureContinue}
                            onBack={() => handleTabChange('model-assignment')}
                        />
                    )}

                    {activeTab === 'review-submit' && (
                        <ReviewSubmitTab
                            projectId={project.id}
                            snapshotResponses={snapshotResponses}
                            organizationalKpis={organizationalKpis}
                            evaluationModelAssignments={evaluationModelAssignments}
                            evaluationStructure={project.evaluation_structure}
                            onBack={() => handleTabChange('evaluation-structure')}
                            onSubmit={handleReviewSubmit}
                        />
                    )}
                </div>
                )}
            </div>
            )}
        </AppLayout>
    );
}
