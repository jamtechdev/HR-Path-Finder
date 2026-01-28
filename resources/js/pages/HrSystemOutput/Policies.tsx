import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Building2, Target, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Company {
    id: number;
    name: string;
}

interface OrganizationDesign {
    structure_type?: string | null;
    job_grade_structure?: string | null;
    grade_title_relationship?: string | null;
    managerial_role_definition?: string | null;
}

interface PerformanceSystem {
    performance_method?: string | null;
    performance_unit?: string | null;
    evaluation_structure_quantitative?: string | null;
    evaluation_structure_relative?: string | null;
}

interface CompensationSystem {
    compensation_structure?: string | null;
    differentiation_method?: string | null;
    incentive_components?: string[] | null;
}

interface PageProps {
    project: {
        id: number;
        status: string;
    };
    company: Company | null;
    organization_design: OrganizationDesign | null;
    performance_system: PerformanceSystem | null;
    compensation_system: CompensationSystem | null;
}

const structureTypeLabels: Record<string, string> = {
    functional: 'Functional Structure',
    team: 'Team-based Structure',
    divisional: 'Divisional Structure',
    matrix: 'Matrix Structure',
};

const methodLabels: Record<string, string> = {
    kpi: 'Key Performance Indicators (KPI)',
    mbo: 'Management by Objectives (MBO)',
    okr: 'Objectives and Key Results (OKR)',
    bsc: 'Balanced Scorecard (BSC)',
};

const compensationLabels: Record<string, string> = {
    fixed: 'Fixed-pay Centered Structure',
    mixed: 'Fixed + Variable Mix Structure',
    performance_based: 'Performance-pay Centered Structure',
};

