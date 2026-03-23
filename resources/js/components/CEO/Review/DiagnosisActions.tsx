import { Link } from '@inertiajs/react';
import { Save, CheckCircle2, ClipboardList } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface DiagnosisActionsProps {
    onSave: () => void;
    onConfirm?: () => void;
    processing: boolean;
    diagnosisStatus?: string;
    /** CEO must complete survey before they can verify diagnosis */
    hasSurveyCompleted?: boolean;
    projectId?: number;
}

export default function DiagnosisActions({
    onSave,
    onConfirm,
    processing,
    diagnosisStatus,
    hasSurveyCompleted = false,
    projectId,
}: DiagnosisActionsProps) {
    const canConfirm = diagnosisStatus === 'submitted' && hasSurveyCompleted && onConfirm;
    const needsSurvey = diagnosisStatus === 'submitted' && !hasSurveyCompleted;

    return (
        <div className="mt-8 space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t flex-wrap gap-4">
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
                            Save Changes
                        </>
                    )}
                </Button>
                {needsSurvey && projectId && (
                    <Link href={`/ceo/philosophy/survey/${projectId}`}>
                        <Button
                            size="lg"
                            className="bg-amber-600 hover:bg-amber-700 text-white min-w-[260px]"
                        >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Complete Survey to Verify Diagnosis
                        </Button>
                    </Link>
                )}
                {canConfirm && (
                    <Button
                        onClick={onConfirm}
                        disabled={processing}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all min-w-[200px]"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verify & Confirm Diagnosis
                    </Button>
                )}
            </div>
        </div>
    );
}
