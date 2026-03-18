import React from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Network } from 'lucide-react';
import D3TreeView from '@/components/Tree/D3TreeView';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_group?: string;
}

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
    };
    performance_management: {
        model?: string;
        cycle?: string;
        rating_scale?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
    };
    hr_system_report: {
        status: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    jobDefinitions: JobDefinition[];
    activeTab?: string;
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function CeoTreeIndex({
    project,
    stepStatuses = {},
    projectId,
    jobDefinitions,
    activeTab = 'overview',
    hrSystemSnapshot,
}: Props) {
    const finalStepStatus = stepStatuses.hr_policy_os ?? 'not_started';
    const canApproveFinalDashboard = finalStepStatus === 'submitted';
    const finalAlreadyDone = ['approved', 'locked'].includes(finalStepStatus);
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-hidden bg-background flex flex-col">
                    <Head title={`Tree - ${project.company.name}`} />
                    
                    {/* Action Buttons - Fixed at top */}
                    <div className="flex gap-4 p-4 border-b bg-background">
                        <Button 
                            variant="default"
                            size="lg"
                            onClick={() => {
                                if (!confirm('Approve Final Dashboard and lock the HR system? This cannot be undone.')) return;
                                router.post(`/ceo/hr-policy-os/${projectId}/approve`, {}, {
                                    onSuccess: () => {
                                        alert('Final Dashboard approved. HR system is locked.');
                                        router.reload();
                                    },
                                    onError: (errors) => {
                                        alert((errors as { error?: string }).error || 'Approval failed.');
                                    },
                                });
                            }}
                            disabled={!canApproveFinalDashboard || finalAlreadyDone}
                        >
                            {finalAlreadyDone ? 'Final Dashboard Approved' : canApproveFinalDashboard ? 'Approve Final Dashboard' : 'Awaiting HR submission'}
                        </Button>
                        <Button 
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                router.visit(`/ceo/report/${projectId}`, {
                                    method: 'get',
                                });
                            }}
                        >
                            Overall Review & ask for report (to consultant)
                        </Button>
                    </div>
                    
                    {/* Full Screen HR System Tree View */}
                    <div className="flex-1 overflow-hidden">
                        <D3TreeView hrSystemSnapshot={hrSystemSnapshot} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
