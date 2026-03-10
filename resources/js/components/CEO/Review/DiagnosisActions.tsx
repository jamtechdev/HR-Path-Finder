import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2 } from 'lucide-react';

interface DiagnosisActionsProps {
    onSave: () => void;
    onConfirm?: () => void;
    processing: boolean;
    diagnosisStatus?: string;
}

export default function DiagnosisActions({
    onSave,
    onConfirm,
    processing,
    diagnosisStatus,
}: DiagnosisActionsProps) {
    return (
        <div className="mt-8 space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
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
                {diagnosisStatus === 'submitted' && onConfirm && (
                    <Button
                        onClick={onConfirm}
                        disabled={processing}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all min-w-[240px]"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirm & Proceed to Survey
                    </Button>
                )}
            </div>
        </div>
    );
}
