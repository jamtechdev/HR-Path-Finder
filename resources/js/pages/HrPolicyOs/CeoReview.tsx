import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileText, BookOpen, Map, BarChart3 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HrPolicyOs {
    id?: number;
    policy_manual?: any;
    system_handbook?: any;
    implementation_roadmap?: any;
    analytics_blueprint?: any;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    hrPolicyOs: HrPolicyOs;
    stepStatuses: Record<string, string>;
}

export default function HrPolicyOsCeoReview({
    project,
    hrPolicyOs,
    stepStatuses,
}: Props) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const handleApprove = () => {
        if (confirm(t('ceo_hr_policy_os_review.confirm_approve'))) {
            post(`/ceo/hr-policy-os/${project.id}/approve`, {
                preserveScroll: true,
            });
        }
    };

    const hrPolicyOsStatus = stepStatuses.hr_policy_os || 'not_started';
    const statusBadge =
        hrPolicyOsStatus === 'submitted'
            ? t('ceo_hr_policy_os_review.badge_pending')
            : t(`ceo_hr_policy_os_review.status.${hrPolicyOsStatus}`, { defaultValue: hrPolicyOsStatus });

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title={t('ceo_hr_policy_os_review.page_title')} />
            <div className="flex h-screen w-full">
                <RoleBasedSidebar />
                <SidebarInset className="flex-1 overflow-auto">
                    <AppHeader />
                    <div className="px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/ceo/dashboard')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('ceo_hr_policy_os_review.back_dashboard')}
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">{t('ceo_hr_policy_os_review.heading')}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {t('ceo_hr_policy_os_review.subheading')}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={hrPolicyOsStatus === 'submitted' ? 'default' : 'secondary'}>
                                {statusBadge}
                            </Badge>
                        </div>

                        <Card className="my-6 border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <p className="text-sm text-blue-800">
                                    <strong>{t('ceo_hr_policy_os_review.notice_strong')}:</strong>{' '}
                                    {t('ceo_hr_policy_os_review.notice_body')}
                                </p>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="policy-manual" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="policy-manual">
                                    <FileText className="h-4 w-4 mr-2" />
                                    {t('ceo_hr_policy_os_review.tabs.policy_manual')}
                                </TabsTrigger>
                                <TabsTrigger value="handbook">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    {t('ceo_hr_policy_os_review.tabs.handbook')}
                                </TabsTrigger>
                                <TabsTrigger value="roadmap">
                                    <Map className="h-4 w-4 mr-2" />
                                    {t('ceo_hr_policy_os_review.tabs.roadmap')}
                                </TabsTrigger>
                                <TabsTrigger value="analytics">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    {t('ceo_hr_policy_os_review.tabs.analytics')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="policy-manual" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('ceo_hr_policy_os_review.policy_manual.title')}</CardTitle>
                                        <CardDescription>
                                            {t('ceo_hr_policy_os_review.policy_manual.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.policy_manual?.company_philosophy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.company_philosophy')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.company_philosophy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.job_architecture_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.job_architecture_policy')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.job_architecture_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.performance_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.performance_policy')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.performance_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.compensation_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.compensation_policy')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.compensation_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.governance && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.governance')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.governance}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.review_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.policy_manual.review_policy')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.review_policy}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="handbook" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('ceo_hr_policy_os_review.handbook.title')}</CardTitle>
                                        <CardDescription>
                                            {t('ceo_hr_policy_os_review.handbook.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.system_handbook?.overview && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.overview')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.overview}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.performance_measurement && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.performance_measurement')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.performance_measurement}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.reward_structure && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.reward_structure')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.reward_structure}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.job_roles && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.job_roles')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.job_roles}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.governance && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.governance')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.governance}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.communication && (
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.handbook.communication')}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.communication}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="roadmap" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('ceo_hr_policy_os_review.roadmap.title')}</CardTitle>
                                        <CardDescription>
                                            {t('ceo_hr_policy_os_review.roadmap.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.implementation_roadmap && (
                                            <>
                                                {hrPolicyOs.implementation_roadmap.rollout_sequence && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.rollout_sequence')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.rollout_sequence}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.pilot_group && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.pilot_group')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.pilot_group}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.communication_plan && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.communication_plan')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.implementation_roadmap.communication_plan}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.training_responsibility && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.training_responsibility')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.training_responsibility}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.timeline && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.timeline')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.timeline}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.risks && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.roadmap.risks')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.implementation_roadmap.risks}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="analytics" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('ceo_hr_policy_os_review.analytics.title')}</CardTitle>
                                        <CardDescription>
                                            {t('ceo_hr_policy_os_review.analytics.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.analytics_blueprint && (
                                            <>
                                                {hrPolicyOs.analytics_blueprint.performance_distribution && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.analytics.performance_distribution')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.performance_distribution}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.pay_equity && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.analytics.pay_equity')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.pay_equity}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.role_clarity && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.analytics.role_clarity')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.role_clarity}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.turnover_risk && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.analytics.turnover_risk')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.turnover_risk}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.performance_reward_correlation && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{t('ceo_hr_policy_os_review.analytics.performance_reward_correlation')}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.performance_reward_correlation}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/ceo/dashboard')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('ceo_hr_policy_os_review.back_dashboard')}
                            </Button>
                            {hrPolicyOsStatus === 'submitted' && (
                                <Button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {processing ? t('ceo_hr_policy_os_review.actions.approving') : t('ceo_hr_policy_os_review.actions.approve_lock')}
                                </Button>
                            )}
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
