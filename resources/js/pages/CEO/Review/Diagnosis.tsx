import { Head, useForm, router, Link, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import ChangeHistoryTab from '@/components/CEO/Review/ChangeHistoryTab';
import DiagnosisActions from '@/components/CEO/Review/DiagnosisActions';
import DiagnosisHeader from '@/components/CEO/Review/DiagnosisHeader';
import DiagnosisTabs from '@/components/CEO/Review/DiagnosisTabs';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import AppHeader from '@/components/Header/AppHeader';
import SuccessModal from '@/components/Modals/SuccessModal';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CompanyInfo from '@/pages/Diagnosis/CompanyInfo';
import Executives from '@/pages/Diagnosis/Executives';
import HrIssues from '@/pages/Diagnosis/HrIssues';
import JobGrades from '@/pages/Diagnosis/JobGrades';
import JobStructure from '@/pages/Diagnosis/JobStructure';
import Leaders from '@/pages/Diagnosis/Leaders';
import OrganizationalCharts from '@/pages/Diagnosis/OrganizationalCharts';
import OrganizationalStructure from '@/pages/Diagnosis/OrganizationalStructure';
import Workforce from '@/pages/Diagnosis/Workforce';
import { useTranslation } from 'react-i18next';

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') {
        if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
        return JSON.stringify(value);
    }
    return String(value);
};
const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '—';
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(n) ? '—' : n.toLocaleString();
};

interface Diagnosis {
    id: number;
    status: string;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    expected_headcount_2y?: number;
    expected_headcount_3y?: number;
    average_tenure_active?: number;
    average_tenure_leavers?: number;
    average_age?: number;
    gender_male?: number;
    gender_female?: number;
    gender_ratio?: number;
    total_executives?: number;
    executive_positions?: Array<{ role: string; count: number }> | Record<string, number>;
    leadership_count?: number;
    leadership_percentage?: number;
    job_grade_names?: string[];
    job_grade_headcounts?: Record<string, number>;
    promotion_years?: Record<string, number | null>;
    org_structure_types?: string[];
    organizational_charts?: Record<string, string>;
    hr_issues?: string[];
    custom_hr_issues?: string;
    job_categories?: string[];
    job_functions?: string[];
    [key: string]: any;
}

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    is_public?: boolean;
    public_listing_status?: string;
    brand_name?: string;
    foundation_date?: string;
    logo_path?: string;
}

interface ReviewLog {
    id: number;
    field_name: string;
    original_value: string;
    modified_value: string;
    created_at: string;
    modifier: {
        name: string;
    };
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories: Array<{ id: number; name: string }>;
}

interface HrIssue {
    id: number;
    name: string;
    category: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
        ceoPhilosophy?: { id?: number; completed_at?: string } | null;
        ceo_philosophy?: { id?: number; completed_at?: string } | null;
    };
    diagnosis?: Diagnosis;
    company: Company;
    reviewLogs?: ReviewLog[];
    industryCategories?: IndustryCategory[];
    hqLocations?: string[];
    hrIssues?: HrIssue[];
}

