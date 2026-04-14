import { Head, useForm, router, Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, TrendingUp, FileText, Settings, Award, Users, AlertCircle, Shield } from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    { id: 'overview', labelKey: 'compensation_system.tabs.overview', icon: Shield },
    { id: 'snapshot', labelKey: 'compensation_system.tabs.snapshot', icon: FileText },
    { id: 'base-salary-framework', labelKey: 'compensation_system.tabs.base_salary_framework', icon: Settings },
    { id: 'pay-band-salary-table', labelKey: 'compensation_system.tabs.pay_band_salary_table', icon: TrendingUp },
    { id: 'bonus-pool', labelKey: 'compensation_system.tabs.bonus_pool', icon: Award },
    { id: 'benefits', labelKey: 'compensation_system.tabs.benefits', icon: Users },
    { id: 'review', labelKey: 'compensation_system.tabs.review', icon: CheckCircle2 },
] as const;

const PRE_REVIEW_TABS = ['snapshot', 'base-salary-framework', 'pay-band-salary-table', 'bonus-pool', 'benefits'] as const;

type CompensationDraftStorage = {
    snapshotResponses?: Record<number, string[] | string | number | object | null>;
    baseSalaryFramework?: BaseSalaryFramework;
    payBands?: PayBand[];
    salaryTables?: SalaryTable[];
    operationCriteria?: PayBandOperationCriteria;
    bonusPool?: BonusPoolConfiguration;
    benefits?: BenefitsConfiguration;
    localTabDone?: Record<string, boolean>;
};

function readCompensationDraft(storageKey: string): CompensationDraftStorage | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;
        return JSON.parse(raw) as CompensationDraftStorage;
    } catch {
        return null;
    }
}

