import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
    size?: 'sm' | 'md';
    children: ReactNode;
}

const sizeClasses: Record<NonNullable<OptionPillProps['size']>, string> = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
};

export function OptionPill({
    selected = false,
    size = 'md',
    className,
    children,
    ...props
}: OptionPillProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center rounded-full border font-semibold transition-colors',
                selected
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                sizeClasses[size],
                props.disabled && 'cursor-not-allowed opacity-60',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
