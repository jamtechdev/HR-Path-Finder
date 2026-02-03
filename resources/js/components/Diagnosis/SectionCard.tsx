import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionCardProps {
    title: string;
    description?: string;
    badge?: ReactNode;
    className?: string;
    children: ReactNode;
}

export function SectionCard({ title, description, badge, className, children }: SectionCardProps) {
    return (
        <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div className="space-y-1.5">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {badge}
            </div>
            <div className="p-6 pt-0">{children}</div>
        </div>
    );
}
