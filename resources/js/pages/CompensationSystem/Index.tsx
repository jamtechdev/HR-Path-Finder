import { Head, useForm, router, Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, TrendingUp, FileText, Settings, Award, Users, AlertCircle, Shield } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';
import { pruneFieldErrorsToValidator } from '@/lib/fieldErrorsUtils';
import { toastCopy } from '@/lib/toastCopy';
import { cn } from '@/lib/utils';

// Import types

// Import tab components
import CompensationOverview from './CompensationOverview';
import { validateCompensationStep } from './compensationTabValidation';
import BaseSalaryFrameworkTab from './tabs/BaseSalaryFrameworkTab';
import BenefitsTab from './tabs/BenefitsTab';
import BonusPoolTab from './tabs/BonusPoolTab';
import PayBandSalaryTableTab from './tabs/PayBandSalaryTableTab';
import ReviewTab from './tabs/ReviewTab';
import SnapshotTab from './tabs/SnapshotTab';
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
    { id: 'snapshot', label: 'Strategic Compensation Snapshot', icon: FileText },
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
    const { t } = useTranslation();
    const draftStorageKey = useMemo(() => `compensation-system-draft:${project.id}`, [project.id]);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<Record<string, boolean>>({});
    const [localTabDone, setLocalTabDone] = useState<Record<string, boolean>>({});
    const [compError, setCompError] = useState<string | null>(null);
    const [compFieldErrors, setCompFieldErrors] = useState<FieldErrors>({});
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
                // Backend may serialize decimal values as strings (e.g. "3.00").
                const raw = resp.numeric_response as unknown;
                const n = typeof raw === 'string' ? parseFloat(raw) : (raw as number);
                responses[resp.question_id] = Number.isFinite(n) ? n : null;
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

    type CompensationDraft = {
        snapshotResponses: Record<number, string[] | string | number | object | null>;
        baseSalaryFramework: BaseSalaryFramework;
        payBands: PayBand[];
        salaryTables: SalaryTable[];
        operationCriteria: PayBandOperationCriteria;
        bonusPool: BonusPoolConfiguration;
        benefits: BenefitsConfiguration;
        localTabDone: Record<string, boolean>;
    };

    const validationCtx = () => ({
        snapshotQuestions: snapshotQuestions || [],
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        bonusPool,
        benefits,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (!raw) return;

            const draft = JSON.parse(raw) as Partial<CompensationDraft>;
            if (draft.snapshotResponses) setSnapshotResponses(draft.snapshotResponses);
            if (draft.baseSalaryFramework) setBaseSalaryFramework(draft.baseSalaryFramework);
            if (draft.payBands) setPayBands(draft.payBands);
            if (draft.salaryTables) setSalaryTables(draft.salaryTables);
            if (draft.operationCriteria) setOperationCriteria(draft.operationCriteria);
            if (draft.bonusPool) setBonusPool(draft.bonusPool);
            if (draft.benefits) setBenefits(draft.benefits);
            if (draft.localTabDone) setLocalTabDone(draft.localTabDone);
        } catch {
            // Ignore invalid local draft payloads.
        }
    }, [draftStorageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const draft: CompensationDraft = {
            snapshotResponses,
            baseSalaryFramework,
            payBands,
            salaryTables,
            operationCriteria,
            bonusPool,
            benefits,
            localTabDone,
        };
        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));

    }, [
        draftStorageKey,
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        operationCriteria,
        bonusPool,
        benefits,
        localTabDone,
        activeTab,
    ]);

    const handleSaveAndContinue = () => {
        setCompError(null);
        setCompFieldErrors({});

        if (activeTab === 'overview') {
            handleTabChange('snapshot');
            return;
        }

        if (activeTab !== 'review') {
            const v = validateCompensationStep(activeTab, validationCtx());
            if (!v.ok) {
                setCompError(v.message);
                setCompFieldErrors(v.fieldErrors);
                return;
            }
        }

        const idx = TABS.findIndex(t => t.id === activeTab);
        const nextTabId = idx < TABS.length - 1 ? TABS[idx + 1].id : activeTab;
        if (activeTab !== 'overview' && activeTab !== 'review') {
            setLocalTabDone((d) => ({ ...d, [activeTab]: true }));
        }
        toast({
            title: toastCopy.stepCompleted,
            description: 'Your updates were saved. Moving to the next step. 입력 내용이 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleTabChange(nextTabId);
    };

    const saveCurrentTabOnly = () => {
        setCompError(null);
        setCompFieldErrors({});
        const pid = project.id;

        const fail = (msg: string) => {
            setCompError(msg);
            toast({
                title: toastCopy.saveFailed,
                description: `${msg} 다시 시도해 주세요.`,
                variant: 'destructive',
            });
        };

        if (activeTab === 'base-salary-framework') {
            router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'base-salary-framework', ...baseSalaryFramework } as never, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast({
                        title: toastCopy.changesSaved,
                        description: 'Base salary framework saved. 저장되었습니다.',
                        variant: 'success',
                        duration: 1500,
                    });
                },
                onError: () => fail('Could not save base salary framework.'),
            });
            return;
        }

        if (activeTab === 'pay-band-salary-table') {
            const std = (baseSalaryFramework?.salary_determination_standard || '').trim();
            if (std === 'salary_table') {
                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'salary-table', salary_tables: salaryTables } as never, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'operation-criteria', ...operationCriteria } as never, {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => toast({
                                title: toastCopy.changesSaved,
                                description: 'Salary table saved. 저장되었습니다.',
                                variant: 'success',
                                duration: 1500,
                            }),
                            onError: () => fail('Could not save operation criteria.'),
                        });
                    },
                    onError: () => fail('Could not save salary tables.'),
                });
                return;
            }

            router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'pay-band', pay_bands: payBands } as never, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'operation-criteria', ...operationCriteria } as never, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => toast({
                                title: toastCopy.changesSaved,
                            description: 'Pay band saved. 저장되었습니다.',
                            variant: 'success',
                            duration: 1500,
                        }),
                        onError: () => fail('Could not save operation criteria.'),
                    });
                },
                onError: () => fail('Could not save pay bands.'),
            });
            return;
        }
    };

    const PRE_REVIEW_TABS = ['snapshot', 'base-salary-framework', 'pay-band-salary-table', 'bonus-pool', 'benefits'] as const;

    // Tab unlock: current form must pass validation (no bypass via stale server props alone).
    const validateTabCompletion = (tabId: string): boolean => {
        const ctx = validationCtx();
        switch (tabId) {
            case 'overview':
                return false;
            case 'review':
                // Prefer the local step-flow completion (Continue clicks),
                // but fall back to strict validation if local progress isn't available
                // (e.g. refreshed page).
                if (PRE_REVIEW_TABS.every((tid) => !!localTabDone[tid])) return true;
                return PRE_REVIEW_TABS.every((tid) => validateCompensationStep(tid, ctx).ok);
            default:
                // For other tabs, strict validation decides whether the tab is unlocked.
                return validateCompensationStep(tabId, ctx).ok;
        }
    };

    // Display completion (step checkmarks / overview progress).
    // This can use local step-flow info, because Continue already validated before
    // marking a tab as done.
    const isTabCompletedForUI = (tabId: string): boolean => {
        const ctx = validationCtx();
        if (tabId === 'overview') return false;

        if (tabId === 'review') {
            return PRE_REVIEW_TABS.every(
                (tid) => !!localTabDone[tid] || validateCompensationStep(tid, ctx).ok
            );
        }

        return !!localTabDone[tabId] || validateCompensationStep(tabId, ctx).ok;
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
    }, [
        snapshotQuestions,
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        operationCriteria,
        bonusPool,
        benefits,
        project.compensation_snapshot_responses,
        project.base_salary_framework,
        project.pay_bands,
        project.salary_tables,
        project.bonus_pool_configuration,
        project.benefits_configuration,
    ]);

    const handleTabChange = (newTab: string) => {
        const tabIndex = TABS.findIndex(t => t.id === newTab);
        if (tabIndex === -1) return;

        if (!isTabEnabled(newTab, tabIndex)) {
            let blocker = 'the previous step';
            for (let i = 0; i < tabIndex; i++) {
                const prev = TABS[i];
                if (prev.id === 'overview') continue;
                if (!validateTabCompletion(prev.id)) {
                    blocker = prev.label;
                    break;
                }
            }
            setCompError(`Complete "${blocker}" before opening this tab.`);
            setCompFieldErrors({});
            return;
        }

        setCompError(null);
        setCompFieldErrors({});
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

    // Live: prune keyed field errors as the user fixes fields on the active tab.
    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'review') return;
        setCompFieldErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            const v = validateCompensationStep(activeTab, validationCtx());
            return pruneFieldErrorsToValidator(prev, v.fieldErrors);
        });
    }, [
        activeTab,
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        bonusPool,
        benefits,
        snapshotQuestions,
    ]);

    useEffect(() => {
        if (!compError) return;
        if (compError.startsWith('Complete "')) return;
        if (Object.keys(compFieldErrors).length === 0) {
            setCompError(null);
        }
    }, [compError, compFieldErrors]);

    const handleSubmit = () => {
        setCompError(null);
        setCompFieldErrors({});

        const preTabs = ['snapshot', 'base-salary-framework', 'pay-band-salary-table', 'bonus-pool', 'benefits'] as const;
        const ctx = validationCtx();
        for (const tid of preTabs) {
            const v = validateCompensationStep(tid, ctx);
            if (!v.ok) {
                setCompError(v.message);
                setCompFieldErrors(v.fieldErrors);
                setActiveTab(tid);
                router.get(`/hr-manager/compensation-system/${project.id}/${tid}`, {}, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['activeTab'],
                    replace: true,
                });
                return;
            }
        }

        setSaving(true);
        const pid = project.id;
        const opts = { preserveScroll: true, preserveState: true, only: ['project'] as string[] };
        const fail = (msg: string, inertiaErrors?: Record<string, string | string[]>) => {
            setSaving(false);
            setCompError(msg);
            toast({
                title: toastCopy.saveFailed,
                description: `${msg} 다시 시도해 주세요.`,
                variant: 'destructive',
            });
            if (inertiaErrors && typeof inertiaErrors === 'object') {
                const fe: FieldErrors = {};
                for (const [k, val] of Object.entries(inertiaErrors)) {
                    const m = Array.isArray(val) ? val[0] : val;
                    if (typeof m === 'string' && m) fe[k] = m;
                }
                setCompFieldErrors(fe);
            } else {
                setCompFieldErrors({});
            }
        };

        const responseData = (snapshotQuestions || []).map((q: { id: number; answer_type?: string }) => {
            const response = snapshotResponses[q.id];
            if (q.answer_type === 'numeric') {
                const lower = (q as any).question_text?.toLowerCase?.() ?? '';
                const isJobFunctions =
                    (q as any).metadata?.is_job_functions === true ||
                    lower.includes('average salary by job function');
                const isMultiYear =
                    (q as any).metadata?.is_multi_year === true ||
                    lower.includes('past three years') ||
                    lower.includes('average annual salary increase rate') ||
                    lower.includes('labor cost ratio') ||
                    lower.includes('average bonus payout ratio');
                const isYearsOfService =
                    (q as any).metadata?.is_years_of_service === true ||
                    lower.includes('average salary by years of service');

                const numericFromAny = (value: any): number | null => {
                    if (value === null || value === undefined) return null;
                    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
                    if (typeof value === 'string') {
                        const n = parseFloat(value);
                        return Number.isFinite(n) ? n : null;
                    }
                    if (typeof value === 'object') {
                        const v = typeof (value as any).valueOf === 'function' ? (value as any).valueOf() : value;
                        if (typeof v === 'number') return Number.isFinite(v) ? v : null;
                        if (typeof v === 'string') {
                            const n = parseFloat(v);
                            return Number.isFinite(n) ? n : null;
                        }
                        const n = parseFloat(String(value));
                        return Number.isFinite(n) ? n : null;
                    }
                    return null;
                };

                // Backend stores numeric scalars into `numeric_response` and
                // numeric objects (e.g. multi-year values) into `response` (json).
                // Some numeric libraries may represent scalars as objects (e.g. Number/Decimal).
                // So detect scalars by parsing, not by `typeof response === 'object'`.
                const scalar = numericFromAny(response);
                const treatAsScalar = scalar !== null && !isJobFunctions && !isMultiYear && !isYearsOfService;

                return {
                    question_id: q.id,
                    response: treatAsScalar ? null : response,
                    text_response: null,
                    numeric_response: treatAsScalar ? scalar : null,
                };
            }
            if (q.answer_type === 'text') {
                return { question_id: q.id, response: null, text_response: (response as string) ?? null, numeric_response: null };
            }
            return {
                question_id: q.id,
                response: Array.isArray(response) ? response : response ? [response] : null,
                text_response: null,
                numeric_response: null,
            };
        });

        const updatedBenefits = { ...benefits };
        if (updatedBenefits.previous_year_total_salary && updatedBenefits.previous_year_total_benefits_expense && updatedBenefits.previous_year_total_salary > 0) {
            updatedBenefits.benefits_expense_ratio =
                (updatedBenefits.previous_year_total_benefits_expense / updatedBenefits.previous_year_total_salary) * 100;
        }

        const saveOperationCriteriaAndAfter = () => {
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
                                            if (typeof window !== 'undefined') {
                                                window.localStorage.removeItem(draftStorageKey);
                                            }
                                            setSaving(false);
                                            setTabCompletions((c) => ({ ...c, review: true }));
                                            toast({
                                                title: toastCopy.submitted,
                                                description: 'Compensation & Benefits system has been submitted. 보상/복리후생 시스템이 제출되었습니다.',
                                                variant: 'success',
                                                duration: 2000,
                                            });
                                            setShowSuccessModal(true);
                                        },
                                        onError: (e) => fail('Submit failed. Check all sections and try again.', e),
                                    });
                                },
                                onError: (e) => fail('Could not save benefits. Please check required fields.', e),
                            });
                        },
                        onError: (e) => fail('Could not save bonus pool.', e),
                    });
                },
                onError: (e) => fail('Could not save operation criteria.', e),
            });
        };

        const saveStructureAndAfter = () => {
            const std = (baseSalaryFramework?.salary_determination_standard || '').trim();

            // Backend validation requires:
            // - `pay-band` => `pay_bands` must be present (non-empty array)
            // - `salary-table` => `salary_tables` must be present (non-empty array)
            // So we must save ONLY the structure type selected by the user.
            if (std === 'salary_table') {
                router.post(
                    `/hr-manager/compensation-system/${pid}`,
                    { tab: 'salary-table', salary_tables: salaryTables } as never,
                    {
                        ...opts,
                        onSuccess: () => saveOperationCriteriaAndAfter(),
                        onError: (e) => fail('Could not save salary tables.', e),
                    }
                );
                return;
            }

            router.post(
                `/hr-manager/compensation-system/${pid}`,
                { tab: 'pay-band', pay_bands: payBands } as never,
                {
                    ...opts,
                    onSuccess: () => saveOperationCriteriaAndAfter(),
                    onError: (e) => fail('Could not save pay bands.', e),
                }
            );
        };

        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'snapshot', responses: responseData } as never, {
            ...opts,
            onSuccess: () => {
                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'base-salary-framework', ...baseSalaryFramework } as never, {
                    ...opts,
                    onSuccess: () => {
                        saveStructureAndAfter();
                    },
                    onError: (e) => fail('Could not save base salary framework.', e),
                });
            },
            onError: (e) => fail('Could not save compensation snapshot. Answer all questions.', e),
        });
    };

    const completedTabsCount = TABS.filter(tab => {
        if (tab.id === 'overview') return false;
        return isTabCompletedForUI(tab.id);
    }).length;

    const completedSteps = useMemo(() => {
        const set = new Set<string>();
        TABS.forEach(tab => {
            if (tab.id !== 'overview' && isTabCompletedForUI(tab.id)) set.add(tab.id);
        });
        return set;
    }, [
        snapshotQuestions,
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        operationCriteria,
        bonusPool,
        benefits,
        project.compensation_snapshot_responses,
        project.base_salary_framework,
        project.pay_bands,
        project.salary_tables,
        project.bonus_pool_configuration,
        project.benefits_configuration,
        localTabDone,
    ]);

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
            <Head
                title={t('page_heads.compensation_step4', {
                    company:
                        project.company?.name ||
                        t('page_head_fallbacks.compensation_system'),
                })}
            />
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
                                        const isDone = tab.id === 'overview' ? false : isTabCompletedForUI(tab.id);
                                        const stepNum = tab.id === 'overview' ? null : idx; // Overview = O, Snapshot = 1, ... Review = 6
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => handleTabChange(tab.id)}
                                                className={cn(
                                                    'flex items-center gap-2 px-5 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                                                    isActive && 'text-white border-[#2ec4a0] bg-white/5',
                                                    isDone && !isActive && 'text-[#2ec4a0] border-transparent',
                                                    !isActive && !isDone && 'text-white/40 border-transparent hover:text-white/70',
                                                    !isTabEnabled(tab.id, idx) && 'opacity-60'
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

                        <div className="max-w-7xl mx-auto px-6 py-6 pb-40">
                        {(compError || Object.keys(compFieldErrors).length > 0) && (
                            <InlineErrorSummary
                                className="mb-4"
                                message={compError}
                                errors={compFieldErrors}
                            />
                        )}
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
                            fieldErrors={compFieldErrors}
                        />
                            </TabsContent>

                            <TabsContent value="base-salary-framework" className="mt-0">
                        <BaseSalaryFrameworkTab
                            framework={baseSalaryFramework}
                            onUpdate={setBaseSalaryFramework}
                            fieldErrors={compFieldErrors}
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
                            onRequestStructureSwitch={() => {
                                handleTabChange('base-salary-framework');
                                toast({
                                    title: toastCopy.info,
                                    description: 'To switch structure, change Base Salary Framework first.',
                                    variant: 'warning',
                                    duration: 2200,
                                });
                            }}
                            fieldErrors={compFieldErrors}
                        />
                                                </TabsContent>

                    <TabsContent value="bonus-pool" className="mt-0">
                        <BonusPoolTab
                            configuration={bonusPool}
                            onUpdate={setBonusPool}
                            fieldErrors={compFieldErrors}
                        />
                                                </TabsContent>

                    <TabsContent value="benefits" className="mt-0">
                        <BenefitsTab
                            configuration={benefits}
                            onUpdate={setBenefits}
                            snapshotBenefitsPrograms={snapshotBenefitsPrograms}
                            fieldErrors={compFieldErrors}
                        />
                    </TabsContent>

                    <TabsContent value="review" className="mt-0">
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
                                type="button"
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
                            {(activeTab === 'base-salary-framework' || activeTab === 'pay-band-salary-table') && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={saveCurrentTabOnly}
                                    className="border-[#d4d8de] text-[#4b5563] hover:bg-[#f7f8fa]"
                                >
                                    Save
                                </Button>
                            )}
                            {activeTab !== 'review' ? (
                                <Button type="button" onClick={handleSaveAndContinue} className="bg-[#152540] hover:bg-[#1e3a62] text-white">
                                    Continue
                                    <svg className="w-3.5 h-3.5 ml-1.5" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleSubmit} disabled={processing || saving} className="bg-[#152540] hover:bg-[#1e3a62] text-white">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {processing || saving ? 'Submitting...' : 'Submit & Lock Step 4'}
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
                                    <span className="block">Compensation system submitted</span>
                                    <span className="block text-sm font-medium opacity-90 mt-1">보상 시스템 제출이 완료되었습니다</span>
                                </h2>
                                <p className="text-sm text-white/70 mt-1.5">
                                    <span className="block">Step 4 is complete. Your consultant will review and the CEO can approve.</span>
                                    <span className="block opacity-90 mt-1">4단계가 완료되었습니다. 컨설턴트가 검토하고 CEO가 승인할 수 있습니다.</span>
                                </p>
                            </div>
                            <div className="px-8 py-6 space-y-5">
                                <p className="text-sm text-[#4A5B78] leading-relaxed">
                                    <span className="block">
                                        Your company now has a structured HR system: performance management, compensation, and benefits. You can enhance it later through our optional subscription—HR policy management, diagnostics, and advisory support.
                                    </span>
                                    <span className="block opacity-90 mt-2">
                                        이제 회사에 체계적인 HR 시스템이 구축되었습니다: 성과관리, 보상, 복리후생. 필요에 따라 추후 구독을 통해 HR 정책 관리, 진단, 컨설팅 지원을 강화할 수 있습니다.
                                    </span>
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            router.visit('/hr-manager/dashboard');
                                        }}
                                        className="w-full h-11 font-semibold rounded-lg bg-[#152540] hover:bg-[#1e3a62] text-white"
                                    >
                                        <span className="flex flex-col leading-tight">
                                            <span>Done</span>
                                            <span className="text-xs opacity-80">대시보드로 이동</span>
                                        </span>
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
