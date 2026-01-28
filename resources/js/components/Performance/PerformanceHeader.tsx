import { Link } from '@inertiajs/react';
import { ChevronLeft, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceHeaderProps {
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'submitted';
    backHref?: string;
    organizationDesign?: {
        structure_type?: string | null;
        job_grade_structure?: string | null;
    } | null;
}

export default function PerformanceHeader({ 
    title, 
    description, 
    status,
    backHref = '/step3',
    organizationDesign
}: PerformanceHeaderProps) {
    const statusLabel = status === 'not_started' ? 'Not Started' : 
                       status === 'in_progress' ? 'In Progress' : 
                       'Submitted';
    
    const statusClasses = status === 'not_started' 
        ? 'bg-muted text-muted-foreground'
        : status === 'in_progress'
        ? 'bg-primary/10 text-primary'
        : 'bg-success/10 text-success';

    const structureTypeLabels: Record<string, string> = {
        functional: 'Functional',
        team: 'Team-based',
        divisional: 'Divisional',
        matrix: 'Matrix',
    };

    const gradeLabels: Record<string, string> = {
        single: 'Single',
        multi: 'Multi',
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

            {/* Organization Structure (Read-only) */}
            {organizationDesign && (organizationDesign.structure_type || organizationDesign.job_grade_structure) && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Organization Structure (Read-only)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Structure: <strong>{organizationDesign.structure_type ? structureTypeLabels[organizationDesign.structure_type] || organizationDesign.structure_type : 'N/A'}</strong> | Grade: <strong>{organizationDesign.job_grade_structure ? gradeLabels[organizationDesign.job_grade_structure] || organizationDesign.job_grade_structure : 'N/A'}</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