function snapshotFromProject(project: HrProject): Record<number, string[] | string | number | object | null> {
    const responses: Record<number, string[] | string | number | object | null> = {};
    project.compensation_snapshot_responses?.forEach((resp) => {
        if (resp.numeric_response !== null && resp.numeric_response !== undefined) {
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
}

function stableHash(value: unknown): string {
    return JSON.stringify(value ?? null);
}

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
    const draftStorageKeyStatic = `compensation-system-draft:${project.id}`;
    const compensationStatus = stepStatuses?.compensation || 'not_started';
    const isCompensationSubmitted = ['submitted', 'approved', 'locked'].includes(compensationStatus);
    const initialDraft = isCompensationSubmitted ? null : readCompensationDraft(draftStorageKeyStatic);

    const [activeTab, setActiveTab] = useState(initialTab);
    const [tabCompletions, setTabCompletions] = useState<Record<string, boolean>>({});
    const [localTabDone, setLocalTabDone] = useState<Record<string, boolean>>(() => {
        if (initialDraft?.localTabDone && Object.keys(initialDraft.localTabDone).length > 0) {
            return { ...initialDraft.localTabDone };
        }
        return {};
    });
    const [compError, setCompError] = useState<string | null>(null);
    const [compFieldErrors, setCompFieldErrors] = useState<FieldErrors>({});
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // State for each step — hydrate from localStorage synchronously so the first paint (and save effect) never wipe a draft.
    const [baseSalaryFramework, setBaseSalaryFramework] = useState<BaseSalaryFramework>(() => {
        const fromProject = project.base_salary_framework || {};
        if (initialDraft?.baseSalaryFramework && Object.keys(initialDraft.baseSalaryFramework).length > 0) {
            return initialDraft.baseSalaryFramework;
        }
        return fromProject;
    });
    const [payBands, setPayBands] = useState<PayBand[]>(() => {
        if (initialDraft?.payBands !== undefined && Array.isArray(initialDraft.payBands)) {
            return initialDraft.payBands;
        }
        return project.pay_bands || [];
    });
    const [salaryTables, setSalaryTables] = useState<SalaryTable[]>(() => {
        if (initialDraft?.salaryTables !== undefined && Array.isArray(initialDraft.salaryTables)) {
            return initialDraft.salaryTables;
        }
        return project.salary_tables || [];
    });
    const [operationCriteria, setOperationCriteria] = useState<PayBandOperationCriteria>(() => {
        if (initialDraft?.operationCriteria && Object.keys(initialDraft.operationCriteria).length > 0) {
            return initialDraft.operationCriteria;
        }
        return project.pay_band_operation_criteria || {};
    });
    const [bonusPool, setBonusPool] = useState<BonusPoolConfiguration>(() => {
        if (initialDraft?.bonusPool && Object.keys(initialDraft.bonusPool).length > 0) {
            return initialDraft.bonusPool;
        }
        return project.bonus_pool_configuration || {};
    });
    const [benefits, setBenefits] = useState<BenefitsConfiguration>(() => {
        if (initialDraft?.benefits && Object.keys(initialDraft.benefits).length > 0) {
            return initialDraft.benefits;
        }
        return project.benefits_configuration || {};
    });

    const [snapshotResponses, setSnapshotResponses] = useState<Record<number, string[] | string | number | object | null>>(() => {
        const fromProject = snapshotFromProject(project);
        if (initialDraft?.snapshotResponses && typeof initialDraft.snapshotResponses === 'object') {
            const keys = Object.keys(initialDraft.snapshotResponses);
            if (keys.length > 0) {
                return { ...fromProject, ...initialDraft.snapshotResponses };
            }
        }
        return fromProject;
    });

    const { post, processing } = useForm({});
    const [saving, setSaving] = useState(false);

    const validationCtx = () => ({
        snapshotQuestions: snapshotQuestions || [],
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        operationCriteria,
        bonusPool,
        benefits,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (isCompensationSubmitted) {
            window.localStorage.removeItem(draftStorageKey);
            return;
        }

        const draft: CompensationDraftStorage = {
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
        isCompensationSubmitted,
    ]);

    const lastSavedHashesRef = useRef<Record<string, string>>({
        'base-salary-framework': stableHash(baseSalaryFramework),
        'pay-band': stableHash(payBands),
        'salary-table': stableHash(salaryTables),
        'operation-criteria': stableHash(operationCriteria),
    });

    /** Persist tabs that previously had a separate Save (server draft). Called from Continue after validation. */
    const persistCurrentTabToServer = useCallback(
        (quiet: boolean): Promise<'saved' | 'skipped' | 'failed'> => {
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
                const currentHash = stableHash(baseSalaryFramework);
                if (lastSavedHashesRef.current['base-salary-framework'] === currentHash) {
                    return Promise.resolve('skipped');
                }
                return new Promise(resolve => {
                    router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'base-salary-framework', ...baseSalaryFramework } as never, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            if (!quiet) {
                                toast({
                                    title: toastCopy.changesSaved,
                                    description: 'Base salary framework saved. 저장되었습니다.',
                                    variant: 'success',
                                    duration: 1500,
                                });
                            }
                            lastSavedHashesRef.current['base-salary-framework'] = currentHash;
                            resolve('saved');
                        },
                        onError: () => {
                            fail('Could not save base salary framework.');
                            resolve('failed');
                        },
                    });
                });
            }

            if (activeTab === 'pay-band-salary-table') {
                const std = (baseSalaryFramework?.salary_determination_standard || '').trim();
                if (std === 'salary_table') {
                    const tableHash = stableHash(salaryTables);
                    const criteriaHash = stableHash(operationCriteria);
                    const tableDirty = lastSavedHashesRef.current['salary-table'] !== tableHash;
                    const criteriaDirty = lastSavedHashesRef.current['operation-criteria'] !== criteriaHash;
                    if (!tableDirty && !criteriaDirty) {
                        return Promise.resolve('skipped');
                    }
                    return new Promise(resolve => {
                        const saveCriteria = () => {
                            if (!criteriaDirty) {
                                if (!quiet) {
                                    toast({
                                        title: toastCopy.changesSaved,
                                        description: 'Salary table saved. 저장되었습니다.',
                                        variant: 'success',
                                        duration: 1500,
                                    });
                                }
                                resolve('saved');
                                return;
                            }
                            router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'operation-criteria', ...operationCriteria } as never, {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => {
                                    lastSavedHashesRef.current['operation-criteria'] = criteriaHash;
                                    if (!quiet) {
                                        toast({
                                            title: toastCopy.changesSaved,
                                            description: 'Salary table saved. 저장되었습니다.',
                                            variant: 'success',
                                            duration: 1500,
                                        });
                                    }
                                    resolve('saved');
                                },
                                onError: () => {
                                    fail('Could not save operation criteria.');
                                    resolve('failed');
                                },
                            });
                        };

                        if (!tableDirty) {
                            saveCriteria();
                            return;
                        }

                        router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'salary-table', salary_tables: salaryTables } as never, {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                lastSavedHashesRef.current['salary-table'] = tableHash;
                                saveCriteria();
                            },
                            onError: () => {
                                fail('Could not save salary tables.');
                                resolve('failed');
                            },
                        });
                    });
                }

                const bandHash = stableHash(payBands);
                const criteriaHash = stableHash(operationCriteria);
                const bandDirty = lastSavedHashesRef.current['pay-band'] !== bandHash;
                const criteriaDirty = lastSavedHashesRef.current['operation-criteria'] !== criteriaHash;
                if (!bandDirty && !criteriaDirty) {
                    return Promise.resolve('skipped');
                }
                return new Promise(resolve => {
                    const saveCriteria = () => {
                        if (!criteriaDirty) {
                            if (!quiet) {
                                toast({
                                    title: toastCopy.changesSaved,
                                    description: 'Pay band saved. 저장되었습니다.',
                                    variant: 'success',
                                    duration: 1500,
                                });
                            }
                            resolve('saved');
                            return;
                        }
                                router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'operation-criteria', ...operationCriteria } as never, {
                                    preserveScroll: true,
                                    preserveState: true,
                                    onSuccess: () => {
                                        lastSavedHashesRef.current['operation-criteria'] = criteriaHash;
                                        if (!quiet) {
                                            toast({
                                                title: toastCopy.changesSaved,
                                                description: 'Salary table saved. 저장되었습니다.',
                                                variant: 'success',
                                                duration: 1500,
                                            });
                                        }
                                        resolve('saved');
                                    },
                                    onError: () => {
                                        fail('Could not save operation criteria.');
                                        resolve('failed');
                                    },
                                });
                    };

                    if (!bandDirty) {
                        saveCriteria();
                        return;
                    }

                    router.post(`/hr-manager/compensation-system/${pid}`, { tab: 'pay-band', pay_bands: payBands } as never, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            lastSavedHashesRef.current['pay-band'] = bandHash;
                            saveCriteria();
                        },
                        onError: () => {
                            fail('Could not save pay bands.');
                            resolve('failed');
                        },
                    });
                });
            }

            return Promise.resolve('skipped');
        },
        [activeTab, project.id, baseSalaryFramework, payBands, salaryTables, operationCriteria],
    );

    const handleSaveAndContinue = async () => {
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

        const persistStatus = await persistCurrentTabToServer(true);
        if (persistStatus === 'failed') return;

        const idx = TABS.findIndex(t => t.id === activeTab);
        const nextTabId = idx < TABS.length - 1 ? TABS[idx + 1].id : activeTab;
        if (activeTab !== 'overview' && activeTab !== 'review') {
            setLocalTabDone(d => ({ ...d, [activeTab]: true }));
        }
        toast({
            title: toastCopy.stepCompleted,
            description:
                persistStatus === 'saved'
                    ? 'Your updates were saved. Moving to the next step. 입력 내용이 저장되었습니다.'
                    : 'No changes detected. Moving to the next step. 변경사항이 없어 다음 단계로 이동합니다.',
            variant: 'success',
            duration: 1800,
        });
        handleTabChange(nextTabId);
    };

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

    /** Sequential unlock: each prior step must pass strict validation (not `localTabDone` alone), so stale drafts cannot open Base Salary / later tabs while Snapshot is incomplete. */
    const isTabEnabled = (tabId: string, tabIndex: number): boolean => {
        if (tabId === 'overview') return true;
        const ctx = validationCtx();
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = TABS[i];
            if (prevTab.id === 'overview') continue;
            if (!validateCompensationStep(prevTab.id, ctx).ok) {
                return false;
            }
        }
        return true;
    };

    const footerStepValid = useMemo(() => {
        const ctx = validationCtx();
        if (activeTab === 'overview') return true;
        if (activeTab === 'review') {
            return PRE_REVIEW_TABS.every(tid => validateCompensationStep(tid, ctx).ok);
        }
        return validateCompensationStep(activeTab, ctx).ok;
    }, [
        activeTab,
        snapshotQuestions,
        snapshotResponses,
        baseSalaryFramework,
        payBands,
        salaryTables,
        operationCriteria,
        bonusPool,
        benefits,
    ]);

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
                    blocker = t(prev.labelKey, { defaultValue: prev.labelKey });
                    break;
                }
            }
            setCompError(t('compensation_system.validation.complete_previous', { step: blocker }));
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
        operationCriteria,
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

        const ctx = validationCtx();
        for (const tid of PRE_REVIEW_TABS) {
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
            const isNumericType = ['numeric', 'numeric_multi_year', 'numeric_job_rows', 'numeric_service_ranges'].includes(String(q.answer_type || ''));
            if (isNumericType) {
                const lower = (q as any).question_text?.toLowerCase?.() ?? '';
                const isJobFunctions =
                    (q as any).answer_type === 'numeric_job_rows' ||
                    (q as any).metadata?.is_job_functions === true ||
                    lower.includes('average salary by job function');
                const isMultiYear =
                    (q as any).answer_type === 'numeric_multi_year' ||
                    (q as any).metadata?.is_multi_year === true ||
                    lower.includes('past three years') ||
                    lower.includes('average annual salary increase rate') ||
                    lower.includes('labor cost ratio') ||
                    lower.includes('average bonus payout ratio');
                const isYearsOfService =
                    (q as any).answer_type === 'numeric_service_ranges' ||
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
            <div className="min-h-full bg-background text-foreground">
                {errors?.error && (
                    <Alert className="mb-6 border-destructive/50 bg-destructive/10 text-destructive mx-auto max-w-[90rem] px-6 pt-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.error}</AlertDescription>
                    </Alert>
                )}

                {isOverview ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap px-6 pt-6 max-w-[90rem] mx-auto">
                            <Link
                                href="/hr-manager/dashboard"
                                className="text-sm font-medium text-foreground/80 hover:text-primary flex items-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('compensation_system.back_to_dashboard')}
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
                        {/* Stage title + progress status (breadcrumb in AppHeader) */}
                        <header className="border-b border-white/10 bg-[var(--hr-navy)] px-4 py-3 text-white sm:px-6 md:px-10">
                            <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--hr-mint)]/15 text-[var(--hr-mint)] ring-1 ring-[var(--hr-mint)]/35"
                                        aria-hidden
                                    >
                                        <DollarSign className="h-4 w-4" strokeWidth={2.25} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold tracking-tight text-white">
                                            {t('compensation_system.title')}
                                        </h2>
                                        <p className="truncate text-[11px] text-white/50 sm:text-xs">
                                            {t('compensation_system.stage_4_5')}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                                        getStatusForHeader() === 'submitted' &&
                                            'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
                                        getStatusForHeader() === 'in_progress' &&
                                            'border-amber-300/40 bg-amber-500/15 text-amber-50',
                                        getStatusForHeader() === 'not_started' &&
                                            'border-white/15 bg-white/5 text-white/70',
                                    )}
                                >
                                    {t(`compensation_system.status.${getStatusForHeader()}`)}
                                </span>
                            </div>
                        </header>

                        {/* Dark stage nav - includes Overview so user can go back from any step */}
                        <div className="border-b border-white/5 bg-[var(--hr-navy)]">
                            <div className="mx-auto max-w-[90rem] overflow-x-auto px-3 scrollbar-thin sm:px-4 md:px-6">
                                <nav className="flex min-w-max items-stretch gap-0">
                                    {TABS.map((tab, idx) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        const isDone = tab.id === 'overview' ? false : isTabCompletedForUI(tab.id);
                                        const stepNum = tab.id === 'overview' ? null : idx;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => handleTabChange(tab.id)}
                                                className={cn(
                                                    'flex items-center gap-2 border-b-2 px-3 py-3 text-left text-xs font-medium whitespace-nowrap transition-colors sm:px-4 md:px-5 md:py-3.5',
                                                    isActive && 'border-[var(--hr-mint)] bg-white/5 text-white',
                                                    isDone && !isActive && 'border-transparent text-[var(--hr-mint)]',
                                                    !isActive && !isDone && 'border-transparent text-white/45 hover:text-white/80',
                                                    !isTabEnabled(tab.id, idx) && 'opacity-55',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                                                        tab.id === 'overview' && 'bg-white/12 text-white',
                                                        isDone && tab.id !== 'overview' && 'bg-[var(--hr-mint)] text-[var(--hr-navy)]',
                                                        isActive && !isDone && tab.id !== 'overview' && 'bg-white/12 text-white',
                                                        !isDone && !isActive && tab.id !== 'overview' && 'bg-white/[0.07] text-white/35',
                                                    )}
                                                >
                                                    {tab.id === 'overview' ? (
                                                        <Icon className="h-3 w-3 opacity-95" aria-hidden />
                                                    ) : isDone ? (
                                                        '✓'
                                                    ) : (
                                                        (stepNum ?? idx)
                                                    )}
                                                </span>
                                                <span className="max-w-[10rem] truncate sm:max-w-[14rem] md:max-w-none">
                                                    {t(tab.labelKey)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                                <div className="h-0.5 bg-white/5">
                                    <div
                                        className="h-full bg-[var(--hr-mint)] rounded-r transition-all duration-300"
                                        style={{ width: `${(completedTabsCount / (TABS.length - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto flex w-full min-w-0 max-w-[90rem] flex-1 flex-col px-3 py-4 pb-40 sm:px-4 md:px-6 md:py-6">
                            <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md">
                                <div className="min-w-0 p-3 sm:p-4 md:p-6">
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
                                            <h3 className="text-lg font-bold">{t('compensation_system.consultant_recommendation')}</h3>
                                                <Badge variant="default" className="bg-primary">
                                                    {consultantRecommendation.recommended_option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {t('compensation_system.consultant_recommendation_desc')}
                                            </p>
                                            <Collapsible open={isRationaleOpen} onOpenChange={setIsRationaleOpen}>
                                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {t('compensation_system.view_consultant_rationale')}
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
                                            <p className="font-medium mb-1">{t('compensation_system.performance_system_readonly')}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('compensation_system.method')}: <strong>{project.performanceSystem.performance_method || t('common.na')}</strong> | 
                                                {t('compensation_system.unit')}: <strong>{project.performanceSystem.evaluation_unit || t('common.na')}</strong>
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

                            <TabsContent value="snapshot" className="mt-0 data-[state=inactive]:hidden">
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
                            </div>
                        </div>

                        {/* Sticky footer: starts after sidebar (same as overview content area) */}
                        <footer
                            className="fixed bottom-0 right-0 bg-card border-t border-border px-6 py-3.5 flex items-center justify-between flex-wrap z-50 shadow-lg"
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
                                className="border-border text-muted-foreground hover:bg-muted"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.previous')}
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button
                                    type="button"
                                    onClick={() => void handleSaveAndContinue()}
                                    className={cn(
                                        footerStepValid
                                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-600/90'
                                            : 'border border-border bg-card text-muted-foreground hover:bg-muted/60',
                                    )}
                                >
                                    {t('common.continue')}
                                    <svg className="w-3.5 h-3.5 ml-1.5" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={processing || saving}
                                    className={cn(
                                        footerStepValid
                                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-600/90'
                                            : 'border border-border bg-card text-muted-foreground hover:bg-muted/60',
                                    )}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {processing || saving ? t('compensation_system.submitting') : t('compensation_system.submit_lock_step4')}
                                </Button>
                            )}
                        </footer>
                    </>
                )}
            </div>

                    {/* Success Modal — clean, focused UI */}
                    <Dialog
                        open={showSuccessModal}
                        onOpenChange={(open) => {
                            // Close only through the explicit CTA button.
                            if (open) setShowSuccessModal(true);
                        }}
                    >
                        <DialogContent
                            onPointerDownOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                            className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 shadow-xl rounded-2xl [&>button]:text-white [&>button]:top-6 [&>button]:right-6 [&>button]:opacity-80 hover:[&>button]:opacity-100"
                        >
                            <div className="bg-gradient-to-b from-[#0f1c30] to-[#1a2f52] px-8 pt-10 pb-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#2ec4a0]/20 border-2 border-[#2ec4a0] flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle2 className="w-9 h-9 text-[#2ec4a0]" strokeWidth={2} />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    <span className="block">{t('compensation_system.submitted_title')}</span>
                                    <span className="block text-sm font-medium opacity-90 mt-1">{t('compensation_system.submitted_title_ko')}</span>
                                </h2>
                                <p className="text-sm text-white/70 mt-1.5">
                                    <span className="block">{t('compensation_system.submitted_desc')}</span>
                                    <span className="block opacity-90 mt-1">{t('compensation_system.submitted_desc_ko')}</span>
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
                                            <span>{t('common.done')}</span>
                                            <span className="text-xs opacity-80">{t('compensation_system.go_dashboard')}</span>
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
