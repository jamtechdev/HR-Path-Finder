import React from 'react';
import { Head } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle2 } from 'lucide-react';

interface HrSystem {
    project: {
        id: number;
        status: string;
        step_statuses: Record<string, string>;
    };
    company: {
        name: string;
    };
    management_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    organization_structure: {
        structure_type?: string;
        job_grade_structure?: string;
    };
    performance_system: {
        evaluation_unit?: string;
        performance_method?: string;
        evaluation_logic?: string;
    };
    compensation_system: {
        compensation_structure?: string;
        incentive_types?: string[];
    };
    is_locked: boolean;
}

interface Props {
    hrSystem: HrSystem;
}

export default function HrSystemOverview({ hrSystem }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="HR System Overview" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">{hrSystem.company.name} - HR System</h1>
                                {hrSystem.is_locked && (
                                    <div className="flex items-center gap-2 mt-2 text-green-600">
                                        <Lock className="h-4 w-4" />
                                        <span className="text-sm font-medium">System Locked</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Management Philosophy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.management_philosophy.main_trait ? (
                                        <div className="space-y-2">
                                            <p><strong>Main Trait:</strong> {hrSystem.management_philosophy.main_trait}</p>
                                            {hrSystem.management_philosophy.secondary_trait && (
                                                <p><strong>Secondary Trait:</strong> {hrSystem.management_philosophy.secondary_trait}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Not completed</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization Structure</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.organization_structure.structure_type ? (
                                        <div className="space-y-2">
                                            <p><strong>Structure Type:</strong> {hrSystem.organization_structure.structure_type}</p>
                                            {hrSystem.organization_structure.job_grade_structure && (
                                                <p><strong>Job Grade Structure:</strong> {hrSystem.organization_structure.job_grade_structure}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Not completed</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.performance_system.performance_method ? (
                                        <div className="space-y-2">
                                            <p><strong>Method:</strong> {hrSystem.performance_system.performance_method}</p>
                                            <p><strong>Evaluation Unit:</strong> {hrSystem.performance_system.evaluation_unit}</p>
                                            <p><strong>Logic:</strong> {hrSystem.performance_system.evaluation_logic}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Not completed</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.compensation_system.compensation_structure ? (
                                        <div className="space-y-2">
                                            <p><strong>Structure:</strong> {hrSystem.compensation_system.compensation_structure}</p>
                                            {hrSystem.compensation_system.incentive_types && hrSystem.compensation_system.incentive_types.length > 0 && (
                                                <p><strong>Incentive Types:</strong> {hrSystem.compensation_system.incentive_types.join(', ')}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Not completed</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
