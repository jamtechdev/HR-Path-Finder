import { CheckCircle2 } from 'lucide-react';
import React from 'react';
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
    title = 'Success!',
    message = 'Operation completed successfully.',
    nextStepLabel = 'Next Step',
    onNextStep,
}: SuccessModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
                    <DialogDescription className="text-center text-base mt-2 whitespace-pre-line">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-center">
                    {onNextStep && (
                        <Button onClick={onNextStep} className="w-full sm:w-auto">
                            {nextStepLabel}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
