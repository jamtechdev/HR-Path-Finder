import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { tr } from '@/config/diagnosisTranslations';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { diagnosisTabs } from '@/config/diagnosisTabs';

// HR issue categories for grouping on review (id, color, issue strings)
const HR_ISSUE_CATEGORIES = [
    { id: 'retention', color: '#e8622a', issues: ['Does not bring in high-caliber leadership/management', 'Did not bring in right people for key roles', 'Did not bring in enough people in same dimension', 'High turnover in specific roles / teams', 'High turnover with less than 1 year of employment', 'High turnover with less than 3 or more years of employment'] },
    { id: 'org', color: '#2a7de8', issues: ['Roles not clearly defined', 'Unclear responsibilities between two or more positions', 'Org structure does not enable business to change', 'Excessive span of control (too many direct reports)', 'Org structure shifts rapidly', 'Confusion of responsibility and accountability', 'Unclear where to go between', 'Slow handover to executives', 'Excessive handover to executives', "Org structure doesn't form at all stages", 'Grow all directions at all ages', 'Slow decision-making'] },
    { id: 'culture', color: '#2aab6e', issues: ['Top-down culture and low freedom of leadership style', 'Lack of clear defined key success measures and competencies', 'Unclear how employees are recognised and why', "Does not manage teams' leadership capability", 'Chaos of local conflict', 'Low or no feedback culture', 'Lacking role models / conflict'] },
    { id: 'reward', color: '#c8a84b', issues: ['Pay too evolved that it is not in a system', 'Same pay across levels that pushes talent out', 'Pay not linked to performance or contribution', 'Pay gap between line and new employees', 'Lack of reward for high performers', 'Excessive overload that is not rewarded', 'No clear ownership of reward decisions', 'Benefits not visible or valued'] },
    { id: 'upskilling', color: '#7c3aed', issues: ['Few employees at all levels have learning and development set', 'Limited budget for learning and development', 'Lack of leadership development programs', 'Lack of steps or programs to become a manager'] },
];
const HR_ISSUE_CATEGORY_LABELS: Record<string, string> = {
    retention: 'Retention',
    org: 'Org Structure',
    culture: 'Culture',
    reward: 'Reward',
    upskilling: 'Upskilling',
    Other: 'Other',
};

const STEP_MAP: Record<string, string> = {
    company: 'company-info',
    workforce: 'workforce',
    executives: 'executives',
    leaders: 'leaders',
    jobGrades: 'job-grades',
    orgCharts: 'organizational-charts',
    orgStructure: 'organizational-structure',
    jobStructure: 'job-structure',
    hrIssues: 'hr-issues',
};

const GRADE_COLORS = ['#1a3a6e', '#1e4d8c', '#2261aa', '#3b7fd4', '#6da8f0'];
const GENDER_COLORS = ['#0f2a4a', '#c8a84b', '#94a3b8'];

function pyramidShape(grades: { name: string; headcount: number }[]): { label: string; color: string; desc: string } {
    if (!grades.length) return { label: tr('pyramidDiamond'), color: '#c8a84b', desc: tr('pyramidDiamondDesc') };
    let inc = 0, dec = 0;
    for (let i = 0; i < grades.length - 1; i++) {
        if (grades[i].headcount < grades[i + 1].headcount) inc++;
        else dec++;
    }
    if (inc >= grades.length - 1) return { label: tr('pyramidHealthy'), color: '#2aab6e', desc: tr('pyramidHealthyDesc') };
    if (dec >= grades.length - 1) return { label: tr('pyramidInverted'), color: '#e8622a', desc: tr('pyramidInvertedDesc') };
    return { label: tr('pyramidDiamond'), color: '#c8a84b', desc: tr('pyramidDiamondDesc') };
}

