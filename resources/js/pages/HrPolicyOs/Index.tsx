import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, BookOpen, Map, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HrPolicyOs {
    id?: number;
    policy_manual?: any;
    system_handbook?: any;
    implementation_roadmap?: any;
    analytics_blueprint?: any;
    customizations?: any;
}

interface AdminRecommendation {
    id: number;
    comment: string;
    created_at: string;
}

interface AdminComment {
    id: number;
    comment: string;
    user?: {
        name: string;
    };
    created_at: string;
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
    jobDefinitions?: any[];
    hrPolicyOs?: HrPolicyOs;
    adminRecommendations?: AdminRecommendation;
    adminComments?: AdminComment[];
}

export default function HrPolicyOsIndex({
    project,
    stepStatuses,
    projectId,
    jobDefinitions = [],
    hrPolicyOs,
    adminRecommendations,
    adminComments = [],
}: Props) {
    const [activeTab, setActiveTab] = useState('policy-manual');

    const { data, setData, post, processing, errors } = useForm({
        policy_manual: hrPolicyOs?.policy_manual || {
            company_philosophy: '',
            job_architecture_policy: '',
            performance_policy: '',
            compensation_policy: '',
            governance: '',
            review_policy: '',
        },
        system_handbook: hrPolicyOs?.system_handbook || {
            overview: '',
            performance_measurement: '',
            reward_structure: '',
            job_roles: '',
            governance: '',
            communication: '',
        },
        implementation_roadmap: hrPolicyOs?.implementation_roadmap || {
            rollout_sequence: '',
            pilot_group: '',
            communication_plan: '',
            training_responsibility: '',
            timeline: '',
            risks: '',
        },
        analytics_blueprint: hrPolicyOs?.analytics_blueprint || {
            performance_distribution: '',
            pay_equity: '',
            role_clarity: '',
            turnover_risk: '',
            performance_reward_correlation: '',
        },
        customizations: hrPolicyOs?.customizations || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/hr-manager/hr-policy-os/${projectId}`, {
            preserveScroll: true,
        });
    };

    const handleFinalSubmit = () => {
        if (confirm('Are you sure you want to submit the HR Policy OS? This will send it to the CEO for final approval.')) {
            post(`/hr-manager/hr-policy-os/${projectId}/submit`, {
                preserveScroll: true,
            });
        }
    };

    const hrPolicyOsStatus = stepStatuses.hr_policy_os || 'not_started';
    const canEdit = hrPolicyOsStatus !== 'locked' && hrPolicyOsStatus !== 'approved';
    const canSubmit = hrPolicyOsStatus === 'in_progress' || hrPolicyOsStatus === 'not_started';

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="HR Policy OS & Implementation Blueprint" />
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
                                    onClick={() => router.visit('/hr-manager/dashboard')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">HR Policy OS & Implementation Blueprint</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Step 5: Transform design outputs into operational HR policies and documentation
                                    </p>
                                </div>
                            </div>
                            <Badge variant={hrPolicyOsStatus === 'locked' ? 'default' : 'secondary'}>
                                {hrPolicyOsStatus === 'locked' ? 'Locked' : hrPolicyOsStatus === 'submitted' ? 'Submitted' : 'In Progress'}
                            </Badge>
                        </div>

                        {/* Disclaimer */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-blue-900">
                                            Important Notice
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            This step compiles your HR system designs into formal policies and documentation. 
                                            It does not execute HR processes or manage employees. The outputs are intended as 
                                            internal governance references. Legal and regulatory compliance review should be 
                                            conducted separately.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {!canEdit && (
                            <Card className="border-yellow-200 bg-yellow-50">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <p className="text-sm text-yellow-800">
                                            This step has been finalized and locked. Contact an administrator to make changes.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Recommendations */}
                        {adminRecommendations && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-blue-900">Consultant Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                        {adminRecommendations.comment}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        Added on {new Date(adminRecommendations.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Comments */}
                        {adminComments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Consultant Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {adminComments.map((comment) => (
                                        <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {comment.comment}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {comment.user?.name || 'Admin'} - {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                                Auto-generated policy documents from Steps 1-4. You can customize the content as needed.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Company HR Philosophy</Label>
                                                <Textarea
                                                    value={data.policy_manual.company_philosophy}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        company_philosophy: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Company HR philosophy based on CEO vision and management style..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Job Architecture Policy</Label>
                                                <Textarea
                                                    value={data.policy_manual.job_architecture_policy}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        job_architecture_policy: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Job architecture and role definition policies..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Performance Management Policy</Label>
                                                <Textarea
                                                    value={data.policy_manual.performance_policy}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        performance_policy: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Performance measurement and evaluation policies..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Compensation & Benefits Policy</Label>
                                                <Textarea
                                                    value={data.policy_manual.compensation_policy}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        compensation_policy: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Compensation structure and benefits policies..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Governance & Decision Authority</Label>
                                                <Textarea
                                                    value={data.policy_manual.governance}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        governance: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Governance framework and decision-making authority..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Review & Change Management Policy</Label>
                                                <Textarea
                                                    value={data.policy_manual.review_policy}
                                                    onChange={(e) => setData('policy_manual', {
                                                        ...data.policy_manual,
                                                        review_policy: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Policy review cycles and change management process..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* System Handbook Tab */}
                                <TabsContent value="handbook" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>HR System Handbook</CardTitle>
                                            <CardDescription>
                                                Simplified handbook explaining how HR systems work internally
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>System Overview</Label>
                                                <Textarea
                                                    value={data.system_handbook.overview}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        overview: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Overview of HR system philosophy..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Performance Measurement</Label>
                                                <Textarea
                                                    value={data.system_handbook.performance_measurement}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        performance_measurement: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="How performance is measured..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reward Structure</Label>
                                                <Textarea
                                                    value={data.system_handbook.reward_structure}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        reward_structure: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="How rewards are structured..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Job Roles Definition</Label>
                                                <Textarea
                                                    value={data.system_handbook.job_roles}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        job_roles: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="How job roles are defined..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Governance & Approval Flow</Label>
                                                <Textarea
                                                    value={data.system_handbook.governance}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        governance: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Governance and approval processes..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Employee Communication Guidelines</Label>
                                                <Textarea
                                                    value={data.system_handbook.communication}
                                                    onChange={(e) => setData('system_handbook', {
                                                        ...data.system_handbook,
                                                        communication: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Guidelines for communicating HR systems to employees..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Implementation Roadmap Tab */}
                                <TabsContent value="roadmap" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Implementation Roadmap</CardTitle>
                                            <CardDescription>
                                                Realistic rollout plan for deploying the designed HR systems
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Rollout Sequence</Label>
                                                <Input
                                                    value={data.implementation_roadmap.rollout_sequence}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        rollout_sequence: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    placeholder="e.g., Performance → Compensation → Policy rollout"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pilot Group</Label>
                                                <Input
                                                    value={data.implementation_roadmap.pilot_group}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        pilot_group: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    placeholder="e.g., Management only / Selected departments"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Communication Plan</Label>
                                                <Textarea
                                                    value={data.implementation_roadmap.communication_plan}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        communication_plan: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="e.g., Townhall / Email / Training sessions"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Training Responsibility</Label>
                                                <Input
                                                    value={data.implementation_roadmap.training_responsibility}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        training_responsibility: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    placeholder="e.g., HR / Managers / External consultant"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Timeline</Label>
                                                <Input
                                                    value={data.implementation_roadmap.timeline}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        timeline: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    placeholder="e.g., 3 months / 6 months / 12 months"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Key Risks & Mitigation</Label>
                                                <Textarea
                                                    value={data.implementation_roadmap.risks}
                                                    onChange={(e) => setData('implementation_roadmap', {
                                                        ...data.implementation_roadmap,
                                                        risks: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={6}
                                                    placeholder="Key risks and mitigation strategies..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Analytics Blueprint Tab */}
                                <TabsContent value="analytics" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>HR Analytics & KPI Blueprint</CardTitle>
                                            <CardDescription>
                                                Define what HR metrics should be tracked after implementation
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Performance Distribution Health</Label>
                                                <Textarea
                                                    value={data.analytics_blueprint.performance_distribution}
                                                    onChange={(e) => setData('analytics_blueprint', {
                                                        ...data.analytics_blueprint,
                                                        performance_distribution: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="Metric definition and formula..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pay Equity Indicators</Label>
                                                <Textarea
                                                    value={data.analytics_blueprint.pay_equity}
                                                    onChange={(e) => setData('analytics_blueprint', {
                                                        ...data.analytics_blueprint,
                                                        pay_equity: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="Metric definition and formula..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role Clarity Index</Label>
                                                <Textarea
                                                    value={data.analytics_blueprint.role_clarity}
                                                    onChange={(e) => setData('analytics_blueprint', {
                                                        ...data.analytics_blueprint,
                                                        role_clarity: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="Metric definition and formula..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Turnover Risk by Job Family</Label>
                                                <Textarea
                                                    value={data.analytics_blueprint.turnover_risk}
                                                    onChange={(e) => setData('analytics_blueprint', {
                                                        ...data.analytics_blueprint,
                                                        turnover_risk: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="Metric definition and formula..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Performance-to-Reward Correlation</Label>
                                                <Textarea
                                                    value={data.analytics_blueprint.performance_reward_correlation}
                                                    onChange={(e) => setData('analytics_blueprint', {
                                                        ...data.analytics_blueprint,
                                                        performance_reward_correlation: e.target.value
                                                    })}
                                                    disabled={!canEdit}
                                                    rows={4}
                                                    placeholder="Metric definition and formula..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/hr-manager/dashboard')}
                                >
                                    Cancel
                                </Button>
                                <div className="flex gap-2">
                                    {canEdit && (
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Draft'}
                                        </Button>
                                    )}
                                    {canSubmit && (
                                        <Button
                                            type="button"
                                            onClick={handleFinalSubmit}
                                            disabled={processing}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Submit for CEO Approval
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
