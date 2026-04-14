import { Head, usePage } from '@inertiajs/react';
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
    compensation_snapshot_details?: Array<{
        id: number;
        order: number;
        question_text: string;
        answer_type: string;
        metadata?: Record<string, any> | null;
        response?: {
            response?: any;
            text_response?: string | null;
            numeric_response?: number | null;
            updated_at?: string | null;
        } | null;
    }>;
    is_locked: boolean;
}

interface Props {
    hrSystem: HrSystem;
}

export default function HrSystemOverview({ hrSystem }: Props) {
    const { t } = useTranslation();
    const page = usePage();
    const isAdmin =
        ((page.props as any).auth?.user?.roles || []).some(
            (role: { name?: string }) => role?.name === 'admin',
        );
    const snapshotDetails = hrSystem.compensation_snapshot_details || [];

    const formatSnapshotAnswer = (item: NonNullable<HrSystem['compensation_snapshot_details']>[number]): string => {
        const response = item.response;
        if (!response) return 'Not answered';

        if (response.text_response && response.text_response.trim() !== '') {
            return response.text_response;
        }
        if (typeof response.numeric_response === 'number' && Number.isFinite(response.numeric_response)) {
            return String(response.numeric_response);
        }

        const raw = response.response;
        if (raw === null || raw === undefined) return 'Not answered';

        if (Array.isArray(raw)) {
            if (item.answer_type === 'numeric_job_rows') {
                return raw
                    .map((entry: any) => {
                        const label = String(entry?.function || '').trim();
                        const amount = entry?.amount;
                        return label !== '' ? `${label}: ${amount ?? '-'}` : null;
                    })
                    .filter((v): v is string => v !== null)
                    .join(', ');
            }
            return raw.map((v) => String(v)).join(', ');
        }

        if (typeof raw === 'object') {
            return Object.entries(raw as Record<string, unknown>)
                .map(([k, v]) => `${k}: ${v ?? '-'}`)
                .join(', ');
        }

        return String(raw);
    };

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
                        <div className="mb-6 flex items-center justify-between flex-wrap flex-wrap">
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

                        {isAdmin && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Compensation Snapshot Results (Client Answers)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {snapshotDetails.length > 0 ? (
                                        <div className="space-y-3">
                                            {snapshotDetails.map((item) => (
                                                <div key={item.id} className="rounded-lg border p-3">
                                                    <p className="text-sm font-semibold">
                                                        Q{item.order}. {item.question_text}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Type: {item.answer_type}
                                                    </p>
                                                    <p className="mt-2 text-sm">
                                                        <strong>Answer:</strong> {formatSnapshotAnswer(item)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No compensation snapshot answers found for this client yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