function ReviewCard({
    title,
    icon,
    editUrl,
    children,
}: {
    title: string;
    icon: string;
    editUrl: string;
    children: React.ReactNode;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="overflow-hidden rounded-[14px] border-[1.5px] bg-white transition-shadow"
            style={{
                borderColor: '#e2e8f0',
                boxShadow: hov ? '0 4px 18px rgba(15,42,74,0.1)' : '0 1px 4px rgba(15,42,74,0.05)',
            }}
        >
            <div className="flex items-center justify-between border-b" style={{ borderColor: '#f0f4f8', background: '#f8fafc', padding: '12px 16px' }}>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#0f2a4a]">{title}</span>
                </div>
                <Link
                    href={editUrl}
                    className="inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 text-[10px] font-semibold transition-opacity hover:bg-slate-50"
                    style={{ opacity: hov ? 1 : 0, borderColor: '#e2e8f0', color: '#64748b' }}
                >
                    <svg width="9" height="9" viewBox="0 0 11 11" fill="none" className="shrink-0">
                        <path d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z" stroke="#64748b" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    {tr('editBtn')}
                </Link>
            </div>
            <div style={{ padding: '14px 16px' }}>{children}</div>
        </div>
    );
}

function KpiBlock({ label, value, unit, accent }: { label: string; value: number | string; unit: string; accent?: string }) {
    return (
        <div className="min-w-[80px] flex-1 rounded-[9px] p-3" style={{ background: '#f8fafc', padding: '11px 13px' }}>
            <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#94a3b8]">{label}</div>
            <div className="text-xl font-extrabold leading-none text-[#0f2a4a]" style={accent ? { color: accent } : undefined}>
                {value}
                <span className="ml-0.5 text-[11px] font-medium text-[#94a3b8]">{unit}</span>
            </div>
        </div>
    );
}

interface Diagnosis {
    id: number;
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
    gender_other?: number;
    gender_ratio?: number;
    total_executives?: number;
    executive_positions?: Array<{ position: string; count: number }> | Record<string, number>;
    leadership_count?: number;
    leadership_percentage?: number;
    job_grade_names?: string[];
    job_grade_headcounts?: Record<string, number>;
    promotion_years?: number[] | Record<string, number>;
    organizational_charts?: string[] | Record<string, string>;
    org_structure_types?: string[];
    org_structure_explanations?: Record<string, string>;
    hr_issues?: string[];
    custom_hr_issues?: string;
    job_categories?: string[];
    job_functions?: string[];
    [key: string]: any;
}

interface Company {
    id: number;
    name: string;
    hq_location?: string;
    logo_path?: string;
    foundation_date?: string;
    brand_name?: string;
    registration_number?: string;
    is_public?: boolean;
    public_listing_status?: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
    };
    company: Company;
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

