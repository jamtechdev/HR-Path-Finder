import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DiagnosisActionsProps {
    onSave: () => void;
    onConfirm?: () => void;
    processing: boolean;
    diagnosisStatus?: string;
    saveSuccess?: boolean;
}

export default function DiagnosisActions({ 
    onSave, 
    onConfirm, 
    processing, 
    diagnosisStatus,
    saveSuccess = false 
}: DiagnosisActionsProps) {
    return (
        <div className="mt-8 space-y-4">
            {/* Success Message */}
            {saveSuccess && (
                <Alert className="border-green-200 bg-green-50 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium">
                        Changes saved successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button
                    variant="outline"
                    onClick={onSave}
                    disabled={processing}
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
