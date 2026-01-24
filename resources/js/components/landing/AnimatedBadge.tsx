import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface AnimatedBadgeProps extends HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
    variant?: 'default' | 'success' | 'primary';
    children: React.ReactNode;
    delay?: number;
}

export function AnimatedBadge({
    icon: Icon,
    variant = 'default',
    children,
    delay = 0,
    className,
    ...props
}: AnimatedBadgeProps) {
    const variantClasses = {
        default: 'bg-muted text-foreground',
        success: 'bg-success/10 text-success',
        primary: 'bg-primary/10 text-primary',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                'animate-in fade-in slide-in-from-top-4',
                variantClasses[variant],
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
            {...props}
        >
            {Icon && <Icon className="size-4 animate-pulse" />}
            {children}
        </div>
    );
}
