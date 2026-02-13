import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, FileText, BookOpen, Map, BarChart3 } from 'lucide-react';
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
    const { post, processing } = useForm({});

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve the HR Policy OS? This will lock the entire system and complete the Pathfinder journey.')) {
            post(`/ceo/hr-policy-os/${project.id}/approve`, {
                preserveScroll: true,
            });
        }
    };

    const hrPolicyOsStatus = stepStatuses.hr_policy_os || 'not_started';

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Review HR Policy OS" />
            <div className="flex h-screen w-full">
                <RoleBasedSidebar />
                <SidebarInset className="flex-1 overflow-auto">
                    <AppHeader />
                    <div className="px-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/ceo/dashboard')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">Review HR Policy OS & Implementation Blueprint</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Final Step: Review and approve the complete HR system package
                                    </p>
                                </div>
                            </div>
                            <Badge variant={hrPolicyOsStatus === 'submitted' ? 'default' : 'secondary'}>
                                {hrPolicyOsStatus === 'submitted' ? 'Pending Approval' : hrPolicyOsStatus}
                            </Badge>
                        </div>

                        {/* Important Notice */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Final Approval:</strong> This is the final step of the Pathfinder journey. 
                                    Approving this will lock the entire HR system. Please review all sections carefully 
                                    before approving.
                                </p>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="policy-manual" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="policy-manual">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Policy Manual
                                </TabsTrigger>
                                <TabsTrigger value="handbook">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    System Handbook
                                </TabsTrigger>
                                <TabsTrigger value="roadmap">
                                    <Map className="h-4 w-4 mr-2" />
                                    Roadmap
                                </TabsTrigger>
                                <TabsTrigger value="analytics">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Analytics
                                </TabsTrigger>
                            </TabsList>

                            {/* Policy Manual Tab */}
                            <TabsContent value="policy-manual" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>HR Policy Manual</CardTitle>
                                        <CardDescription>
                                            Review the auto-generated policy documents
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.policy_manual?.company_philosophy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Company HR Philosophy</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.company_philosophy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.job_architecture_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Job Architecture Policy</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.job_architecture_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.performance_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Performance Management Policy</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.performance_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.compensation_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Compensation & Benefits Policy</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.compensation_policy}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.governance && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Governance & Decision Authority</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.governance}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.policy_manual?.review_policy && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Review & Change Management Policy</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.policy_manual.review_policy}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* System Handbook Tab */}
                            <TabsContent value="handbook" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>HR System Handbook</CardTitle>
                                        <CardDescription>
                                            Review the system handbook
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.system_handbook?.overview && (
                                            <div>
                                                <h4 className="font-semibold mb-2">System Overview</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.overview}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.performance_measurement && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Performance Measurement</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.performance_measurement}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.reward_structure && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Reward Structure</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.reward_structure}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.job_roles && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Job Roles Definition</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.job_roles}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.governance && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Governance & Approval Flow</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.governance}
                                                </p>
                                            </div>
                                        )}
                                        {hrPolicyOs.system_handbook?.communication && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Employee Communication Guidelines</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {hrPolicyOs.system_handbook.communication}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Implementation Roadmap Tab */}
                            <TabsContent value="roadmap" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Implementation Roadmap</CardTitle>
                                        <CardDescription>
                                            Review the implementation plan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.implementation_roadmap && (
                                            <>
                                                {hrPolicyOs.implementation_roadmap.rollout_sequence && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Rollout Sequence</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.rollout_sequence}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.pilot_group && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Pilot Group</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.pilot_group}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.communication_plan && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Communication Plan</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.implementation_roadmap.communication_plan}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.training_responsibility && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Training Responsibility</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.training_responsibility}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.timeline && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Timeline</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {hrPolicyOs.implementation_roadmap.timeline}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.implementation_roadmap.risks && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Key Risks & Mitigation</h4>
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

                            {/* Analytics Blueprint Tab */}
                            <TabsContent value="analytics" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>HR Analytics & KPI Blueprint</CardTitle>
                                        <CardDescription>
                                            Review the analytics metrics definitions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hrPolicyOs.analytics_blueprint && (
                                            <>
                                                {hrPolicyOs.analytics_blueprint.performance_distribution && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Performance Distribution Health</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.performance_distribution}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.pay_equity && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Pay Equity Indicators</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.pay_equity}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.role_clarity && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Role Clarity Index</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.role_clarity}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.turnover_risk && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Turnover Risk by Job Family</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                            {hrPolicyOs.analytics_blueprint.turnover_risk}
                                                        </p>
                                                    </div>
                                                )}
                                                {hrPolicyOs.analytics_blueprint.performance_reward_correlation && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Performance-to-Reward Correlation</h4>
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

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/ceo/dashboard')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            {hrPolicyOsStatus === 'submitted' && (
                                <Button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {processing ? 'Approving...' : 'Approve & Lock System'}
                                </Button>
                            )}
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
