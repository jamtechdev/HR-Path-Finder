import { Badge } from '@/components/ui/badge';

interface StepDataDisplayProps {
    data: Record<string, any>;
    type: 'philosophy' | 'organization' | 'performance' | 'compensation';
}

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

const relationshipLabels: Record<string, string> = {
    integrated: 'Integrated',
    separated: 'Separated',
};

const unitLabels: Record<string, string> = {
    individual: 'Individual',
    organization: 'Organizational',
    hybrid: 'Hybrid',
};

const methodLabels: Record<string, string> = {
    kpi: 'KPI',
    mbo: 'MBO',
    okr: 'OKR',
    bsc: 'BSC',
};

const typeLabels: Record<string, string> = {
    quantitative: 'Quantitative',
    qualitative: 'Qualitative',
    hybrid: 'Hybrid',
};

const scaleLabels: Record<string, string> = {
    relative: 'Relative',
    absolute: 'Absolute',
};

const structureLabels: Record<string, string> = {
    fixed: 'Fixed-pay Centered',
    mixed: 'Mixed',
    performance_based: 'Performance-pay Centered',
};

const differentiationLabels: Record<string, string> = {
    merit: 'Merit',
    incentive: 'Incentive',
    role_based: 'Role-Based',
};

const traitLabels: Record<string, string> = {
    performance_oriented: 'Performance-oriented',
    innovation_focused: 'Innovation-focused',
    quality_conscious: 'Quality-conscious',
};

export default function StepDataDisplay({ data, type }: StepDataDisplayProps) {
    if (!data) {
        return <p className="text-muted-foreground">Not completed yet</p>;
    }

    const getLabel = (key: string, value: string) => {
        const labelMaps: Record<string, Record<string, string>> = {
            organization: {
                structure_type: structureTypeLabels,
                job_grade_structure: gradeLabels,
                grade_title_relationship: relationshipLabels,
            },
            performance: {
                performance_unit: unitLabels,
                performance_method: methodLabels,
                evaluation_structure_quantitative: typeLabels,
                evaluation_structure_relative: scaleLabels,
            },
            compensation: {
                compensation_structure: structureLabels,
                differentiation_method: differentiationLabels,
            },
            philosophy: {
                main_trait: traitLabels,
                sub_trait: traitLabels,
            },
        };

        const map = labelMaps[type]?.[key];
        return map?.[value] || value || 'N/A';
    };

    if (type === 'philosophy') {
        return (
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Main Trait</p>
                    <p className="font-semibold">
                        {getLabel('main_trait', data.main_trait)}
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Sub Trait</p>
                    <p className="font-semibold">
                        {getLabel('sub_trait', data.sub_trait)}
                    </p>
                </div>
            </div>
        );
    }

    if (type === 'organization') {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Structure Type:</span>
                    <Badge variant="outline">
                        {getLabel('structure_type', data.structure_type)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Job Grade:</span>
                    <Badge variant="outline">
                        {getLabel('job_grade_structure', data.job_grade_structure)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Grade-Title:</span>
                    <Badge variant="outline">
                        {getLabel('grade_title_relationship', data.grade_title_relationship)}
                    </Badge>
                </div>
                {data.managerial_role_definition && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Managerial Criteria:</span>
                        <Badge variant="outline">
                            {Array.isArray(data.managerial_role_definition)
                                ? data.managerial_role_definition.join(', ')
                                : data.managerial_role_definition}
                        </Badge>
                    </div>
                )}
            </div>
        );
    }

    if (type === 'performance') {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Evaluation Unit:</span>
                    <Badge variant="outline">
                        {getLabel('performance_unit', data.performance_unit)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Method:</span>
                    <Badge variant="outline">
                        {getLabel('performance_method', data.performance_method)}
                    </Badge>
                </div>
                {data.evaluation_structure_quantitative && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                            {getLabel('evaluation_structure_quantitative', data.evaluation_structure_quantitative)}
                        </Badge>
                    </div>
                )}
                {data.evaluation_structure_relative && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Scale:</span>
                        <Badge variant="outline">
                            {getLabel('evaluation_structure_relative', data.evaluation_structure_relative)}
                        </Badge>
                    </div>
                )}
            </div>
        );
    }

    if (type === 'compensation') {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Structure:</span>
                    <Badge variant="outline">
                        {getLabel('compensation_structure', data.compensation_structure)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Differentiation Method:</span>
                    <Badge variant="outline">
                        {getLabel('differentiation_method', data.differentiation_method)}
                    </Badge>
                </div>
                {data.incentive_components &&
                 Array.isArray(data.incentive_components) &&
                 data.incentive_components.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Incentive Components:</span>
                        <div className="flex gap-2 flex-wrap">
                            {data.incentive_components.map((component: string, index: number) => (
                                <Badge key={index} variant="outline">
                                    {component}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
