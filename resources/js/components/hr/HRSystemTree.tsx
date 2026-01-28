import { Building2, Target, DollarSign, Users, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HRSystemTreeProps {
    ceoPhilosophy?: {
        main_trait?: string | null;
        sub_trait?: string | null;
    } | null;
    organizationDesign?: {
        structure_type?: string | null;
        job_grade_structure?: string | null;
        grade_title_relationship?: string | null;
    } | null;
    performanceSystem?: {
        performance_method?: string | null;
        performance_unit?: string | null;
    } | null;
    compensationSystem?: {
        compensation_structure?: string | null;
        differentiation_method?: string | null;
    } | null;
    isLocked?: boolean;
    companyLogo?: string | null;
    companyName?: string;
}

const structureTypeLabels: Record<string, string> = {
    functional: 'Functional',
    team: 'Team-based',
    divisional: 'Divisional',
    matrix: 'Matrix',
};

const methodLabels: Record<string, string> = {
    kpi: 'KPI',
    mbo: 'MBO',
    okr: 'OKR',
    bsc: 'BSC',
};

const compensationLabels: Record<string, string> = {
    fixed: 'Fixed-pay Centered',
    mixed: 'Fixed + Variable',
    performance_based: 'Performance-pay Centered',
};

export function HRSystemTree({
    ceoPhilosophy,
    organizationDesign,
    performanceSystem,
    compensationSystem,
    isLocked = false,
    companyLogo,
    companyName,
}: HRSystemTreeProps) {
    const nodes = [
        {
            id: 'philosophy',
            label: 'Management Philosophy',
            icon: Users,
            completed: !!ceoPhilosophy?.main_trait,
            data: ceoPhilosophy,
            color: 'from-blue-500 to-blue-600',
        },
        {
            id: 'organization',
            label: 'Organization Structure',
            icon: Building2,
            completed: !!organizationDesign?.structure_type,
            data: organizationDesign,
            color: 'from-green-500 to-green-600',
        },
        {
            id: 'performance',
            label: 'Performance System',
            icon: Target,
            completed: !!performanceSystem?.performance_method,
            data: performanceSystem,
            color: 'from-purple-500 to-purple-600',
        },
        {
            id: 'compensation',
            label: 'Compensation System',
            icon: DollarSign,
            completed: !!compensationSystem?.compensation_structure,
            data: compensationSystem,
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <div className="w-full">
            {/* Company Logo & Name Header */}
            {(companyLogo || companyName) && (
                <div className="mb-8 text-center">
                    {companyLogo && (
                        <img
                            src={`/storage/${companyLogo}`}
                            alt={companyName || 'Company Logo'}
                            className="h-20 w-20 mx-auto mb-4 rounded-lg object-contain"
                        />
                    )}
                    {companyName && (
                        <h2 className="text-2xl font-bold text-foreground">{companyName}</h2>
                    )}
                </div>
            )}

            {/* Technology Tree Visualization */}
            <div className="relative">
                {/* Tree Container */}
                <div className="space-y-6">
                    {nodes.map((node, index) => {
                        const Icon = node.icon;
                        const isLast = index === nodes.length - 1;
                        const prevCompleted = index === 0 || nodes[index - 1].completed;

                        return (
                            <div key={node.id} className="relative">
                                {/* Connection Line */}
                                {!isLast && (
                                    <div
                                        className={`absolute left-1/2 top-16 w-0.5 h-6 -translate-x-1/2 ${
                                            node.completed && prevCompleted
                                                ? 'bg-gradient-to-b from-green-500 to-green-400'
                                                : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    />
                                )}

                                {/* Node Card */}
                                <Card
                                    className={`relative transition-all duration-300 ${
                                        node.completed
                                            ? 'border-green-500/30 bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-gray-800 shadow-lg'
                                            : isLocked || !prevCompleted
                                            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex-shrink-0 p-3 rounded-lg ${
                                                    node.completed
                                                        ? 'bg-gradient-to-br ' + node.color + ' text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {node.label}
                                                    </h3>
                                                    {node.completed ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    ) : isLocked || !prevCompleted ? (
                                                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                                    )}
                                                </div>

                                                {/* Status Badge */}
                                                <div className="mb-3">
                                                    <Badge
                                                        variant={
                                                            node.completed
                                                                ? 'default'
                                                                : isLocked || !prevCompleted
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                        className={
                                                            node.completed
                                                                ? 'bg-green-500 text-white'
                                                                : ''
                                                        }
                                                    >
                                                        {node.completed
                                                            ? 'Completed'
                                                            : isLocked || !prevCompleted
                                                            ? 'Locked'
                                                            : 'Pending'}
                                                    </Badge>
                                                </div>

                                                {/* Data Display */}
                                                {node.completed && node.data && (
                                                    <div className="space-y-2 mt-3">
                                                        {node.id === 'philosophy' && (
                                                            <>
                                                                {node.data.main_trait && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Main Trait:
                                                                        </span>
                                                                        <p className="text-sm font-medium capitalize">
                                                                            {node.data.main_trait.replace('_', ' ')}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {node.data.sub_trait && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Sub Trait:
                                                                        </span>
                                                                        <p className="text-sm font-medium capitalize">
                                                                            {node.data.sub_trait}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {node.id === 'organization' && (
                                                            <>
                                                                {node.data.structure_type && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Structure:
                                                                        </span>
                                                                        <p className="text-sm font-medium">
                                                                            {structureTypeLabels[node.data.structure_type] ||
                                                                                node.data.structure_type}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {node.data.job_grade_structure && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Grade Structure:
                                                                        </span>
                                                                        <p className="text-sm font-medium capitalize">
                                                                            {node.data.job_grade_structure}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {node.id === 'performance' && (
                                                            <>
                                                                {node.data.performance_method && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Method:
                                                                        </span>
                                                                        <p className="text-sm font-medium">
                                                                            {methodLabels[node.data.performance_method] ||
                                                                                node.data.performance_method.toUpperCase()}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {node.data.performance_unit && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Unit:
                                                                        </span>
                                                                        <p className="text-sm font-medium capitalize">
                                                                            {node.data.performance_unit}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {node.id === 'compensation' && (
                                                            <>
                                                                {node.data.compensation_structure && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Structure:
                                                                        </span>
                                                                        <p className="text-sm font-medium">
                                                                            {compensationLabels[node.data.compensation_structure] ||
                                                                                node.data.compensation_structure.replace('_', ' ')}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {node.data.differentiation_method && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Differentiation:
                                                                        </span>
                                                                        <p className="text-sm font-medium capitalize">
                                                                            {node.data.differentiation_method.replace('_', ' ')}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Missing Step Indicator */}
                                                {!node.completed && !isLocked && prevCompleted && (
                                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                                        Waiting for completion...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* System Locked Indicator */}
                {isLocked && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                HR System Locked
                            </p>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            This HR system has been finalized and approved. No further changes can be made.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
