import { Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';

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
    const { t } = useTranslation();

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head
                        title={`${hrSystem.company.name} - ${t('admin_hr_system_overview.page_title')}`}
                    />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {hrSystem.company.name} -{' '}
                                    {t('admin_hr_system_overview.page_title')}
                                </h1>
                                {hrSystem.is_locked && (
                                    <div className="mt-2 flex items-center gap-2 text-green-600">
                                        <Lock className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {t(
                                                'admin_hr_system_overview.system_locked',
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Management Philosophy */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_hr_system_overview.management_philosophy',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.management_philosophy
                                        .main_trait ? (
                                        <div className="space-y-2">
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.main_trait',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem
                                                        .management_philosophy
                                                        .main_trait
                                                }
                                            </p>
                                            {hrSystem.management_philosophy
                                                .secondary_trait && (
                                                <p>
                                                    <strong>
                                                        {t(
                                                            'admin_hr_system_overview.secondary_trait',
                                                        )}
                                                        :
                                                    </strong>{' '}
                                                    {
                                                        hrSystem
                                                            .management_philosophy
                                                            .secondary_trait
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {t(
                                                'admin_hr_system_overview.not_completed',
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Organization Structure */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_hr_system_overview.organization_structure',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.organization_structure
                                        .structure_type ? (
                                        <div className="space-y-2">
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.structure_type',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem
                                                        .organization_structure
                                                        .structure_type
                                                }
                                            </p>
                                            {hrSystem.organization_structure
                                                .job_grade_structure && (
                                                <p>
                                                    <strong>
                                                        {t(
                                                            'admin_hr_system_overview.job_grade_structure',
                                                        )}
                                                        :
                                                    </strong>{' '}
                                                    {
                                                        hrSystem
                                                            .organization_structure
                                                            .job_grade_structure
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {t(
                                                'admin_hr_system_overview.not_completed',
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Performance System */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_hr_system_overview.performance_system',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.performance_system
                                        .performance_method ? (
                                        <div className="space-y-2">
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.method',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem.performance_system
                                                        .performance_method
                                                }
                                            </p>
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.evaluation_unit',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem.performance_system
                                                        .evaluation_unit
                                                }
                                            </p>
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.logic',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem.performance_system
                                                        .evaluation_logic
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {t(
                                                'admin_hr_system_overview.not_completed',
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Compensation System */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_hr_system_overview.compensation_system',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hrSystem.compensation_system
                                        .compensation_structure ? (
                                        <div className="space-y-2">
                                            <p>
                                                <strong>
                                                    {t(
                                                        'admin_hr_system_overview.structure',
                                                    )}
                                                    :
                                                </strong>{' '}
                                                {
                                                    hrSystem.compensation_system
                                                        .compensation_structure
                                                }
                                            </p>
                                            {hrSystem.compensation_system
                                                .incentive_types &&
                                                hrSystem.compensation_system
                                                    .incentive_types.length >
                                                    0 && (
                                                    <p>
                                                        <strong>
                                                            {t(
                                                                'admin_hr_system_overview.incentive_types',
                                                            )}
                                                            :
                                                        </strong>{' '}
                                                        {hrSystem.compensation_system.incentive_types.join(
                                                            ', ',
                                                        )}
                                                    </p>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {t(
                                                'admin_hr_system_overview.not_completed',
                                            )}
                                        </p>
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
