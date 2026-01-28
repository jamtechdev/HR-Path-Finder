import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface SuccessMessageProps {
    message?: string;
    nextStep?: string;
    nextStepRoute?: string;
    onClose?: () => void;
}

export default function SuccessMessage({ 
    message, 
    nextStep, 
    nextStepRoute,
    onClose 
}: SuccessMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            // Auto-dismiss after 8 seconds if no next step, or 12 seconds if there's a next step
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose();
                }
            }, nextStep ? 12000 : 8000);

            return () => clearTimeout(timer);
        }
    }, [message, nextStep, onClose]);

    if (!message || !isVisible) {
        return null;
    }

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] animate-in fade-in slide-in-from-right-4 duration-500 max-w-md w-full sm:w-auto">
            <div className="bg-card border-2 border-success/30 rounded-xl shadow-2xl p-6 space-y-4 relative overflow-hidden backdrop-blur-sm">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-success/10 to-success/5 opacity-50"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-success/20 via-success/10 to-success/20 opacity-0 animate-pulse"></div>
                
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted/50"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="relative space-y-4">
                    {/* Icon and Message */}
                    <div className="flex items-start gap-4 pr-6">
                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 ring-2 ring-success/30 animate-pulse">
                            <CheckCircle2 className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="font-semibold text-lg text-foreground mb-1.5">Success!</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                        </div>
                    </div>

                    {/* Next Step Button */}
                    {nextStep && nextStepRoute && (
                        <div className="pt-3 border-t border-border/50">
                            <Link href={nextStepRoute} onClick={handleClose}>
                                <Button
                                    className="w-full bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-success-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group"
                                >
                                    Continue to {nextStep}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
