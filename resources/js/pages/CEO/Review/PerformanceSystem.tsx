import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    ArrowRight,
    CheckCircle2, 
    FileText, 
    Target, 
    Settings, 
    TrendingUp,
    Building2,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

interface PerformanceSystem {
    id?: number;
    evaluation_unit?: string;
    performance_method?: string;
    evaluation_type?: string;
    evaluation_scale?: string;
}

interface PerformanceSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: string;
    options: string[];
    order: number;
}

interface PerformanceSnapshotResponse {
    id: number;
    question_id: number;
    response: string[] | string;
    text_response?: string;
    question?: PerformanceSnapshotQuestion;
}

interface OrganizationalKpi {
    id: number;
    organization_name: string;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    status: string;
    linked_job?: {
        id: number;
        job_name: string;
    };
}

interface EvaluationModelAssignment {
    id: number;
    job_definition_id: number;
    evaluation_model: 'mbo' | 'bsc' | 'okr';
    job_definition?: {
        id: number;
        job_name: string;
    };
}

interface EvaluationStructure {
    individual_evaluation_cycle?: string;
    individual_evaluation_timing?: string;
    individual_evaluator_types?: string[];
    individual_evaluators?: string[];
    individual_evaluation_method?: string;
    individual_rating_scale?: string;
    individual_evaluation_groups?: string[];
    individual_use_of_results?: string[];
    organization_leader_evaluation?: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
        performance_snapshot_responses?: PerformanceSnapshotResponse[];
        organizational_kpis?: OrganizationalKpi[];
        evaluation_model_assignments?: EvaluationModelAssignment[];
        evaluation_structure?: EvaluationStructure;
    };
    performanceSystem?: PerformanceSystem;
    snapshotQuestions?: PerformanceSnapshotQuestion[];
    jobDefinitions?: Array<{
        id: number;
        job_name: string;
    }>;
    orgChartMappings?: Array<{
        id: number;
        org_unit_name: string;
    }>;
    kpiReviewTokens?: Record<string, Array<{
        id: number;
        token: string;
        email: string;
        name?: string;
        organization_name: string;
        is_valid: boolean;
        review_link: string;
    }>>;
    stepStatuses?: Record<string, string>;
}

const METHOD_LABELS: Record<string, string> = {
    kpi: 'KPI',
    mbo: 'MBO',
    okr: 'OKR',
    bsc: 'BSC',
};

const UNIT_LABELS: Record<string, string> = {
    individual: 'Individual',
    team: 'Team',
    department: 'Department',
    organization: 'Organization',
};

