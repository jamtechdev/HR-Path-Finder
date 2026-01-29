import { Head, Link } from '@inertiajs/react';
import { Building2, Users, Target, Wallet, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Company {
    id: number;
    name: string;
    industry?: string | null;
    hq_location?: string | null;
}

interface CeoPhilosophy {
    id?: number;
    main_trait?: string | null;
    sub_trait?: string | null;
}

interface OrganizationDesign {
    id?: number;
    structure_type?: string | null;
    job_grade_structure?: string | null;
    grade_title_relationship?: string | null;
    managerial_role_definition?: string | null;
}

interface PerformanceSystem {
    id?: number;
    performance_unit?: string | null;
    performance_method?: string | null;
    evaluation_structure_quantitative?: string | null;
    evaluation_structure_relative?: string | null;
}

interface CompensationSystem {
    id?: number;
    compensation_structure?: string | null;
    differentiation_method?: string | null;
    incentive_components?: string[] | null;
}

interface Culture {
    id?: number;
    work_format?: string | null;
    decision_making_style?: string | null;
    core_values?: string[] | null;
}

interface Project {
    id: number;
    status: string;
    organization_design?: OrganizationDesign | null;
    performance_system?: PerformanceSystem | null;
    compensation_system?: CompensationSystem | null;
    ceo_philosophy?: CeoPhilosophy | null;
    culture?: Culture | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
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

export default function HrSystemOutput({ company, project }: PageProps) {
    if (!company || !project) {
        return (
            <div className="flex h-screen bg-background">
                <RoleBasedSidebar />
                <main className="flex-1 overflow-auto md:pt-0 pt-14 flex items-center justify-center">
                    <div>No HR system data available. Please complete all steps first.</div>
                </main>
            </div>
        );
    }

    const isComplete = project.status === 'submitted' || 
        (project.organization_design && project.performance_system && project.compensation_system);

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="HR System Overview" />

                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Link
                                href="/hr-manager/dashboard"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-0.5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-display font-bold tracking-tight">
                                        HR System Overview
                                    </h1>
                                    {isComplete && (
                                        <Badge className="bg-success/10 text-success">
                                            Complete
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    Your complete HR system at a glance
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Company Name Card */}
                        <Card className="gradient-primary text-white">
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90 mb-1">Company Name</p>
                                        <h3 className="text-xl font-bold">{company.name}</h3>
                                        <p className="text-sm opacity-80 mt-1">
                                            {company.industry || 'N/A'} • {company.hq_location || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CEO Management Philosophy */}
                        {project.ceo_philosophy && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        CEO Management Philosophy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Main Trait</p>
                                        <Badge variant="secondary" className="w-full justify-start">
                                            {project.ceo_philosophy.main_trait || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Sub Trait</p>
                                        <Badge variant="secondary" className="w-full justify-start">
                                            {project.ceo_philosophy.sub_trait || 'N/A'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Organization Structure */}
                        {project.organization_design && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Organization Structure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {project.organization_design.structure_type && (
                                            <Badge variant="secondary">
                                                {structureTypeLabels[project.organization_design.structure_type] || project.organization_design.structure_type}
                                            </Badge>
                                        )}
                                        {project.organization_design.job_grade_structure && (
                                            <Badge variant="secondary">
                                                {gradeLabels[project.organization_design.job_grade_structure] || project.organization_design.job_grade_structure}
                                            </Badge>
                                        )}
                                        {project.organization_design.grade_title_relationship && (
                                            <Badge variant="secondary">
                                                {relationshipLabels[project.organization_design.grade_title_relationship] || project.organization_design.grade_title_relationship}
                                            </Badge>
                                        )}
                                        {project.organization_design.managerial_role_definition && (
                                            <Badge variant="secondary">
                                                Team Lead
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Performance System */}
                        {project.performance_system && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Performance System
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {project.performance_system.performance_unit && (
                                            <Badge variant="secondary">
                                                {unitLabels[project.performance_system.performance_unit] || project.performance_system.performance_unit}
                                            </Badge>
                                        )}
                                        {project.performance_system.performance_method && (
                                            <Badge variant="secondary">
                                                {methodLabels[project.performance_system.performance_method] || project.performance_system.performance_method.toUpperCase()}
                                            </Badge>
                                        )}
                                        {project.performance_system.evaluation_structure_quantitative && (
                                            <Badge variant="secondary">
                                                {typeLabels[project.performance_system.evaluation_structure_quantitative] || project.performance_system.evaluation_structure_quantitative}
                                            </Badge>
                                        )}
                                        {project.performance_system.evaluation_structure_relative && (
                                            <Badge variant="secondary">
                                                {scaleLabels[project.performance_system.evaluation_structure_relative] || project.performance_system.evaluation_structure_relative}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Compensation System */}
                        {project.compensation_system && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5" />
                                        Compensation System
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {project.compensation_system.compensation_structure && (
                                            <Badge variant="secondary">
                                                {structureLabels[project.compensation_system.compensation_structure] || project.compensation_system.compensation_structure}
                                            </Badge>
                                        )}
                                        {project.compensation_system.differentiation_method && (
                                            <Badge variant="secondary">
                                                {differentiationLabels[project.compensation_system.differentiation_method] || project.compensation_system.differentiation_method}
                                            </Badge>
                                        )}
                                        {Array.isArray(project.compensation_system.incentive_components) && project.compensation_system.incentive_components.length > 0 && (
                                            <Badge variant="secondary">
                                                {project.compensation_system.incentive_components.map((id) => {
                                                    const labels: Record<string, string> = {
                                                        individual: 'Individual',
                                                        organizational: 'Organizational',
                                                        task_force: 'Task-Force',
                                                        long_term: 'Long-Term',
                                                    };
                                                    return labels[id] || id;
                                                }).join(', ')}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Culture & Values */}
                        {project.culture && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Culture & Values
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {project.culture.work_format && (
                                            <Badge variant="secondary">
                                                {project.culture.work_format}
                                            </Badge>
                                        )}
                                        {project.culture.decision_making_style && (
                                            <Badge variant="secondary">
                                                {project.culture.decision_making_style}
                                            </Badge>
                                        )}
                                        {Array.isArray(project.culture.core_values) && project.culture.core_values.length > 0 && (
                                            <Badge variant="secondary">
                                                {project.culture.core_values.slice(0, 3).join(', ')}
                                                {project.culture.core_values.length > 3 && '...'}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
