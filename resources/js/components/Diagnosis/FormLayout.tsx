import { Link, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DiagnosisFieldErrorsProvider } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import DiagnosisTabs from '@/components/Diagnosis/DiagnosisTabs';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { tr } from '@/config/diagnosisTranslations';
import AppLayout from '@/layouts/AppLayout';
import { saveTabDraft } from '@/lib/diagnosisDraftStorage';
import { mergeDiagnosisWithFormData, pruneFieldErrorsToValidator } from '@/lib/fieldErrorsUtils';

function hasFiles(data: any): boolean {
    if (!data) return false;
    if (data instanceof File) return true;
    if (Array.isArray(data)) return data.some((item: any) => hasFiles(item));
    if (typeof data === 'object') return Object.values(data).some((value: any) => hasFiles(value));
    return false;
}

function hasMeaningfulFormData(formData: any): boolean {
    if (!formData || typeof formData !== 'object' || Object.keys(formData).length === 0) return false;
    return Object.values(formData).some((val: any) => {
        if (val instanceof File) return true;
        if (Array.isArray(val) && val.length > 0) return true;
        if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) return true;
        if (typeof val === 'string' && val.trim() !== '') return true;
        if (typeof val === 'number' && val >= 0) return true;
        return false;
    });
}

function serializeDraft(formData: any): Record<string, unknown> {
    if (!formData || typeof formData !== 'object') return {};
    try {
        const json = JSON.stringify(formData, (_k, v) => (v instanceof File ? undefined : v));
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return {};
    }
}

interface FormLayoutProps {
    title: string;
    subtitle?: string;
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    diagnosis?: any;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    children: React.ReactNode;
    onBack?: () => void;
    onNext?: () => void;
    backRoute?: string;
    nextRoute?: string;
    showBack?: boolean;
    showNext?: boolean;
    nextLabel?: string;
    processing?: boolean;
    validateBeforeNext?: () => boolean | string; // Returns true if valid, or error message string
    formData?: any; // Form data to save
    saveRoute?: string; // Route to save form data
    hidePageTitle?: boolean; // e.g. Job Grades uses only section label in content
    /** When set, shown as validation error so user sees it as soon as form becomes invalid (e.g. on change) */
    liveValidationError?: string | null;
}

