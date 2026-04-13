import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
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
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    FileText,
    LayoutGrid,
    Send,
    Settings,
    Target,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    validateEvaluationStructureTab,
    validateKpiReviewTab,
    validateModelAssignmentTab,
    validatePerformanceSnapshotTab,
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
    snapshotResponses?: Record<
        number,
        { response: string[]; text_response?: string }
    >;
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

const getTabs = (t: (key: string) => string) => [
    {
        id: 'performance-snapshot',
        label: t('performance_system_index.tabs.snapshot'),
        icon: FileText,
    },
    {
        id: 'kpi-review',
        label: t('performance_system_index.tabs.kpi'),
        icon: Target,
    },
    {
        id: 'model-assignment',
        label: t('performance_system_index.tabs.model'),
        icon: Settings,
    },
    {
        id: 'evaluation-structure',
        label: t('performance_system_index.tabs.structure'),
        icon: CheckCircle2,
    },
    {
        id: 'review-submit',
        label: t('performance_system_index.tabs.review'),
        icon: Send,
    },
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
    const TABS = getTabs(t);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<
        Record<string, boolean>
    >({});
    const [localDone, setLocalDone] = useState<Record<string, boolean>>({});
    const [draftSnapshotResponses, setDraftSnapshotResponses] = useState<
        Props['snapshotResponses']
    >(() => snapshotResponses ?? {});
    const [draftKpis, setDraftKpis] = useState<any[]>(
        () => organizationalKpis ?? [],
    );
    const [draftAssignments, setDraftAssignments] = useState<
        Record<number, 'mbo' | 'bsc' | 'okr'>
    >(() => {
        const out: Record<number, 'mbo' | 'bsc' | 'okr'> = {};
        (evaluationModelAssignments ?? []).forEach((a: any) => {
            const id = Number(a?.job_definition_id ?? a?.job_definition?.id);
            const m = String(a?.evaluation_model ?? '').toLowerCase();
            if (!id) return;
            if (m === 'mbo' || m === 'bsc' || m === 'okr') out[id] = m;
        });
        return out;
    });
    const [draftStructure, setDraftStructure] = useState<any>(
        () => project.evaluation_structure ?? null,
    );
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [tabValidationMessage, setTabValidationMessage] = useState<
        string | null
    >(null);
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
                const hasOther = (q.options || []).some((o: string) =>
                    String(o).toLowerCase().includes('other'),
                );
                const selectedOther = arr.some((s: string) =>
                    String(s).toLowerCase().includes('other'),
                );
                if (hasOther && selectedOther) {
                    if ((r?.text_response ?? '').trim()) n++;
                } else n++;
            }
        }
        return n;
    });
    const snapshotTotalCount = (snapshotQuestions as any[])?.length ?? 0;
    const draftStorageKey = useMemo(
        () => `performance-draft:${project.id}`,
        [project.id],
    );

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
                return (
                    validatePerformanceSnapshotTab(
                        snapshotQuestions as any[],
                        draftSnapshotResponses ?? {},
                    ).valid || localDone['performance-snapshot'] === true
                );
            case 'kpi-review':
                return (
                    validateKpiReviewTab(draftKpis ?? []).valid ||
                    localDone['kpi-review'] === true
                );
            case 'model-assignment':
                return (
                    validateModelAssignmentTab(
                        jobDefinitions ?? [],
                        draftAssignments ?? {},
                    ).valid || localDone['model-assignment'] === true
                );
            case 'evaluation-structure':
                return (
                    validateEvaluationStructureTab(draftStructure).valid ||
                    localDone['evaluation-structure'] === true
                );
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
        TABS.forEach((tab) => {
            completions[tab.id] = validateTabCompletion(tab.id);
        });
        setTabCompletions(completions);
    }, [
        draftSnapshotResponses,
        draftKpis,
        draftAssignments,
        draftStructure,
        localDone,
    ]);

    const handleTabChange = (tab: string, force: boolean = false) => {
        if (tab === 'overview') {
            setTabValidationMessage(null);
            setPerfFieldErrors({});
            setActiveTab('overview');
            router.get(
                `/hr-manager/performance-system/${project.id}/overview`,
                {},
                {
                    preserveState: true,
                    preserveScroll: false,
                },
            );
            return;
        }

        const tabIndex = TABS.findIndex((t) => t.id === tab);
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
            setTabValidationMessage(
                t('performance_system_index.validation.complete_previous', {
                    step: blockerLabel,
                }),
            );
            return;
        }

        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setActiveTab(tab);
        router.get(
            `/hr-manager/performance-system/${project.id}/${tab}`,
            {},
            {
                preserveState: true,
                preserveScroll: false,
            },
        );
    };

    const calculateProgress = () => {
        const completedTabs = TABS.filter((tab) =>
            validateTabCompletion(tab.id),
        );
        return Math.round((completedTabs.length / TABS.length) * 100);
    };

    const progress = calculateProgress();
    const completedTabsCount = TABS.filter((tab) =>
        validateTabCompletion(tab.id),
    ).length;

    // Update active tab when initialTab changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Keep KPI draft in sync with latest server payload (e.g. CEO approval/revision updates).
    useEffect(() => {
        setDraftKpis(organizationalKpis ?? []);
    }, [organizationalKpis]);

    // Hydrate unsaved local draft on first load.
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (
                    Object.keys(snapshotResponses ?? {}).length === 0 &&
                    parsed?.snapshotResponses
                )
                    setDraftSnapshotResponses(parsed.snapshotResponses);
                if (
                    (organizationalKpis ?? []).length === 0 &&
                    Array.isArray(parsed?.kpis)
                )
                    setDraftKpis(parsed.kpis);
                if (
                    (evaluationModelAssignments ?? []).length === 0 &&
                    parsed?.assignments
                )
                    setDraftAssignments(parsed.assignments);
                if (!project.evaluation_structure && parsed?.structure) {
                    setDraftStructure(parsed.structure);
                }
            }
        } catch {
            // Ignore malformed local draft.
        }
    }, [
        draftStorageKey,
        snapshotResponses,
        organizationalKpis,
        evaluationModelAssignments,
        project.evaluation_structure,
    ]);

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
    }, [
        draftStorageKey,
        draftSnapshotResponses,
        draftKpis,
        draftAssignments,
        draftStructure,
        activeTab,
    ]);

    // Live: drop field-level errors as the user fixes each field on the active tab.
    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'review-submit') return;
        setPerfFieldErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            let latest: FieldErrors = {};
            switch (activeTab) {
                case 'performance-snapshot':
                    latest = validatePerformanceSnapshotTab(
                        snapshotQuestions as any[],
                        draftSnapshotResponses ?? {},
                    ).fieldErrors;
                    break;
                case 'kpi-review':
                    latest = validateKpiReviewTab(draftKpis ?? []).fieldErrors;
                    break;
                case 'model-assignment':
                    latest = validateModelAssignmentTab(
                        jobDefinitions ?? [],
                        draftAssignments ?? {},
                    ).fieldErrors;
                    break;
                case 'evaluation-structure':
                    latest =
                        validateEvaluationStructureTab(
                            draftStructure,
                        ).fieldErrors;
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

    const getStatusForHeader = ():
        | 'not_started'
        | 'in_progress'
        | 'submitted' => {
        const status = stepStatuses?.performance || 'not_started';
        if (
            status === 'submitted' ||
            status === 'approved' ||
            status === 'locked'
        ) {
            return 'submitted';
        }
        if (status === 'in_progress' || completedTabsCount > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    // Handlers for tab continue actions
    const handleSnapshotContinue = async (
        responses: Record<
            number,
            { response: string[]; text_response?: string }
        >,
    ) => {
        const v = validatePerformanceSnapshotTab(
            snapshotQuestions as any[],
            responses,
        );
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftSnapshotResponses(responses);
        setIsSavingDraft(true);
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'performance-snapshot',
                responses: Object.entries(responses ?? {}).map(
                    ([questionId, d]) => ({
                        question_id: Number(questionId),
                        response: d?.response ?? [],
                        text_response: d?.text_response,
                    }),
                ),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLocalDone((d) => ({
                        ...d,
                        'performance-snapshot': true,
                    }));
                    setIsSavingDraft(false);
                    handleTabChange('kpi-review', true);
                },
                onError: () => {
                    setIsSavingDraft(false);
                    setTabValidationMessage(
                        'Snapshot save failed. Please try again.',
                    );
                    toast({
                        title: toastCopy.saveFailed,
                        description:
                            'Snapshot could not be saved. Please try again. 다시 시도해 주세요.',
                        variant: 'destructive',
                    });
                },
            },
        );
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
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'kpi-review',
                kpis: kpis ?? [],
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLocalDone((d) => ({ ...d, 'kpi-review': true }));
                    setIsSavingDraft(false);
                    handleTabChange('model-assignment', true);
                },
                onError: () => {
                    setIsSavingDraft(false);
                    setTabValidationMessage(
                        'KPI draft save failed. Please try again.',
                    );
                    toast({
                        title: toastCopy.saveFailed,
                        description:
                            'KPI Review could not be saved. Please try again. 다시 시도해 주세요.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleModelAssignmentContinue = async (
        assignments: Record<number, 'mbo' | 'bsc' | 'okr'>,
    ) => {
        const v = validateModelAssignmentTab(
            jobDefinitions ?? [],
            assignments ?? {},
        );
        if (!v.valid) {
            setTabValidationMessage(v.message);
            setPerfFieldErrors(v.fieldErrors);
            return;
        }
        setTabValidationMessage(null);
        setPerfFieldErrors({});
        setDraftAssignments(assignments);
        setIsSavingDraft(true);
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'model-assignment',
                assignments,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLocalDone((d) => ({ ...d, 'model-assignment': true }));
                    setIsSavingDraft(false);
                    handleTabChange('evaluation-structure', true);
                },
                onError: () => {
                    setIsSavingDraft(false);
                    setTabValidationMessage(
                        'Model assignment save failed. Please try again.',
                    );
                    toast({
                        title: toastCopy.saveFailed,
                        description:
                            'Model Assignment could not be saved. Please try again. 다시 시도해 주세요.',
                        variant: 'destructive',
                    });
                },
            },
        );
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
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'evaluation-structure',
                ...(structure ?? {}),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLocalDone((d) => ({
                        ...d,
                        'evaluation-structure': true,
                    }));
                    setIsSavingDraft(false);
                    handleTabChange('review-submit', true);
                },
                onError: () => {
                    setIsSavingDraft(false);
                    setTabValidationMessage(
                        'Evaluation structure save failed. Please try again.',
                    );
                    toast({
                        title: toastCopy.saveFailed,
                        description:
                            'Evaluation Structure could not be saved. Please try again. 다시 시도해 주세요.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleReviewSubmit = async () => {
        setSubmitError(null);
        setTabValidationMessage(null);

        const snapV = validatePerformanceSnapshotTab(
            snapshotQuestions as any[],
            draftSnapshotResponses ?? {},
        );
        if (!snapV.valid) {
            setTabValidationMessage(snapV.message);
            setPerfFieldErrors(snapV.fieldErrors);
            setActiveTab('performance-snapshot');
            router.get(
                `/hr-manager/performance-system/${project.id}/performance-snapshot`,
                {},
                {
                    preserveState: true,
                    preserveScroll: false,
                },
            );
            return;
        }
        const kpiV = validateKpiReviewTab(draftKpis ?? []);
        if (!kpiV.valid) {
            setTabValidationMessage(kpiV.message);
            setPerfFieldErrors(kpiV.fieldErrors);
            setActiveTab('kpi-review');
            router.get(
                `/hr-manager/performance-system/${project.id}/kpi-review`,
                {},
                {
                    preserveState: true,
                    preserveScroll: false,
                },
            );
            return;
        }
        const modelV = validateModelAssignmentTab(
            jobDefinitions ?? [],
            draftAssignments ?? {},
        );
        if (!modelV.valid) {
            setTabValidationMessage(modelV.message);
            setPerfFieldErrors(modelV.fieldErrors);
            setActiveTab('model-assignment');
            router.get(
                `/hr-manager/performance-system/${project.id}/model-assignment`,
                {},
                {
                    preserveState: true,
                    preserveScroll: false,
                },
            );
            return;
        }
        const structV = validateEvaluationStructureTab(draftStructure);
        if (!structV.valid) {
            setTabValidationMessage(structV.message);
            setPerfFieldErrors(structV.fieldErrors);
            setActiveTab('evaluation-structure');
            router.get(
                `/hr-manager/performance-system/${project.id}/evaluation-structure`,
                {},
                {
                    preserveState: true,
                    preserveScroll: false,
                },
            );
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
            const responsesArray = Object.entries(
                draftSnapshotResponses ?? {},
            ).map(([questionId, d]) => ({
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

            await postStep(
                `/hr-manager/performance-system/${project.id}/submit`,
                {},
            );
            try {
                window.localStorage.removeItem(draftStorageKey);
            } catch {
                // ignore
            }
            toast({
                title: toastCopy.submitted,
                description:
                    'Performance system submitted for review. 성과 시스템이 제출되었습니다.',
                variant: 'success',
                duration: 2000,
            });
            setShowSuccessModal(true);
        } catch {
            setSubmitError(
                'Submit failed. Please review each tab and try again.',
            );
            toast({
                title: toastCopy.submitFailed,
                description:
                    'Please review required fields and try again. 필수 항목을 확인해 주세요.',
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
                <div className="flex min-h-full flex-col bg-[#f5f3ef] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
                    <div className="shrink-0 px-6 pt-6 pb-2">
                        <Link
                            href="/hr-manager/dashboard"
                            className="flex items-center gap-1 text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] dark:text-slate-200 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t('performance_system_index.back_dashboard')}
                        </Link>
                    </div>
                    {/* Same flex shell as Job Analysis Overview: hero + flex-1 step column + sticky footer */}
                    <section className="shrink-0 bg-[#0f172a] px-6 py-10 pb-16 text-white md:px-[10%]">
                        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-lg font-bold">
                                {t('performance_system_index.brand')}{' '}
                                <span className="ml-2 font-normal text-[#64748b] dark:text-slate-400">
                                    / {t('performance_system_index.title')}
                                </span>
                            </div>
                            <div className="rounded-[20px] border border-white/20 bg-white/10 px-3 py-1 text-xs text-[#94a3b8]">
                                {getStatusForHeader() === 'submitted'
                                    ? t(
                                          'performance_system_index.status.submitted',
                                      )
                                    : getStatusForHeader() === 'in_progress'
                                      ? t(
                                            'performance_system_index.status.in_progress',
                                        )
                                      : t(
                                            'performance_system_index.status.not_started',
                                        )}
                            </div>
                        </div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-[#b38e5d] uppercase">
                            {t('performance_system_index.stage')}
                        </div>
                        <h1 className="mt-2 mb-2 text-3xl font-bold md:text-4xl">
                            {t('performance_system_index.overview_title')}
                        </h1>
                        <p className="max-w-[600px] leading-relaxed text-[#94a3b8]">
                            {t('performance_system_index.description')}
                        </p>
                        <div className="mt-6 max-w-[720px] rounded-xl border border-white/10 bg-white/5 p-5">
                            <div className="mb-2 text-[11px] font-bold tracking-wider text-[#b38e5d] uppercase">
                                {t('performance_system_index.before_begin')}
                            </div>
                            <p className="m-0 text-sm leading-relaxed text-[#e2e8f0]">
                                {t(
                                    'performance_system_index.before_begin_desc',
                                )}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:gap-10">
                            <div className="border-r-0 pr-0 md:border-r md:border-white/10 md:pr-10">
                                <div className="text-[11px] text-[#94a3b8] uppercase">
                                    {t('performance_system_index.steps_done')}
                                </div>
                                <strong className="text-2xl text-[#b38e5d]">
                                    {completedTabsCount} / {TABS.length}
                                </strong>
                                <div className="text-[11px] text-[#64748b]">
                                    {t(
                                        'performance_system_index.steps_completed',
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex justify-between text-xs font-bold">
                                    <span>
                                        {t(
                                            'performance_system_index.overall_progress',
                                        )}
                                    </span>
                                    <span>
                                        {Math.round(
                                            (completedTabsCount / TABS.length) *
                                                100,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="h-1 w-full overflow-hidden rounded-sm bg-white/10">
                                    <div
                                        className="h-full rounded-sm bg-[#b38e5d] transition-all duration-300"
                                        style={{
                                            width: `${(completedTabsCount / TABS.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="relative z-[2] -mt-10 flex min-h-0 w-full flex-1 flex-col px-5 pb-8">
                        <Overview
                            projectId={project.id}
                            stepStatuses={stepStatuses}
                            completedSteps={
                                new Set(
                                    Object.keys(tabCompletions).filter(
                                        (k) => tabCompletions[k],
                                    ),
                                )
                            }
                            onStepClick={handleTabChange}
                            snapshotResponses={draftSnapshotResponses}
                            organizationalKpis={draftKpis}
                            evaluationModelAssignments={
                                evaluationModelAssignments
                            }
                            evaluationStructure={
                                draftStructure ?? project.evaluation_structure
                            }
                            jobCount={jobDefinitions?.length ?? 0}
                            snapshotQuestionsCount={
                                snapshotQuestions?.length ?? 10
                            }
                            completedTabsCount={completedTabsCount}
                            tabsLength={TABS.length}
                            hideProgressCard
                        />
                    </div>
                </div>
            ) : (
                <div className="mx-auto flex min-h-full max-w-7xl flex-col bg-background p-6 md:p-8 dark:bg-slate-950 dark:text-slate-100">
                    {activeTab === 'review-submit' &&
                        (tabValidationMessage || submitError) && (
                            <InlineErrorSummary
                                className="mb-4"
                                message={tabValidationMessage || submitError}
                                errors={perfFieldErrors}
                            />
                        )}
                    <div className="mb-0 overflow-hidden rounded-t-xl">
                        <div className="flex items-start gap-4 bg-[#151535] px-5 py-4 text-white md:px-6">
                            <button
                                type="button"
                                onClick={() => handleTabChange('overview')}
                                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10"
                                aria-label="Back to overview"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                                        {t('performance_system_index.title')}
                                    </h1>
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                                            getStatusForHeader() ===
                                                'in_progress'
                                                ? 'bg-amber-500/90 text-white'
                                                : getStatusForHeader() ===
                                                    'submitted'
                                                  ? 'bg-emerald-600 text-white'
                                                  : 'bg-white/10 text-slate-300',
                                        )}
                                    >
                                        {getStatusForHeader() === 'submitted'
                                            ? t(
                                                  'performance_system_index.status.submitted',
                                              )
                                            : getStatusForHeader() ===
                                                'in_progress'
                                              ? t(
                                                    'performance_system_index.status.in_progress',
                                                )
                                              : t(
                                                    'performance_system_index.status.not_started',
                                                )}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-300">
                                    {t('performance_system_index.description')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 overflow-hidden rounded-b-xl border border-t-0 border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin]">
                                <button
                                    onClick={() => handleTabChange('overview')}
                                    className={cn(
                                        'shrink-0 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                                        activeTab === 'overview'
                                            ? 'border-[#059669] bg-emerald-50 font-semibold text-[#121431] dark:bg-emerald-900/20 dark:text-slate-100'
                                            : 'border-[#e5e7eb] text-[#6b7280] hover:text-[#374151] dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                                    )}
                                >
                                    <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">
                                        {t(
                                            'performance_system_index.tabs.overview',
                                        )}
                                    </span>
                                </button>
                                {TABS.map((tab, index) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const isEnabled = isTabEnabled(
                                        tab.id,
                                        index,
                                    );
                                    const isCompleted = validateTabCompletion(
                                        tab.id,
                                    );
                                    const TabIcon = isCompleted
                                        ? CheckCircle2
                                        : Icon;
                                    if (!isEnabled) {
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() =>
                                                    handleTabChange(tab.id)
                                                }
                                                className="shrink-0 flex cursor-pointer items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm font-medium text-[#9ca3af] hover:bg-[#f3f4f6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 whitespace-nowrap"
                                            >
                                                <TabIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {tab.label}
                                                </span>
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() =>
                                                handleTabChange(tab.id)
                                            }
                                            className={cn(
                                                'shrink-0 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                                                isActive
                                                    ? 'border-[#059669] bg-emerald-50 font-semibold text-[#121431] dark:bg-emerald-900/20 dark:text-slate-100'
                                                    : isCompleted
                                                      ? 'border-[#10b981]/30 bg-emerald-50/70 text-[#059669] hover:text-[#047857] dark:border-emerald-800/50 dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:text-emerald-300'
                                                      : 'border-[#e5e7eb] text-[#6b7280] hover:text-[#374151] dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                                            )}
                                        >
                                            <TabIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="hidden sm:inline">
                                                {tab.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {activeTab === 'performance-snapshot' &&
                                snapshotTotalCount > 0 && (
                                    <span className="shrink-0 text-sm font-medium text-[#6b7280] dark:text-slate-300">
                                        {snapshotAnsweredCount}/
                                        {snapshotTotalCount}{' '}
                                        {t(
                                            'performance_system_index.questions_answered',
                                        )}
                                    </span>
                                )}
                        </div>
                        <div className="h-1 w-full bg-[#e5e7eb] dark:bg-slate-700">
                            <div
                                className="h-full bg-[#059669] transition-all duration-300"
                                style={{
                                    width: `${(completedTabsCount / TABS.length) * 100}%`,
                                }}
                            />
                        </div>
                        {isSavingDraft && (
                            <div className="border-t border-[#eef2f7] bg-[#f9fafb] px-4 py-2 text-xs text-[#6b7280] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                {t('performance_system_index.saving')}
                            </div>
                        )}
                    </div>

                    {/* Tab Content (non-overview): flex so KPI Review footer stays in content area */}
                    {activeTab !== 'overview' && (
                        <div
                            className={cn(
                                activeTab === 'kpi-review' &&
                                    'flex min-h-0 flex-1 flex-col',
                            )}
                        >
                            {activeTab === 'performance-snapshot' && (
                                <PerformanceSnapshotTab
                                    project={project}
                                    questions={snapshotQuestions}
                                    savedResponses={draftSnapshotResponses}
                                    onResponsesChange={
                                        setDraftSnapshotResponses
                                    }
                                    onContinue={handleSnapshotContinue}
                                    onBack={() => handleTabChange('overview')}
                                    onAnsweredChange={(answered, total) =>
                                        setSnapshotAnsweredCount(answered)
                                    }
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
                                    onBack={() =>
                                        handleTabChange('performance-snapshot')
                                    }
                                    fieldErrors={perfFieldErrors}
                                    kpiVerificationNotice={
                                        kpiVerificationNotice
                                    }
                                />
                            )}

                            {activeTab === 'model-assignment' && (
                                <EvaluationModelAssignmentTab
                                    project={project}
                                    jobDefinitions={jobDefinitions}
                                    organizationalKpis={draftKpis}
                                    evaluationModelAssignments={
                                        evaluationModelAssignments
                                    }
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
                                    evaluationStructure={
                                        (draftStructure ??
                                            project.evaluation_structure) ||
                                        null
                                    }
                                    onContinue={
                                        handleEvaluationStructureContinue
                                    }
                                    onBack={() =>
                                        handleTabChange('model-assignment')
                                    }
                                    fieldErrors={perfFieldErrors}
                                />
                            )}

                            {activeTab === 'review-submit' && (
                                <ReviewSubmitTab
                                    projectId={project.id}
                                    snapshotQuestions={snapshotQuestions}
                                    snapshotResponses={draftSnapshotResponses}
                                    organizationalKpis={draftKpis}
                                    evaluationModelAssignments={
                                        reviewSubmitAssignments
                                    }
                                    evaluationStructure={
                                        draftStructure ??
                                        project.evaluation_structure
                                    }
                                    orgChartMappings={orgChartMappings}
                                    onBack={() =>
                                        handleTabChange('evaluation-structure')
                                    }
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
                    // Prevent close from outside click / ESC.
                    // Close only via explicit done button.
                    if (open) setShowSuccessModal(true);
                }}
            >
                <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="sm:max-w-md"
                >
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">
                            <span className="block">
                                {t('performance_system_index.success_title')}
                            </span>
                            <span className="block text-sm font-medium opacity-90">
                                성과 시스템 제출이 완료되었습니다!
                            </span>
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-center">
                            <span className="block">
                                {t('performance_system_index.success_desc')}
                            </span>
                            <span className="block opacity-90">
                                성과 설계가 컨설턴트 검토를 위해 제출되었습니다.
                                협업 검토 과정을 통해 최종 시스템이 확정됩니다.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={handleCloseSuccessModal}
                            className="h-11 w-full rounded-lg bg-[#152540] font-semibold text-white hover:bg-[#1e3a62] sm:w-auto"
                        >
                            {t('performance_system_index.done')}
                            <span className="block text-xs opacity-80">
                                대시보드로 이동
                            </span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
