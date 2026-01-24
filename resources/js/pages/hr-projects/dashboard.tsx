import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HRSystemOverview } from '@/components/hr/HRSystemOverview';
import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
    project: {
        id: number;
        company?: {
            name?: string;
            logo_path?: string;
        };
        company_attributes?: any;
        organizational_sentiment?: any;
        ceo_philosophy?: {
            main_trait?: string;
            sub_trait?: string;
        };
        organization_design?: {
            structure_type?: string;
        };
        performance_system?: {
            performance_method?: string;
        };
        compensation_system?: {
            compensation_structure?: string;
        };
    };
    alignmentScore?: string;
}

export default function HrSystemDashboard({ project, alignmentScore = 'Medium' }: Props) {
    const steps = [
        { id: 1, name: 'Diagnosis', completed: !!project.company_attributes },
        { id: 2, name: 'Organization', completed: !!project.organization_design },
        { id: 3, name: 'Performance', completed: !!project.performance_system },
        { id: 4, name: 'Compensation', completed: !!project.compensation_system },
    ];

    return (
        <AppLayout>
            <Head title="HR System Overview Dashboard" />
            <div className="container mx-auto max-w-7xl py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">HR System Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Complete consultant-style summary of your HR system design
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Management Philosophy */}
                        {project.ceo_philosophy && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>CEO Management Philosophy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">Main Trait:</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {project.ceo_philosophy.main_trait?.replace('_', ' ')}
                                        </p>
                                        {project.ceo_philosophy.sub_trait && (
                                            <>
                                                <p className="font-semibold mt-4">Sub Trait:</p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {project.ceo_philosophy.sub_trait}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Organization Structure */}
                        {project.organization_design && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization & Job Structure</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">Structure Type:</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {project.organization_design.structure_type}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Performance System */}
                        {project.performance_system && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">Performance Method:</p>
                                        <p className="text-sm text-muted-foreground uppercase">
                                            {project.performance_system.performance_method}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Compensation System */}
                        {project.compensation_system && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">Compensation Structure:</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {project.compensation_system.compensation_structure?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div>
                        <HRSystemOverview steps={steps} alignmentScore={alignmentScore} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
