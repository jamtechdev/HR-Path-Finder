import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HRSystemTree } from '@/components/hr/HRSystemTree';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, ArrowRight } from 'lucide-react';

interface Props {
    project: {
        id: number;
        status?: string;
        company?: {
            id?: number;
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
            job_grade_structure?: string;
            grade_title_relationship?: string;
        };
        performance_system?: {
            performance_method?: string;
            performance_unit?: string;
        };
        compensation_system?: {
            compensation_structure?: string;
            differentiation_method?: string;
        };
    };
    alignmentScore?: string;
}

export default function HrSystemDashboard({ project, alignmentScore = 'Medium' }: Props) {
    const isLocked = project.status === 'locked';

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

                {/* Technology Tree Visualization */}
                <div className="mb-8">
                    <HRSystemTree
                        ceoPhilosophy={project.ceo_philosophy}
                        organizationDesign={project.organization_design}
                        performanceSystem={project.performance_system}
                        compensationSystem={project.compensation_system}
                        isLocked={isLocked}
                        companyLogo={project.company?.logo_path}
                        companyName={project.company?.name}
                    />
                </div>

                {/* Output Layer Links */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                HR Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                View detailed analyst-style HR system report
                            </p>
                            <Link href={`/hr-projects/${project.id}/report`}>
                                <Button variant="outline" className="w-full">
                                    View Report
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                HR Policies & Manuals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Review HR policies and manuals based on your system design
                            </p>
                            <Link href={`/hr-projects/${project.id}/policies`}>
                                <Button variant="outline" className="w-full">
                                    View Policies
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
