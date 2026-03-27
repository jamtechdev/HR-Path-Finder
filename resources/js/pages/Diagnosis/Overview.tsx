import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ArrowRight,
    Lock,
    Rocket,
    Building2,
    Users,
    UserCog,
    UserCheck,
    BriefcaseBusiness,
    Upload,
    Network,
    Layers,
    AlertTriangle,
    Check,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';

interface Diagnosis {
    id: number;
    status: string;
    industry_category?: string;
    industry_subcategory?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    total_executives?: number;
    executive_positions?: unknown;
    leadership_count?: number;
    job_grade_names?: unknown[];
    organizational_charts?: unknown;
    org_structure_types?: unknown;
    organizational_structure?: unknown;
    job_categories?: unknown[];
    job_functions?: unknown[];
    hr_issues?: unknown;
    custom_hr_issues?: string;
}

interface Project {
    id: number;
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
}

interface StepConfig {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    estMin: number;
}

const STEPS: StepConfig[] = [
    { id: 'company-info', name: 'Basic Info', description: 'Company name, registration, HQ, industry, and listing status.', icon: <Building2 className="w-5 h-5" />, route: 'company-info', estMin: 4 },
    { id: 'workforce', name: 'Workforce', description: 'Present headcount, expected growth, tenure, age, and gender.', icon: <Users className="w-5 h-5" />, route: 'workforce', estMin: 4 },
    { id: 'executives', name: 'Executives', description: 'Total executives and positions (e.g. CEO, CFO).', icon: <UserCog className="w-5 h-5" />, route: 'executives', estMin: 2 },
    { id: 'leaders', name: 'Leaders', description: 'Leaders above team leader and share of workforce.', icon: <UserCheck className="w-5 h-5" />, route: 'leaders', estMin: 2 },
    { id: 'job-grades', name: 'Job Grades', description: 'Job grade names and promotion-in-grade structure.', icon: <BriefcaseBusiness className="w-5 h-5" />, route: 'job-grades', estMin: 3 },
    { id: 'organizational-charts', name: 'Org Charts', description: 'Upload organizational charts for required years.', icon: <Upload className="w-5 h-5" />, route: 'organizational-charts', estMin: 5 },
    { id: 'organizational-structure', name: 'Org Structure', description: 'Select organizational structure type(s).', icon: <Network className="w-5 h-5" />, route: 'organizational-structure', estMin: 2 },
    { id: 'job-structure', name: 'Job Structure', description: 'Job categories and job functions.', icon: <Layers className="w-5 h-5" />, route: 'job-structure', estMin: 4 },
    { id: 'hr-issues', name: 'HR Issues', description: 'Key HR and organizational issues to address.', icon: <AlertTriangle className="w-5 h-5" />, route: 'hr-issues', estMin: 3 },
    { id: 'review', name: 'Review & Submit', description: 'Final review and submission of diagnosis data.', icon: <Check className="w-5 h-5" />, route: 'review', estMin: 2 },
];

const TOTAL_EST_MIN = 31;

function validateStepCompletion(tabId: string, diagnosis: Diagnosis | undefined): boolean {
    if (!diagnosis) return false;
    switch (tabId) {
        case 'company-info':
            return !!(diagnosis.industry_category && String(diagnosis.industry_category).trim() !== '');
        case 'workforce':
            return !!(diagnosis.present_headcount && diagnosis.present_headcount > 0);
        case 'organizational-charts': {
            const charts = diagnosis.organizational_charts;
            if (Array.isArray(charts)) return charts.length > 0;
            if (charts && typeof charts === 'object') return Object.keys(charts).length > 0;
            return false;
        }
        case 'organizational-structure': {
            const structure = diagnosis.org_structure_types ?? diagnosis.organizational_structure;
            if (Array.isArray(structure)) return structure.length > 0;
            if (structure && typeof structure === 'object') return Object.keys(structure).length > 0;
            return false;
        }
        case 'job-structure':
            return !!(
                (diagnosis.job_categories && diagnosis.job_categories.length > 0) ||
                (diagnosis.job_functions && diagnosis.job_functions.length > 0)
            );
        case 'hr-issues':
            return !!(
                (diagnosis.hr_issues && (Array.isArray(diagnosis.hr_issues) ? diagnosis.hr_issues.length > 0 : false)) ||
                (diagnosis.custom_hr_issues && String(diagnosis.custom_hr_issues).trim() !== '')
            );
        case 'review':
            return false; // handled by diagnosisStatus
        case 'executives':
            return !!(diagnosis.total_executives != null || (diagnosis.executive_positions && Array.isArray(diagnosis.executive_positions) && diagnosis.executive_positions.length > 0));
        case 'leaders':
            return diagnosis.leadership_count != null;
        case 'job-grades':
            return !!(diagnosis.job_grade_names && Array.isArray(diagnosis.job_grade_names) && diagnosis.job_grade_names.length > 0);
        default:
            return false;
    }
}

