import { CheckCircle2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    nextStepLabel?: string;
    onNextStep?: () => void;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title,
    message,
    nextStepLabel,
    onNextStep,
}: SuccessModalProps) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('job_analysis_pages.success_modal.default_title');
    const resolvedMessage = message ?? t('job_analysis_pages.success_modal.default_message');
    const resolvedNext = nextStepLabel ?? t('job_analysis_pages.success_modal.default_next');
    const closeLabel = t('job_analysis_pages.success_modal.close');

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                // Close only through explicit modal buttons.
                if (open) return;
            }}
        >
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md"
            >
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">{resolvedTitle}</DialogTitle>
                    <DialogDescription className="text-center text-base mt-2 whitespace-pre-line">
                        {resolvedMessage}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-center">
                    {onNextStep && (
                        <Button onClick={onNextStep} className="w-full sm:w-auto">
                            {resolvedNext}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        {closeLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
