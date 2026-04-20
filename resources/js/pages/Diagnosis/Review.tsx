import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import InlineErrorSummary, { flattenErrors } from '@/components/Forms/InlineErrorSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';
import { both, tr } from '@/config/diagnosisTranslations';
import { clearClientDraftCaches } from '@/lib/clientDraftCleanup';
import { mergeTabDraftsIntoDiagnosis } from '@/lib/diagnosisDraftStorage';
import { getOrgChartDraftFiles, getLogoDraftFile } from '@/lib/diagnosisFileDrafts';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
    uncategorized: 'Uncategorized',
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
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp']);

function pyramidShape(grades: { name: string; headcount: number }[]): { label: string; color: string; desc: string } {
    if (!grades.length) return { label: tr('pyramidDiamond'), color: '#c8a84b', desc: tr('pyramidDiamondDesc') };
    const headcounts = grades.map((g) => Number(g.headcount) || 0);
    const top = headcounts[0] ?? 0;
    const bottom = headcounts[headcounts.length - 1] ?? 0;
    const max = Math.max(...headcounts);
    const topIsMax = top === max;
    const bottomIsMax = bottom === max;

    if (bottomIsMax && !topIsMax) return { label: tr('pyramidHealthy'), color: '#2aab6e', desc: tr('pyramidHealthyDesc') };
    if (topIsMax && !bottomIsMax) return { label: tr('pyramidInverted'), color: '#e8622a', desc: tr('pyramidInvertedDesc') };

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
    return (
        <div className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80 dark:border-[#2a3a5c] dark:bg-[#1a2744]">
            <div className="flex items-center justify-between flex-wrap border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base shadow-sm ring-1 ring-slate-200/80 dark:bg-[#1e3a5f] dark:ring-[#2a3a5c]">
                        {icon}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#CBD0DA]">
                        {title}
                    </span>
                </div>
                <Link
                    href={editUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30 dark:text-[#CBD0DA] dark:hover:bg-[#2a3a5c]"
                >
                    <svg width="10" height="10" viewBox="0 0 11 11" fill="none" className="shrink-0" aria-hidden>
                        <path d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    {tr('editBtn')}
                </Link>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

interface Diagnosis {
    id: number;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
    present_headcount?: number;
    full_time_headcount?: number;
    contract_headcount?: number;
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
    const inviteModalResolvedKey = projectId
        ? `diagnosis:invite-modal-resolved:${projectId}`
        : null;
    const { t, i18n } = useTranslation();
    const isKo = (i18n.resolvedLanguage ?? i18n.language ?? 'ko')
        .toLowerCase()
        .startsWith('ko');

    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAlreadyDoneModal, setShowAlreadyDoneModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteProcessing, setInviteProcessing] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
    const submitErrorRef = useRef<HTMLDivElement>(null);

    // Bilingual (EN / KO) modal content using new translation keys
    const submitSuccessTitle = both('diagnosisSubmitSuccessTitle');
    const submitSuccessDesc = both('diagnosisSubmitSuccessDesc');

    const ceoEmailAddressLabel = {
        en: t('diagnosis_review.ceoEmailLabel'),
        ko: t('diagnosis_review.ceoEmailLabel_ko', t('diagnosis_review.ceoEmailLabel'))
    };

    const inviteCeoLabel = {
        en: t('diagnosis_review.inviteCeo'),
        ko: t('diagnosis_review.inviteCeo_ko', t('diagnosis_review.inviteCeo'))
    };

    const inviteSendingLabel = {
        en: t('diagnosis_review.sending'),
        ko: t('diagnosis_review.sending_ko', t('diagnosis_review.sending'))
    };

    const skipForNowLabel = {
        en: t('diagnosis_review.skipForNow'),
        ko: t('diagnosis_review.skipForNow_ko', t('diagnosis_review.skipForNow'))
    };

    const invitationSentTitle = {
        en: t('diagnosis_review.invitationSentTitle'),
        ko: t('diagnosis_review.invitationSentTitle_ko', t('diagnosis_review.invitationSentTitle'))
    };

    const invitationSentDesc = {
        en: t('diagnosis_review.invitationSentDesc'),
        ko: t('diagnosis_review.invitationSentDesc_ko', t('diagnosis_review.invitationSentDesc'))
    };

    const doneLabel = {
        en: t('diagnosis_review.done'),
        ko: t('diagnosis_review.done_ko', t('diagnosis_review.done'))
    };

    const pickLabel = (v: { en: string; ko: string }) => (isKo ? v.ko : v.en);

    const renderEmailTemplate = (template: string) => {
        const [before, after] = template.split('{{email}}');
        return (
            <>
                {before}
                <strong>{inviteEmail}</strong>
                {after}
            </>
        );
    };

    const { props } = usePage<{ errors?: Record<string, string> }>();

    const mergedDiagnosis = useMemo(() => {
        if (!projectId) return diagnosis;
        return mergeTabDraftsIntoDiagnosis(projectId, diagnosis ?? ({} as Diagnosis));
    }, [projectId, diagnosis]);

    useEffect(() => {
        const errors = props.errors;
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            const flat = flattenErrors(errors as Record<string, string | string[]>);
            setSubmitError(flat[0] ?? t('diagnosis_review.submitFailed'));
            const o: Record<string, string> = {};
            for (const [k, v] of Object.entries(errors)) {
                const m = Array.isArray(v) ? v[0] : v;
                if (typeof m === 'string') o[k] = m;
            }
            setPageErrors(o);
            return;
        }
        setSubmitError('');
        setPageErrors({});
    }, [props.errors, t]);

    useEffect(() => {
        if (!inviteModalResolvedKey) return;
        if (diagnosisStatus !== 'submitted') return;
        try {
            const resolved = window.sessionStorage.getItem(inviteModalResolvedKey);
            if (resolved !== '1') {
                setShowSuccessModal(true);
            }
        } catch {
            // ignore storage errors
        }
    }, [inviteModalResolvedKey, diagnosisStatus]);

    useLayoutEffect(() => {
        if (!submitError) return;
        submitErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [submitError]);

    const handleSubmit = () => {
        setSubmitError('');
        setPageErrors({});
        if (!projectId) {
            setSubmitError(t('diagnosis_review.projectNotLoaded'));
            return;
        }
        setProcessing(true);
        const payload = mergeTabDraftsIntoDiagnosis(projectId, diagnosis ?? ({} as Diagnosis));
        const fd = new FormData();
        fd.append('diagnosis_payload', JSON.stringify(payload));

        const chartDrafts = getOrgChartDraftFiles(projectId);
        for (const year of ['2023.12', '2024.12', '2025.12'] as const) {
            const f = chartDrafts[year];
            if (f) {
                fd.append(`org_chart_${year.replace('.', '_')}`, f);
            }
        }
        const logo = getLogoDraftFile(projectId);
        if (logo) {
            fd.append('company_logo', logo);
        }

        router.post(`/hr-manager/diagnosis/${projectId}/submit`, fd, {
            forceFormData: true,
            onSuccess: () => {
                setSubmitError('');
                setPageErrors({});
                clearClientDraftCaches(projectId);
                setShowSuccessModal(true);
                setProcessing(false);
            },
            onError: (payload: Record<string, unknown>) => {
                const errors = (payload?.errors ?? payload) as Record<string, string | string[]>;
                const lines = flattenErrors(errors);
                const alreadyDone = Object.prototype.hasOwnProperty.call(errors, 'already_submitted');
                setSubmitError(lines[0] ?? t('diagnosis_review.submitFailed'));
                const o: Record<string, string> = {};
                for (const [k, v] of Object.entries(errors)) {
                    const m = Array.isArray(v) ? v[0] : v;
                    if (typeof m === 'string') o[k] = m;
                }
                setPageErrors(o);
                if (alreadyDone) {
                    setShowAlreadyDoneModal(true);
                }
                setProcessing(false);
                queueMicrotask(() => {
                    submitErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess(false);

        if (!inviteEmail || !inviteEmail.includes('@')) {
            setInviteError(t('diagnosis_review.invalidEmail'));
            return;
        }

        setInviteProcessing(true);
        
        router.post(`/companies/${company.id}/invite-ceo`, {
            email: inviteEmail,
            hr_project_id: projectId,
        }, {
            onSuccess: () => {
                try {
                    if (inviteModalResolvedKey) {
                        window.sessionStorage.setItem(inviteModalResolvedKey, '1');
                    }
                } catch {
                    // ignore storage errors
                }
                setInviteSuccess(true);
                setInviteProcessing(false);
                setInviteError('');
            },
            onError: (errors: { email?: string }) => {
                const errMsg = errors.email || t('diagnosis_review.inviteFailed');
                setInviteError(errMsg);
                setInviteProcessing(false);
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCloseModal = () => {
        try {
            if (inviteModalResolvedKey) {
                window.sessionStorage.setItem(inviteModalResolvedKey, '1');
            }
        } catch {
            // ignore storage errors
        }
        setShowSuccessModal(false);
        setInviteEmail('');
        setInviteError('');
        setInviteSuccess(false);
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

    const formatReviewDate = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        const raw = String(value).trim();
        if (!raw) return '-';

        const normalized = raw.replace(/\./g, '-').replace(/\//g, '-');
        const parsed = new Date(normalized);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
        }

        return raw;
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

    const preview = mergedDiagnosis ?? ({} as Diagnosis);

    const getExecutivePositions = (): Array<{ position: string; count: number }> => {
        if (!preview?.executive_positions) return [];

        if (Array.isArray(preview.executive_positions)) {
            return preview.executive_positions;
        }

        if (typeof preview.executive_positions === 'object') {
            return Object.entries(preview.executive_positions).map(([position, count]) => ({
                position,
                count: typeof count === 'number' ? count : parseInt(String(count), 10)
            }));
        }
        
        return [];
    };

    const getOrgStructureExplanations = (): Record<string, string> => {
        if (!preview?.org_structure_explanations) return {};
        if (typeof preview.org_structure_explanations === 'object') {
            return preview.org_structure_explanations as Record<string, string>;
        }
        return {};
    };

    const jobGradesForPyramid = useMemo(() => {
        const names = preview?.job_grade_names ?? [];
        const headcounts = (preview?.job_grade_headcounts ?? {}) as Record<string, number>;
        return names
            .map((name) => ({ name, headcount: Number(headcounts[name]) || 0 }))
            .reverse();
    }, [preview?.job_grade_names, preview?.job_grade_headcounts]);

    const gradeTotal = useMemo(() => jobGradesForPyramid.reduce((s, g) => s + g.headcount, 0), [jobGradesForPyramid]);

    const jobStructureForReview = useMemo(() => {
        const funcs = preview?.job_functions ?? [];
        const cats = preview?.job_categories ?? [];
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
    }, [preview?.job_functions, preview?.job_categories]);

    const hrIssuesByCategory = useMemo(() => {
        const issues = preview?.hr_issues ?? [];
        const custom = (preview?.custom_hr_issues ?? '').trim();
        const result: { category: string; color: string; items: string[] }[] = [];
        const categorized = new Set<string>();
        for (const cat of HR_ISSUE_CATEGORIES) {
            const items = issues.filter((i) => cat.issues.includes(i));
            if (items.length) {
                items.forEach((i) => categorized.add(i));
                result.push({ category: cat.id, color: cat.color, items });
            }
        }
        const uncategorized = issues.filter((i) => !categorized.has(i));
        if (uncategorized.length) {
            result.push({
                category: 'uncategorized',
                color: '#64748b',
                items: uncategorized,
            });
        }
        if (custom) result.push({ category: 'Other', color: '#64748b', items: [custom] });
        return result;
    }, [preview?.hr_issues, preview?.custom_hr_issues]);

    const orgChartEntries = useMemo(() => {
        const charts = preview?.organizational_charts;
        if (!charts) return [] as Array<{ label: string; url: string; extension: string; isImage: boolean }>;

        const normalize = (path: string): string => {
            if (!path) return '';
            if (path.startsWith('http')) return path;
            if (path.startsWith('/storage/')) return path;
            return path.startsWith('storage/') ? `/${path}` : `/storage/${path}`;
        };

        const getExtension = (path: string): string => {
            const clean = path.split('?')[0].split('#')[0];
            const file = clean.split('/').pop() ?? '';
            const idx = file.lastIndexOf('.');
            return idx >= 0 ? file.slice(idx + 1).toLowerCase() : '';
        };

        if (Array.isArray(charts)) {
            return charts
                .filter((p): p is string => typeof p === 'string' && p.length > 0)
                .map((p, i) => {
                    const extension = getExtension(p);
                    return {
                        label: `Chart ${i + 1}`,
                        url: normalize(p),
                        extension,
                        isImage: IMAGE_EXTENSIONS.has(extension),
                    };
                });
        }

        if (typeof charts === 'object') {
            return DIAGNOSIS_ORG_CHART_REQUIRED_YEARS.map((year) => {
                const path = (charts as Record<string, string>)[year];
                if (!path || typeof path !== 'string') return null;
                const extension = getExtension(path);
                return {
                    label: year,
                    url: normalize(path),
                    extension,
                    isImage: IMAGE_EXTENSIONS.has(extension),
                };
            }).filter((v): v is { label: string; url: string; extension: string; isImage: boolean } => Boolean(v));
        }

        return [] as Array<{ label: string; url: string; extension: string; isImage: boolean }>;
    }, [preview?.organizational_charts]);

    const orgStructureTypes = useMemo(() => {
        const types = preview?.org_structure_types;
        if (!Array.isArray(types)) return [] as string[];
        return types
            .map((t) => String(t).trim())
            .filter(Boolean)
            .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    }, [preview?.org_structure_types]);

    const orgStructureNotes = useMemo(() => {
        const raw = preview?.org_structure_explanations;
        if (!raw || typeof raw !== 'object') return [] as Array<{ key: string; value: string }>;
        return Object.entries(raw as Record<string, string>)
            .map(([key, value]) => ({
                key: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value ?? '').trim(),
            }))
            .filter((x) => x.value.length > 0);
    }, [preview?.org_structure_explanations]);

    const totalHeadcount = Number(preview?.present_headcount) || 0;
    const execTotal = Number(preview?.total_executives) || 0;
    const leaderHeadcount = Number(preview?.leadership_count) || 0;
    const pyramidDiag = pyramidShape(jobGradesForPyramid);

    const genderData = useMemo(() => {
        const male = Number(preview?.gender_male) || 0;
        const female = Number(preview?.gender_female) || 0;
        const other = Number(preview?.gender_other) || 0;
        return [
            { name: tr('male'), value: male },
            { name: tr('female'), value: female },
            { name: tr('other'), value: other || 1 },
        ];
    }, [preview?.gender_male, preview?.gender_female, preview?.gender_other]);

    const execPositionsStr = useMemo(() => {
        const pos = getExecutivePositions();
        return pos.map((p) => `${p.position} × ${p.count}`).join(', ');
    }, [preview?.executive_positions]);

    return (
        <>
            <Head
                title={t('page_heads.diagnosis_review_suffix', {
                    title: t('diagnosis_review.title'),
                    company:
                        company?.name ||
                        project?.company?.name ||
                        t('page_head_fallbacks.company'),
                })}
            />

            {/* Success Modal with Invite CEO */}
            <Dialog
                open={showSuccessModal}
                onOpenChange={(open) => {
                    // Prevent closing via outside click / ESC / implicit toggles.
                    // Modal closes only through explicit action buttons.
                    if (open) setShowSuccessModal(true);
                }}
            >
                <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="w-[min(92vw,760px)] max-w-[760px] rounded-2xl border-slate-200/80 bg-white/95 p-8 text-slate-900 shadow-2xl backdrop-blur-md dark:border-[#2a3a5c]/80 dark:bg-[#1a2744]/95 dark:text-[#e2e8f0]"
                >
                    <DialogHeader>
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-3xl font-extrabold leading-tight">
                            <span className="block">{pickLabel(submitSuccessTitle)}</span>
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-center text-base leading-relaxed text-slate-600 dark:text-[#9AA3B2]">
                            <span className="block">{pickLabel(submitSuccessDesc)}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {!inviteSuccess ? (
                            <form onSubmit={handleInviteCeo} className="space-y-5">
                                <div className="mt-1 space-y-2.5">
                                    <Label htmlFor="ceo-email" className="block text-sm font-semibold text-slate-700 dark:text-[#CBD0DA]">
                                        <span className="block">{pickLabel(ceoEmailAddressLabel)}</span>
                                    </Label>
                                    <Input
                                        id="ceo-email"
                                        type="email"
                                        placeholder="ceo@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        disabled={inviteProcessing}
                                        required
                                        className={cn(
                                            'h-11 rounded-lg border-slate-200 bg-white/90 px-3 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20',
                                            inviteError && 'border-red-500',
                                        )}
                                    />
                                    {inviteError && (
                                        <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            {inviteError}
                                        </p>
                                    )}
                                </div>
                                
                                <DialogFooter className="flex-col gap-2.5 pt-1 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                        disabled={inviteProcessing}
                                        className="h-10 w-full sm:w-auto"
                                    >
                                        {pickLabel(skipForNowLabel)}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={inviteProcessing || !inviteEmail}
                                        className="h-10 w-full sm:w-auto"
                                    >
                                        {inviteProcessing ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                {pickLabel(inviteSendingLabel)}
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4 mr-2" />
                                                {pickLabel(inviteCeoLabel)}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/40 dark:bg-green-900/20">
                                    <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="font-medium">
                                            <span className="block">{pickLabel(invitationSentTitle)}</span>
                                        </p>
                                    </div>
                                    <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                        <span className="block">{renderEmailTemplate(pickLabel(invitationSentDesc))}</span>
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCloseModal}
                                        className="w-full"
                                    >
                                        {pickLabel(doneLabel)}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAlreadyDoneModal} onOpenChange={setShowAlreadyDoneModal}>
                <DialogContent className="w-[min(92vw,560px)] max-w-[560px] rounded-2xl border-slate-200 bg-white p-7 text-slate-900 shadow-2xl dark:border-[#2a3a5c] dark:bg-[#1a2744] dark:text-[#e2e8f0]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold">
                            You have already done diagnosis submission
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-center text-sm text-slate-600 dark:text-[#9AA3B2]">
                            Diagnosis is already submitted. No additional submit is needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowAlreadyDoneModal(false)} className="w-full">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <FormLayout
                title={t('diagnosis_review.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="hr-issues"
                showBack={false}
                showNext={false}
            >
                <div className="min-h-full bg-slate-50/70 pb-10 dark:bg-transparent">
                    <div className="w-full px-4 py-8">
                        {/* Alerts — above fold */}
                        {submitError && (
                            <div ref={submitErrorRef}>
                                {(() => {
                                    const submitFailedTitle = t(
                                        'diagnosis_review.submitFailed',
                                    );
                                    const showDescription =
                                        submitError.trim() &&
                                        submitError.trim() !== submitFailedTitle.trim();
                                    return (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{submitFailedTitle}</AlertTitle>
                                    {showDescription && (
                                        <AlertDescription>{submitError}</AlertDescription>
                                    )}
                                </Alert>
                                    );
                                })()}
                            </div>
                        )}
                        {!projectId && diagnosisStatus !== 'submitted' && (
                            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                                <p className="text-sm font-medium">{t('diagnosis_review.projectNotLoaded')}</p>
                            </div>
                        )}
                        {diagnosisStatus === 'submitted' && (
                            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
                                <p className="text-sm font-medium">Diagnosis has been submitted and is awaiting CEO review.</p>
                            </div>
                        )}

                        {/* Page header */}
                        <header className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#e2e8f0]">
                                {t('diagnosis_review.title')}
                            </h1>
                            <p className="mt-1.5 text-sm text-slate-500 dark:text-[#9AA3B2]">
                                {t('diagnosis_review.subtitle')}
                            </p>
                        </header>

                        {/* Hero — company + 3 KPIs */}
                        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white shadow-xl">
                            <div className="px-6 pt-5 pb-6">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                                    {company?.name || project?.company?.name || '—'} · {[preview?.industry_category, preview?.industry_subcategory].filter(Boolean).map((v) => formatValue(v)).join(' · ') || '—'}
                                </p>
                                <div className="flex flex-wrap items-end gap-8 sm:gap-10">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('diagnosis_review.totalHeadcount')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight">
                                            {totalHeadcount}
                                            <span className="ml-1 text-base font-medium text-slate-400">{t('diagnosis_review.personsUnit')}</span>
                                        </p>
                                    </div>
                                    <div className="h-12 w-px bg-white/15" />
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('diagnosis_review.executiveHeadcountLabel')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight text-amber-400">
                                            {execTotal}
                                            <span className="ml-1 text-base font-medium text-slate-400">{t('diagnosis_review.personsUnit')}</span>
                                        </p>
                                    </div>
                                    <div className="h-12 w-px bg-white/15" />
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('diagnosis_review.leaderHeadcountLabel')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight text-amber-400">
                                            {leaderHeadcount}
                                            <span className="ml-1 text-base font-medium text-slate-400">{t('diagnosis_review.personsUnit')}</span>
                                        </p>
                                    </div>
                                    <div className="h-12 w-px bg-white/15" />
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{tr('avgTenureShort')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight text-emerald-400">
                                            {formatNumber(preview?.average_tenure_active)}
                                            <span className="ml-1 text-base font-medium text-slate-400">{tr('yearsUnit')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gender + Job structure strip */}
                        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#2a3a5c] dark:bg-[#1a2744]">
                            <div className="flex items-center gap-5 flex-wrap">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#9AA3B2]">{tr('genderDistribution')}</span>
                                <div className="relative h-20 w-20 shrink-0">
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
                                <div className="flex flex-col gap-1.5 text-sm">
                                    {genderData.slice(0, 2).map((d, i) => (
                                        <div key={`gender-${i}-${d.name ?? ''}`} className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: GENDER_COLORS[i] }} />
                                            <span className="text-slate-600 dark:text-[#9AA3B2]">{d.name}</span>
                                            <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">{d.value}{tr('personsUnit')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-14 w-px bg-slate-200 shrink-0 hidden sm:block dark:bg-[#2a3a5c]" />
                            <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#9AA3B2]">Job Structure</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {jobStructureForReview.flatMap((cat) =>
                                        cat.functions.map((fn, fnIdx) => (
                                            <span
                                                key={`${cat.name}-${fnIdx}-${fn}`}
                                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-[#1e3a5f]/40 dark:text-[#CBD0DA]"
                                            >
                                                {fn}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dashboard grid — Company, Workforce, Grade pyramid, HR issues */}
                        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <ReviewCard title={t('diagnosis_review.companyCardTitle')} icon="🏢" editUrl={getEditUrl(STEP_MAP.company)}>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {[
                                        [tr('foundedDate'), formatReviewDate(preview?.foundation_date ?? company?.foundation_date)],
                                        [tr('size'), totalHeadcount ? String(totalHeadcount) : '—'],
                                        [tr('sector'), [preview?.industry_category, preview?.industry_subcategory].filter(Boolean).map((v) => formatValue(v)).join(' · ') || '—'],
                                        [tr('listedShort'), company?.public_listing_status ? String(company.public_listing_status) : ((preview?.is_public ?? company?.is_public) != null ? ((preview?.is_public ?? company?.is_public) ? 'Yes' : 'No') : '—')],
                                    ].map(([k, v], idx) => (
                                        <div key={`company-${idx}-${String(k ?? '')}`}>
                                            <p className="text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{k}</p>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-[#e2e8f0]">{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </ReviewCard>
                            <ReviewCard title={t('diagnosis_review.workforceCardTitle')} icon="👥" editUrl={getEditUrl(STEP_MAP.workforce)}>
                                <div className="flex flex-wrap gap-4">
                                    <div className="min-w-[100px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-[#1e3a5f]/30">
                                        <p className="text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{tr('workforceFullTimeLabel')}</p>
                                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">
                                            {formatNumber(preview?.full_time_headcount ?? totalHeadcount)}
                                        </p>
                                    </div>
                                    <div className="min-w-[100px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-[#1e3a5f]/30">
                                        <p className="text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{tr('workforceContractLabel')}</p>
                                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">
                                            {formatNumber(preview?.contract_headcount ?? 0)}
                                        </p>
                                    </div>
                                    <div className="min-w-[100px] flex-1 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20">
                                        <p className="text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{tr('workforceTotalLabel')}</p>
                                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">{totalHeadcount}</p>
                                    </div>
                                    {preview?.average_age != null && (
                                        <div className="min-w-[100px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-[#1e3a5f]/30">
                                            <p className="text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{tr('avgAgeShort')}</p>
                                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">{formatNumber(preview.average_age)}</p>
                                        </div>
                                    )}
                                </div>
                            </ReviewCard>
                            <div className="md:col-span-2">
                                <ReviewCard title={t('diagnosis_review.gradePyramidTitle')} icon="📊" editUrl={getEditUrl(STEP_MAP.jobGrades)}>
                                    <div className="space-y-3">
                                        {jobGradesForPyramid.length ? (
                                            <>
                                                {jobGradesForPyramid.map((g, i) => {
                                                    const max = Math.max(...jobGradesForPyramid.map((x) => x.headcount), 1);
                                                    const pct = max > 0 ? (g.headcount / max) * 100 : 0;
                                                    const ratio = gradeTotal ? ((g.headcount / gradeTotal) * 100).toFixed(1) : '0';
                                                    return (
                                                        <div key={`grade-${i}-${String(g.name ?? '')}`} className="flex items-center gap-3">
                                                            <div className="w-24 shrink-0 text-right text-sm font-semibold text-slate-600 dark:text-[#9AA3B2]">
                                                                {g.name}
                                                            </div>
                                                            <div className="relative h-8 flex-1 min-w-0">
                                                                <div
                                                                    className="absolute left-1/2 flex h-full min-w-[4rem] -translate-x-1/2 items-center justify-center rounded-lg text-xs font-bold text-white"
                                                                    style={{
                                                                        width: `${Math.max(pct, 15)}%`,
                                                                        backgroundColor: GRADE_COLORS[i % GRADE_COLORS.length],
                                                                    }}
                                                                >
                                                                    {g.headcount}{tr('personsUnit')}
                                                                </div>
                                                            </div>
                                                            <div className="w-12 shrink-0 text-right text-xs font-medium text-slate-500 dark:text-[#9AA3B2]">{ratio}%</div>
                                                        </div>
                                                    );
                                                })}
                                                <div
                                                    className="mt-4 flex flex-col items-start gap-3 rounded-xl border px-4 py-3"
                                                    style={{
                                                        backgroundColor: `${pyramidDiag.color}15`,
                                                        borderColor: `${pyramidDiag.color}40`,
                                                    }}
                                                >
                                                    <span className="shrink-0 text-sm font-bold" style={{ color: pyramidDiag.color }}>
                                                        {pyramidDiag.label}
                                                    </span>
                                                    <div className="min-w-0 space-y-1">
                                                        <span className="text-sm text-slate-600 leading-relaxed block dark:text-[#9AA3B2]">{pyramidDiag.desc}</span>
                                                        <p className="text-[13px] font-bold text-slate-800 leading-snug dark:text-[#e2e8f0]">
                                                            {tr('includeAllHint')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-slate-500">—</p>
                                        )}
                                    </div>
                                </ReviewCard>
                            </div>
                            <div className="md:col-span-2">
                                <ReviewCard title={t('diagnosis_review.currentIssuesTitle')} icon="⚠️" editUrl={getEditUrl(STEP_MAP.hrIssues)}>
                                    <div className="space-y-3">
                                        {hrIssuesByCategory.length ? (
                                            hrIssuesByCategory.map((cat, catIdx) => (
                                                <div key={`hr-${catIdx}-${cat.category ?? ''}`}>
                                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>
                                                        {HR_ISSUE_CATEGORY_LABELS[cat.category] ?? cat.category}
                                                    </span>
                                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                                        {cat.items.map((item, itemIdx) => (
                                                            <span
                                                                key={`${cat.category}-item-${itemIdx}-${String(item ?? '')}`}
                                                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-[#1e3a5f]/40 dark:text-[#CBD0DA]"
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">—</p>
                                        )}
                                    </div>
                                </ReviewCard>
                            </div>
                        </div>

                        {/* Org chart + Org structure */}
                        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <ReviewCard title={t('diagnosis_review.currentOrgChartTitle')} icon="🗂️" editUrl={getEditUrl(STEP_MAP.orgCharts)}>
                                <div className="flex min-h-[200px] flex-col">
                                    {orgChartEntries.length ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {orgChartEntries.map((entry) => (
                                                <div
                                                    key={`${entry.label}-${entry.url}`}
                                                    className="rounded-xl border border-slate-200 p-3 dark:border-[#2a3a5c]"
                                                >
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA3B2]">
                                                        {entry.label}
                                                    </p>
                                                    {entry.isImage ? (
                                                        <img
                                                            src={entry.url}
                                                            alt={`Org chart ${entry.label}`}
                                                            className="max-h-[260px] w-full rounded-lg border border-slate-200 object-contain shadow-inner dark:border-[#2a3a5c]"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={entry.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0] dark:hover:bg-[#1e3a5f]/35"
                                                        >
                                                            <span>Open file</span>
                                                            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs uppercase dark:bg-[#2a3a5c]">
                                                                {entry.extension || 'file'}
                                                            </span>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/10">
                                            <div className="text-3xl opacity-70">🖼️</div>
                                            <p className="text-center text-sm font-medium text-slate-700 dark:text-[#CBD0DA]">{tr('orgChartUploadHint')}</p>
                                            <p className="text-center text-sm text-slate-500 dark:text-[#9AA3B2]">{tr('orgChartUploadDesc')}</p>
                                            <Link
                                                href={getEditUrl(STEP_MAP.orgCharts)}
                                                className="mt-1 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
                                            >
                                                {tr('goToPrevStep')}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </ReviewCard>
                            <ReviewCard title={t('diagnosis_review.orgStructureCardTitle')} icon="🏗️" editUrl={getEditUrl(STEP_MAP.orgStructure)}>
                                <div className="flex flex-col gap-2">
                                    {orgStructureTypes.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {orgStructureTypes.map((type) => (
                                                    <span
                                                        key={type}
                                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30 dark:text-[#e2e8f0]"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                            {orgStructureNotes.length > 0 && (
                                                <div className="space-y-2">
                                                    {orgStructureNotes.map((note) => (
                                                        <div
                                                            key={`${note.key}-${note.value}`}
                                                            className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20"
                                                        >
                                                            <p className="font-semibold text-slate-700 dark:text-[#CBD0DA]">
                                                                {note.key}
                                                            </p>
                                                            <p className="mt-1 text-slate-600 dark:text-[#9AA3B2]">
                                                                {note.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-500">—</span>
                                    )}
                                </div>
                            </ReviewCard>
                        </div>

                        {/* Submit footer */}
                        <footer className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6 text-white shadow-xl">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('diagnosis_review.submitConfirmTitle')}</h3>
                                <p className="mt-1 text-sm text-slate-400">{t('diagnosis_review.submitConfirmDesc')}</p>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <Link href={getEditUrl('hr-issues')}>
                                    <Button variant="outline" size="sm" className="border-slate-500/60 bg-transparent font-medium text-slate-300 hover:bg-white/10 hover:text-white">
                                        {t('diagnosis_review.backBtn')}
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing || ['submitted', 'approved', 'locked'].includes(diagnosisStatus) || !projectId}
                                    className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-900 shadow-lg transition-all hover:bg-amber-400 disabled:opacity-60"
                                >
                                    {['submitted', 'approved', 'locked'].includes(diagnosisStatus) ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {t('diagnosis_review.submitted')}
                                        </>
                                    ) : processing ? (
                                        t('diagnosis_review.submitting')
                                    ) : (
                                        t('diagnosis_review.submitDiagnosisBtn')
                                    )}
                                </Button>
                            </div>
                        </footer>
                    </div>
                </div>
            </FormLayout>
        </>
    );
}