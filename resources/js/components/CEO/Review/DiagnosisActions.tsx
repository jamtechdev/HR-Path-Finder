import { Link } from '@inertiajs/react';
import { Save, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface DiagnosisActionsProps {
    onSave: () => void;
    onConfirm?: () => void;
    onBackTab?: () => void;
    onNextTab?: () => void;
    canGoBackTab?: boolean;
    canGoNextTab?: boolean;
    showNextButton?: boolean;
    processing: boolean;
    diagnosisStatus?: string;
    /** CEO must complete survey before they can verify diagnosis */
    hasSurveyCompleted?: boolean;
    /** Diagnosis data must be complete before verification */
    isDiagnosisComplete?: boolean;
    projectId?: number;
}

export default function DiagnosisActions({
    onSave,
    onConfirm,
    onBackTab,
    onNextTab,
    canGoBackTab = false,
    canGoNextTab = false,
    showNextButton = true,
    processing,
    diagnosisStatus,
    hasSurveyCompleted = false,
    isDiagnosisComplete = false,
    projectId,
}: DiagnosisActionsProps) {
    const isFinalized =
        diagnosisStatus === 'approved' ||
        diagnosisStatus === 'locked' ||
        diagnosisStatus === 'completed';

    const needsCompleteDiagnosis = diagnosisStatus === 'submitted' && hasSurveyCompleted && !isDiagnosisComplete;
    // Keep "Next" practical for CEO flow: survey completion is mandatory; completeness can be handled in backend validation.
    const canProceedNext = diagnosisStatus === 'submitted' && hasSurveyCompleted && !!onConfirm;

    if (isFinalized) {
        return (
            <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between flex-wrap pt-6 border-t flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            className="min-w-[130px]"
                            onClick={onBackTab}
                            disabled={!canGoBackTab}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Diagnosis already verified
                        </span>
                        {showNextButton && (
                            <Button
                                size="lg"
                                className="min-w-[160px]"
                                onClick={onNextTab}
                                disabled={!canGoNextTab}
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-between flex-wrap pt-6 border-t flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        className="min-w-[130px]"
                        onClick={onBackTab}
                        disabled={!canGoBackTab}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <Button
                        variant="outline"
                        onClick={onSave}
                        disabled={processing || diagnosisStatus !== 'submitted'}
                        size="lg"
                        className="min-w-[160px]"
                    >
                        {processing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>

                    {diagnosisStatus === 'submitted' && showNextButton && (
                        <Button
                            onClick={onNextTab ?? onConfirm}
                            disabled={processing || !canProceedNext}
                            size="lg"
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all min-w-[160px]"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Next
                        </Button>
                    )}
                </div>
            </div>
            {diagnosisStatus === 'submitted' && !hasSurveyCompleted && (
                <p className="text-sm text-amber-700">
                    Complete the CEO survey first, then use Next.
                </p>
            )}
            {needsCompleteDiagnosis && (
                <p className="text-sm text-amber-700">
                    Complete all required diagnosis sections before verification.
                </p>
            )}
        </div>
    );
}
