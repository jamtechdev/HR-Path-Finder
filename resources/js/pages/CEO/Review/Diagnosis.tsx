import React, { useEffect, useState, useMemo } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DiagnosisHeader from '@/components/CEO/Review/DiagnosisHeader';
import DiagnosisTabs from '@/components/CEO/Review/DiagnosisTabs';
import ChangeHistoryTab from '@/components/CEO/Review/ChangeHistoryTab';
import CompanyInfo from '@/pages/Diagnosis/CompanyInfo';
import Workforce from '@/pages/Diagnosis/Workforce';
import Executives from '@/pages/Diagnosis/Executives';
import Leaders from '@/pages/Diagnosis/Leaders';
import JobGrades from '@/pages/Diagnosis/JobGrades';
import OrganizationalCharts from '@/pages/Diagnosis/OrganizationalCharts';
import OrganizationalStructure from '@/pages/Diagnosis/OrganizationalStructure';
import JobStructure from '@/pages/Diagnosis/JobStructure';
import HrIssues from '@/pages/Diagnosis/HrIssues';
import DiagnosisActions from '@/components/CEO/Review/DiagnosisActions';
import SuccessModal from '@/components/Modals/SuccessModal';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('company-info');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
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
        post(`/ceo/review/diagnosis/${project.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Your changes have been saved successfully.' });
                router.reload({
                    only: ['diagnosis', 'company', 'reviewLogs'],
                });
            },
        });
    };

    const handleConfirm = () => {
        post(`/ceo/review/diagnosis/${project.id}/confirm`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: () => {
                // Validation/backend errors are shared via Inertia; ensure user sees feedback
                router.reload({ only: ['diagnosis', 'company'] });
            },
        });
    };

    const handleNextStep = () => {
        router.visit('/ceo/dashboard');
    };

    const totalHeadcount = Number(diagnosis?.present_headcount) || 0;
    const execTotal = Number(diagnosis?.total_executives) || 0;
    const jobGradesForPyramid = useMemo(() => {
        const names = diagnosis?.job_grade_names ?? [];
        const headcounts = (diagnosis?.job_grade_headcounts ?? {}) as Record<string, number>;
        return names.map((name) => ({ name, headcount: Number(headcounts[name]) || 0 }));
    }, [diagnosis?.job_grade_names, diagnosis?.job_grade_headcounts]);
    const leaderCountFromGrades = jobGradesForPyramid.slice(0, 2).reduce((s, g) => s + g.headcount, 0);
    const leaderTotal = execTotal + leaderCountFromGrades;
    const leaderRatio = totalHeadcount ? ((leaderTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const execRatio = totalHeadcount ? ((execTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const execPositionsStr = useMemo(() => {
        const pos = Array.isArray(diagnosis?.executive_positions)
            ? diagnosis.executive_positions
            : diagnosis?.executive_positions && typeof diagnosis.executive_positions === 'object'
                ? Object.entries(diagnosis.executive_positions).map(([role, count]) => ({ role, count: Number(count) || 0 }))
                : [];
        return pos.map((p) => `${p.role} × ${p.count}`).join(', ');
    }, [diagnosis?.executive_positions]);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900">
                    <Head title={`Review Diagnosis - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <Link
                            href={`/ceo/projects/${project.id}/verification`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Step Verification
                        </Link>

                        <DiagnosisHeader
                            title="Review HR Diagnosis Inputs"
                            subtitle="Review and edit the diagnosis data submitted by your HR Manager. All changes will be logged."
                            status={diagnosis?.status}
                        />

                        {diagnosis && (
                            <div className="rounded-t-[14px] bg-gradient-to-br from-[#0f2a4a] to-[#1a4070] dark:from-slate-800 dark:to-slate-900 px-6 py-5 mb-0">
                                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#c8a84b]">
                                    {company?.name || project.company?.name || '—'} · {formatValue(diagnosis?.industry_category) || '—'}
                                </div>
                                <div className="flex flex-wrap items-end gap-6">
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">Total headcount</div>
                                        <div className="text-2xl font-extrabold leading-none text-white">
                                            {totalHeadcount}
                                            <span className="ml-0.5 text-xs font-medium text-slate-400">persons</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div>
                                            <div className="mb-0.5 text-[9px] text-slate-400">Active tenure (avg)</div>
                                            <div className="text-2xl font-extrabold leading-none text-emerald-400">
                                                {formatNumber(diagnosis?.average_tenure_active)}
                                                <span className="ml-0.5 text-xs font-medium text-slate-400">yrs</span>
                                            </div>
                                        </div>
                                        <div className="pb-1 text-[10px] text-white/20">vs</div>
                                        <div>
                                            <div className="mb-0.5 text-[9px] text-slate-400">Exit tenure (avg)</div>
                                            <div className="text-2xl font-extrabold leading-none text-slate-400">
                                                {formatNumber(diagnosis?.average_tenure_leavers)}
                                                <span className="ml-0.5 text-xs font-medium text-slate-400">yrs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-11 w-px self-center bg-white/10" />
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">Leader ratio</div>
                                        <div className="text-2xl font-extrabold leading-none text-[#c8a84b]">{leaderRatio}%</div>
                                        <div className="mt-0.5 text-[9px] text-slate-400">
                                            {leaderCountFromGrades} / {totalHeadcount} total
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-0.5 text-[9px] text-slate-400">Executive ratio</div>
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
                                    Diagnosis must be submitted by HR before you can save changes or confirm. Ask your HR Manager to complete and submit the Diagnosis step, then return here to review and save.
                                </AlertDescription>
                            </Alert>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {Object.entries(errors).map(([key, msg]) => (
                                        <p key={key}>{String(msg)}</p>
                                    ))}
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
                            processing={processing}
                            diagnosisStatus={diagnosis?.status}
                            hasSurveyCompleted={!!project?.ceoPhilosophy}
                            projectId={project?.id}
                        />
                    </div>
                </main>
            </SidebarInset>
            
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Diagnosis Confirmed!"
                message="Diagnosis has been confirmed and locked."
                nextStepLabel="Go to Dashboard"
                onNextStep={handleNextStep}
            />
        <Toaster />
        </SidebarProvider>
    );
}