interface Props {
    project: Project;
    company: Project['company'];
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

export default function DiagnosisOverview({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const pid = projectId ?? project?.id;
    const isReviewSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';

    const completedSteps = React.useMemo(() => {
        const set = new Set<string>();
        STEPS.forEach((step) => {
            if (step.id === 'review') {
                if (isReviewSubmitted) set.add(step.id);
                return;
            }
            const status = stepStatuses[step.id];
            const statusDone = status && ['submitted', 'approved', 'locked', 'completed', true].includes(status as string);
            if (statusDone || validateStepCompletion(step.id, diagnosis)) {
                set.add(step.id);
            }
        });
        return set;
    }, [diagnosis, stepStatuses, isReviewSubmitted]);

    const completedCount = STEPS.filter((s) => completedSteps.has(s.id)).length;
    const progressPct = STEPS.length ? Math.round((completedCount / STEPS.length) * 100) : 0;

    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        if (isReviewSubmitted) return 'submitted';
        if (diagnosisStatus === 'in_progress' || completedCount > 0) return 'in_progress';
        return 'not_started';
    };

    const statusLabel = getStatusForHeader() === 'submitted' ? 'SUBMITTED' : getStatusForHeader() === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED';

    const isStepEnabled = (index: number) => {
        if (index === 0) return true;
        for (let i = 0; i < index; i++) {
            if (!completedSteps.has(STEPS[i].id)) return false;
        }
        return true;
    };

    const handleStart = (step: StepConfig, index: number) => {
        if (!isStepEnabled(index)) return;
        const url = pid ? `/hr-manager/diagnosis/${pid}/${step.route}` : `/hr-manager/diagnosis/${step.route}`;
        router.visit(url);
    };

    return (
        <AppLayout showWorkflowSteps={true} stepStatuses={stepStatuses} projectId={pid}>
            <Head title={`Step 1: Diagnosis - ${company?.name || project?.company?.name || 'Company'}`} />
            <div className="min-h-full flex flex-col bg-[#f5f3ef] text-[#1e293b]">
                {/* Hero Section — same as Job Analysis / Performance */}
                <section className="bg-[#0f172a] text-white px-6 py-10 pb-20 md:px-[10%]">
                    <div className="mb-4">
                        <Link
                            href="/hr-manager/dashboard"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#b38e5d] bg-[#b38e5d]/10 px-3 py-1.5 text-sm font-semibold text-[#b38e5d] transition-colors hover:bg-[#b38e5d]/20"
                        >
                            ← Back
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                        <div className="font-bold text-lg">
                            HR Path-Finder <span className="font-normal text-[#64748b] ml-2">/ Diagnosis</span>
                        </div>
                        <div className="bg-white/10 border border-white/20 px-3 py-1 rounded-[20px] text-xs text-[#94a3b8]">
                            {statusLabel}
                        </div>
                    </div>

                    <div className="text-[#b38e5d] uppercase text-xs font-bold tracking-wider mb-1">
                        ● STAGE 1 OF 5 — DIAGNOSIS
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-2">Diagnosis Overview</h1>
                    <p className="text-[#94a3b8] max-w-[600px] leading-relaxed">
                        Provide company information and organizational context. Complete each step in sequence to build a foundation for your HR system design.
                    </p>

                    <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10 max-w-[720px]">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#b38e5d] mb-2">
                            Before you begin
                        </div>
                        <p className="text-[#e2e8f0] text-sm leading-relaxed m-0">
                            In this step you will enter company basics, industry, workforce composition, organizational structure, and HR issues. This data will be used for job analysis, performance, and compensation design. All inputs are confidential.
                        </p>
                    </div>

                    <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        <div className="border-r-0 md:border-r md:border-white/10 pr-0 md:pr-10">
                            <div className="text-[11px] text-[#94a3b8] uppercase">Steps Done</div>
                            <strong className="text-2xl text-[#b38e5d]">
                                {completedCount} / {STEPS.length}
                            </strong>
                            <div className="text-[11px] text-[#64748b]">steps completed</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span>Overall Progress</span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="h-1 w-full rounded-sm bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-sm bg-[#b38e5d] transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                        <div className="border border-[#b38e5d] px-4 py-2 rounded-[20px] text-white text-[13px] whitespace-nowrap">
                            ⏱ Est. <b>~{TOTAL_EST_MIN} min</b> total
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <div className="flex-1 max-w-[1000px] mx-auto px-5 -mt-10 relative w-full">
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-[#d1d5db] z-[1]" aria-hidden />

                    <div className="space-y-6 relative z-[2]">
                        {STEPS.map((step, index) => {
                            const completed = completedSteps.has(step.id);
                            const enabled = isStepEnabled(index);
                            const isActive = enabled && !completed;

                            return (
                                <div key={step.id} className="flex gap-6">
                                    <div
                                        className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-5 border',
                                            completed && 'bg-emerald-500 border-emerald-500 text-white',
                                            isActive && 'bg-[#1e293b] text-white border-[#1e293b]',
                                            !enabled && 'bg-white border-[#d1d5db] text-[#94a3b8]'
                                        )}
                                    >
                                        {completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                    </div>

                                    <div
                                        className={cn(
                                            'flex-1 bg-white rounded-xl border border-[#e2e8f0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all',
                                            isActive && 'border-2 border-[#1e293b] shadow-lg',
                                            !enabled && 'opacity-60 bg-[#fafafa]'
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <div
                                                className={cn(
                                                    'text-[11px] font-bold uppercase',
                                                    enabled ? 'text-[#b38e5d]' : 'text-[#cbd5e1]'
                                                )}
                                            >
                                                STEP {index + 1} OF {STEPS.length}
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-xl font-bold mt-1 flex items-center gap-2',
                                                    enabled ? 'text-[#1e293b]' : 'text-[#94a3b8]'
                                                )}
                                            >
                                                {step.icon}
                                                {step.name}
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-sm mt-1 mb-3',
                                                    enabled ? 'text-[#64748b]' : 'text-[#cbd5e1]'
                                                )}
                                            >
                                                {step.description}
                                            </p>
                                            <div
                                                className={cn('text-xs', enabled ? 'text-[#94a3b8]' : 'text-[#cbd5e1]')}
                                            >
                                                ~{step.estMin} min
                                                {!enabled && index > 0 && ` • Complete Step ${index} first`}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                            {enabled && !completed && (
                                                <>
                                                    <div className="bg-[#f8fafc] text-[#64748b] px-3 py-1.5 rounded-lg text-xs">
                                                        Ready to Start
                                                    </div>
                                                    <Button
                                                        onClick={() => handleStart(step, index)}
                                                        className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                    >
                                                        Start <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {completed && (
                                                <Button
                                                    onClick={() => handleStart(step, index)}
                                                    variant="outline"
                                                    className="font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                >
                                                    Review <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {!enabled && (
                                                <div className="bg-[#f1f5f9] text-[#94a3b8] px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
                                                    <Lock className="w-3.5 h-3.5" />
                                                    Locked
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="sticky bottom-0 w-full bg-white py-4 px-5 md:px-[10%] flex flex-wrap items-center justify-between gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 mt-auto border-t border-[#e2e8f0]">
                    <p className="text-sm text-[#64748b]">
                        <b>{completedCount}</b> of {STEPS.length} steps completed
                    </p>
                    <Button
                        onClick={() => handleStart(STEPS[0], 0)}
                        className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-8 py-3 rounded-lg"
                    >
                        <Rocket className="w-4 h-4 mr-2" />
                        Start Diagnosis
                    </Button>
                </footer>
            </div>
        </AppLayout>
    );
}
