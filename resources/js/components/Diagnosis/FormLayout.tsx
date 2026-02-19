import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisTabs from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
        
        case 'organizational-charts':
            if (!diagnosis.organizational_charts || 
                (Array.isArray(diagnosis.organizational_charts) && diagnosis.organizational_charts.length === 0) ||
                (typeof diagnosis.organizational_charts === 'object' && Object.keys(diagnosis.organizational_charts).length === 0)) {
                return { isValid: false, error: 'At least one organizational chart is required. Please upload charts for the required years.' };
            }
            break;
        
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
    nextLabel = 'Next',
    processing = false,
    validateBeforeNext,
    formData,
    saveRoute,
}: FormLayoutProps) {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
        setValidationError(null);

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
        
        // Only validate if step is not completed AND we have new data to validate
        if (!stepCompleted && !hasFormData) {
            // Use custom validation if provided
            if (validateBeforeNext) {
                const result = validateBeforeNext();
                if (result !== true) {
                    setValidationError(typeof result === 'string' ? result : 'Please fill in all required fields.');
                    return;
                }
            } else {
                // Use default validation - check diagnosis data
                const validation = validateStepRequiredFields(activeTab, diagnosis);
                if (!validation.isValid) {
                    setValidationError(validation.error || 'Please fill in all required fields.');
                    return;
                }
            }
        }

        // Check if diagnosis is submitted
        const isSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        
        // If submitted and no new data to save, just navigate
        if (isSubmitted && !hasFormData) {
            // Just navigate without saving if no changes
            if (onNext) {
                onNext();
            } else if (nextRoute) {
                router.visit(getNextUrl()!);
            }
            return;
        }

        // Check if formData contains files
        const hasFiles = (data: any): boolean => {
            if (!data) return false;
            if (data instanceof File) return true;
            if (Array.isArray(data)) {
                return data.some(item => hasFiles(item));
            }
            if (typeof data === 'object') {
                return Object.values(data).some(value => hasFiles(value));
            }
            return false;
        };

        // Save form data before navigating if saveRoute and formData are provided
        if (saveRoute && formData && projectId) {
            setIsSaving(true);
            router.post(saveRoute, formData, {
                preserveScroll: false,
                forceFormData: hasFiles(formData), // Use FormData if files are present
                onSuccess: () => {
                    setIsSaving(false);
                    // Navigate after successful save
                    if (onNext) {
                        onNext();
                    } else if (nextRoute) {
                        router.visit(getNextUrl()!);
                    }
                },
                onError: () => {
                    setIsSaving(false);
                },
            });
            return;
        }

        // If validation passes and no save needed, proceed
        if (onNext) {
            onNext();
        } else if (nextRoute) {
            router.visit(getNextUrl()!);
        }
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

    // Calculate progress - same as Overview
    const displayTabs = diagnosisTabs.filter(tab => tab.id !== 'overview');
    const completedCount = displayTabs.filter(tab => {
        const status = stepStatuses[tab.id];
        return status && ['submitted', 'approved', 'locked', 'completed', 'in_progress'].includes(status);
    }).length;

    return (
        <AppLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                        {/* Header - Same as Overview */}
                        <div className="mb-6">
                            <DiagnosisHeader
                                title="Step 1: Diagnosis"
                                description="Input company information and organizational context."
                                status={getStatusForHeader()}
                                backHref={getBackHref()}
                            />
                        </div>

                        {/* Progress Overview - Same as Overview */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Overview</span>
                                <span className="text-sm text-gray-600">{completedCount} of {displayTabs.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className="bg-primary h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${(completedCount / displayTabs.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Tabs Navigation - Same as Overview */}
                        <div className="mb-6">
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

                        {/* Page Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                        </div>

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
                            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive font-medium">{validationError}</p>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="mb-6">
                            {children}
                        </div>

                        {/* Navigation */}
                        {(showBack || showNext) && (
                            <div className="flex items-center justify-between pt-6 border-t">
                                {showBack && (
                                    <Link href={getBackUrl()}>
                                        <Button variant="outline" disabled={processing}>
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                    </Link>
                                )}
                                {showNext && (
                                    <>
                                        {onNext ? (
                                            <Button onClick={handleNext} disabled={processing || isSaving}>
                                                {isSaving ? 'Saving...' : nextLabel}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : nextRoute ? (
                                            <Button onClick={handleNext} disabled={processing || isSaving}>
                                                {isSaving ? 'Saving...' : nextLabel}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
        </AppLayout>
    );
}
