import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, User, Building2, Target, Wallet } from 'lucide-react';
import CompanyInfoCard from '@/components/HRSystem/CompanyInfoCard';
import StepOverviewCard from '@/components/HRSystem/StepOverviewCard';
import type { StepStatuses, VerifiedSteps, Company, HrProject } from '@/types/dashboard';

interface PageProps {
    project: HrProject & {
        company?: Company | null;
        ceo_philosophy?: {
            main_trait?: string | null;
            sub_trait?: string | null;
            completed_at?: string | null;
        } | null;
        organization_design?: any;
        performance_system?: any;
        compensation_system?: any;
    };
    stepStatuses: StepStatuses;
    verifiedSteps: VerifiedSteps;
}

export default function HrSystemOverview({ project, stepStatuses, verifiedSteps }: PageProps) {
    const allStepsComplete = Object.values(stepStatuses).every(status =>
        status === 'submitted' || status === 'completed'
    );

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="HR System Overview" />

                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-0.5"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-display font-bold tracking-tight">
                                            HR System Overview
                                        </h1>
                                        {allStepsComplete && (
                                            <Badge className="bg-green-500 text-white">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
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

                        <CompanyInfoCard company={project.company || null} />

                        <StepOverviewCard
                            title="CEO Management Philosophy"
                            icon={User}
                            isVerified={verifiedSteps.diagnosis}
                            type="philosophy"
                            data={project.ceo_philosophy}
                        />

                        <StepOverviewCard
                            title="Organization Structure"
                            icon={Building2}
                            isVerified={verifiedSteps.organization}
                            type="organization"
                            data={project.organization_design}
                        />

                        <StepOverviewCard
                            title="Performance System"
                            icon={Target}
                            isVerified={verifiedSteps.performance}
                            type="performance"
                            data={project.performance_system}
                        />

                        <StepOverviewCard
                            title="Compensation System"
                            icon={Wallet}
                            isVerified={verifiedSteps.compensation}
                            type="compensation"
                            data={project.compensation_system}
                        />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
