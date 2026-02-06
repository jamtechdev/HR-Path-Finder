import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiagnosisHeaderProps {
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'submitted';
    backHref?: string;
}

export default function DiagnosisHeader({ 
    title, 
    description, 
    status,
    backHref = '/diagnosis'
}: DiagnosisHeaderProps) {
    const statusLabel = status === 'not_started' ? 'Not Started' : 
                       status === 'in_progress' ? 'In Progress' : 
                       status === 'submitted' ? 'Completed' : 
                       'Submitted';
    
    const statusClasses = status === 'not_started' 
        ? 'bg-muted text-muted-foreground'
        : status === 'in_progress'
        ? 'bg-success/10 text-success' // Green badge for in_progress
        : 'bg-success/10 text-success';

    return (
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
    );
}
