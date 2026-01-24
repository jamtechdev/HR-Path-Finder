import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface GradientBackgroundProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'primary' | 'hero' | 'accent' | 'success';
    intensity?: 'light' | 'medium' | 'strong';
    animated?: boolean;
}

export function GradientBackground({
    variant = 'primary',
    intensity = 'medium',
    animated = true,
    className,
    children,
    ...props
}: GradientBackgroundProps) {
    const variantClasses = {
        primary: 'gradient-primary',
        hero: 'gradient-hero',
        accent: 'gradient-accent',
        success: 'gradient-success',
    };

    const intensityClasses = {
        light: 'opacity-10',
        medium: 'opacity-20',
        strong: 'opacity-30',
    };

    return (
        <div className={cn('relative', className)} {...props}>
            {animated && (
                <div
                    className={cn(
                        'absolute inset-0 rounded-3xl blur-3xl transition-all duration-1000',
                        variantClasses[variant],
                        intensityClasses[intensity],
                        'animate-pulse'
                    )}
                />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
