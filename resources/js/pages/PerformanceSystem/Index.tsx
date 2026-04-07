import { Head, Link, router } from '@inertiajs/react';
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
import { Send } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';
import { pruneFieldErrorsToValidator } from '@/lib/fieldErrorsUtils';
import { toastCopy } from '@/lib/toastCopy';
import { cn } from '@/lib/utils';
import {
    validatePerformanceSnapshotTab,
    validateKpiReviewTab,
    validateModelAssignmentTab,
    validateEvaluationStructureTab,
} from './performanceTabValidation';
import Overview from './steps/Overview';
import EvaluationModelAssignmentTab from './tabs/EvaluationModelAssignmentTab';
import EvaluationStructureTab from './tabs/EvaluationStructureTab';
import KpiReviewTab from './tabs/KpiReviewTab';
import PerformanceSnapshotTab from './tabs/PerformanceSnapshotTab';
import ReviewSubmitTab from './tabs/ReviewSubmitTab';

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
    kpiVerificationNotice?: string | null;
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
    kpiVerificationNotice = null,
}: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<Record<string, boolean>>({});
    const [localDone, setLocalDone] = useState<Record<string, boolean>>({});
    const [draftSnapshotResponses, setDraftSnapshotResponses] = useState<Props['snapshotResponses']>(() => snapshotResponses ?? {});
    const [draftKpis, setDraftKpis] = useState<any[]>(() => organizationalKpis ?? []);
    const [draftAssignments, setDraftAssignments] = useState<Record<number, 'mbo' | 'bsc' | 'okr'>>(() => {
        const out: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        (evaluationModelAssignments ?? []).forEach((a: any) => {
            const id = Number(a?.job_definition_id ?? a?.job_definition?.id);
            const m = String(a?.evaluation_model ?? '').toLowerCase();
            if (!id) return;
            if (m === 'mbo' || m === 'bsc' || m === 'okr') out[id] = m;
        });
        return out;
    });
    const [draftStructure, setDraftStructure] = useState<any>(() => project.evaluation_structure ?? null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [tabValidationMessage, setTabValidationMessage] = useState<string | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [perfFieldErrors, setPerfFieldErrors] = useState<FieldErrors>({});
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
    const draftStorageKey = useMemo(() => `performance-draft:${project.id}`, [project.id]);

    const reviewSubmitAssignments = useMemo(() => {
        const byJobId = new Map<number, any>();
        (jobDefinitions ?? []).forEach((job: any) => {
            const id = Number(job?.id);
            if (id) byJobId.set(id, job);
        });

        return Object.entries(draftAssignments ?? {}).map(([jobId, model]) => {
            const numericJobId = Number(jobId);
            const job = byJobId.get(numericJobId);
            return {
                job_definition_id: numericJobId,
                evaluation_model: model,
                job_definition: job ?? null,
            };
        });
    }, [draftAssignments, jobDefinitions]);

    // Validate tab completion based on data
    const validateTabCompletion = (tabId: string): boolean => {
        switch (tabId) {
            case 'performance-snapshot':
                return validatePerformanceSnapshotTab(snapshotQuestions as any[], draftSnapshotResponses ?? {}).valid || localDone['performance-snapshot'] === true;
            case 'kpi-review':
                return validateKpiReviewTab(draftKpis ?? []).valid || localDone['kpi-review'] === true;
            case 'model-assignment':
                return validateModelAssignmentTab(jobDefinitions ?? [], draftAssignments ?? {}).valid || localDone['model-assignment'] === true;
            case 'evaluation-structure':
                return validateEvaluationStructureTab(draftStructure).valid || localDone['evaluation-structure'] === true;
            case 'review-submit':
                return (
                    validateTabCompletion('performance-snapshot') &&
                    validateTabCompletion('kpi-review') &&
                    validateTabCompletion('model-assignment') &&
                    validateTabCompletion('evaluation-structure')
                );
            default:
                return false;
        }
    };

    // Check if tab is enabled (previous tabs completed)
    const isTabEnabled = (tabId: string, tabIndex: number): boolean => {
        // Overview is always enabled
        if (tabId === 'overview') return true;
        if (tabIndex === 0) return true;

        const currentIndex = TABS.findIndex((t) => t.id === activeTab);
        // Always allow moving to same/previous tab (back navigation must never be blocked)
        if (currentIndex !== -1 && tabIndex <= currentIndex) return true;
        
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = TABS[i];
            if (prevTab.id === 'overview') continue;
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
    }, [draftSnapshotResponses, draftKpis, draftAssignments, draftStructure, localDone]);

    const handleTabChange = (tab: string, force: boolean = false) => {
        if (tab === 'overview') {
            setTabValidationMessage(null);
            setPerfFieldErrors({});
            setActiveTab('overview');
            router.get(`/hr-manager/performance-system/${project.id}/overview`, {}, {
                preserveState: true,
                preserveScroll: false,
            });
            return;
        }

        const tabIndex = TABS.findIndex(t => t.id === tab);
        if (tabIndex === -1) return;

        if (!force && !isTabEnabled(tab, tabIndex)) {
            let blockerLabel = 'the previous step';
            for (let i = 0; i < tabIndex; i++) {
                const prevTab = TABS[i];
                if (!validateTabCompletion(prevTab.id)) {
                    blockerLabel = prevTab.label;
                    break;
                }
            }
            setPerfFieldErrors({});
            setTabValidationMessage(`Complete "${blockerLabel}" before opening this tab.`);
            return;
        }

        setTabValidationMessage(null);
        setPerfFieldErrors({});
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

    // Hydrate unsaved local draft on first load.
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (
                    Object.keys(snapshotResponses ?? {}).length === 0 &&
                    parsed?.snapshotResponses
                ) setDraftSnapshotResponses(parsed.snapshotResponses);
                if (
                    (organizationalKpis ?? []).length === 0 &&
                    Array.isArray(parsed?.kpis)
                ) setDraftKpis(parsed.kpis);
                if (
                    (evaluationModelAssignments ?? []).length === 0 &&
                    parsed?.assignments
                ) setDraftAssignments(parsed.assignments);
                if (!project.evaluation_structure && parsed?.structure) {
                    setDraftStructure(parsed.structure);
                }
            }
        } catch {
            // Ignore malformed local draft.
        }
    }, [draftStorageKey, snapshotResponses, organizationalKpis, evaluationModelAssignments, project.evaluation_structure]);

    // Persist current draft locally while user progresses.
    useEffect(() => {
        try {
            window.localStorage.setItem(
                draftStorageKey,
                JSON.stringify({
                    snapshotResponses: draftSnapshotResponses,
                    kpis: draftKpis,
                    assignments: draftAssignments,
                    structure: draftStructure,
                    updatedAt: Date.now(),
                }),
            );

        } catch {
            // Ignore local storage write failures.
        }
    }, [draftStorageKey, draftSnapshotResponses, draftKpis, draftAssignments, draftStructure, activeTab]);

    // Live: drop field-level errors as the user fixes each field on the active tab.
    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'review-submit') return;
        setPerfFieldErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            let latest: FieldErrors = {};
            switch (activeTab) {
                case 'performance-snapshot':
                    latest = validatePerformanceSnapshotTab(snapshotQuestions as any[], draftSnapshotResponses ?? {}).fieldErrors;
                    break;
                case 'kpi-review':
                    latest = validateKpiReviewTab(draftKpis ?? []).fieldErrors;
                    break;
                case 'model-assignment':
                    latest = validateModelAssignmentTab(jobDefinitions ?? [], draftAssignments ?? {}).fieldErrors;
                    break;
                case 'evaluation-structure':
                    latest = validateEvaluationStructureTab(draftStructure).fieldErrors;
                    break;
                default:
                    return prev;
            }
            return pruneFieldErrorsToValidator(prev, latest);
        });
    }, [
        activeTab,
        draftSnapshotResponses,
        draftKpis,
        draftAssignments,
        draftStructure,
        snapshotQuestions,
        jobDefinitions,
    ]);

    useEffect(() => {
        if (!tabValidationMessage) return;
        if (tabValidationMessage.startsWith('Complete "')) return;
        if (Object.keys(perfFieldErrors).length === 0) {
            setTabValidationMessage(null);
        }
    }, [tabValidationMessage, perfFieldErrors]);

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
        const v = validatePerformanceSnapshotTab(snapshotQuestions as any[], responses);
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftSnapshotResponses(responses);
        setIsSavingDraft(true);
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'performance-snapshot',
            responses: Object.entries(responses ?? {}).map(([questionId, d]) => ({
                question_id: Number(questionId),
                response: d?.response ?? [],
                text_response: d?.text_response,
            })),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLocalDone((d) => ({ ...d, 'performance-snapshot': true }));
                setIsSavingDraft(false);
                handleTabChange('kpi-review', true);
            },
            onError: () => {
                setIsSavingDraft(false);
                setTabValidationMessage('Snapshot save failed. Please try again.');
                toast({
                    title: toastCopy.saveFailed,
                    description: 'Snapshot could not be saved. Please try again. 다시 시도해 주세요.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleKpiReviewContinue = async (kpis: any[]) => {
        const v = validateKpiReviewTab(kpis ?? []);
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftKpis(kpis);
        setIsSavingDraft(true);
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'kpi-review',
            kpis: kpis ?? [],
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLocalDone((d) => ({ ...d, 'kpi-review': true }));
                setIsSavingDraft(false);
                handleTabChange('model-assignment', true);
            },
            onError: () => {
                setIsSavingDraft(false);
                setTabValidationMessage('KPI draft save failed. Please try again.');
                toast({
                    title: toastCopy.saveFailed,
                    description: 'KPI Review could not be saved. Please try again. 다시 시도해 주세요.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleModelAssignmentContinue = async (assignments: Record<number, 'mbo' | 'bsc' | 'okr'>) => {
        const v = validateModelAssignmentTab(jobDefinitions ?? [], assignments ?? {});
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftAssignments(assignments);
        setIsSavingDraft(true);
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'model-assignment',
            assignments,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLocalDone((d) => ({ ...d, 'model-assignment': true }));
                setIsSavingDraft(false);
                handleTabChange('evaluation-structure', true);
            },
            onError: () => {
                setIsSavingDraft(false);
                setTabValidationMessage('Model assignment save failed. Please try again.');
                toast({
                    title: toastCopy.saveFailed,
                    description: 'Model Assignment could not be saved. Please try again. 다시 시도해 주세요.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleEvaluationStructureContinue = async (structure: any) => {
        const v = validateEvaluationStructureTab(structure);
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftStructure(structure);
        setIsSavingDraft(true);
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'evaluation-structure',
            ...(structure ?? {}),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLocalDone((d) => ({ ...d, 'evaluation-structure': true }));
                setIsSavingDraft(false);
                handleTabChange('review-submit', true);
            },
            onError: () => {
                setIsSavingDraft(false);
                setTabValidationMessage('Evaluation structure save failed. Please try again.');
                toast({
                    title: toastCopy.saveFailed,
                    description: 'Evaluation Structure could not be saved. Please try again. 다시 시도해 주세요.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleReviewSubmit = async () => {
        setSubmitError(null);
        setTabValidationMessage(null);

        const snapV = validatePerformanceSnapshotTab(snapshotQuestions as any[], draftSnapshotResponses ?? {});
        if (!snapV.valid) {
            setTabValidationMessage(snapV.message);
            setPerfFieldErrors(snapV.fieldErrors);
            setActiveTab('performance-snapshot');
            router.get(`/hr-manager/performance-system/${project.id}/performance-snapshot`, {}, {
                preserveState: true,
                preserveScroll: false,
            });
            return;
        }
        const kpiV = validateKpiReviewTab(draftKpis ?? []);
        if (!kpiV.valid) {
            setTabValidationMessage(kpiV.message);
            setPerfFieldErrors(kpiV.fieldErrors);
            setActiveTab('kpi-review');
            router.get(`/hr-manager/performance-system/${project.id}/kpi-review`, {}, {
                preserveState: true,
                preserveScroll: false,
            });
            return;
        }
        const modelV = validateModelAssignmentTab(jobDefinitions ?? [], draftAssignments ?? {});
        if (!modelV.valid) {
            setTabValidationMessage(modelV.message);
            setPerfFieldErrors(modelV.fieldErrors);
            setActiveTab('model-assignment');
            router.get(`/hr-manager/performance-system/${project.id}/model-assignment`, {}, {
                preserveState: true,
                preserveScroll: false,
            });
            return;
        }
        const structV = validateEvaluationStructureTab(draftStructure);
        if (!structV.valid) {
            setTabValidationMessage(structV.message);
            setPerfFieldErrors(structV.fieldErrors);
            setActiveTab('evaluation-structure');
            router.get(`/hr-manager/performance-system/${project.id}/evaluation-structure`, {}, {
                preserveState: true,
                preserveScroll: false,
            });
            return;
        }

        setPerfFieldErrors({});

        const postStep = (url: string, payload: any) =>
            new Promise<void>((resolve, reject) => {
                router.post(url, payload, {
                    preserveScroll: true,
                    onSuccess: () => resolve(),
                    onError: (e) => reject(e),
                });
            });

        try {
            const responsesArray = Object.entries(draftSnapshotResponses ?? {}).map(([questionId, d]) => ({
                question_id: parseInt(questionId, 10),
                response: (d as any)?.response ?? [],
                text_response: (d as any)?.text_response,
            }));

            await postStep(`/hr-manager/performance-system/${project.id}`, {
                tab: 'performance-snapshot',
                responses: responsesArray,
            });

            await postStep(`/hr-manager/performance-system/${project.id}`, {
                tab: 'kpi-review',
                kpis: draftKpis ?? [],
            });

            await postStep(`/hr-manager/performance-system/${project.id}`, {
                tab: 'model-assignment',
                assignments: draftAssignments ?? {},
            });

            await postStep(`/hr-manager/performance-system/${project.id}`, {
                tab: 'evaluation-structure',
                ...(draftStructure ?? {}),
            });

            await postStep(`/hr-manager/performance-system/${project.id}/submit`, {});
            try {
                window.localStorage.removeItem(draftStorageKey);
            } catch {
                // ignore
            }
            toast({
                title: toastCopy.submitted,
                description: 'Performance system submitted for review. 성과 시스템이 제출되었습니다.',
                variant: 'success',
                duration: 2000,
            });
            setShowSuccessModal(true);
        } catch {
            setSubmitError('Submit failed. Please review each tab and try again.');
            toast({
                title: toastCopy.submitFailed,
                description: 'Please review required fields and try again. 필수 항목을 확인해 주세요.',
                variant: 'destructive',
            });
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        router.visit('/hr-manager/dashboard');
    };

    return (
        <AppLayout>
            <Head
                title={t('page_heads.performance_system', {
                    company:
                        project?.company?.name ||
                        t('page_head_fallbacks.hr_manager'),
                })}
            />
            {/* Match Job Analysis: on overview = full-page cream bg, no tab bar. Else = header + tab bar + content */}
            {activeTab === 'overview' ? (
                <div className="min-h-full flex flex-col bg-[#f5f3ef]">
                    <div className="shrink-0 px-6 pt-6 pb-2">
                        <Link
                            href="/hr-manager/dashboard"
                            className="text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                    {/* Same flex shell as Job Analysis Overview: hero + flex-1 step column + sticky footer */}
                    <section className="shrink-0 bg-[#0f172a] text-white px-6 py-10 pb-16 md:px-[10%]">
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
                    <div className="flex-1 flex flex-col min-h-0 w-full px-5 -mt-10 pb-8 relative z-[2]">
                        <Overview
                            projectId={project.id}
                            stepStatuses={stepStatuses}
                            completedSteps={new Set(Object.keys(tabCompletions).filter(k => tabCompletions[k]))}
                            onStepClick={handleTabChange}
                            snapshotResponses={draftSnapshotResponses}
                            organizationalKpis={draftKpis}
                            evaluationModelAssignments={evaluationModelAssignments}
                            evaluationStructure={draftStructure ?? project.evaluation_structure}
                            jobCount={jobDefinitions?.length ?? 0}
                            snapshotQuestionsCount={snapshotQuestions?.length ?? 10}
                            completedTabsCount={completedTabsCount}
                            tabsLength={TABS.length}
                            hideProgressCard
                        />
                    </div>
                </div>
            ) : (
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background flex flex-col min-h-full">
                {activeTab === 'review-submit' && (tabValidationMessage || submitError) && (
                    <InlineErrorSummary
                        className="mb-4"
                        message={tabValidationMessage || submitError}
                        errors={perfFieldErrors}
                    />
                )}
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
                                                type="button"
                                                onClick={() => handleTabChange(tab.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap bg-[#f9fafb] text-[#9ca3af] cursor-pointer border-b-2 border-transparent -mb-[9px] hover:bg-[#f3f4f6]"
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
                        {isSavingDraft && (
                            <div className="px-4 py-2 text-xs text-[#6b7280] bg-[#f9fafb] border-t border-[#eef2f7]">
                                Saving draft...
                            </div>
                        )}
                    </div>

                {/* Tab Content (non-overview): flex so KPI Review footer stays in content area */}
                {activeTab !== 'overview' && (
                <div className={cn(activeTab === 'kpi-review' && 'flex flex-col flex-1 min-h-0')}>
                    {activeTab === 'performance-snapshot' && (
                        <PerformanceSnapshotTab
                            project={project}
                            questions={snapshotQuestions}
                            savedResponses={draftSnapshotResponses}
                            onResponsesChange={setDraftSnapshotResponses}
                            onContinue={handleSnapshotContinue}
                            onBack={() => handleTabChange('overview')}
                            onAnsweredChange={(answered, total) => setSnapshotAnsweredCount(answered)}
                            fieldErrors={perfFieldErrors}
                        />
                    )}

                    {activeTab === 'kpi-review' && (
                        <KpiReviewTab
                            project={project}
                            jobDefinitions={jobDefinitions}
                            orgChartMappings={orgChartMappings}
                            kpiReviewTokens={kpiReviewTokens}
                            organizationalKpis={draftKpis}
                            onKpisChange={setDraftKpis}
                            onContinue={handleKpiReviewContinue}
                            onBack={() => handleTabChange('performance-snapshot')}
                            fieldErrors={perfFieldErrors}
                            kpiVerificationNotice={kpiVerificationNotice}
                        />
                    )}


                    {activeTab === 'model-assignment' && (
                        <EvaluationModelAssignmentTab
                            project={project}
                            jobDefinitions={jobDefinitions}
                            organizationalKpis={draftKpis}
                            evaluationModelAssignments={evaluationModelAssignments}
                            modelGuidance={modelGuidance}
                            jobRecommendations={jobRecommendations}
                            onContinue={handleModelAssignmentContinue}
                            onBack={() => handleTabChange('kpi-review')}
                            fieldErrors={perfFieldErrors}
                        />
                    )}

                    {activeTab === 'evaluation-structure' && (
                        <EvaluationStructureTab
                            project={project}
                            evaluationStructure={(draftStructure ?? project.evaluation_structure) || null}
                            onContinue={handleEvaluationStructureContinue}
                            onBack={() => handleTabChange('model-assignment')}
                            fieldErrors={perfFieldErrors}
                        />
                    )}

                    {activeTab === 'review-submit' && (
                        <ReviewSubmitTab
                            projectId={project.id}
                            snapshotQuestions={snapshotQuestions}
                            snapshotResponses={draftSnapshotResponses}
                            organizationalKpis={draftKpis}
                            evaluationModelAssignments={reviewSubmitAssignments}
                            evaluationStructure={draftStructure ?? project.evaluation_structure}
                            orgChartMappings={orgChartMappings}
                            onBack={() => handleTabChange('evaluation-structure')}
                            onSubmit={handleReviewSubmit}
                            onGoToStep={(tab) => handleTabChange(tab)}
                        />
                    )}
                </div>
                )}
            </div>
            )}
            <Dialog
                open={showSuccessModal}
                onOpenChange={(open) => {
                    if (!open) handleCloseSuccessModal();
                    else setShowSuccessModal(true);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">
                            <span className="block">Performance system submitted successfully!</span>
                            <span className="block text-sm font-medium opacity-90">성과 시스템 제출이 완료되었습니다!</span>
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            <span className="block">
                                Your performance design has been submitted for consultant review. The final system will be confirmed through a collaborative review process.
                            </span>
                            <span className="block opacity-90">
                                성과 설계가 컨설턴트 검토를 위해 제출되었습니다. 협업 검토 과정을 통해 최종 시스템이 확정됩니다.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
                        <button
                            type="button"
                            onClick={handleCloseSuccessModal}
                            className="w-full sm:w-auto h-11 rounded-lg bg-[#152540] hover:bg-[#1e3a62] text-white font-semibold"
                        >
                            Done
                            <span className="block text-xs opacity-80">대시보드로 이동</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
