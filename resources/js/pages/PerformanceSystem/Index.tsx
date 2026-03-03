import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
    FileText, 
    Target, 
    Users, 
    CheckCircle2,
    Settings,
    Check
} from 'lucide-react';
import Overview from './steps/Overview';
import PerformanceSnapshotTab from './tabs/PerformanceSnapshotTab';
import KpiReviewTab from './tabs/KpiReviewTab';
import EvaluationModelAssignmentTab from './tabs/EvaluationModelAssignmentTab';
import EvaluationStructureTab from './tabs/EvaluationStructureTab';
import ReviewSubmitTab from './tabs/ReviewSubmitTab';
import StepHeader from '@/components/StepHeader/StepHeader';
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
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                {/* Header */}
                {activeTab !== 'overview' && (
                    <div className="mb-6">
                        <StepHeader
                            title="Performance System"
                            description="Design evaluation units, performance management methods, and assessment structures."
                            status={getStatusForHeader()}
                            backHref="/hr-manager/dashboard"
                        />
                    </div>
                )}

                {/* Overview Page */}
                {activeTab === 'overview' && (
                    <Overview
                        projectId={project.id}
                        stepStatuses={stepStatuses}
                        completedSteps={new Set(Object.keys(tabCompletions).filter(k => tabCompletions[k]))}
                        onStepClick={handleTabChange}
                        snapshotResponses={snapshotResponses}
                        organizationalKpis={organizationalKpis}
                        evaluationModelAssignments={evaluationModelAssignments}
                        evaluationStructure={project.evaluation_structure}
                    />
                )}

                {/* Progress Overview */}
                {activeTab !== 'overview' && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-600">{completedTabsCount} of {TABS.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${(completedTabsCount / TABS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth mb-6" style={{ scrollbarWidth: 'thin' }}>
                    {/* Overview Tab */}
                    <button
                        onClick={() => handleTabChange('overview')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer relative",
                            activeTab === 'overview'
                                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Overview</span>
                    </button>

                    {/* Other Tabs */}
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
                                        <Check className="w-3 h-3 text-white" />
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
                

                {/* Tab Content */}
                {activeTab !== 'overview' && (
                <div>
                    {activeTab === 'performance-snapshot' && (
                        <PerformanceSnapshotTab
                            project={project}
                            questions={snapshotQuestions}
                            savedResponses={snapshotResponses}
                            onContinue={handleSnapshotContinue}
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
        </AppLayout>
    );
}
