import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface AnimatedHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    highlight?: string;
    highlightColor?: 'primary' | 'success' | 'accent';
    delay?: number;
    children: React.ReactNode;
}

export function AnimatedHeading({
    as: Component = 'h1',
    highlight,
    highlightColor = 'primary',
    delay = 0,
    children,
    className,
    ...props
}: AnimatedHeadingProps) {
    const highlightClasses = {
        primary: 'text-primary',
        success: 'text-success',
        accent: 'text-accent',
    };

    const content = typeof children === 'string' && highlight ? (
        <>
            {children.split(highlight).map((part, index, array) => (
                <span key={index}>
                    {part}
                    {index < array.length - 1 && (
                        <span className={cn('bg-gradient-to-r from-primary to-success bg-clip-text text-transparent', highlightClasses[highlightColor])}>
                            {highlight}
                        </span>
                    )}
                </span>
            ))}
        </>
    ) : (
        children
    );

    return (
        <Component
            className={cn(
                'font-display font-bold leading-tight',
                'animate-in fade-in slide-in-from-bottom-8',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
            {...props}
        >
            {content}
        </Component>
    );
}
