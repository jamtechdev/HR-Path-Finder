import { CheckCircle2 } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedFeatureListProps extends HTMLAttributes<HTMLDivElement> {
    features: string[];
    delay?: number;
    iconColor?: 'success' | 'primary' | 'accent';
}

export function AnimatedFeatureList({
    features,
    delay = 0,
    iconColor = 'success',
    className,
    ...props
}: AnimatedFeatureListProps) {
    const iconColorClasses = {
        success: 'text-success bg-success/10',
        primary: 'text-primary bg-primary/10',
        accent: 'text-accent bg-accent/10',
    };

    return (
        <div className={cn('grid gap-4', className)} {...props}>
            {features.map((feature, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${delay + index * 100}ms` }}
                >
                    <div
                        className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110',
                            iconColorClasses[iconColor]
                        )}
                    >
                        <CheckCircle2 className="size-4" />
                    </div>
                    <span className="font-medium">{feature}</span>
                </div>
            ))}
        </div>
    );
}