export default function HrPolicies({
    project,
    company,
    organization_design,
    performance_system,
    compensation_system,
}: PageProps) {
    if (!company) {
        return (
            <div className="flex h-screen bg-background">
                <RoleBasedSidebar />
                <main className="flex-1 overflow-auto md:pt-0 pt-14 flex items-center justify-center">
                    <div>No HR system data available. Please complete all steps first.</div>
                </main>
            </div>
        );
    }

    const isComplete = project.status === 'locked' || 
        (organization_design && performance_system && compensation_system);

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="HR Policies & Manuals" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Link
                                href={`/hr-projects/${project.id}/dashboard`}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-0.5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-8 h-8 text-primary" />
                                    <h1 className="text-3xl font-display font-bold tracking-tight">
                                        HR Policies & Manuals
                                    </h1>
                                    {isComplete && (
                                        <Badge className="bg-success/10 text-success">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Finalized
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    Comprehensive HR policies and manuals based on your system design
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {company.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Organization Structure Policy */}
                    {organization_design && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Organization Structure Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">1. Organizational Structure</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {company.name} adopts a{' '}
                                        <span className="font-medium">
                                            {structureTypeLabels[organization_design.structure_type || ''] ||
                                                organization_design.structure_type}
                                        </span>
                                        {' '}organizational structure.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Policy Statement:</strong> The organizational structure defines how
                                            roles, responsibilities, and reporting relationships are organized within the
                                            company. All employees must understand their position within this structure
                                            and report through the designated channels.
                                        </p>
                                    </div>
                                </div>

                                {organization_design.job_grade_structure && (
                                    <div>
                                        <h3 className="font-semibold mb-2">2. Job Grade Structure</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            The company utilizes a{' '}
                                            <span className="font-medium capitalize">
                                                {organization_design.job_grade_structure}-grade structure
                                            </span>
                                            {' '}for position classification and career progression.
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> Job grades provide a framework for
                                                understanding position levels, compensation ranges, and career advancement
                                                opportunities. All positions are assigned to appropriate grades based on
                                                responsibilities, required skills, and impact.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {organization_design.grade_title_relationship && (
                                    <div>
                                        <h3 className="font-semibold mb-2">3. Grade-Title Relationship</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            The relationship between job grades and titles is{' '}
                                            <span className="font-medium capitalize">
                                                {organization_design.grade_title_relationship}
                                            </span>
                                            .
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> This structure ensures consistency
                                                in how job titles relate to grade levels, providing clarity for
                                                employees and managers in understanding position hierarchy and
                                                expectations.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Performance Management Policy */}
                    {performance_system && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Performance Management Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">1. Performance Evaluation Framework</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {company.name} uses{' '}
                                        <span className="font-medium">
                                            {methodLabels[performance_system.performance_method || ''] ||
                                                performance_system.performance_method?.toUpperCase()}
                                        </span>
                                        {' '}as the primary performance management method.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Policy Statement:</strong> All employees are evaluated using the
                                            established performance management framework. Performance evaluations are
                                            conducted regularly to assess progress, provide feedback, and identify
                                            development opportunities.
                                        </p>
                                    </div>
                                </div>

                                {performance_system.performance_unit && (
                                    <div>
                                        <h3 className="font-semibold mb-2">2. Performance Evaluation Unit</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Performance is evaluated at the{' '}
                                            <span className="font-medium capitalize">
                                                {performance_system.performance_unit}
                                            </span>
                                            {' '}level.
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> This approach ensures that performance
                                                measurement aligns with organizational goals and provides appropriate
                                                recognition for individual and/or team contributions.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {performance_system.evaluation_structure_quantitative && (
                                    <div>
                                        <h3 className="font-semibold mb-2">3. Evaluation Structure</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Evaluations combine{' '}
                                            <span className="font-medium capitalize">
                                                {performance_system.evaluation_structure_quantitative}
                                            </span>
                                            {' '}assessment methods
                                            {performance_system.evaluation_structure_relative && ` with ${performance_system.evaluation_structure_relative} comparison`}.
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> The evaluation structure ensures
                                                comprehensive assessment of performance using both measurable metrics
                                                and qualitative observations, providing a balanced view of employee
                                                contributions.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Compensation Policy */}
                    {compensation_system && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Compensation Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">1. Compensation Structure</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {company.name} follows a{' '}
                                        <span className="font-medium">
                                            {compensationLabels[compensation_system.compensation_structure || ''] ||
                                                compensation_system.compensation_structure?.replace('_', ' ')}
                                        </span>
                                        {' '}approach to compensation.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Policy Statement:</strong> Compensation is designed to attract,
                                            retain, and motivate employees while ensuring internal equity and external
                                            competitiveness. The structure balances base pay with performance-based
                                            components as appropriate.
                                        </p>
                                    </div>
                                </div>

                                {compensation_system.differentiation_method && (
                                    <div>
                                        <h3 className="font-semibold mb-2">2. Pay Differentiation Method</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Pay differentiation is based on{' '}
                                            <span className="font-medium capitalize">
                                                {compensation_system.differentiation_method.replace('_', ' ')}
                                            </span>
                                            .
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> This method ensures that compensation
                                                differences reflect performance, role requirements, and contribution
                                                levels, maintaining fairness and motivation across the organization.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {compensation_system.incentive_components &&
                                 Array.isArray(compensation_system.incentive_components) &&
                                 compensation_system.incentive_components.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">3. Incentive Components</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            The compensation structure includes the following incentive components:{' '}
                                            <span className="font-medium">
                                                {compensation_system.incentive_components
                                                    .map((c: string) => c.replace('_', ' '))
                                                    .join(', ')}
                                            </span>
                                            .
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm">
                                                <strong>Policy Statement:</strong> These incentive components are
                                                designed to reward performance and align employee interests with
                                                organizational goals. Eligibility and payout criteria are clearly
                                                defined and communicated to all eligible employees.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Grade & Title Policy */}
                    {organization_design && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Job Grade & Title Policy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">1. Job Classification</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        All positions are classified according to the established job grade structure,
                                        which provides a clear framework for understanding position levels and
                                        responsibilities.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Policy Statement:</strong> Job grades serve as the foundation for
                                            compensation, career progression, and organizational structure. Each position
                                            is assigned to a specific grade based on factors including scope of
                                            responsibility, required qualifications, and impact on organizational
                                            outcomes.
                                        </p>
                                    </div>
                                </div>

                                {organization_design.managerial_role_definition && (
                                    <div>
                                        <h3 className="font-semibold mb-2">2. Managerial Role Definition</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Managerial roles are defined as follows:
                                        </p>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm whitespace-pre-wrap">
                                                {organization_design.managerial_role_definition}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold mb-2">3. Career Progression</h3>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Policy Statement:</strong> Career progression is supported through
                                            the job grade structure, with clear pathways for advancement. Employees are
                                            encouraged to develop skills and capabilities that align with higher-grade
                                            positions. Promotions and grade changes are based on demonstrated
                                            performance, competency development, and business needs.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground py-4 border-t">
                        <p>These policies are based on the HR system design completed through the HR Copilot platform.</p>
                        <p className="mt-1">For questions or clarifications, please contact your HR Manager or Consultant.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
