import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { HTMLAttributes, ReactNode } from 'react';

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
    iconColor?: 'primary' | 'success' | 'accent' | 'warning';
    title?: string;
    description?: string;
    children?: ReactNode;
    delay?: number;
    gradient?: boolean;
}

export function AnimatedCard({
    icon: Icon,
    iconColor = 'primary',
    title,
    description,
    children,
    delay = 0,
    gradient = false,
    className,
    ...props
}: AnimatedCardProps) {
    const iconColorClasses = {
        primary: 'text-primary',
        success: 'text-success',
        accent: 'text-accent',
        warning: 'text-warning',
    };

    return (
        <Card
            className={cn(
                'card-hover group relative overflow-hidden transition-all duration-500',
                'animate-in fade-in slide-in-from-bottom-4',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
            {...props}
        >
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            )}
            <CardContent className={cn('relative p-6', gradient && 'z-10')}>
                {Icon && (
                    <div className="mb-4 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className={cn('size-6 text-white')} />
                    </div>
                )}
                {title && <h3 className="font-semibold text-lg mb-2">{title}</h3>}
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
                {children}
            </CardContent>
        </Card>
    );
}
