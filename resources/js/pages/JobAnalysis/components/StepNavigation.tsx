import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
    onBack?: () => void;
    onNext?: () => void;
    backLabel?: string;
    nextLabel?: string;
    nextDisabled?: boolean;
    nextLoading?: boolean;
    showBack?: boolean;
    showNext?: boolean;
}

export default function StepNavigation({
    onBack,
    onNext,
    backLabel,
    nextLabel,
    nextDisabled = false,
    nextLoading = false,
    showBack = true,
    showNext = true,
}: StepNavigationProps) {
    const { t } = useTranslation();
    const resolvedBackLabel = backLabel ?? t('common.back', { defaultValue: 'Back' });
    const resolvedNextLabel = nextLabel ?? t('job_analysis_pages.common.save_continue', { defaultValue: 'Save & Continue' });

    return (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border">
            {showBack && onBack && (
                <Button
                    onClick={onBack}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {resolvedBackLabel}
                </Button>
            )}
            {!showBack && <div />}
            <div className="flex-1" />
            {showNext && (
                <Button
                    onClick={onNext}
                    disabled={nextDisabled || nextLoading}
                    size="lg"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                >
                    {nextLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {t('common.processing', { defaultValue: 'Processing...' })}
                        </>
                    ) : (
                        <>
                            {resolvedNextLabel}
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
