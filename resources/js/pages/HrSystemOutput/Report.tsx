import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Building2, Users, Target, DollarSign, CheckCircle2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Company {
    id: number;
    name: string;
    industry?: string | null;
    hq_location?: string | null;
    foundation_date?: string | null;
}

interface CeoPhilosophy {
    main_trait?: string | null;
    sub_trait?: string | null;
}

interface OrganizationDesign {
    structure_type?: string | null;
    job_grade_structure?: string | null;
    grade_title_relationship?: string | null;
    managerial_role_definition?: string | null;
}

interface PerformanceSystem {
    performance_unit?: string | null;
    performance_method?: string | null;
    evaluation_structure_quantitative?: string | null;
    evaluation_structure_relative?: string | null;
}

interface CompensationSystem {
    compensation_structure?: string | null;
    differentiation_method?: string | null;
    incentive_components?: string[] | null;
}

interface ConsultantReview {
    id: number;
    opinions?: string | null;
    risk_notes?: string | null;
    alignment_observations?: string | null;
    reviewed_at?: string | null;
}

interface PageProps {
    project: {
        id: number;
        status: string;
    };
    company: Company | null;
    diagnosis: any;
    ceo_philosophy: CeoPhilosophy | null;
    organization_design: OrganizationDesign | null;
    performance_system: PerformanceSystem | null;
    compensation_system: CompensationSystem | null;
    consultant_reviews: ConsultantReview[];
    ceo_approvals: any[];
}

const structureTypeLabels: Record<string, string> = {
    functional: 'Functional',
    team: 'Team-based',
    divisional: 'Divisional',
    matrix: 'Matrix',
};

const methodLabels: Record<string, string> = {
    kpi: 'KPI (Key Performance Indicators)',
    mbo: 'MBO (Management by Objectives)',
    okr: 'OKR (Objectives and Key Results)',
    bsc: 'BSC (Balanced Scorecard)',
};

const compensationLabels: Record<string, string> = {
    fixed: 'Fixed-pay Centered',
    mixed: 'Fixed + Variable Mix',
    performance_based: 'Performance-pay Centered',
};