// Validation function for each step — returns field-level keys for red under-field messages
const validateStepRequiredFields = (
    tabId: string,
    diagnosis: any
): { isValid: boolean; error?: string; fieldErrors: FieldErrors } => {
    const fieldErrors: FieldErrors = {};

    if (!diagnosis) {
        return {
            isValid: false,
            error: 'Please fill in all required fields.',
            fieldErrors: { _form: 'Please fill in all required fields.' },
        };
    }

    switch (tabId) {
        case 'company-info':
            if (!diagnosis.industry_category || diagnosis.industry_category.trim() === '') {
                fieldErrors.industry_category = 'Primary Industry is required. Please select an industry category.';
            }
            break;

        case 'workforce':
            if (!diagnosis.present_headcount || diagnosis.present_headcount <= 0) {
                fieldErrors.present_headcount =
                    'Present Workforce (people) is required. Please enter the number of employees.';
            }
            break;

        case 'organizational-charts': {
            const charts = diagnosis.organizational_charts;
            const chartKeys = typeof charts === 'object' && charts !== null && !Array.isArray(charts) ? Object.keys(charts) : [];
            const hasAllYears = DIAGNOSIS_ORG_CHART_REQUIRED_YEARS.every((year) => chartKeys.includes(year));
            if (!hasAllYears) {
                fieldErrors.organizational_charts =
                    'Upload organizational charts for all required years (2023.12, 2024.12, 2025.12).';
            }
            break;
        }

        case 'organizational-structure': {
            const structure = diagnosis.org_structure_types || diagnosis.organizational_structure;
            if (
                !structure ||
                (Array.isArray(structure) && structure.length === 0) ||
                (typeof structure === 'object' && Object.keys(structure).length === 0)
            ) {
                fieldErrors.organizational_structure =
                    'At least one organizational structure type is required. Please select a structure type.';
            }
            break;
        }

        case 'job-structure':
            if (
                (!diagnosis.job_categories || diagnosis.job_categories.length === 0) &&
                (!diagnosis.job_functions || diagnosis.job_functions.length === 0)
            ) {
                fieldErrors.job_structure = 'At least one Job Category or Job Function is required.';
            }
            break;

        case 'hr-issues':
            break;

        case 'executives':
            if (typeof diagnosis.total_executives === 'number' && diagnosis.total_executives < 0) {
                fieldErrors.total_executives = 'Number of executives cannot be negative.';
            }
            break;

        case 'leaders':
            if (typeof diagnosis.leadership_count === 'number' && diagnosis.leadership_count < 0) {
                fieldErrors.leadership_count = 'Leadership count cannot be negative.';
            }
            break;

        case 'job-grades': {
            const grades = diagnosis.job_grade_names;
            if (grades == null || !Array.isArray(grades) || grades.length === 0) {
                fieldErrors.job_grade_names = 'Add at least one job grade or skip this step.';
            }
            break;
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        const first = Object.values(fieldErrors)[0];
        return { isValid: false, error: first, fieldErrors };
    }

    return { isValid: true, fieldErrors: {} };
};

export default function FormLayout({
    title,
    subtitle,
    project,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    children,
    onBack,
    onNext,
    backRoute,
    nextRoute,
    showBack = true,
    showNext = true,
    nextLabel,
    processing = false,
    validateBeforeNext,
    formData,
    saveRoute,
    hidePageTitle = false,
    liveValidationError = null,
}: FormLayoutProps) {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [diagnosisFieldErrors, setDiagnosisFieldErrors] = useState<FieldErrors>({});
    const validateBeforeNextRef = useRef(validateBeforeNext);
    validateBeforeNextRef.current = validateBeforeNext;

    useEffect(() => {
        setDiagnosisFieldErrors({});
        setValidationError(null);
    }, [activeTab]);

    // Live: drop field errors and top banner as soon as each field / step becomes valid.
    useEffect(() => {
        setDiagnosisFieldErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            const custom = validateBeforeNextRef.current;
            if (custom) {
                const ok = custom() === true;
                if (ok) return {};
                return prev;
            }
            const merged = mergeDiagnosisWithFormData(diagnosis, formData);
            const v = validateStepRequiredFields(activeTab, merged);
            return pruneFieldErrorsToValidator(prev, v.fieldErrors);
        });
        setValidationError((ve) => {
            if (!ve) return null;
            const custom = validateBeforeNextRef.current;
            if (custom) {
                return custom() === true ? null : ve;
            }
            const merged = mergeDiagnosisWithFormData(diagnosis, formData);
            const v = validateStepRequiredFields(activeTab, merged);
            return v.isValid ? null : ve;
        });
    }, [activeTab, formData, diagnosis]);

    const isReadOnly = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';

    const getBackUrl = () => {
        if (backRoute) {
            return projectId ? `/hr-manager/diagnosis/${projectId}/${backRoute}` : `/hr-manager/diagnosis/${backRoute}`;
        }
        return projectId ? `/hr-manager/diagnosis/${projectId}/overview` : '/hr-manager/diagnosis/overview';
    };

    const getNextUrl = () => {
        if (nextRoute) {
            return projectId ? `/hr-manager/diagnosis/${projectId}/${nextRoute}` : `/hr-manager/diagnosis/${nextRoute}`;
        }
        return null;
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        setValidationError(null);
        setDiagnosisFieldErrors({});

        const stepCompleted = stepStatuses[activeTab] === 'submitted' ||
            stepStatuses[activeTab] === 'approved' ||
            stepStatuses[activeTab] === 'locked' ||
            stepStatuses[activeTab] === 'completed';

        if (!stepCompleted) {
            if (validateBeforeNext) {
                const result = validateBeforeNext();
                if (result !== true) {
                    const errMsg = typeof result === 'string' ? result : 'Please fill in all required fields.';
                    setValidationError(errMsg);
                    setDiagnosisFieldErrors({ _form: errMsg });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            } else {
                const dataToValidate = formData && Object.keys(formData).length > 0 ? formData : diagnosis;
                const validation = validateStepRequiredFields(activeTab, dataToValidate);
                if (!validation.isValid) {
                    const errMsg = validation.error || 'Please fill in all required fields.';
                    setValidationError(errMsg);
                    setDiagnosisFieldErrors(validation.fieldErrors);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }
        }

        const isSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        if (isSubmitted) {
            if (onNext) onNext();
            else if (nextRoute && getNextUrl()) {
                router.visit(getNextUrl()!, { onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }) });
            }
            return;
        }

        const doNavigate = () => {
            setDiagnosisFieldErrors({});
            if (onNext) onNext();
            else if (nextRoute && getNextUrl()) {
                router.visit(getNextUrl()!, { onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }) });
            }
        };

        // Persist current step to backend so step completion/status updates.
        if (projectId && saveRoute && formData && activeTab !== 'review' && !isReadOnly) {
            if (projectId) {
                saveTabDraft(projectId, activeTab, serializeDraft(formData));
            }

            router.post(saveRoute, formData, {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (projectId) {
                        saveTabDraft(projectId, activeTab, serializeDraft(formData));
                    }
                    doNavigate();
                },
                onError: (payload: unknown) => {
                    const raw = (payload as any)?.errors ?? payload;
                    const mappedErrors: Record<string, string> = {};
                    if (raw && typeof raw === 'object') {
                        for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
                            const vv = Array.isArray(v) ? v[0] : v;
                            if (typeof vv === 'string' && vv) mappedErrors[k] = vv;
                        }
                    }
                    const first = Object.values(mappedErrors)[0];
                    setValidationError(first ?? 'Failed to save. Please try again.');
                    setDiagnosisFieldErrors(mappedErrors as FieldErrors);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
            });
            return;
        }

        if (projectId && formData && activeTab !== 'review') {
            saveTabDraft(projectId, activeTab, serializeDraft(formData));
        }

        doNavigate();
    };

    // Get status for header - same logic as Overview
    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        if (diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked') {
            return 'submitted';
        }
        const displayTabs = diagnosisTabs.filter(tab => tab.id !== 'overview');
        const completedCount = displayTabs.filter(tab => {
            // Review tab is completed when diagnosis is submitted
            if (tab.id === 'review') {
                return diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
            }
            const status = stepStatuses[tab.id];
            return status && ['submitted', 'approved', 'locked', 'completed', 'in_progress'].includes(status);
        }).length;
        if (diagnosisStatus === 'in_progress' || completedCount > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    const getBackHref = () => {
        if (projectId) {
            return `/hr-manager/diagnosis/${projectId}/overview`;
        }
        return '/hr-manager/diagnosis/overview';
    };

    const handleBack = (e: React.MouseEvent) => {
        if (projectId && formData && !isReadOnly && activeTab !== 'review') {
            e.preventDefault();
            saveTabDraft(projectId, activeTab, serializeDraft(formData));
            router.visit(getBackUrl());
        }
    };

    // Calculate progress - same as Overview
    const displayTabs = diagnosisTabs.filter(tab => tab.id !== 'overview');
    const completedCount = displayTabs.filter(tab => {
        const status = stepStatuses[tab.id];
        return status && ['submitted', 'approved', 'locked', 'completed', 'in_progress'].includes(status);
    }).length;
    const currentStepIndex = displayTabs.findIndex(tab => tab.id === activeTab);
    const stepCounter = currentStepIndex >= 0 ? `${currentStepIndex + 1} of ${displayTabs.length}` : '';

    const canProceed = useMemo(() => {
        const stepCompleted = stepStatuses[activeTab] === 'submitted' ||
            stepStatuses[activeTab] === 'approved' ||
            stepStatuses[activeTab] === 'locked' ||
            stepStatuses[activeTab] === 'completed';
        if (stepCompleted) return true;
        if (liveValidationError) return false;
        if (validateBeforeNext) {
            const result = validateBeforeNext();
            return result === true;
        }
        const dataToValidate = formData && typeof formData === 'object' && Object.keys(formData).length > 0 ? formData : diagnosis;
        return validateStepRequiredFields(activeTab, dataToValidate).isValid;
    }, [activeTab, formData, diagnosis, stepStatuses, validateBeforeNext, liveValidationError]);

    const statusForHeader = getStatusForHeader();
    const progressPct = displayTabs.length ? (completedCount / displayTabs.length) * 100 : 0;
    const badgeLabel = statusForHeader === 'in_progress' ? '진행중' : statusForHeader === 'submitted' ? '완료' : '미시작';

    return (
        <AppLayout>
            <div className="diagnosis-step-layout flex flex-col min-h-full bg-[var(--dx-gray-50)]">
                        {/* Top bar: back, Step 1: Diagnosis, badge, counter (pixel-perfect reference) */}
                        <div className="dx-top-bar shrink-0">
                            <Link href={getBackHref()} className="dx-back-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                            </Link>
                            <span className="dx-step-title">Step 1: Diagnosis</span>
                            <span className={`dx-step-badge ${statusForHeader !== 'in_progress' ? '!bg-[#F0F2F5] !text-[#6B7585] !border-[#E2E6ED]' : ''}`}>
                                {badgeLabel}
                            </span>
                            <span className="dx-step-counter">{stepCounter}</span>
                        </div>
                        <div className="dx-progress-wrap shrink-0">
                            <div className="dx-progress-track">
                                <div className="dx-progress-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                        </div>
                        <div className="dx-nav-tabs shrink-0">
                            <DiagnosisTabs
                                tabs={diagnosisTabs}
                                activeTab={activeTab as any}
                                stepStatus={stepStatuses}
                                stepOrder={diagnosisTabs.map(t => t.id)}
                                projectId={projectId}
                                diagnosisStatus={diagnosisStatus as any}
                                diagnosis={diagnosis}
                            />
                        </div>

                        {/* Form area - scrollable content */}
                        <div className="flex-1 overflow-y-auto">
                        <main className="dx-main">
                        {!hidePageTitle && (
                            <h2 className="text-[17px] font-bold text-[var(--dx-gray-900)] tracking-[-0.3px] mb-5">{title}</h2>
                        )}

                        {/* Read-only Notice */}
                        {(diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked') && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                    This diagnosis has been submitted and is currently in read-only mode. You can view the data but cannot make changes.
                                </p>
                            </div>
                        )}

                        {/* Validation Error (from Next click or live from step when form becomes invalid) */}
                        {(validationError || liveValidationError) && (
                            <div className="mb-4 p-4 bg-destructive/10 border-2 border-destructive/50 rounded-lg shadow-sm animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
                                        <span className="text-destructive text-xs font-bold">!</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-destructive mb-1">Validation Error</p>
                                        <p className="text-sm text-destructive/90">{validationError || liveValidationError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Content */}
                        <DiagnosisFieldErrorsProvider value={diagnosisFieldErrors}>
                            <div className="mb-6">{children}</div>
                        </DiagnosisFieldErrorsProvider>
                        </main>
                        </div>

                        {/* Bottom bar (pixel-perfect: 68px, Back / hint / Next) */}
                        {(showBack || showNext) && (
                            <div className="dx-bottom-bar">
                                {showBack ? (
                                    <Link
                                        href={getBackUrl()}
                                        onClick={handleBack}
                                        className="dx-btn-back"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M19 12H5M12 5l-7 7 7 7" />
                                        </svg>
                                        {tr('back')}
                                    </Link>
                                ) : <span />}
                                <span className="dx-bottom-hint">
                                    <strong>{title}</strong> · {stepCounter}
                                </span>
                                {showNext ? (
                                    <div className="relative flex flex-col items-end">
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={processing}
                                            className="dx-btn-next"
                                        >
                                            {nextLabel ?? tr('next')}
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        {!canProceed && !processing && (
                                            <p className="mt-1.5 text-[11px] text-[var(--dx-gray-400)] whitespace-nowrap">{tr('completeRequired')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <span />
                                )}
                            </div>
                        )}
            </div>
        </AppLayout>
    );
}
