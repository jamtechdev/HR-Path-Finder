import { Link } from '@inertiajs/react';
import { ChevronLeft, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompensationHeaderProps {
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'submitted';
    backHref?: string;
    performanceSystem?: {
        performance_method?: string | null;
        performance_unit?: string | null;
    } | null;
}

export default function CompensationHeader({ 
    title, 
    description, 
    status,
    backHref = '/step4',
    performanceSystem
}: CompensationHeaderProps) {
    const statusLabel = status === 'not_started' ? 'Not Started' : 
                       status === 'in_progress' ? 'In Progress' : 
                       'Submitted';
    
    const statusClasses = status === 'not_started' 
        ? 'bg-muted text-muted-foreground'
        : status === 'in_progress'
        ? 'bg-primary/10 text-primary'
        : 'bg-success/10 text-success';

    const methodLabels: Record<string, string> = {
        kpi: 'KPI',
        mbo: 'MBO',
        okr: 'OKR',
        bsc: 'BSC',
    };

    const unitLabels: Record<string, string> = {
        individual: 'Individual',
        organization: 'Organizational',
        hybrid: 'Hybrid',
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Link
                        href={backHref}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-0.5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-display font-bold tracking-tight">
                                {title}
                            </h1>
                            <Badge className={statusClasses}>
                                {statusLabel}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance System (Read-only) */}
            {performanceSystem && (performanceSystem.performance_method || performanceSystem.performance_unit) && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Performance System (Read-only)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Method: <strong>{performanceSystem.performance_method ? methodLabels[performanceSystem.performance_method] || performanceSystem.performance_method.toUpperCase() : 'N/A'}</strong> | Unit: <strong>{performanceSystem.performance_unit ? unitLabels[performanceSystem.performance_unit] || performanceSystem.performance_unit : 'N/A'}</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
