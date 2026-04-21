import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
    nextLabel,
    backLabel,
    showFooter = true,
}: StepFooterProps) {
    const { t } = useTranslation();
    const resolvedBackLabel = backLabel ?? t('common.back', { defaultValue: 'Back' });
    const resolvedNextLabel = nextLabel ?? t('job_analysis_pages.common.save_continue', { defaultValue: 'Save & Continue' });

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
                {resolvedBackLabel}
            </Button>
            <Button
                onClick={onNext}
                disabled={!canGoNext || isNextDisabled}
                className="flex items-center gap-2"
            >
                {resolvedNextLabel}
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