export default function CeoReviewDiagnosis({ 
    project, 
    diagnosis, 
    company, 
    reviewLogs = [],
    industryCategories = [],
    hqLocations = [],
    hrIssues = [],
}: Props) {
    const hasMeaningfulDiagnosisData = (payload: Record<string, any>) => {
        const ignored = new Set([
            'id',
            'status',
            'created_at',
            'updated_at',
            'company_name',
            'company',
        ]);
        return Object.entries(payload).some(([key, value]) => {
            if (ignored.has(key)) return false;
            if (value == null) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return value > 0;
            if (typeof value === 'boolean') return value === true;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object') return Object.keys(value).length > 0;
            return false;
        });
    };

    const { t } = useTranslation();
    const REQUIRED_ORG_CHART_YEARS = ['2023.12', '2024.12', '2025.12'] as const;
    const tabOrder = [
        'company-info',
        'workforce',
        'executives',
        'leaders',
        'job-grades',
        'organizational-charts',
        'organizational-structure',
        'job-structure',
        'hr-issues',
        'history',
    ] as const;
    const [activeTab, setActiveTab] = useState('company-info');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [saveNotice, setSaveNotice] = useState<string | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [showCeoDoneModal, setShowCeoDoneModal] = useState(false);
    const page = usePage();
    const flash = (page.props as any)?.flash ?? {};
    
    const { data, setData, post, processing, errors } = useForm({
        ...diagnosis,
        company_name: company?.name || '',
        registration_number: diagnosis?.registration_number ?? company?.registration_number ?? '',
        hq_location: diagnosis?.hq_location ?? company?.hq_location ?? '',
        is_public: company?.is_public ?? false,
        brand_name: company?.brand_name ?? '',
        foundation_date: company?.foundation_date ?? '',
    });

    // Update form data when diagnosis or company props change (after save/reload)
    useEffect(() => {
        if (diagnosis) {
            Object.keys(diagnosis).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                    setData(key as any, diagnosis[key as keyof typeof diagnosis]);
                }
            });
        }
        setData('company_name', company?.name ?? '');
        setData('registration_number', diagnosis?.registration_number ?? company?.registration_number ?? '');
        setData('hq_location', diagnosis?.hq_location ?? company?.hq_location ?? '');
        setData('is_public', company?.is_public ?? false);
        setData('brand_name', company?.brand_name ?? '');
        setData('foundation_date', company?.foundation_date ?? '');
    }, [diagnosis, company]);

    // Show completion popup after CEO submits the philosophy survey
    useEffect(() => {
        if (flash?.ceoSurveyDone) setShowCeoDoneModal(true);
    }, [flash?.ceoSurveyDone]);

    // Calculate gender ratio
    useEffect(() => {
        const total = (data.gender_male || 0) + (data.gender_female || 0);
        if (total > 0) {
            const ratio = ((data.gender_male || 0) / total) * 100;
            setData('gender_ratio', Math.round(ratio * 100) / 100);
        }
    }, [data.gender_male, data.gender_female]);

    // Calculate leadership percentage
    useEffect(() => {
        if (data.present_headcount && data.leadership_count) {
            const percentage = (data.leadership_count / data.present_headcount) * 100;
            setData('leadership_percentage', Math.round(percentage * 100) / 100);
        }
    }, [data.present_headcount, data.leadership_count]);

    const handleSave = () => {
        setSaveNotice(null);
        setPageError(null);
        if (!hasMeaningfulDiagnosisData(data as Record<string, any>)) {
            setPageError('Cannot save empty data. Please fill at least one field.');
            return;
        }
        post(`/ceo/review/diagnosis/${project.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveNotice(t('ceo_review_diagnosis.messages.saved'));
                router.reload({
                    only: ['diagnosis', 'company', 'reviewLogs'],
                });
            },
            onError: () => setPageError(t('ceo_review_diagnosis.messages.fix_fields')),
        });
    };

    const handleConfirm = () => {
        setPageError(null);
        post(`/ceo/review/diagnosis/${project.id}/confirm`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: () => {
                // Validation/backend errors are shared via Inertia; ensure user sees feedback
                setPageError(t('ceo_review_diagnosis.messages.unable_submit'));
                router.reload({ only: ['diagnosis', 'company'] });
            },
        });
    };

    const handleNextStep = () => {
        router.visit('/ceo/dashboard');
    };

    // Use live form data for summary metrics so CEO sees correct values immediately while editing.
    const totalHeadcount = Number((data as any)?.present_headcount) || 0;
    const execTotal = Number((data as any)?.total_executives) || 0;
    const jobGradesForPyramid = useMemo(() => {
        const names = ((data as any)?.job_grade_names ?? []) as string[];
        const headcounts = (((data as any)?.job_grade_headcounts ?? {}) as Record<string, number | string>);
        // Stored order is typically low -> high in editor; reverse for top -> bottom analysis.
        return names
            .map((name) => ({ name, headcount: Number(headcounts[name]) || 0 }))
            .reverse();
    }, [(data as any)?.job_grade_names, (data as any)?.job_grade_headcounts]);
    const leaderCountFromGrades = jobGradesForPyramid.slice(0, 2).reduce((s, g) => s + g.headcount, 0);
    const leaderTotal = execTotal + leaderCountFromGrades;
    const leaderRatio = totalHeadcount ? ((leaderTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const execRatio = totalHeadcount ? ((execTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const execPositionsStr = useMemo(() => {
        const positions = (data as any)?.executive_positions;
        const pos = Array.isArray(positions)
            ? positions
            : positions && typeof positions === 'object'
                ? Object.entries(positions).map(([role, count]) => ({ role, count: Number(count) || 0 }))
                : [];
        return pos.map((p) => `${p.role} × ${p.count}`).join(', ');
    }, [(data as any)?.executive_positions]);

    const isDiagnosisCompleteForVerification = useMemo(() => {
        const d = data as Record<string, any>;
        const hasIndustry = String(d.industry_category ?? '').trim() !== '';
        const hasHeadcount = Number(d.present_headcount ?? 0) > 0;

        const charts = d.organizational_charts;
        const chartObj = charts && typeof charts === 'object' && !Array.isArray(charts) ? charts : {};
        const hasAllCharts = REQUIRED_ORG_CHART_YEARS.every((y) => {
            const v = chartObj[y];
            return typeof v === 'string' && v.trim() !== '';
        });

        const orgTypes = d.org_structure_types;
        const hasOrgStructure = Array.isArray(orgTypes) && orgTypes.length > 0;

        const jobGrades = d.job_grade_names;
        const hasJobGrades = Array.isArray(jobGrades) && jobGrades.length > 0;

        const jobCategories = d.job_categories;
        const jobFunctions = d.job_functions;
        const hasJobStructure =
            (Array.isArray(jobCategories) && jobCategories.length > 0) ||
            (Array.isArray(jobFunctions) && jobFunctions.length > 0);

        return hasIndustry && hasHeadcount && hasAllCharts && hasOrgStructure && hasJobGrades && hasJobStructure;
    }, [data]);
    const hasSurveyCompleted =
        !!project?.ceoPhilosophy?.completed_at || !!(project as any)?.ceo_philosophy?.completed_at;
    const activeTabIndex = tabOrder.indexOf(activeTab as (typeof tabOrder)[number]);
    const canGoPrevTab = activeTabIndex > 0;
    const canGoNextTab = activeTabIndex >= 0 && activeTabIndex < tabOrder.length - 1;
    const handleBackTab = () => {
        if (!canGoPrevTab) return;
        setActiveTab(tabOrder[activeTabIndex - 1]);
    };
    const handleNextTab = () => {
        if (activeTab === 'hr-issues' || activeTab === 'history' || !canGoNextTab) {
            router.visit(`/ceo/projects/${project.id}/verification`);
            return;
        }
        setActiveTab(tabOrder[activeTabIndex + 1]);
    };
    const showNextButton = activeTab !== 'history';

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900">
                    <Head title={t('ceo_review_diagnosis.page_title', { company: project.company.name })} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <InlineErrorSummary className="mb-6" message={pageError} errors={errors as any} />
                        {saveNotice && (
                            <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-50">
                                <AlertDescription>{saveNotice}</AlertDescription>
                            </Alert>
                        )}
                        <DiagnosisHeader
                            title={t('ceo_review_diagnosis.header.title')}
                            subtitle={t('ceo_review_diagnosis.header.subtitle')}
                            status={diagnosis?.status}
                        />

                        {diagnosis && (
                            <div className="rounded-t-[14px] bg-gradient-to-br from-[#0f2a4a] to-[#1a4070] dark:from-slate-800 dark:to-slate-900 px-6 py-5 mb-0">
                                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#c8a84b]">
                                    {company?.name || project.company?.name || '—'} · {formatValue((data as any)?.industry_category) || '—'}
                                </div>
                                <div className="flex flex-wrap items-end gap-6">
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">{t('ceo_review_diagnosis.metrics.total_headcount')}</div>
                                        <div className="text-2xl font-extrabold leading-none text-white">
                                            {totalHeadcount}
                                            <span className="ml-0.5 text-xs font-medium text-slate-400">{t('ceo_review_diagnosis.metrics.persons')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div>
                                            <div className="mb-0.5 text-[9px] text-slate-400">{t('ceo_review_diagnosis.metrics.active_tenure_avg')}</div>
                                            <div className="text-2xl font-extrabold leading-none text-emerald-400">
                                                {formatNumber((data as any)?.average_tenure_active)}
                                                <span className="ml-0.5 text-xs font-medium text-slate-400">{t('ceo_review_diagnosis.metrics.years')}</span>
                                            </div>
                                        </div>
                                        <div className="pb-1 text-[10px] text-white/20">{t('ceo_review_diagnosis.metrics.vs')}</div>
                                        <div>
                                            <div className="mb-0.5 text-[9px] text-slate-400">{t('ceo_review_diagnosis.metrics.exit_tenure_avg')}</div>
                                            <div className="text-2xl font-extrabold leading-none text-slate-400">
                                                {formatNumber((data as any)?.average_tenure_leavers)}
                                                <span className="ml-0.5 text-xs font-medium text-slate-400">{t('ceo_review_diagnosis.metrics.years')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-11 w-px self-center bg-white/10" />
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">{t('ceo_review_diagnosis.metrics.leader_ratio')}</div>
                                        <div className="text-2xl font-extrabold leading-none text-[#c8a84b]">{leaderRatio}%</div>
                                        <div className="mt-0.5 text-[9px] text-slate-400">
                                            {leaderCountFromGrades} / {totalHeadcount} {t('ceo_review_diagnosis.metrics.total')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">{t('ceo_review_diagnosis.metrics.executive_ratio')}</div>
                                        <div className="text-2xl font-extrabold leading-none text-sky-300">{execRatio}%</div>
                                        <div className="mt-0.5 text-[9px] text-slate-400">
                                            {execTotal} · {execPositionsStr || '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {diagnosis && diagnosis.status !== 'submitted' && (
                            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription>
                                    {t('ceo_review_diagnosis.warning_not_submitted')}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="rounded-b-[14px] border border-t-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
                            <DiagnosisTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            <TabsContent value="company-info" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <CompanyInfo project={project} company={company} diagnosis={diagnosis} activeTab="company-info" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} industryCategories={industryCategories} hqLocations={hqLocations ?? []} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="workforce" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <Workforce project={project} company={company} diagnosis={diagnosis} activeTab="workforce" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="executives" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <Executives project={project} company={company} diagnosis={diagnosis} activeTab="executives" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="leaders" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <Leaders project={project} company={company} diagnosis={diagnosis} activeTab="leaders" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="job-grades" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <JobGrades project={project} company={company} diagnosis={diagnosis} activeTab="job-grades" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="organizational-charts" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <OrganizationalCharts project={project} company={company} diagnosis={diagnosis} activeTab="organizational-charts" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="organizational-structure" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <OrganizationalStructure project={project} company={company} diagnosis={diagnosis} activeTab="organizational-structure" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="job-structure" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <JobStructure project={project} company={company} diagnosis={diagnosis} activeTab="job-structure" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="hr-issues" className="space-y-4 p-6 pt-4">
                                {diagnosis && project && (
                                    <HrIssues project={project} company={company} diagnosis={diagnosis} activeTab="hr-issues" diagnosisStatus={diagnosis.status ?? ''} stepStatuses={project?.step_statuses ?? {}} projectId={project.id} embedMode readOnly={diagnosis.status !== 'submitted'} embedData={data} embedSetData={setData} />
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4 p-6 pt-4">
                                <ChangeHistoryTab reviewLogs={reviewLogs} />
                            </TabsContent>
                        </Tabs>
                        </div>

                        <DiagnosisActions
                            onSave={handleSave}
                            onConfirm={handleConfirm}
                            onBackTab={handleBackTab}
                            onNextTab={handleNextTab}
                            canGoBackTab={canGoPrevTab}
                            canGoNextTab={canGoNextTab}
                            showNextButton={showNextButton}
                            processing={processing}
                            diagnosisStatus={diagnosis?.status}
                            hasSurveyCompleted={hasSurveyCompleted}
                            isDiagnosisComplete={isDiagnosisCompleteForVerification}
                            projectId={project?.id}
                        />
                    </div>
                </main>
            </SidebarInset>
            
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={t('ceo_review_diagnosis.success.title')}
                message={t('ceo_review_diagnosis.success.message')}
                nextStepLabel={t('ceo_review_diagnosis.success.next')}
                onNextStep={handleNextStep}
            />

            <SuccessModal
                isOpen={showCeoDoneModal}
                onClose={() => setShowCeoDoneModal(false)}
                title={t('ceo_review_diagnosis.success.title')}
                message={t('ceo_review_diagnosis.success.message')}
                nextStepLabel={t('ceo_review_diagnosis.success.next')}
                onNextStep={handleNextStep}
            />
        </SidebarProvider>
    );
}
