import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepFooterProps {
    onBack?: () => void;
    onNext?: () => void;
    canGoBack?: boolean;
    canGoNext?: boolean;
    isNextDisabled?: boolean;
    nextLabel?: string;
    backLabel?: string;
    showFooter?: boolean;
}

export default function StepFooter({
    onBack,
    onNext,
    canGoBack = true,
    canGoNext = true,
    isNextDisabled = false,
    nextLabel = 'Next',
    backLabel = 'Back',
    showFooter = true,
}: StepFooterProps) {
    if (!showFooter) return null;

    return (
        <div className="flex justify-between pt-4 border-t mt-6">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={!canGoBack}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
            </Button>
            <Button
                onClick={onNext}
                disabled={!canGoNext || isNextDisabled}
                className="flex items-center gap-2"
            >
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
