import { Head, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import PhilosophySurveyCard from '@/components/Dashboard/CEO/PhilosophySurveyCard';
import HRSystemProgressCard from '@/components/Dashboard/CEO/HRSystemProgressCard';
import type { StepStatuses, VerifiedSteps, HrProject } from '@/types/dashboard';
import type { StepKey } from '@/types/workflow';

interface PageProps {
    project?: HrProject | null;
    stepStatuses?: StepStatuses;
    verifiedSteps?: VerifiedSteps;
    pendingVerifications?: string[];
    ceoPhilosophyStatus?: 'not_started' | 'in_progress' | 'completed';
    noCompany?: boolean;
    message?: string;
}

export default function CEODashboard({
    project,
    stepStatuses = {
        diagnosis: 'not_started',
        organization: 'not_started',
        performance: 'not_started',
        compensation: 'not_started',
    },
    verifiedSteps = {
        diagnosis: false,
        organization: false,
        performance: false,
        compensation: false,
    },
    pendingVerifications = [],
    ceoPhilosophyStatus = 'not_started',
    noCompany = false,
    message,
}: PageProps) {
    const handleVerify = (step: StepKey) => {
        if (project) {
            router.post(`/hr-projects/${project.id}/verify/${step}`, {}, {
                preserveScroll: true,
            });
        }
    };

    if (noCompany) {
        return (
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-auto">
                        <Head title="CEO Dashboard" />
                        <div className="p-6 md:p-8 max-w-7xl mx-auto">
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-muted-foreground">{message}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="CEO Dashboard" />
                    
                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                        <DashboardHeader
                            title="CEO Dashboard"
                            subtitle="Review and approve HR system design"
                            breadcrumbs={[
                                { title: 'CEO Dashboard' }
                            ]}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <PhilosophySurveyCard
                                project={project}
                                ceoPhilosophyStatus={ceoPhilosophyStatus}
                            />
                            <HRSystemProgressCard
                                stepStatuses={stepStatuses}
                                verifiedSteps={verifiedSteps}
                                pendingVerifications={pendingVerifications}
                                project={project}
                                onVerify={handleVerify}
                            />
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