export default function Review({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteProcessing, setInviteProcessing] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const { props } = usePage<{ errors?: Record<string, string> }>();

    // Show errors from server when redirected back with validation/authorization errors
    useEffect(() => {
        const errors = props.errors;
        if (errors && typeof errors === 'object') {
            const message = (errors as Record<string, string | string[]>).error;
            const msg = Array.isArray(message) ? message[0] : message;
            if (msg) setSubmitError(msg);
        }
    }, [props.errors]);

    const handleSubmit = () => {
        setSubmitError('');
        if (!projectId) {
            const msg = 'Project not loaded. Please refresh or go back to the dashboard.';
            setSubmitError(msg);
            toast({ title: 'Cannot submit', description: msg, variant: 'destructive' });
            return;
        }
        setProcessing(true);
        router.post(`/hr-manager/diagnosis/${projectId}/submit`, {}, {
            onSuccess: () => {
                setSubmitError('');
                setShowSuccessModal(true);
                setProcessing(false);
                toast({ title: 'Diagnosis submitted', description: 'Your diagnosis has been submitted for CEO review.' });
            },
            onError: (payload: Record<string, unknown>) => {
                const errors = (payload?.errors ?? payload) as Record<string, string | string[]>;
                const message = errors?.error ?? errors?.message ?? Object.values(errors)[0];
                const msg = Array.isArray(message) ? message[0] : message;
                const displayMsg = typeof msg === 'string' ? msg : 'Submission failed. Please try again.';
                setSubmitError(displayMsg);
                setProcessing(false);
                toast({ title: 'Submission failed', description: displayMsg, variant: 'destructive' });
            },
            preserveState: true,
            preserveScroll: true,
            only: [], // Prevent prop updates to keep modal state
        });
    };

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess(false);

        if (!inviteEmail || !inviteEmail.includes('@')) {
            setInviteError('Please enter a valid email address');
            return;
        }

        setInviteProcessing(true);
        
        router.post(`/companies/${company.id}/invite-ceo`, {
            email: inviteEmail,
            hr_project_id: projectId,
        }, {
            onSuccess: () => {
                setInviteSuccess(true);
                setInviteProcessing(false);
                setInviteError('');
                toast({ title: 'Invitation sent', description: `An invitation has been sent to ${inviteEmail}.` });
            },
            onError: (errors: { email?: string }) => {
                const errMsg = errors.email || 'Failed to send invitation. Please try again.';
                setInviteError(errMsg);
                setInviteProcessing(false);
                toast({ title: 'Invitation failed', description: errMsg, variant: 'destructive' });
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setInviteEmail('');
        setInviteError('');
        setInviteSuccess(false);
        // Redirect to dashboard after closing modal
        router.visit('/hr-manager/dashboard');
    };

    const getEditUrl = (tab: string) => {
        return projectId ? `/hr-manager/diagnosis/${projectId}/${tab}` : `/hr-manager/diagnosis/${tab}`;
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : '-';
            }
            return JSON.stringify(value);
        }
        return String(value);
    };

    const formatNumber = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return numValue.toLocaleString();
    };

    const formatPercentage = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return `${numValue.toFixed(1)}%`;
    };

    const formatCurrency = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        if (numValue >= 1000) {
            return `₩${(numValue / 1000).toFixed(1)}B`;
        }
        return `₩${numValue.toFixed(1)}B`;
    };

    // Parse executive positions
    const getExecutivePositions = (): Array<{ position: string; count: number }> => {
        if (!diagnosis?.executive_positions) return [];
        
        if (Array.isArray(diagnosis.executive_positions)) {
            return diagnosis.executive_positions;
        }
        
        if (typeof diagnosis.executive_positions === 'object') {
            return Object.entries(diagnosis.executive_positions).map(([position, count]) => ({
                position,
                count: typeof count === 'number' ? count : parseInt(String(count), 10)
            }));
        }
        
        return [];
    };

    // Parse org structure explanations
    const getOrgStructureExplanations = (): Record<string, string> => {
        if (!diagnosis?.org_structure_explanations) return {};
        if (typeof diagnosis.org_structure_explanations === 'object') {
            return diagnosis.org_structure_explanations as Record<string, string>;
        }
        return {};
    };

    // Derived data for dashboard
    const jobGradesForPyramid = useMemo(() => {
        const names = diagnosis?.job_grade_names ?? [];
        const headcounts = (diagnosis?.job_grade_headcounts ?? {}) as Record<string, number>;
        return names.map((name) => ({ name, headcount: Number(headcounts[name]) || 0 }));
    }, [diagnosis?.job_grade_names, diagnosis?.job_grade_headcounts]);

    const gradeTotal = useMemo(() => jobGradesForPyramid.reduce((s, g) => s + g.headcount, 0), [jobGradesForPyramid]);

    const jobStructureForReview = useMemo(() => {
        const funcs = diagnosis?.job_functions ?? [];
        const cats = diagnosis?.job_categories ?? [];
        const map = new Map<string, string[]>();
        for (const c of cats) {
            const name = String(c).trim();
            if (name && !map.has(name)) map.set(name, []);
        }
        for (const f of funcs) {
            const s = String(f);
            const sep = s.indexOf('|');
            const cat = sep > 0 ? s.slice(0, sep).trim() : 'General';
            const fn = sep > 0 ? s.slice(sep + 1).trim() : s;
            if (!map.has(cat)) map.set(cat, []);
            if (fn) map.get(cat)!.push(fn);
        }
        if (map.size === 0 && (funcs.length || cats.length)) return [];
        if (map.size === 0) return [];
        return Array.from(map.entries()).map(([name, functions]) => ({ name, functions }));
    }, [diagnosis?.job_functions, diagnosis?.job_categories]);

    const hrIssuesByCategory = useMemo(() => {
        const issues = diagnosis?.hr_issues ?? [];
        const custom = (diagnosis?.custom_hr_issues ?? '').trim();
        const result: { category: string; color: string; items: string[] }[] = [];
        for (const cat of HR_ISSUE_CATEGORIES) {
            const items = issues.filter((i) => cat.issues.includes(i));
            if (items.length) result.push({ category: cat.id, color: cat.color, items });
        }
        if (custom) result.push({ category: 'Other', color: '#64748b', items: [custom] });
        return result;
    }, [diagnosis?.hr_issues, diagnosis?.custom_hr_issues]);

    const currentOrgChartUrl = useMemo(() => {
        const charts = diagnosis?.organizational_charts;
        if (!charts || typeof charts !== 'object' || Array.isArray(charts)) return '';
        const lastYear = DIAGNOSIS_ORG_CHART_REQUIRED_YEARS[DIAGNOSIS_ORG_CHART_REQUIRED_YEARS.length - 1];
        const path = (charts as Record<string, string>)[lastYear];
        if (!path || typeof path !== 'string') return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/storage/')) return path;
        return path.startsWith('storage/') ? `/${path}` : `/storage/${path}`;
    }, [diagnosis?.organizational_charts]);

    const totalHeadcount = Number(diagnosis?.present_headcount) || 0;
    const execTotal = Number(diagnosis?.total_executives) || 0;
    const leaderCountFromGrades = jobGradesForPyramid.slice(0, 2).reduce((s, g) => s + g.headcount, 0);
    const leaderTotal = execTotal + leaderCountFromGrades;
    const leaderRatio = totalHeadcount ? ((leaderTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const execRatio = totalHeadcount ? ((execTotal / totalHeadcount) * 100).toFixed(1) : '0';
    const pyramidDiag = pyramidShape(jobGradesForPyramid);

    const genderData = useMemo(() => {
        const male = Number(diagnosis?.gender_male) || 0;
        const female = Number(diagnosis?.gender_female) || 0;
        const other = Number(diagnosis?.gender_other) || 0;
        return [
            { name: tr('male'), value: male },
            { name: tr('female'), value: female },
            { name: tr('other'), value: other || 1 },
        ];
    }, [diagnosis?.gender_male, diagnosis?.gender_female, diagnosis?.gender_other]);

    const execPositionsStr = useMemo(() => {
        const pos = getExecutivePositions();
        return pos.map((p) => `${p.position} × ${p.count}`).join(', ');
    }, [diagnosis?.executive_positions]);

    return (
        <>
            <Head title={`Review & Submit - ${company?.name || project?.company?.name || 'Company'}`} />
            
            {/* Success Modal with Invite CEO */}
            <Dialog open={showSuccessModal} onOpenChange={(open) => {
                if (!open) {
                    handleCloseModal();
                } else {
                    setShowSuccessModal(true);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">Diagnosis Submitted Successfully!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Your diagnosis has been submitted for CEO review. You can now invite the CEO to join the platform.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {!inviteSuccess ? (
                            <form onSubmit={handleInviteCeo} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ceo-email">CEO Email Address</Label>
                                    <Input
                                        id="ceo-email"
                                        type="email"
                                        placeholder="ceo@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        disabled={inviteProcessing}
                                        required
                                        className={inviteError ? 'border-red-500' : ''}
                                    />
                                    {inviteError && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {inviteError}
                                        </p>
                                    )}
                                </div>
                                
                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                        disabled={inviteProcessing}
                                        className="w-full sm:w-auto"
                                    >
                                        Skip for Now
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={inviteProcessing || !inviteEmail}
                                        className="w-full sm:w-auto"
                                    >
                                        {inviteProcessing ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Invite CEO
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="font-medium">Invitation sent successfully!</p>
                                    </div>
                                    <p className="text-sm text-green-700 mt-2">
                                        An invitation email has been sent to <strong>{inviteEmail}</strong>. The CEO will receive instructions to join the platform.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCloseModal}
                                        className="w-full"
                                    >
                                        Done
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <FormLayout
                title={tr('reviewDashboardTitle')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="hr-issues"
                showNext={false}
            >
                <div className="-mx-9 -mt-7 bg-[#f4f6f9] min-h-full pb-6">
                    {/* Step nav bar — ref: gap 8px, padding 4px 11px, sticky, 52px */}
                    <div className="bg-white border-b border-[#e2e8f0] px-5 flex items-center gap-2 h-[52px] overflow-x-auto shrink-0 sticky top-0 z-[100]" style={{ gap: 8 }}>
                        {diagnosisTabs
                            .filter((tab) => tab.id !== 'overview')
                            .map((tab) => {
                                const isCurrent = tab.id === 'review';
                                const isDone = tab.id !== 'review';
                                const href = projectId ? `/hr-manager/diagnosis/${projectId}/${tab.id}` : `/hr-manager/diagnosis/${tab.id}`;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={href}
                                        className="flex items-center gap-1 py-1 px-[11px] rounded-[20px] text-[11.5px] font-medium whitespace-nowrap shrink-0 transition-colors"
                                        style={{
                                            background: isCurrent ? '#0f2a4a' : isDone ? '#e8f8ef' : 'transparent',
                                            color: isCurrent ? '#fff' : isDone ? '#1a9e55' : '#94a3b8',
                                            border: isCurrent ? 'none' : isDone ? '1.5px solid #a7efcc' : '1.5px solid #e2e8f0',
                                            fontWeight: isCurrent ? 700 : 500,
                                        }}
                                    >
                                        {isDone && !isCurrent && <span className="shrink-0">✓</span>}
                                        {tab.name}
                                    </Link>
                                );
                            })}
                    </div>
                    <div className="max-w-[960px] mx-auto px-5 pt-7 pb-12" style={{ padding: '28px 20px 50px' }}>
                <div className="space-y-4">
                    {/* Page header — ref: margin-bottom 20px */}
                    <header className="mb-5" style={{ marginBottom: 20 }}>
                        <h1 className="m-0 text-xl font-extrabold text-[#0f2a4a]" style={{ fontSize: 20, fontWeight: 800 }}>{tr('reviewDashboardTitle')}</h1>
                        <p className="mt-1 text-[12px] text-[#94a3b8]" style={{ marginTop: 4 }}>{tr('reviewDashboardDescShort')}</p>
                    </header>

                    {/* Hero dark — ref: 3 KPIs only, padding 22px 26px, divider 44px */}
                    <div className="rounded-t-[14px] text-white" style={{ background: 'linear-gradient(135deg, #0f2a4a 0%, #1a4070 100%)', padding: '22px 26px' }}>
                        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#c8a84b]">
                            {company?.name || project?.company?.name || '—'} · {[diagnosis?.industry_category, diagnosis?.industry_subcategory].filter(Boolean).map((v) => formatValue(v)).join(' · ') || '—'}
                        </div>
                        <div className="flex flex-wrap items-end gap-7" style={{ gap: 28 }}>
                            <div>
                                <label className="block text-[9px] text-[#94a3b8] uppercase mb-0.5">{tr('totalHeadcount')}</label>
                                <div className="text-2xl font-extrabold leading-none">
                                    {totalHeadcount}<span className="text-[12px] text-[#94a3b8] font-medium ml-0.5">{tr('personsUnit')}</span>
                                </div>
                            </div>
                            <div className="w-px h-[44px] bg-white/10 self-center shrink-0" />
                            <div>
                                <label className="block text-[9px] text-[#94a3b8] uppercase mb-0.5">{tr('leaderRatioLabel')}</label>
                                <div className="text-2xl font-extrabold leading-none text-[#c8a84b]">{leaderRatio}%</div>
                            </div>
                            <div>
                                <label className="block text-[9px] text-[#94a3b8] uppercase mb-0.5">{tr('avgTenureShort')}</label>
                                <div className="text-2xl font-extrabold leading-none text-[#2aab6e]">
                                    {formatNumber(diagnosis?.average_tenure_active)}<span className="text-[12px] text-[#94a3b8] font-medium ml-0.5">{tr('yearsUnit')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero light — ref: gender doughnut 80x80, legend with ● and "남성 46명" only (no %); job structure tags only */}
                    <div className="flex flex-wrap items-center rounded-b-[14px] border border-t-0 mb-4" style={{ background: '#fff', borderColor: '#e2e8f0', padding: '16px 26px', gap: 24 }}>
                        <div className="flex items-center gap-3" style={{ gap: 15 }}>
                            <span className="text-[10px] font-bold uppercase text-[#0f2a4a]">{tr('genderDistribution')}</span>
                            <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: totalHeadcount
                                            ? `conic-gradient(${GENDER_COLORS[0]} 0deg ${(Number(genderData[0].value) / totalHeadcount) * 360}deg, ${GENDER_COLORS[1]} ${(Number(genderData[0].value) / totalHeadcount) * 360}deg ${((Number(genderData[0].value) + Number(genderData[1].value)) / totalHeadcount) * 360}deg, ${GENDER_COLORS[2]} ${((Number(genderData[0].value) + Number(genderData[1].value)) / totalHeadcount) * 360}deg 360deg)`
                                            : `conic-gradient(${GENDER_COLORS[0]} 0deg 120deg, ${GENDER_COLORS[1]} 120deg 240deg, ${GENDER_COLORS[2]} 240deg 360deg)`,
                                        mask: 'radial-gradient(farthest-side, transparent 70%, black 70%)',
                                        WebkitMask: 'radial-gradient(farthest-side, transparent 70%, black 70%)',
                                    }}
                                />
                            </div>
                            <div className="flex flex-col text-[11px] gap-1" style={{ gap: 4 }}>
                                {genderData.slice(0, 2).map((d, i) => (
                                    <div key={`gender-${i}-${d.name ?? ''}`} className="flex items-center gap-1">
                                        <span style={{ color: GENDER_COLORS[i] }}>●</span>
                                        <span>{d.name}</span>
                                        <span className="font-bold text-[#0f2a4a]">{d.value}{tr('personsUnit')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-px h-[60px] bg-[#e2e8f0] shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase text-[#0f2a4a]">Job Structure</span>
                            <div className="flex flex-wrap gap-1.5 mt-2" style={{ gap: 5 }}>
                                {jobStructureForReview.flatMap((cat) =>
                                    cat.functions.map((fn, fnIdx) => (
                                        <span
                                            key={`${cat.name}-${fnIdx}-${fn}`}
                                            className="rounded-full border font-semibold text-[#0f2a4a]"
                                            style={{ fontSize: 9, background: '#f0f4fa', borderColor: '#c7d7f0', padding: '2px 8px', borderRadius: 20 }}
                                        >
                                            {fn}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard grid — ref: 2x2, gap 14px, margin-bottom 20px. Company, Workforce, 직급별 분포, 당면 이슈 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5" style={{ gap: 14, marginBottom: 20 }}>
                        <ReviewCard title={tr('companyCardTitle')} icon="🏢" editUrl={getEditUrl(STEP_MAP.company)}>
                            <div className="grid grid-cols-2 gap-2.5" style={{ gap: 10 }}>
                                {[
                                    [tr('foundedDate'), formatValue(company?.foundation_date) || '—'],
                                    [tr('size'), totalHeadcount ? String(totalHeadcount) : '—'],
                                    [tr('sector'), [diagnosis?.industry_category, diagnosis?.industry_subcategory].filter(Boolean).map((v) => formatValue(v)).join(' · ') || '—'],
                                    [tr('listedShort'), company?.public_listing_status ? String(company.public_listing_status) : (company?.is_public != null ? (company.is_public ? 'Yes' : 'No') : '—')],
                                ].map(([k, v], idx) => (
                                    <div key={`company-${idx}-${String(k ?? '')}`}>
                                        <div className="text-[9px] text-[#94a3b8] mb-0.5">{k}</div>
                                        <div className="text-[12px] font-semibold text-[#0f2a4a]">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </ReviewCard>
                        <ReviewCard title={tr('workforceCardTitle')} icon="👥" editUrl={getEditUrl(STEP_MAP.workforce)}>
                            <div className="flex gap-2.5" style={{ gap: 10 }}>
                                <div className="flex-1 rounded-lg p-2.5" style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                                    <div className="text-[9px] text-[#94a3b8] mb-0.5">{tr('fullTime')}</div>
                                    <div className="text-[18px] font-extrabold text-[#0f2a4a] leading-none">{totalHeadcount}</div>
                                </div>
                                {diagnosis?.average_age != null && (
                                    <div className="flex-1 rounded-lg p-2.5" style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                                        <div className="text-[9px] text-[#94a3b8] mb-0.5">{tr('avgAgeShort')}</div>
                                        <div className="text-[18px] font-extrabold text-[#0f2a4a] leading-none">{formatNumber(diagnosis.average_age)}</div>
                                    </div>
                                )}
                            </div>
                        </ReviewCard>
                        <ReviewCard title={tr('gradePyramidTitle')} icon="📊" editUrl={getEditUrl(STEP_MAP.jobGrades)}>
                            <div className="flex flex-col gap-1">
                                {jobGradesForPyramid.length ? (
                                    <>
                                        {jobGradesForPyramid.map((g, i) => {
                                            const max = Math.max(...jobGradesForPyramid.map((x) => x.headcount), 1);
                                            const pct = (g.headcount / max) * 100;
                                            const ratio = gradeTotal ? ((g.headcount / gradeTotal) * 100).toFixed(1) : '0';
                                            return (
                                                <div key={`grade-${i}-${String(g.name ?? '')}`} className="flex items-center gap-2" style={{ gap: 8, marginBottom: 5 }}>
                                                    <div className="shrink-0 text-right text-[11px] font-bold text-[#64748b]" style={{ width: 35 }}>{g.name}</div>
                                                    <div className="flex-1 relative" style={{ height: 26 }}>
                                                        <div
                                                            className="absolute left-1/2 -translate-x-1/2 h-full flex items-center justify-center text-white font-bold rounded"
                                                            style={{ width: `${pct}%`, minWidth: 36, fontSize: 10, borderRadius: 4, backgroundColor: GRADE_COLORS[i % GRADE_COLORS.length] }}
                                                        >
                                                            {g.headcount}{tr('personsUnit')}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-[9px] text-[#94a3b8]" style={{ width: 34 }}>{ratio}%</div>
                                                </div>
                                            );
                                        })}
                                        <div
                                            className="mt-2 flex items-start gap-2 rounded-lg border px-3 py-2"
                                            style={{
                                                marginTop: 8,
                                                padding: '8px 11px',
                                                borderRadius: 8,
                                                backgroundColor: `${pyramidDiag.color}18`,
                                                border: `1.5px solid ${pyramidDiag.color}50`,
                                            }}
                                        >
                                            <span className="shrink-0 text-xs font-extrabold" style={{ color: pyramidDiag.color }}>
                                                {pyramidDiag.label}
                                            </span>
                                            <span className="text-[10px] text-[#475569] leading-relaxed">{pyramidDiag.desc}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-[#64748b]">—</p>
                                )}
                            </div>
                        </ReviewCard>
                        <ReviewCard title={tr('currentIssuesTitle')} icon="⚠️" editUrl={getEditUrl(STEP_MAP.hrIssues)}>
                            <div className="flex flex-col gap-2">
                                {hrIssuesByCategory.length ? (
                                    hrIssuesByCategory.map((cat, catIdx) => (
                                        <div key={`hr-${catIdx}-${cat.category ?? ''}`} style={{ marginBottom: 8 }}>
                                            <span className="text-[10px] font-extrabold uppercase" style={{ color: cat.color }}>
                                                {HR_ISSUE_CATEGORY_LABELS[cat.category] ?? cat.category}
                                            </span>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {cat.items.map((item, itemIdx) => (
                                                    <span
                                                        key={`${cat.category}-item-${itemIdx}-${String(item ?? '')}`}
                                                        className="rounded text-[11px] text-[#475569]"
                                                        style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-[#64748b]">—</p>
                                )}
                            </div>
                        </ReviewCard>
                    </div>

                    {/* Optional second row: Org chart + Org structure */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5" style={{ gap: 14, marginBottom: 20 }}>
                        <ReviewCard title={tr('currentOrgChartTitle')} icon="🗂️" editUrl={getEditUrl(STEP_MAP.orgCharts)}>
                            <div className="flex min-h-[180px] flex-col items-center justify-center">
                                {currentOrgChartUrl ? (
                                    <img src={currentOrgChartUrl} alt="Org chart" className="max-h-[220px] max-w-full rounded-lg border border-[#e2e8f0] object-contain" />
                                ) : (
                                    <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-[#f8fafc]" style={{ borderColor: '#c7d7f0' }}>
                                        <div className="text-2xl">🖼️</div>
                                        <div className="text-xs font-semibold text-[#0f2a4a]">{tr('orgChartUploadHint')}</div>
                                        <div className="text-center text-[10px] text-[#94a3b8]">{tr('orgChartUploadDesc')}</div>
                                        <Link href={getEditUrl(STEP_MAP.orgCharts)} className="mt-1 rounded-md bg-[#0f2a4a] px-3.5 py-1.5 text-[10px] font-semibold text-white">
                                            {tr('goToPrevStep')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </ReviewCard>
                        <ReviewCard title={tr('orgStructureCardTitle')} icon="🏗️" editUrl={getEditUrl(STEP_MAP.orgStructure)}>
                            <div className="flex flex-col gap-2">
                                {diagnosis?.org_structure_types && diagnosis.org_structure_types.length > 0 ? (
                                    <div className="inline-flex items-center gap-2 self-start rounded-lg border px-4 py-2.5" style={{ background: '#f0f4fa', borderColor: '#c7d7f0' }}>
                                        <span className="text-lg">🏗️</span>
                                        <span className="text-sm font-bold text-[#0f2a4a]">
                                            {diagnosis.org_structure_types.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-[#64748b]">—</span>
                                )}
                            </div>
                        </ReviewCard>
                    </div>

                    {/* Submit footer — ref: padding 22px 26px, gradient, gold button */}
                    <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #0f2a4a, #1a4070)', padding: '22px 26px' }}>
                        <div>
                            <h3 className="m-0 text-sm font-bold text-white" style={{ fontSize: 14 }}>{tr('submitConfirmTitle')}</h3>
                            <p className="text-[11px] text-[#94a3b8] mt-0.5" style={{ margin: '3px 0 0' }}>{tr('submitConfirmDesc')}</p>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing || diagnosisStatus === 'submitted' || !projectId}
                            className="whitespace-nowrap border-0 font-bold text-white hover:opacity-95"
                            style={{ background: '#c8a84b', boxShadow: '0 4px 12px rgba(200,168,75,0.4)', borderRadius: 9, padding: '11px 24px', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' }}
                        >
                            {diagnosisStatus === 'submitted' ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Submitted
                                </>
                            ) : processing ? (
                                'Submitting…'
                            ) : (
                                tr('submitDiagnosisBtn')
                            )}
                        </Button>
                    </footer>
                    {submitError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Submission failed</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    )}
                    {!projectId && diagnosisStatus !== 'submitted' && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm text-amber-800">Project not loaded. Please refresh or go back to the dashboard.</p>
                        </div>
                    )}
                    {diagnosisStatus === 'submitted' && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">Diagnosis has been submitted and is awaiting CEO review.</p>
                        </div>
                    )}
                    <div className="mt-4">
                        <Link href={getEditUrl('hr-issues')}>
                            <Button variant="outline" size="sm" className="border-[#e2e8f0] font-semibold text-[#475569] bg-white hover:bg-slate-50">
                                {tr('backBtn')}
                            </Button>
                        </Link>
                    </div>
                </div>
                    </div>
                </div>
            </FormLayout>
        </>
    );
}