export default function HrReport({
    project,
    company,
    diagnosis,
    ceo_philosophy,
    organization_design,
    performance_system,
    compensation_system,
    consultant_reviews,
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
                <Head title="HR System Report" />

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
                                    <FileText className="w-8 h-8 text-primary" />
                                    <h1 className="text-3xl font-display font-bold tracking-tight">
                                        HR System Report
                                    </h1>
                                    {isComplete && (
                                        <Badge className="bg-success/10 text-success">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Finalized
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    Analyst-style comprehensive report of your HR system design
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {company.name} • Generated {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Company Overview</h3>
                                <p className="text-sm text-muted-foreground">
                                    {company.name} operates in the {company.industry || 'N/A'} industry
                                    {company.hq_location && `, headquartered in ${company.hq_location}`}.
                                    {company.foundation_date && ` Founded in ${new Date(company.foundation_date).getFullYear()}.`}
                                </p>
                            </div>

                            {ceo_philosophy?.main_trait && (
                                <div>
                                    <h3 className="font-semibold mb-2">Management Philosophy</h3>
                                    <p className="text-sm text-muted-foreground">
                                        The CEO demonstrates a <span className="font-medium capitalize">
                                            {ceo_philosophy.main_trait.replace('_', ' ')}
                                        </span> management style
                                        {ceo_philosophy.sub_trait && ` with ${ceo_philosophy.sub_trait} characteristics`}.
                                        This philosophy serves as the foundation for all HR system design decisions.
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold mb-2">System Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {organization_design && (
                                        <Badge variant="secondary">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            Organization Design Complete
                                        </Badge>
                                    )}
                                    {performance_system && (
                                        <Badge variant="secondary">
                                            <Target className="w-3 h-3 mr-1" />
                                            Performance System Complete
                                        </Badge>
                                    )}
                                    {compensation_system && (
                                        <Badge variant="secondary">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            Compensation System Complete
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diagnostic Findings */}
                    {diagnosis && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Diagnostic Findings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {diagnosis.company_attributes && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Company Attributes</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {diagnosis.company_attributes.job_standardization_level && (
                                                <div>
                                                    <span className="text-muted-foreground">Job Standardization:</span>
                                                    <p className="font-medium">
                                                        {diagnosis.company_attributes.job_standardization_level}/5
                                                    </p>
                                                </div>
                                            )}
                                            {diagnosis.company_attributes.performance_measurability && (
                                                <div>
                                                    <span className="text-muted-foreground">Performance Measurability:</span>
                                                    <p className="font-medium">
                                                        {diagnosis.company_attributes.performance_measurability}/5
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {diagnosis.organizational_sentiment && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Organizational Sentiment</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {diagnosis.organizational_sentiment.openness_to_change && (
                                                <div>
                                                    <span className="text-muted-foreground">Openness to Change:</span>
                                                    <p className="font-medium">
                                                        {diagnosis.organizational_sentiment.openness_to_change}/5
                                                    </p>
                                                </div>
                                            )}
                                            {diagnosis.organizational_sentiment.trust_level && (
                                                <div>
                                                    <span className="text-muted-foreground">Trust Level:</span>
                                                    <p className="font-medium">
                                                        {diagnosis.organizational_sentiment.trust_level}/5
                                                    </p>
                                                </div>
                                            )}
                                            {diagnosis.organizational_sentiment.reward_sensitivity && (
                                                <div>
                                                    <span className="text-muted-foreground">Reward Sensitivity:</span>
                                                    <p className="font-medium">
                                                        {diagnosis.organizational_sentiment.reward_sensitivity}/5
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* System Design Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Design Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Organization Design */}
                            {organization_design && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Organization Structure & Job Grade Design
                                    </h3>
                                    <div className="space-y-2 text-sm pl-7">
                                        {organization_design.structure_type && (
                                            <div>
                                                <span className="text-muted-foreground">Structure Type: </span>
                                                <span className="font-medium">
                                                    {structureTypeLabels[organization_design.structure_type] ||
                                                        organization_design.structure_type}
                                                </span>
                                            </div>
                                        )}
                                        {organization_design.job_grade_structure && (
                                            <div>
                                                <span className="text-muted-foreground">Job Grade Structure: </span>
                                                <span className="font-medium capitalize">
                                                    {organization_design.job_grade_structure}
                                                </span>
                                            </div>
                                        )}
                                        {organization_design.grade_title_relationship && (
                                            <div>
                                                <span className="text-muted-foreground">Grade-Title Relationship: </span>
                                                <span className="font-medium capitalize">
                                                    {organization_design.grade_title_relationship}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Performance System */}
                            {performance_system && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Performance System Design
                                    </h3>
                                    <div className="space-y-2 text-sm pl-7">
                                        {performance_system.performance_unit && (
                                            <div>
                                                <span className="text-muted-foreground">Performance Unit: </span>
                                                <span className="font-medium capitalize">
                                                    {performance_system.performance_unit}
                                                </span>
                                            </div>
                                        )}
                                        {performance_system.performance_method && (
                                            <div>
                                                <span className="text-muted-foreground">Performance Method: </span>
                                                <span className="font-medium">
                                                    {methodLabels[performance_system.performance_method] ||
                                                        performance_system.performance_method.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {performance_system.evaluation_structure_quantitative && (
                                            <div>
                                                <span className="text-muted-foreground">Evaluation Structure: </span>
                                                <span className="font-medium capitalize">
                                                    {performance_system.evaluation_structure_quantitative}
                                                    {performance_system.evaluation_structure_relative && ` / ${performance_system.evaluation_structure_relative}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Compensation System */}
                            {compensation_system && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Compensation System Design
                                    </h3>
                                    <div className="space-y-2 text-sm pl-7">
                                        {compensation_system.compensation_structure && (
                                            <div>
                                                <span className="text-muted-foreground">Compensation Structure: </span>
                                                <span className="font-medium">
                                                    {compensationLabels[compensation_system.compensation_structure] ||
                                                        compensation_system.compensation_structure.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                        {compensation_system.differentiation_method && (
                                            <div>
                                                <span className="text-muted-foreground">Differentiation Method: </span>
                                                <span className="font-medium capitalize">
                                                    {compensation_system.differentiation_method.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                        {compensation_system.incentive_components && 
                                         Array.isArray(compensation_system.incentive_components) &&
                                         compensation_system.incentive_components.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Incentive Components: </span>
                                                <span className="font-medium">
                                                    {compensation_system.incentive_components
                                                        .map((c: string) => c.replace('_', ' '))
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Consultant Recommendations */}
                    {consultant_reviews && consultant_reviews.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultant Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {consultant_reviews.map((review) => (
                                    <div key={review.id} className="border-l-4 border-primary pl-4 space-y-3">
                                        {review.opinions && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1">Consulting Opinions</h4>
                                                <p className="text-sm text-muted-foreground">{review.opinions}</p>
                                            </div>
                                        )}
                                        {review.risk_notes && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1 text-orange-600">Risk Notes</h4>
                                                <p className="text-sm text-muted-foreground">{review.risk_notes}</p>
                                            </div>
                                        )}
                                        {review.alignment_observations && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1 text-green-600">Alignment Observations</h4>
                                                <p className="text-sm text-muted-foreground">{review.alignment_observations}</p>
                                            </div>
                                        )}
                                        {review.reviewed_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Reviewed: {new Date(review.reviewed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground py-4 border-t">
                        <p>This report is generated based on the HR system design completed through the HR Copilot platform.</p>
                        <p className="mt-1">For questions or clarifications, please contact your consultant.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
