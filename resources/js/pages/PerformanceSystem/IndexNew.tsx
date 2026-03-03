import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    FileText, 
    Target, 
    Users, 
    CheckCircle2,
    Settings,
    Shield
} from 'lucide-react';
import PerformanceSnapshotTab from './tabs/PerformanceSnapshotTab';
import KpiReviewTab from './tabs/KpiReviewTab';
import CeoKpiReviewTab from './tabs/CeoKpiReviewTab';
import EvaluationModelAssignmentTab from './tabs/EvaluationModelAssignmentTab';
import EvaluationStructureTab from './tabs/EvaluationStructureTab';

// Fix for missing performance_snapshot_responses property
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
    orgChartMappings?: any[];
    kpiReviewTokens?: any;
    organizationalKpis?: any[];
    modelGuidance?: any;
    jobRecommendations?: any;
    stepStatuses?: any;
    projectId?: number;
}

const TABS = [
    { id: 'performance-snapshot', label: 'Strategic Performance Snapshot', icon: FileText },
    { id: 'kpi-review', label: 'KPI Review', icon: Target },
    { id: 'ceo-kpi-review', label: 'CEO KPI Review', icon: Users },
    { id: 'model-assignment', label: 'Evaluation Model Assignment', icon: Settings },
    { id: 'evaluation-structure', label: 'Evaluation Structure', icon: CheckCircle2 },
];

export default function PerformanceSystemIndexNew({
    project,
    performanceSystem,
    activeTab: initialTab = 'performance-snapshot',
    snapshotQuestions = [],
    snapshotResponses = {},
    jobDefinitions = [],
    orgChartMappings = [],
    kpiReviewTokens = {},
    organizationalKpis = [],
    modelGuidance,
    jobRecommendations,
    stepStatuses = {},
    projectId,
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update active tab when initialTab changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get(`/hr-manager/performance-system/${project.id}/${tab}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
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
                handleTabChange('kpi-review');
            },
        });
    };

    const handleKpiReviewContinue = async (kpis: any[]) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'kpi-review',
            kpis: kpis,
        }, {
            onSuccess: () => {
                handleTabChange('ceo-kpi-review');
            },
        });
    };

    const handleCeoKpiReviewContinue = () => {
        handleTabChange('model-assignment');
    };

    const handleModelAssignmentContinue = async (assignments: Record<number, 'mbo' | 'bsc' | 'okr'>) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'model-assignment',
            assignments: assignments,
        }, {
            onSuccess: () => {
                handleTabChange('evaluation-structure');
            },
        });
    };

    const handleEvaluationStructureContinue = async (structure: any) => {
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'evaluation-structure',
            ...structure,
        }, {
            onSuccess: () => {
                // Could redirect to review page or show success
            },
        });
    };

    const calculateProgress = () => {
        let completed = 0;
        if (project.performance_snapshot_responses && project.performance_snapshot_responses.length > 0) completed++;
        if (project.organizational_kpis && project.organizational_kpis.length > 0) completed++;
        if (project.evaluation_model_assignments && project.evaluation_model_assignments.length > 0) completed++;
        if (project.evaluation_structure) completed++;
        return Math.round((completed / 5) * 100);
    };

    const progress = calculateProgress();

    return (
        <AppLayout>
            <Head title={`Performance System - ${project?.company?.name || 'HR Manager'}`} />
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Performance System</h1>
                                    <p className="text-primary-100 mt-1">HR Manager — Admin Module</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-primary-100 mb-1">Module Progress</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-48 bg-white/20 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-white h-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="text-lg font-bold">{progress}%</div>
                                </div>
                                <div className="text-xs text-primary-100 mt-1">0/5 stages</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1 bg-muted/50">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-medium text-center">{tab.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value="performance-snapshot" className="mt-0">
                            <PerformanceSnapshotTab
                                project={project}
                                questions={snapshotQuestions}
                                savedResponses={snapshotResponses}
                                onContinue={handleSnapshotContinue}
                            />
                        </TabsContent>

                        <TabsContent value="kpi-review" className="mt-0">
                            <KpiReviewTab
                                project={project}
                                jobDefinitions={jobDefinitions}
                                orgChartMappings={orgChartMappings}
                                kpiReviewTokens={kpiReviewTokens}
                                onContinue={handleKpiReviewContinue}
                            />
                        </TabsContent>

                        <TabsContent value="ceo-kpi-review" className="mt-0">
                            <CeoKpiReviewTab
                                project={project}
                                kpis={organizationalKpis}
                                onContinue={handleCeoKpiReviewContinue}
                            />
                        </TabsContent>

                        <TabsContent value="model-assignment" className="mt-0">
                            <EvaluationModelAssignmentTab
                                project={project}
                                jobDefinitions={jobDefinitions}
                                modelGuidance={modelGuidance}
                                jobRecommendations={jobRecommendations}
                                onContinue={handleModelAssignmentContinue}
                            />
                        </TabsContent>

                        <TabsContent value="evaluation-structure" className="mt-0">
                            <EvaluationStructureTab
                                project={project}
                                evaluationStructure={project.evaluation_structure}
                                onContinue={handleEvaluationStructureContinue}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
