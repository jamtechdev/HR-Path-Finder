import { Head } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SummaryCards from '@/components/Dashboard/Consultant/SummaryCards';
import ActiveCompaniesList from '@/components/Dashboard/Consultant/ActiveCompaniesList';
import WorkflowStatus from '@/components/Dashboard/Consultant/WorkflowStatus';
import ReviewRequiredSection from '@/components/Dashboard/Consultant/ReviewRequiredSection';

interface ActiveCompany {
    id: number;
    name: string;
    industry?: string | null;
    project_id: number;
    step_statuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
}

interface ProjectWithSteps {
    id: number;
    company_name: string;
}

interface PageProps {
    activeCompanies?: ActiveCompany[];
    needsReview?: ProjectWithSteps[];
    workflowStatus?: {
        step1: number;
        step2: number;
        step3: number;
        step4: number;
    };
    stats?: {
        active_companies: number;
        steps_complete: string;
        ceo_survey_status: string;
        final_status: string;
        pending_reviews: number;
        completed_reviews: number;
    };
}

export default function ConsultantDashboard({
    activeCompanies = [],
    needsReview = [],
    workflowStatus = {
        step1: 0,
        step2: 0,
        step3: 0,
        step4: 0,
    },
    stats = {
        active_companies: 0,
        steps_complete: '0/0',
        ceo_survey_status: 'pending',
        final_status: 'none',
        pending_reviews: 0,
        completed_reviews: 0,
    },
}: PageProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Consultant Dashboard" />
                    
                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                        <DashboardHeader
                            title="Consultant Dashboard"
                            subtitle="Monitor and review HR system designs across companies"
                            breadcrumbs={[
                                { title: 'Consultant Dashboard' }
                            ]}
                        />

                        <SummaryCards stats={stats} />

                        {activeCompanies.length > 0 && (
                            <ActiveCompaniesList companies={activeCompanies} />
                        )}

                        <WorkflowStatus workflowStatus={workflowStatus} />

                        <ReviewRequiredSection needsReview={needsReview} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
