import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisTabs from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { Button } from '@/components/ui/button';
import { toast, dismissAll } from '@/hooks/use-toast';
import { tr } from '@/config/diagnosisTranslations';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const AUTO_SAVE_DELAY_MS = 1800;

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

function getFormDataSnapshot(formData: any): string {
    if (!formData || typeof formData !== 'object') return '';
    try {
        return JSON.stringify(formData, (_k, v) => (v instanceof File ? '[File]' : v));
    } catch {
        return '';
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
}

// Validation function for each step
const validateStepRequiredFields = (tabId: string, diagnosis: any): { isValid: boolean; error?: string } => {
    if (!diagnosis) {
        return { isValid: false, error: 'Please fill in all required fields.' };
    }

    switch (tabId) {
        case 'company-info':
            if (!diagnosis.industry_category || diagnosis.industry_category.trim() === '') {
                return { isValid: false, error: 'Primary Industry is required. Please select an industry category.' };
            }
            break;
        
        case 'workforce':
            if (!diagnosis.present_headcount || diagnosis.present_headcount <= 0) {
                return { isValid: false, error: 'Present Workforce (people) is required. Please enter the number of employees.' };
            }
            break;
        
        case 'organizational-charts': {
            const charts = diagnosis.organizational_charts;
            const chartKeys = typeof charts === 'object' && charts !== null && !Array.isArray(charts) ? Object.keys(charts) : [];
            const hasAllYears = DIAGNOSIS_ORG_CHART_REQUIRED_YEARS.every((year) => chartKeys.includes(year));
            if (!hasAllYears) {
                return { isValid: false, error: 'Upload organizational charts for all required years (2023.12, 2024.12, 2025.12).' };
            }
            break;
        }
        
        case 'organizational-structure':
            const structure = diagnosis.org_structure_types || diagnosis.organizational_structure;
            if (!structure || 
                (Array.isArray(structure) && structure.length === 0) ||
                (typeof structure === 'object' && Object.keys(structure).length === 0)) {
                return { isValid: false, error: 'At least one organizational structure type is required. Please select a structure type.' };
            }
            break;
        
        case 'job-structure':
            if ((!diagnosis.job_categories || diagnosis.job_categories.length === 0) &&
                (!diagnosis.job_functions || diagnosis.job_functions.length === 0)) {
                return { isValid: false, error: 'At least one Job Category or Job Function is required.' };
            }
            break;

        case 'hr-issues':
            // Optional step: user can skip if none apply
            break;

        case 'executives':
            if (typeof diagnosis.total_executives === 'number' && diagnosis.total_executives < 0) {
                return { isValid: false, error: 'Number of executives cannot be negative.' };
            }
            break;

        case 'leaders':
            if (typeof diagnosis.leadership_count === 'number' && diagnosis.leadership_count < 0) {
                return { isValid: false, error: 'Leadership count cannot be negative.' };
            }
            break;

        case 'job-grades':
            const grades = diagnosis.job_grade_names;
            if (grades == null || !Array.isArray(grades) || grades.length === 0) {
                return { isValid: false, error: 'Add at least one job grade or skip this step.' };
            }
            break;
    }

    return { isValid: true };
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
}: FormLayoutProps) {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAutoSaveSnapshotRef = useRef<string>('');
    const initialMountRef = useRef(true);

    const isReadOnly = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';

    // Debounced auto-save: persist formData to DB so leaving the page does not reset answers
    useEffect(() => {
        if (!saveRoute || !projectId || !formData || !hasMeaningfulFormData(formData) || isReadOnly) {
            return;
        }
        const snapshot = getFormDataSnapshot(formData);
        if (initialMountRef.current) {
            initialMountRef.current = false;
            lastAutoSaveSnapshotRef.current = snapshot;
            return;
        }
        if (snapshot === lastAutoSaveSnapshotRef.current) {
            return;
        }
        lastAutoSaveSnapshotRef.current = snapshot;
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(() => {
            autoSaveTimeoutRef.current = null;
            router.post(saveRoute, formData, {
                preserveScroll: true,
                forceFormData: hasFiles(formData),
                onSuccess: () => {
                    lastAutoSaveSnapshotRef.current = getFormDataSnapshot(formData);
                },
                onError: () => {
                    toast({ title: 'Auto-save failed', description: 'Your changes may not be saved. Try clicking Next to save.', variant: 'destructive' });
                },
            });
        }, AUTO_SAVE_DELAY_MS);
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
                autoSaveTimeoutRef.current = null;
            }
        };
    }, [saveRoute, projectId, formData, isReadOnly]);

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

    const handleNext = async (e: React.MouseEvent) => {
        e.preventDefault();
        dismissAll(); // Ensure only one toast shows
        setValidationError(null);
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
        }

        // Check if step is already completed - skip validation if completed
        const stepCompleted = stepStatuses[activeTab] === 'submitted' || 
                              stepStatuses[activeTab] === 'approved' || 
                              stepStatuses[activeTab] === 'locked' ||
                              stepStatuses[activeTab] === 'completed';
        
        // Check if formData has actual data (not just empty object)
        const hasFormData = formData && typeof formData === 'object' && 
                           Object.keys(formData).length > 0 &&
                           Object.values(formData).some(val => {
                               if (val instanceof File) return true;
                               if (Array.isArray(val) && val.length > 0) return true;
                               if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) return true;
                               if (typeof val === 'string' && val.trim() !== '') return true;
                               if (typeof val === 'number' && val > 0) return true;
                               return false;
                           });
        
        // Always validate required fields before proceeding (unless step is already completed)
        if (!stepCompleted) {
            // Use custom validation if provided
            if (validateBeforeNext) {
                const result = validateBeforeNext();
                if (result !== true) {
                    const errMsg = typeof result === 'string' ? result : 'Please fill in all required fields.';
                    setValidationError(errMsg);
                    toast({ title: tr('validationError'), description: errMsg, variant: 'destructive' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            } else {
                // Use default validation - check both diagnosis data and formData
                const dataToValidate = formData && Object.keys(formData).length > 0 ? formData : diagnosis;
                const validation = validateStepRequiredFields(activeTab, dataToValidate);
                if (!validation.isValid) {
                    const errMsg = validation.error || 'Please fill in all required fields.';
                    setValidationError(errMsg);
                    toast({ title: tr('validationError'), description: errMsg, variant: 'destructive' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }
        }

        // If diagnosis is already submitted/approved/locked, skip save and go to next step (avoid "cannot be edited" error)
        const isSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        if (isSubmitted) {
            if (onNext) {
                onNext();
            } else if (nextRoute && getNextUrl()) {
                router.visit(getNextUrl()!, { onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }) });
            }
            return;
        }

        // Save form data before navigating if saveRoute and formData are provided
        if (saveRoute && formData && projectId) {
            setIsSaving(true);
            router.post(saveRoute, formData, {
                preserveScroll: false,
                forceFormData: hasFiles(formData), // Use FormData if files are present
                onSuccess: () => {
                    setIsSaving(false);
                    dismissAll();
                    toast({ title: tr('saved'), description: tr('savedDesc'), variant: 'success' });
                    setTimeout(() => {
                        if (onNext) {
                            onNext();
                        } else if (nextRoute) {
                            router.visit(getNextUrl()!, {
                                onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                            });
                        }
                    }, 300);
                },
                onError: (errors: Record<string, string | string[]>) => {
                    setIsSaving(false);
                    const msg = typeof errors === 'object' && errors !== null
                        ? (errors.message ?? Object.values(errors)[0])
                        : 'Failed to save. Please try again.';
                    const desc = Array.isArray(msg) ? msg[0] : String(msg ?? '');
                    toast({ title: tr('saveFailed'), description: desc || 'Failed to save. Please try again.', variant: 'destructive' });
                },
            });
            return;
        }

        // If validation passes and no save needed, show one toast then proceed
        toast({ title: tr('saved'), description: tr('proceeding'), variant: 'success' });
        setTimeout(() => {
            if (onNext) {
                onNext();
            } else if (nextRoute) {
                router.visit(getNextUrl()!, {
                    onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                });
            }
        }, 200);
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
        const backUrl = getBackUrl();
        const hasDirtyData =
            saveRoute &&
            projectId &&
            formData &&
            hasMeaningfulFormData(formData) &&
            !isReadOnly &&
            getFormDataSnapshot(formData) !== lastAutoSaveSnapshotRef.current;
        if (hasDirtyData) {
            e.preventDefault();
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
                autoSaveTimeoutRef.current = null;
            }
            setIsSaving(true);
            router.post(saveRoute, formData, {
                preserveScroll: false,
                forceFormData: hasFiles(formData),
                onSuccess: () => {
                    setIsSaving(false);
                    lastAutoSaveSnapshotRef.current = getFormDataSnapshot(formData);
                    router.visit(backUrl);
                },
                onError: () => {
                    setIsSaving(false);
                    toast({ title: 'Save failed', description: 'Your changes may not be saved. Try again or click Next to save.', variant: 'destructive' });
                },
            });
        }
        // If !hasDirtyData, allow default (Link navigation)
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
        if (validateBeforeNext) {
            const result = validateBeforeNext();
            return result === true;
        }
        const dataToValidate = formData && typeof formData === 'object' && Object.keys(formData).length > 0 ? formData : diagnosis;
        return validateStepRequiredFields(activeTab, dataToValidate).isValid;
    }, [activeTab, formData, diagnosis, stepStatuses, validateBeforeNext]);

    return (
        <AppLayout>
            <div className="flex flex-col min-h-full bg-[var(--hr-gray-50)]">
                        {/* Step Header - white bar with back, title, badge, counter */}
                        <div className="bg-white border-b border-[var(--hr-gray-200)] pt-4 px-9 pb-0 shrink-0">
                            <DiagnosisHeader
                                title="Step 1: Diagnosis"
                                status={getStatusForHeader()}
                                backHref={getBackHref()}
                                stepCounter={stepCounter}
                            />
                            {/* Overview bar */}
                            <div className="flex items-center gap-2.5 mt-0 mb-0">
                                <span className="text-[11px] text-[var(--hr-gray-400)] whitespace-nowrap">Overview</span>
                                <div className="flex-1 h-[3px] bg-[var(--hr-gray-200)] rounded-[3px] overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--hr-mint)] rounded-[3px] transition-all duration-400 ease-out"
                                        style={{ width: `${displayTabs.length ? (completedCount / displayTabs.length) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            {/* Tabs - scrollable */}
                            <div className="mt-3.5">
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
                        </div>

                        {/* Form area - scrollable content */}
                        <div className="flex-1 overflow-y-auto py-7 px-3 md:px-9">
                        {/* Page Title */}
                        <h2 className="text-[17px] font-bold text-[var(--hr-gray-800)] tracking-[-0.3px] mb-5">{title}</h2>

                        {/* Read-only Notice */}
                        {(diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked') && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                    This diagnosis has been submitted and is currently in read-only mode. You can view the data but cannot make changes.
                                </p>
                            </div>
                        )}

                        {/* Validation Error */}
                        {validationError && (
                            <div className="mb-4 p-4 bg-destructive/10 border-2 border-destructive/50 rounded-lg shadow-sm animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
                                        <span className="text-destructive text-xs font-bold">!</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-destructive mb-1">Validation Error</p>
                                        <p className="text-sm text-destructive/90">{validationError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="mb-6">
                            {children}
                        </div>
                        </div>

                        {/* Bottom Nav - white bar */}
                        {(showBack || showNext) && (
                            <div className="bg-white border-t border-[var(--hr-gray-200)] py-3.5 px-9 flex items-center justify-between shrink-0">
                                {showBack ? (
                                    <Link
                                        href={getBackUrl()}
                                        onClick={handleBack}
                                        className="flex items-center gap-[7px] py-2 px-[18px] border border-[var(--hr-gray-200)] rounded-lg bg-white text-[13px] font-medium text-[var(--hr-gray-600)] hover:border-[var(--hr-gray-300)] hover:bg-[var(--hr-gray-50)] transition-colors"
                                    >
                                        ← {tr('back')}
                                    </Link>
                                ) : <span />}
                                <span className="text-[11.5px] text-[var(--hr-gray-400)]">{stepCounter}</span>
                                {showNext ? (
                                    <div className="relative flex flex-col items-end">
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={processing || isSaving || !canProceed}
                                            className="flex items-center gap-[7px] py-2 px-[22px] rounded-lg bg-[var(--hr-navy)] text-[13px] font-bold text-white hover:bg-[var(--hr-navy-mid)] hover:-translate-y-px transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? tr('saving') : (nextLabel ?? tr('next'))}
                                            →
                                        </button>
                                        {!canProceed && !processing && !isSaving && (
                                            <p className="mt-1.5 text-[11px] text-[var(--hr-gray-400)] whitespace-nowrap">{tr('completeRequired')}</p>
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