export default function CeoReviewPerformanceSystem({
    project,
    performanceSystem,
    snapshotQuestions = [],
    jobDefinitions = [],
    orgChartMappings = [],
    kpiReviewTokens = {},
    stepStatuses = {},
}: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const tabOrder = ['overview', 'snapshot', 'kpis', 'models', 'structure'] as const;
    const activeTabIndex = tabOrder.indexOf(activeTab as (typeof tabOrder)[number]);
    const canGoPrevTab = activeTabIndex > 0;
    const canGoNextTab = activeTabIndex >= 0 && activeTabIndex < tabOrder.length - 1;
    const goPrevTab = () => {
        if (!canGoPrevTab) return;
        setActiveTab(tabOrder[activeTabIndex - 1]);
    };
    const goNextTab = () => {
        if (!canGoNextTab) return;
        setActiveTab(tabOrder[activeTabIndex + 1]);
    };

    const performanceStatus = stepStatuses?.performance || 'not_started';
    const isSubmitted = performanceStatus === 'submitted' || performanceStatus === 'approved' || performanceStatus === 'locked';

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto dark:bg-slate-900">
                    <Head title={t('ceo_review_performance.page_title', { company: project.company.name })} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Link 
                                href="/ceo/dashboard" 
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('ceo_review_performance.back_to_dashboard')}
                            </Link>
                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                <div>
                                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {t('ceo_review_performance.heading')}
                                    </h1>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {t('ceo_review_performance.subheading')}
                                    </p>
                                </div>
                                <Badge 
                                    className={`px-4 py-2 ${
                                        performanceStatus === 'submitted' ? 'bg-blue-500' :
                                        performanceStatus === 'approved' || performanceStatus === 'locked' ? 'bg-green-500' :
                                        'bg-yellow-500'
                                    } text-white border-0`}
                                >
                                    {performanceStatus === 'submitted' ? t('ceo_review_performance.status.submitted') :
                                     performanceStatus === 'approved' || performanceStatus === 'locked' ? t('ceo_review_performance.status.approved') :
                                     t('ceo_review_performance.status.in_progress')}
                                </Badge>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="overview" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {t('ceo_review_performance.tabs.overview')}
                                </TabsTrigger>
                                <TabsTrigger value="snapshot" className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    {t('ceo_review_performance.tabs.snapshot')}
                                </TabsTrigger>
                                <TabsTrigger value="kpis" className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    KPIs
                                </TabsTrigger>
                                <TabsTrigger value="models" className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    {t('ceo_review_performance.tabs.models')}
                                </TabsTrigger>
                                <TabsTrigger value="structure" className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {t('ceo_review_performance.tabs.structure')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <Card className="shadow-sm border">
                                    <CardHeader>
                                        <CardTitle>{t('ceo_review_performance.configuration.title')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('ceo_review_performance.configuration.evaluation_unit')}</Label>
                                                <div className="p-3 bg-muted rounded-lg border">
                                                    <p className="font-medium">
                                                        {performanceSystem?.evaluation_unit 
                                                            ? UNIT_LABELS[performanceSystem.evaluation_unit] || performanceSystem.evaluation_unit
                                                            : t('ceo_review_performance.not_set')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('ceo_review_performance.configuration.performance_method')}</Label>
                                                <div className="p-3 bg-muted rounded-lg border">
                                                    <p className="font-medium">
                                                        {performanceSystem?.performance_method 
                                                            ? METHOD_LABELS[performanceSystem.performance_method] || performanceSystem.performance_method.toUpperCase()
                                                            : t('ceo_review_performance.not_set')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('ceo_review_performance.configuration.evaluation_type')}</Label>
                                                <div className="p-3 bg-muted rounded-lg border">
                                                    <p className="font-medium">
                                                        {performanceSystem?.evaluation_type || t('ceo_review_performance.not_set')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">{t('ceo_review_performance.configuration.evaluation_scale')}</Label>
                                                <div className="p-3 bg-muted rounded-lg border">
                                                    <p className="font-medium">
                                                        {performanceSystem?.evaluation_scale || t('ceo_review_performance.not_set')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900">{t('ceo_review_performance.summary.snapshot_responses')}</p>
                                                    <p className="text-2xl font-bold text-blue-700">
                                                        {project.performance_snapshot_responses?.length || 0}
                                                    </p>
                                                </div>
                                                <Target className="w-8 h-8 text-blue-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">{t('ceo_review_performance.summary.organizational_kpis')}</p>
                                                    <p className="text-2xl font-bold text-green-700">
                                                        {project.organizational_kpis?.length || 0}
                                                    </p>
                                                </div>
                                                <TrendingUp className="w-8 h-8 text-green-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                                <div>
                                                    <p className="text-sm font-medium text-purple-900">{t('ceo_review_performance.summary.model_assignments')}</p>
                                                    <p className="text-2xl font-bold text-purple-700">
                                                        {project.evaluation_model_assignments?.length || 0}
                                                    </p>
                                                </div>
                                                <Settings className="w-8 h-8 text-purple-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between flex-wrap  flex-wrap">
                                                <div>
                                                    <p className="text-sm font-medium text-orange-900">{t('ceo_review_performance.summary.job_definitions')}</p>
                                                    <p className="text-2xl font-bold text-orange-700">
                                                        {jobDefinitions.length}
                                                    </p>
                                                </div>
                                                <Users className="w-8 h-8 text-orange-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Snapshot Tab */}
                            <TabsContent value="snapshot" className="space-y-6">
                                <Card className="shadow-sm border">
                                    <CardHeader>
                                        <CardTitle>{t('ceo_review_performance.snapshot.title')}</CardTitle>
                                        <CardDescription>
                                            {t('ceo_review_performance.snapshot.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            {snapshotQuestions.map((question) => {
                                                const response = project.performance_snapshot_responses?.find(
                                                    r => r.question_id === question.id
                                                );
                                                return (
                                                    <div key={question.id} className="p-4 border-2 border-border rounded-lg bg-card">
                                                        <h3 className="font-semibold mb-3 text-base">{question.question_text}</h3>
                                                        {response ? (
                                                            <div className="space-y-2">
                                                                {Array.isArray(response.response) ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {response.response.map((resp, idx) => (
                                                                            <Badge key={idx} variant="outline" className="bg-primary/10 border-primary/30">
                                                                                {resp}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground">{response.response}</p>
                                                                )}
                                                                {response.text_response && (
                                                                    <div className="mt-3 p-3 bg-muted rounded-lg">
                                                                        <p className="text-sm whitespace-pre-wrap">{response.text_response}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">{t('ceo_review_performance.snapshot.no_response')}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* KPIs Tab */}
                            <TabsContent value="kpis" className="space-y-6">
                                <Card className="shadow-sm border">
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                        <CardTitle className="text-xl">Organizational KPIs</CardTitle>
                                        <CardDescription>
                                            Key Performance Indicators by organization unit
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {project.organizational_kpis && project.organizational_kpis.length > 0 ? (
                                            <div className="space-y-6">
                                                {Array.from(new Set(project.organizational_kpis.map(k => k.organization_name).filter(Boolean))).map((orgName) => {
                                                    const orgKpis = project.organizational_kpis!.filter(k => k.organization_name === orgName);
                                                    return (
                                                        <div key={orgName} className="border-2 border-border rounded-lg p-4 bg-card">
                                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                                <Building2 className="w-5 h-5 text-primary" />
                                                                {orgName}
                                                            </h3>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>KPI Name</TableHead>
                                                                        <TableHead>Purpose</TableHead>
                                                                        <TableHead>Linked Job</TableHead>
                                                                        <TableHead>Weight</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {orgKpis.map((kpi) => (
                                                                        <TableRow key={kpi.id}>
                                                                            <TableCell className="font-medium">{kpi.kpi_name}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">
                                                                                {kpi.purpose || '-'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {kpi.linked_job?.job_name || '-'}
                                                                            </TableCell>
                                                                            <TableCell>{kpi.weight || '-'}</TableCell>
                                                                            <TableCell>
                                                                                <Badge 
                                                                                    variant={kpi.status === 'approved' ? 'default' : 'outline'}
                                                                                    className={kpi.status === 'approved' ? 'bg-green-500' : ''}
                                                                                >
                                                                                    {kpi.status}
                                                                                </Badge>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">{t('ceo_review_performance.kpis.empty')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Model Assignments Tab */}
                            <TabsContent value="models" className="space-y-6">
                                <Card className="shadow-sm border">
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                        <CardTitle className="text-xl">Evaluation Model Assignments</CardTitle>
                                        <CardDescription>
                                            Performance evaluation models assigned to each job
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {project.evaluation_model_assignments && project.evaluation_model_assignments.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Job Name</TableHead>
                                                        <TableHead>Evaluation Model</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {project.evaluation_model_assignments.map((assignment) => (
                                                        <TableRow key={assignment.id}>
                                                            <TableCell className="font-medium">
                                                                {assignment.job_definition?.job_name || `Job #${assignment.job_definition_id}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                                                                    {METHOD_LABELS[assignment.evaluation_model] || assignment.evaluation_model.toUpperCase()}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">{t('ceo_review_performance.models.empty')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Structure Tab */}
                            <TabsContent value="structure" className="space-y-6">
                                <Card className="shadow-sm border">
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                        <CardTitle className="text-xl">Evaluation Structure</CardTitle>
                                        <CardDescription>
                                            Individual evaluation configuration
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {project.evaluation_structure ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">Evaluation Cycle</Label>
                                                    <div className="p-3 bg-muted rounded-lg border">
                                                        <p>{project.evaluation_structure.individual_evaluation_cycle || t('ceo_review_performance.not_set')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">Evaluation Timing</Label>
                                                    <div className="p-3 bg-muted rounded-lg border">
                                                        <p>{project.evaluation_structure.individual_evaluation_timing || t('ceo_review_performance.not_set')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">Evaluator Types</Label>
                                                    <div className="p-3 bg-muted rounded-lg border">
                                                        {project.evaluation_structure.individual_evaluator_types && project.evaluation_structure.individual_evaluator_types.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {project.evaluation_structure.individual_evaluator_types.map((type, idx) => (
                                                                    <Badge key={idx} variant="outline">{type}</Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted-foreground">{t('ceo_review_performance.not_set')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">Rating Scale</Label>
                                                    <div className="p-3 bg-muted rounded-lg border">
                                                        <p>{project.evaluation_structure.individual_rating_scale || t('ceo_review_performance.not_set')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-semibold">Use of Results</Label>
                                                    <div className="p-3 bg-muted rounded-lg border">
                                                        {project.evaluation_structure.individual_use_of_results && project.evaluation_structure.individual_use_of_results.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {project.evaluation_structure.individual_use_of_results.map((use, idx) => (
                                                                    <Badge key={idx} variant="outline">{use}</Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted-foreground">{t('ceo_review_performance.not_set')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">{t('ceo_review_performance.structure.empty')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Tab Navigation */}
                        <div className="mt-6 flex items-center justify-between flex-wrap  flex-wrap">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goPrevTab}
                                disabled={!canGoPrevTab}
                                className="min-w-[120px]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('common.back')}
                            </Button>
                            <Button
                                type="button"
                                onClick={goNextTab}
                                disabled={!canGoNextTab}
                                className="min-w-[120px]"
                            >
                                {t('common.next')}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        {isSubmitted && (
                            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
                                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{t('ceo_review_performance.submitted_card.title')}</h3>
                                            <p className="text-muted-foreground text-sm">
                                                {t('ceo_review_performance.submitted_card.description')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.post(`/ceo/revision/step/${project.id}`, { step: 'performance' })}
                                            size="lg"
                                        >
                                            {t('ceo_review_performance.actions.request_revision')}
                                        </Button>
                                        <Button
                                            onClick={() => router.post(`/ceo/verify/step/${project.id}`, { step: 'performance' })}
                                            size="lg"
                                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {t('ceo_review_performance.actions.approve')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
