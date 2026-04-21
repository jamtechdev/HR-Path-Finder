import { router } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Send,
    Edit,
    Check,
    ChevronLeft,
    ChevronRight,
    User,
    Target,
    Clock,
    Zap,
    CheckCircle2,
    TrendingUp,
    Database,
    AlertTriangle,
    Lightbulb,
    Circle,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { waitWebAnimationMs } from '@/lib/deferred';
import { toastCopy } from '@/lib/toastCopy';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const VALIDATION_CRITERIA = [
    { id: 'outcome_influence', label: 'Outcome Influence', icon: Zap, desc: "Outcome is primarily driven by this org's own efforts.", required: false, question: 'Is the outcome primarily influenced by this organization\'s own efforts?', noHint: 'Please refine the KPI so it reflects outcomes your org can directly control.' },
    { id: 'job_relevance', label: 'Job Relevance', icon: CheckCircle2, desc: "Directly tied to this org's core responsibilities.", required: false, question: 'Is this KPI directly tied to this organization\'s core responsibilities and performance?', noHint: 'Please align the KPI with this org\'s core job scope.' },
    { id: 'measurability', label: 'Measurability Required', icon: TrendingUp, desc: 'Measurable with a clear data source.', required: true, question: 'Is this KPI clearly measurable with numerical data?', noHint: 'Please refine the KPI name and formula to be more quantitative.' },
    { id: 'data_availability', label: 'Data Availability', icon: Database, desc: 'Data is accessible and ready to collect.', required: false, question: 'Is the data for this KPI accessible and ready to collect?', noHint: 'Please ensure a clear data source exists before confirming.' },
] as const;

type ValidationKey = (typeof VALIDATION_CRITERIA)[number]['id'];

interface Kpi {
    id?: number;
    organization_name: string;
    category: string;
    kpi_name: string;
    purpose: string;
    linked_job_id?: number;
    linked_csf: string;
    formula: string;
    measurement_method: string;
    weight: number;
    is_active: boolean;
    status: string;
    ceo_approval_status?: string | null;
}

interface ValidationState {
    outcome_influence: boolean;
    job_relevance: boolean;
    measurability: boolean;
    data_availability: boolean;
}

interface Props {
    project: { id: number };
    jobDefinitions?: Array<{ id: number; job_name: string }>;
    orgChartMappings?: Array<{ org_unit_name: string; org_head_email?: string; org_head_name?: string; is_kpi_reviewer?: boolean }>;
    kpiReviewTokens?: Record<string, unknown>;
    organizationalKpis?: Array<Partial<Kpi>>;
    onKpisChange?: (kpis: Kpi[]) => void;
    onContinue: (kpis: Kpi[]) => void;
    onBack?: () => void;
    fieldErrors?: FieldErrors;
    kpiVerificationNotice?: string | null;
}

const normalizeKpis = (source: Array<Partial<Kpi>> = []): Kpi[] =>
    source.map((k: any) => ({
        id: k.id,
        organization_name: k.organization_name || '',
        category: k.category || '',
        kpi_name: k.kpi_name || '',
        purpose: k.purpose || '',
        linked_job_id: k.linked_job_id,
        linked_csf: k.linked_csf || '',
        formula: k.formula || '',
        measurement_method: k.measurement_method || '',
        weight: k.weight ?? 0,
        is_active: k.is_active ?? true,
        status: k.status || 'draft',
        ceo_approval_status: k.ceo_approval_status ?? null,
    }));

const areKpisEqual = (a: Kpi[], b: Kpi[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((item, i) => {
        const other = b[i];
        return (
            item.id === other.id &&
            item.organization_name === other.organization_name &&
            item.category === other.category &&
            item.kpi_name === other.kpi_name &&
            item.purpose === other.purpose &&
            item.linked_job_id === other.linked_job_id &&
            item.linked_csf === other.linked_csf &&
            item.formula === other.formula &&
            item.measurement_method === other.measurement_method &&
            item.weight === other.weight &&
            item.is_active === other.is_active &&
            item.status === other.status &&
            item.ceo_approval_status === other.ceo_approval_status
        );
    });
};

const defaultValidation = (): ValidationState => ({
    outcome_influence: false,
    job_relevance: false,
    measurability: false,
    data_availability: false,
});

export default function KpiReviewTab({
    project,
    jobDefinitions = [],
    orgChartMappings = [],
    organizationalKpis = [],
    onKpisChange,
    kpiReviewTokens = {},
    onContinue,
    onBack,
    fieldErrors = {},
    kpiVerificationNotice = null,
}: Props) {
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const WEIGHT_EPS = 0.01;
    const [inlineMsg, setInlineMsg] = useState<string | null>(null);
    const [kpis, setKpis] = useState<Kpi[]>(() => normalizeKpis(organizationalKpis || []));
    const [selectedOrg, setSelectedOrg] = useState('');
    const [validationByKpi, setValidationByKpi] = useState<Record<string, ValidationState>>({});
    const [validationModal, setValidationModal] = useState<{ kpiKey: string; criterion: ValidationKey } | null>(null);
    const [validationModalNoHint, setValidationModalNoHint] = useState<string | null>(null);
    const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
    const [editingKpiIndex, setEditingKpiIndex] = useState<number | null>(null);
    const [sendingReview, setSendingReview] = useState(false);
    const [sendSuccessModalOpen, setSendSuccessModalOpen] = useState(false);
    const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
    const [reviewerOrgName, setReviewerOrgName] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerEmail, setReviewerEmail] = useState('');
    const [savingReviewer, setSavingReviewer] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Kpi>>({});
    const [recommendedTemplates, setRecommendedTemplates] = useState<Array<{ id: number; kpi_name: string; purpose?: string; category?: string; formula?: string; measurement_method?: string; weight?: number }>>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const lastToastRef = useRef<{ message: string; ts: number } | null>(null);
    // When an organization has only 1 KPI, it should appear selected by default,
    // but only until the user manually toggles selection.
    const [selectionTouchedByOrg, setSelectionTouchedByOrg] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!kpiVerificationNotice || !project?.id) return;

        const key = `kpi-verified-popup-shown:${project.id}`;
        if (window.sessionStorage.getItem(key) === '1') return;
        window.sessionStorage.setItem(key, '1');
        alert(kpiVerificationNotice);
    }, [kpiVerificationNotice, project?.id]);

    const orgNames = Array.from(new Set(orgChartMappings.map((m) => m.org_unit_name).filter(Boolean)));
    useEffect(() => {
        if (orgNames.length > 0 && !selectedOrg) setSelectedOrg(orgNames[0]);
    }, [orgNames, selectedOrg]);

    useEffect(() => {
        if (!selectedOrg || !project?.id) {
            setRecommendedTemplates([]);
            return;
        }
        setLoadingTemplates(true);
        fetch(`/hr-manager/performance-system/${project.id}/recommended-kpis?organization_name=${encodeURIComponent(selectedOrg)}`)
            .then((res) => res.json())
            .then((data) => {
                setRecommendedTemplates(data.templates || []);
            })
            .catch(() => setRecommendedTemplates([]))
            .finally(() => setLoadingTemplates(false));
    }, [selectedOrg, project?.id]);

    // Auto-close success modal shortly after showing it (Web Animations timing).
    useEffect(() => {
        if (!sendSuccessModalOpen) return;
        let cancelled = false;
        void waitWebAnimationMs(1800).then(() => {
            if (!cancelled) setSendSuccessModalOpen(false);
        });
        return () => {
            cancelled = true;
        };
    }, [sendSuccessModalOpen]);

    useEffect(() => {
        const next = normalizeKpis(organizationalKpis || []);
        setKpis((prev) => (areKpisEqual(prev, next) ? prev : next));
    }, [organizationalKpis]);

    useEffect(() => {
        onKpisChange?.(kpis);
    }, [kpis]);

    useEffect(() => {
        if (!inlineMsg) return;
        const now = Date.now();
        const prev = lastToastRef.current;
        if (prev && prev.message === inlineMsg && now - prev.ts < 1500) {
            setInlineMsg(null);
            return;
        }
        lastToastRef.current = { message: inlineMsg, ts: now };
        const isFailure = /failed|error|required|missing/i.test(inlineMsg);
        toast({
            title: isFailure ? toastCopy.saveFailed : toastCopy.success,
            description: inlineMsg,
            variant: isFailure ? 'destructive' : 'success',
            duration: 2500,
        });
        setInlineMsg(null);
    }, [inlineMsg]);

    const orgKpis = kpis.filter((k) => k.organization_name === selectedOrg);
    const orgActiveKpis = orgKpis.filter((k) => k.is_active);
    const leaderName = orgChartMappings.find((m) => m.org_unit_name === selectedOrg)?.org_head_name || '—';
    const isSingleKpiOrg = orgKpis.length === 1;
    const isDefaultAutoSelectedSingleKpi = !!selectedOrg && isSingleKpiOrg && !selectionTouchedByOrg[selectedOrg];
    const orgSelectedKpis = isDefaultAutoSelectedSingleKpi ? orgKpis : orgActiveKpis;

    const totalWeight = orgSelectedKpis.reduce((s, k) => s + (k.weight || 0), 0);
    const totalWeightNormalized = Math.round(totalWeight * 100) / 100;
    const weightOk = orgSelectedKpis.length > 0 && Math.abs(totalWeightNormalized - 100) <= WEIGHT_EPS;

    const getValidation = (kpiKey: string): ValidationState =>
        validationByKpi[kpiKey] ?? defaultValidation();
    const setValidation = (kpiKey: string, key: ValidationKey, value: boolean) => {
        setValidationByKpi((prev) => ({
            ...prev,
            [kpiKey]: { ...(prev[kpiKey] ?? defaultValidation()), [key]: value },
        }));
    };
    const openValidationModal = (kpiKey: string, key: ValidationKey) => {
        const v = getValidation(kpiKey);
        if (v[key]) return;
        setValidationModalNoHint(null);
        setValidationModal({ kpiKey, criterion: key });
    };
    const closeValidationModal = () => {
        setValidationModal(null);
        setValidationModalNoHint(null);
    };
    const confirmValidationYes = () => {
        if (validationModal) {
            setValidation(validationModal.kpiKey, validationModal.criterion, true);
        }
        closeValidationModal();
    };
    const confirmValidationNo = () => {
        const c = VALIDATION_CRITERIA.find((x) => x.id === validationModal?.criterion);
        if (c && 'noHint' in c && c.noHint) setValidationModalNoHint(c.noHint);
        else closeValidationModal();
    };
    const completedCount = (kpiKey: string) =>
        VALIDATION_CRITERIA.filter((c) => getValidation(kpiKey)[c.id]).length;
    const needsMeasurability = (kpiKey: string) => !getValidation(kpiKey).measurability;

    const handleAddKpi = () => {
        if (!selectedOrg) return;
        const newKpi: Kpi = {
            organization_name: selectedOrg,
            category: 'Monthly',
            kpi_name: '',
            purpose: '',
            linked_csf: '',
            formula: '',
            measurement_method: '',
            weight: 0,
            // New KPI starts as "unselected" until the user includes it (green check).
            is_active: false,
            status: 'draft',
        };
        setKpis((prev) => [...prev, newKpi]);
        setEditingKpi(newKpi);
        setEditingKpiIndex(kpis.length);
        setEditForm(newKpi);
    };

    const handleAddFromTemplate = (template: (typeof recommendedTemplates)[0]) => {
        if (!selectedOrg) return;
        const newKpi: Kpi = {
            organization_name: selectedOrg,
            category: template.category || 'Monthly',
            kpi_name: template.kpi_name,
            purpose: template.purpose || '',
            linked_csf: '',
            formula: template.formula || '',
            measurement_method: template.measurement_method || '',
            weight: template.weight ?? 0,
            // Template KPIs also start as "unselected" until user includes them.
            is_active: false,
            status: 'draft',
        };
        setKpis((prev) => [...prev, newKpi]);
        setEditingKpi(newKpi);
        setEditingKpiIndex(kpis.length);
        setEditForm(newKpi);
    };

    const handleDeleteKpi = (index: number) => {
        if (!confirm(tx('performance_system_kpi_review.confirm_delete_kpi', '이 KPI를 삭제하시겠습니까?'))) return;
        const target = kpis[index];
        if (!target) return;

        const removeLocally = () => {
            setKpis((prev) => prev.filter((_, i) => i !== index));
            if (editingKpiIndex !== null) {
                if (editingKpiIndex === index) {
                    setEditingKpi(null);
                    setEditingKpiIndex(null);
                } else if (editingKpiIndex > index) {
                    setEditingKpiIndex(editingKpiIndex - 1);
                }
            }
        };

        // Unsaved KPI exists only in local state.
        if (!target.id || !project?.id) {
            removeLocally();
            return;
        }

        router.delete(`/hr-manager/performance-system/${project.id}/kpis/${target.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                removeLocally();
                setInlineMsg(tx('performance_system_kpi_review.kpi_deleted', 'KPI가 삭제되었습니다.'));
            },
            onError: () => {
                setInlineMsg(tx('performance_system_kpi_review.kpi_delete_failed', 'KPI 삭제에 실패했습니다. 다시 시도해 주세요.'));
            },
        });
    };

    const handleExcludeKpi = (index: number) => {
        const kpi = kpis[index];
        if (selectedOrg) {
            setSelectionTouchedByOrg((prev) => ({ ...prev, [selectedOrg]: true }));
        }
        const defaultSelectedSoleKpi =
            !!selectedOrg && isDefaultAutoSelectedSingleKpi && kpi.organization_name === selectedOrg && !kpi.is_active;

        setKpis((prev) => {
            const next = [...prev];
            next[index] = { ...kpi, is_active: defaultSelectedSoleKpi ? false : !kpi.is_active };
            return next;
        });
    };

    const handleSaveKpi = async (index: number, override?: Partial<Kpi>) => {
        const base = kpis[index];
        const kpi = { ...base, ...(override ?? {}) };
        if (!kpi.kpi_name?.trim()) {
            setInlineMsg(tx('performance_system_kpi_review.kpi_name_required', 'KPI 이름은 필수입니다.'));
            return;
        }
        if ((kpi.weight ?? 0) < 0 || (kpi.weight ?? 0) > 100) {
            setInlineMsg(tx('performance_system_kpi_review.weight_range_error', '가중치는 0~100 사이여야 합니다.'));
            return;
        }
        setInlineMsg(null);
        setKpis((prev) => {
            const next = [...prev];
            next[index] = { ...kpi, kpi_name: kpi.kpi_name.trim(), organization_name: (kpi.organization_name || '').trim() };
            const targetOrg = next[index].organization_name;
            const total = next
                .filter((row) => row.organization_name === targetOrg && row.is_active)
                .reduce((sum, row) => sum + (row.weight || 0), 0);
            if (total > 100) {
                setInlineMsg(tx('performance_system_kpi_review.weight_total_over_100', '활성 KPI의 총 가중치는 100%를 초과할 수 없습니다.') + ` (${targetOrg})`);
            }
            return next;
        });
        setEditingKpi(null);
    };

    const saveCurrentDraftToServer = () => {
        if (!project?.id) return;
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'kpi-review',
                kpis: kpis as any,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {},
                onError: () => {
                    setInlineMsg(tx('performance_system_kpi_review.kpi_draft_save_failed', 'KPI 임시저장에 실패했습니다. 다시 시도해 주세요.'));
                },
            },
        );
    };

    const kpiReviewRecipients = orgChartMappings.filter((m) => m.is_kpi_reviewer && m.org_head_email?.trim());
    const hasOrgReviewer = (orgName: string) =>
        orgChartMappings.some(
            (m) =>
                (m.org_unit_name ?? '').trim().toLowerCase() === (orgName ?? '').trim().toLowerCase() &&
                !!m.is_kpi_reviewer &&
                !!m.org_head_email?.trim(),
        );
    const hasSelectedOrgReviewer = selectedOrg ? hasOrgReviewer(selectedOrg) : false;
    const openReviewerModal = (orgName: string) => {
        const mapping = orgChartMappings.find(
            (m) => (m.org_unit_name ?? '').trim().toLowerCase() === orgName.trim().toLowerCase(),
        );
        setReviewerOrgName(orgName);
        setReviewerName(mapping?.org_head_name ?? '');
        setReviewerEmail(mapping?.org_head_email ?? '');
        setReviewerModalOpen(true);
    };
    const saveReviewerForOrg = () => {
        if (!project?.id || !reviewerOrgName || !reviewerEmail.trim()) {
            setInlineMsg(tx('performance_system_kpi_review.reviewer_email_required', '검토자 이메일은 필수입니다.'));
            return;
        }
        setSavingReviewer(true);
        const payload = orgChartMappings.map((m) => {
            const isTarget = (m.org_unit_name ?? '').trim().toLowerCase() === reviewerOrgName.trim().toLowerCase();
            return {
                org_unit_name: m.org_unit_name,
                org_head_name: isTarget ? reviewerName.trim() : (m.org_head_name ?? ''),
                org_head_email: isTarget ? reviewerEmail.trim() : (m.org_head_email ?? ''),
                is_kpi_reviewer: isTarget ? true : !!m.is_kpi_reviewer,
            };
        });
        router.post(
            `/hr-manager/job-analysis/${project.id}/org-chart-mapping`,
            { org_chart_mappings: payload },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSavingReviewer(false);
                    setReviewerModalOpen(false);
                    setInlineMsg(tx('performance_system_kpi_review.reviewer_saved', 'KPI 검토자 정보가 저장되었습니다.') + ` (${reviewerOrgName})`);
                },
                onError: () => {
                    setSavingReviewer(false);
                    setInlineMsg(tx('performance_system_kpi_review.reviewer_save_failed', 'KPI 검토자 저장에 실패했습니다. 이메일 형식을 확인하고 다시 시도해 주세요.'));
                },
            },
        );
    };
    const getHasReviewSent = (orgName: string) => {
        const tokens = (kpiReviewTokens as Record<string, unknown[]>)[orgName];
        return Array.isArray(tokens) && tokens.length > 0;
    };
    const getOrgReviewEligibility = (orgName: string) => {
        const orgRows = kpis.filter((k) => k.organization_name === orgName);
        if (orgRows.length === 0) {
            return { canSend: false, reason: tx('performance_system_kpi_review.no_kpi_for_org_reason', '이 조직에는 KPI가 없습니다.') };
        }
        const hasCeoRevisionRequested = orgRows.some((k) => {
            const ceo = (k.ceo_approval_status ?? '').toLowerCase();
            const status = (k.status ?? '').toLowerCase();
            return ceo === 'revision_requested' || status === 'revision_requested';
        });
        const allApproved = orgRows.every((k) => {
            const ceo = (k.ceo_approval_status ?? '').toLowerCase();
            const status = (k.status ?? '').toLowerCase();
            return ceo === 'approved' || status === 'approved' || status === 'verified';
        });
        if (allApproved && !hasCeoRevisionRequested) {
            return {
                canSend: false,
                reason: tx('performance_system_kpi_review.verified_locked_reason', '이미 CEO 승인 완료되어 재요청이 잠겨 있습니다. CEO가 수정요청한 경우에만 재전송할 수 있습니다.'),
            };
        }
        return { canSend: true, reason: null as string | null };
    };
    const selectedHasReviewSent = selectedOrg ? getHasReviewSent(selectedOrg) : false;
    const selectedEligibility = selectedOrg
        ? getOrgReviewEligibility(selectedOrg)
        : { canSend: false, reason: tx('performance_system_kpi_review.select_org_first', '먼저 조직을 선택하세요.') };

    // NOTE:
    // We intentionally do NOT auto-call setKpis here.
    // Doing setState in effects caused maximum update depth issues earlier.
    // Instead, the "single KPI default selected" behavior is implemented via derived UI logic above.

    const handleSendReviewRequest = () => {
        if (!selectedOrg || !project?.id) return;
        if (sendingReview) return;
        if (!hasSelectedOrgReviewer) {
            setInlineMsg(tx('performance_system_kpi_review.set_reviewer_first', '먼저 KPI 검토자를 설정한 뒤 검토 요청을 보내세요.'));
            return;
        }
        if (!selectedEligibility.canSend) {
            setInlineMsg((selectedEligibility.reason || tx('performance_system_kpi_review.org_not_sendable', '이 조직은 현재 검토 요청을 보낼 수 없습니다.')) + ' 준비가 완료되면 다시 시도해 주세요.');
            return;
        }
        if (!selectedKpisReady) {
            setInlineMsg(
                tx('performance_system_kpi_review.validation_before_send', '선택한 KPI는 4개 검증 기준을 모두 체크하고 측정 가능성(측정방법 또는 수식)을 입력해야 합니다.'),
            );
            return;
        }
        if (!weightOk) {
            setInlineMsg(tx('performance_system_kpi_review.weight_must_be_100_before_send', '검토 요청 전 선택한 KPI의 총 가중치는 정확히 100%여야 합니다.'));
            return;
        }

        setInlineMsg(null);
        setSendingReview(true);

        router.post(
            `/hr-manager/performance-system/${project.id}/send-review-request`,
            {
                organization_name: selectedOrg,
                recipient_target: 'leader',
                kpis: orgSelectedKpis.map((kpi) => ({
                    id: kpi.id ?? null,
                    organization_name: kpi.organization_name,
                    kpi_name: kpi.kpi_name,
                    purpose: kpi.purpose,
                    category: kpi.category,
                    linked_job_id: kpi.linked_job_id ?? null,
                    linked_csf: kpi.linked_csf,
                    formula: kpi.formula,
                    measurement_method: kpi.measurement_method,
                    weight: kpi.weight ?? null,
                    // If KPI is included in this request, always treat it as active for backend payload.
                    is_active: true,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSendSuccessModalOpen(true);
                    setSendingReview(false);
                },
                onError: (errors: Record<string, any>) => {
                    setSendSuccessModalOpen(false);
                    const firstError =
                        (typeof errors?.error === 'string' && errors.error) ||
                        (Array.isArray(errors?.error) && errors.error.length > 0 ? errors.error[0] : '') ||
                        (typeof errors?.kpis === 'string' && errors.kpis) ||
                        (Array.isArray(errors?.kpis) && errors.kpis.length > 0 ? errors.kpis[0] : '') ||
                        '';
                    setInlineMsg(
                        firstError ||
                            tx('performance_system_kpi_review.review_request_failed', '검토 요청 전송에 실패했습니다. 조직도 매핑의 검토자 이메일과 선택 KPI 총 가중치(100%)를 확인해 주세요.'),
                    );
                    setSendingReview(false);
                },
            },
        );
    };

    const handleConfirmAllRecommended = () => {
        // Optional: bulk confirm recommended KPIs; for UI we just close any edit and show feedback
        setInlineMsg(tx('performance_system_kpi_review.recommended_confirmed', '추천 KPI 전체를 확인 처리했습니다.'));
    };

    const currentCriterion = validationModal ? VALIDATION_CRITERIA.find((c) => c.id === validationModal.criterion) : null;
    const allKpisCeoApproved =
        kpis.length > 0 &&
        kpis.every((k) => {
            const ceo = (k.ceo_approval_status ?? '').toLowerCase();
            const status = (k.status ?? '').toLowerCase();
            return ceo === 'approved' || status === 'approved';
        });
    const canContinue = selectedHasReviewSent || allKpisCeoApproved;

    const getKpiKey = (kpi: Kpi) => {
        const globalIndex = kpis.findIndex((x) => x === kpi);
        return `kpi-${kpi.id ?? globalIndex}-${kpi.kpi_name}`;
    };

    const selectedKpisReady = orgSelectedKpis.length > 0 &&
        orgSelectedKpis.every((kpi) => {
            const key = getKpiKey(kpi);
            // Accept either explicit measurement method OR formula text for measurability readiness.
            const hasMeasurabilityText =
                (kpi.measurement_method ?? '').trim() !== '' || (kpi.formula ?? '').trim() !== '';
            return completedCount(key) === 4 && hasMeasurabilityText;
        });

    return (
        <div className="manager-kpi-draft min-h-full flex flex-col bg-[#f8f9fb] dark:bg-slate-950 dark:text-slate-100">
            <Dialog open={!!validationModal} onOpenChange={(open) => !open && closeValidationModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{tx('performance_system_kpi_review.validation_dialog_title', '검증')}</DialogTitle>
                        <DialogDescription>
                            {validationModalNoHint ? (
                                <span className="text-amber-700 font-medium">{validationModalNoHint}</span>
                            ) : currentCriterion && 'question' in currentCriterion ? (
                                currentCriterion.question
                            ) : (
                                ''
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end mt-4">
                        {validationModalNoHint ? (
                            <Button onClick={closeValidationModal}>{tx('common.close', '닫기')}</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={confirmValidationNo}>
                                    {tx('common.no', '아니오')}
                                </Button>
                                <Button onClick={confirmValidationYes}>{tx('common.yes', '예')}</Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={sendSuccessModalOpen} onOpenChange={setSendSuccessModalOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{tx('common.success', '성공')}</DialogTitle>
                        <DialogDescription>
                            {tx('performance_system_kpi_review.review_request_sent_success', '리더에게 검토 요청을 성공적으로 전송했습니다.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setSendSuccessModalOpen(false)}>{tx('common.ok', '확인')}</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={reviewerModalOpen} onOpenChange={setReviewerModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{tx('performance_system_kpi_review.add_kpi_reviewer', 'KPI 검토자 등록')}</DialogTitle>
                        <DialogDescription>
                            {tx('performance_system_kpi_review.reviewer_modal_desc_prefix', '다음 조직의 검토자 정보를 설정하세요:')} <strong>{reviewerOrgName || tx('performance_system_kpi_review.selected_org', '선택된 조직')}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                        <div>
                            <Label className="text-xs">{tx('performance_system_kpi_review.reviewer_name_optional', '검토자 이름 (선택)')}</Label>
                            <Input
                                value={reviewerName}
                                onChange={(e) => setReviewerName(e.target.value)}
                                placeholder={tx('performance_system_kpi_review.reviewer_name_placeholder', '검토자 이름')}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">{tx('performance_system_kpi_review.reviewer_email', '검토자 이메일')}</Label>
                            <Input
                                type="email"
                                value={reviewerEmail}
                                onChange={(e) => setReviewerEmail(e.target.value)}
                                placeholder={tx('performance_system_kpi_review.reviewer_email_placeholder', 'name@company.com')}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={() => setReviewerModalOpen(false)} disabled={savingReviewer}>
                                {tx('common.cancel', '취소')}
                            </Button>
                            <Button onClick={saveReviewerForOrg} disabled={savingReviewer || !reviewerEmail.trim()}>
                                {savingReviewer ? tx('common.saving', '저장 중...') : tx('performance_system_kpi_review.save_reviewer', '검토자 저장')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="flex-1 min-h-0 flex gap-6 p-3 sm:p-4 lg:p-6 flex-col lg:flex-row max-w-[1400px] mx-auto w-full overflow-x-hidden">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    <Card className="overflow-hidden rounded-xl border border-[#e2e6ed] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <CardContent className="p-6">
                            <div className="mb-5 rounded-xl border border-[#facc15]/40 bg-[#fefce8] px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/20">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="mt-0.5 h-5 w-5 text-[#92400e] dark:text-amber-300" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-[#78350f] dark:text-amber-200">
                                            {t('performance_system_kpi_review.banner_title')}
                                        </p>
                                        <p className="mt-1 text-xs text-[#6b7685] dark:text-slate-300">
                                            {t('performance_system_kpi_review.banner_desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Top row: Organization, Leader, KPI Count */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Label className="text-sm font-semibold text-[#1a2b4a] dark:text-slate-100">{t('performance_system_kpi_review.organization')}</Label>
                                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                        <SelectTrigger className="w-[280px] max-w-full border-[#e2e6ed] rounded-lg h-10">
                                            <SelectValue placeholder={t('performance_system_kpi_review.select_organization')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgNames.map((org) => (
                                                <SelectItem key={org} value={org}>
                                                    {org}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {hasSelectedOrgReviewer ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700">
                                            {t('performance_system_kpi_review.reviewer_set')}
                                        </Badge>
                                    ) : (
                                        <>
                                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-xs dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700">
                                                {t('performance_system_kpi_review.reviewer_missing')}
                                            </Badge>
                                            {selectedOrg && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() => openReviewerModal(selectedOrg)}
                                                >
                                                    {t('performance_system_kpi_review.add_kpi_reviewer')}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e6ed] bg-[#f0f2f5] px-3 py-1.5 text-sm text-[#6b7685] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    <User className="w-4 h-4 text-[#9aa3b2]" />
                                    <span className="font-medium">{t('performance_system_kpi_review.leader')}</span>
                                    <span className="text-[#1a2b4a] font-semibold dark:text-slate-100">{leaderName}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e6ed] bg-[#f0f2f5] px-3 py-1.5 text-sm text-[#6b7685] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    <Target className="w-4 h-4 text-[#9aa3b2]" />
                                    <span className="font-medium">{t('performance_system_kpi_review.kpi_count')}</span>
                                    <span className="text-[#1a2b4a] font-semibold dark:text-slate-100">{orgKpis.length}</span>
                                </div>
                                {orgKpis.length > 0 && !selectedHasReviewSent && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef9c3] border border-[#facc15] text-sm text-[#92400e]">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-semibold">{t('performance_system_kpi_review.pending_request')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Button
                                    onClick={handleConfirmAllRecommended}
                                    className="bg-[#2e4570] hover:bg-[#1a2b4a] text-white rounded-lg font-semibold"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {t('performance_system_kpi_review.confirm_all_recommended')}
                                </Button>
                            <Button
                                onClick={handleAddKpi}
                                disabled={!selectedOrg}
                                className="bg-[#2ec4a0] hover:bg-[#25a88a] text-white rounded-lg font-semibold border border-[#b0ede0]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('performance_system_kpi_review.add_kpi')}
                            </Button>
                            </div>

                            {selectedOrg && (
                                <>
                                    {loadingTemplates ? (
                                        <p className="py-2 text-sm text-[#6b7685] dark:text-slate-300">{t('performance_system_kpi_review.loading_recommended')}</p>
                                    ) : recommendedTemplates.length > 0 ? (
                                        <div className="mb-4 rounded-lg border border-[#e2e6ed] bg-[#f8f9fb] p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                            <h4 className="mb-2 text-sm font-bold text-[#1a2b4a] dark:text-slate-100">{t('performance_system_kpi_review.recommended_title')}</h4>
                                            <p className="mb-3 text-xs text-[#6b7685] dark:text-slate-300">{t('performance_system_kpi_review.recommended_desc')}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recommendedTemplates.map((tpl) => (
                                                    <div key={tpl.id} className="inline-flex items-center gap-2 rounded-lg border border-[#e2e6ed] bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                                                        <span className="font-medium text-[#1a2b4a] dark:text-slate-100">{tpl.kpi_name}</span>
                                                        <span className="text-[#6b7685] dark:text-slate-300">{(tpl.weight ?? 0)}%</span>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleAddFromTemplate(tpl)}
                                                        >
                                                            {t('performance_system_kpi_review.add_to_list')}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            )}

                            {/* Team Progress Status */}
                            {orgNames.length > 0 && (
                                <div className="mb-6 rounded-xl border border-[#e2e6ed] bg-[#f8f9fb] p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <h4 className="mb-3 text-sm font-bold text-[#1a2b4a] dark:text-slate-100">{t('performance_system_kpi_review.team_progress_status')}</h4>
                                    <div className="space-y-2">
                                        {orgNames.map((orgName) => {
                                            const orgKpisForStatus = kpis.filter((k) => k.organization_name === orgName);
                                            const orgKpiCount = orgKpisForStatus.length;
                                            const orgHasReviewer = hasOrgReviewer(orgName);
                                            const tokens = (kpiReviewTokens as Record<string, unknown[]>)[orgName];
                                            const hasReviewSent = Array.isArray(tokens) && tokens.length > 0;
                                            const hasLeaderSubmitted = orgKpisForStatus.some((k) => (k.status ?? '').toLowerCase() === 'proposed');
                                            const hasCeoRevisionRequested = orgKpisForStatus.some((k) => {
                                                const ceo = (k.ceo_approval_status ?? '').toLowerCase();
                                                const status = (k.status ?? '').toLowerCase();
                                                return ceo === 'revision_requested' || status === 'revision_requested';
                                            });
                                            const allCeoApproved =
                                                orgKpisForStatus.length > 0 &&
                                                orgKpisForStatus.every((k) => {
                                                    const ceo = (k.ceo_approval_status ?? '').toLowerCase();
                                                    const status = (k.status ?? '').toLowerCase();
                                                    return ceo === 'approved' || status === 'approved';
                                                });
                                            return (
                                                <div key={orgName} className="flex items-center justify-between flex-wrap rounded-lg border border-[#e2e6ed] bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                                                    <span className="font-medium text-[#1a2b4a] dark:text-slate-100">{orgName}</span>
                                                    <div className="flex items-center gap-2">
                                                        {orgKpiCount === 0 ? (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {t('performance_system_kpi_review.no_kpis')}
                                                            </Badge>
                                                        ) : hasReviewSent ? (
                                                            <Badge variant="default" className="text-xs">
                                                                {t('performance_system_kpi_review.request_sent')}
                                                            </Badge>
                                                        ) : !getOrgReviewEligibility(orgName).canSend ? (
                                                            <Badge className="bg-[#334155] text-white text-xs font-semibold">
                                                                {t('performance_system_kpi_review.verified_locked')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-[#f59e0b] text-white text-xs font-semibold">
                                                                {t('performance_system_kpi_review.pending_request')}
                                                            </Badge>
                                                        )}
                                                        {hasLeaderSubmitted && (
                                                            <Badge className="bg-[#2563eb] text-white text-xs">{t('performance_system_kpi_review.leader_submitted')}</Badge>
                                                        )}
                                                        {hasCeoRevisionRequested && (
                                                            <Badge className="bg-[#f59e0b] text-white text-xs">{t('performance_system_kpi_review.ceo_revision')}</Badge>
                                                        )}
                                                        {allCeoApproved && (
                                                            <Badge className="bg-[#16a34a] text-white text-xs">{t('performance_system_kpi_review.ceo_approved')}</Badge>
                                                        )}
                                                        {!orgHasReviewer && (
                                                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-xs">
                                                                {t('performance_system_kpi_review.reviewer_missing')}
                                                            </Badge>
                                                        )}
                                                        {!orgHasReviewer && orgName === selectedOrg && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => openReviewerModal(orgName)}
                                                            >
                                                                {t('performance_system_kpi_review.add_kpi_reviewer')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* KPI summary + send hint */}
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                                <span className="font-medium text-[#6b7685] dark:text-slate-300">
                                    {t('performance_system_kpi_review.kpi_count_summary', {
                                        selected: orgSelectedKpis.length,
                                        total: orgKpis.length,
                                    })}
                                </span>
                                <span className="text-[#6b7685] dark:text-slate-300">
                                    {t('performance_system_kpi_review.weight_total')}{' '}
                                    <span
                                        className={cn(
                                            'font-bold',
                                            weightOk ? 'text-[#2ec4a0]' : 'text-[#1a2b4a]'
                                        )}
                                    >
                                        {totalWeightNormalized}%
                                    </span>
                                </span>
                                {orgKpis.length > 0 && (
                                    <span className="text-xs text-[#6b7685] dark:text-slate-300">
                                        <span>
                                            {t('performance_system_kpi_review.send_hint')}
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* KPI cards */}
                            <div className="space-y-4">
                                {!selectedOrg ? (
                                    <p className="py-8 text-center text-sm text-[#6b7685] dark:text-slate-300">{t('performance_system_kpi_review.select_org_to_view')}</p>
                                ) : orgKpis.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-[#6b7685] dark:text-slate-300">{t('performance_system_kpi_review.no_kpis_for_org')}</p>
                                ) : (
                                    <>
                                        {orgSelectedKpis.length === 0 && (
                                            <p className="py-4 text-sm text-[#6b7685] dark:text-slate-300">
                                                {t('performance_system_kpi_review.select_kpi_hint')}
                                            </p>
                                        )}
                                        {orgKpis.map((kpi, idx) => {
                                        const globalIndex = kpis.findIndex((k) => k === kpi);
                                        const kpiKey = `kpi-${kpi.id ?? globalIndex}-${kpi.kpi_name}`;
                                        const validation = getValidation(kpiKey);
                                        const completed = completedCount(kpiKey);
                                        const measurabilityRequired = needsMeasurability(kpiKey);
                                        const formulaText = kpi.formula || kpi.measurement_method || '—';
                                        const isSelected = orgSelectedKpis.includes(kpi);

                                        return (
                                            <div
                                                key={kpiKey}
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    // Don't toggle selection when user interacts with any button inside the card.
                                                    if (target.closest('button')) return;
                                                    handleExcludeKpi(globalIndex);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key !== 'Enter' && e.key !== ' ') return;
                                                    e.preventDefault();
                                                    handleExcludeKpi(globalIndex);
                                                }}
                                                className={cn(
                                                    'relative rounded-xl border bg-white p-5 shadow-sm transition-all cursor-pointer dark:bg-slate-900',
                                                    isSelected
                                                        ? 'border-[#16a34a] bg-[#ecfdf5] dark:border-emerald-500/60 dark:bg-emerald-900/20'
                                                        : 'border-[#e2e6ed] opacity-70 hover:border-[#dbe2ea] dark:border-slate-700 dark:opacity-100 dark:hover:border-slate-500'
                                                )}
                                            >
                                                {isSelected && (
                                                    <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-[#16a34a]" />
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge className="bg-[#7c3aed] text-white text-xs font-semibold rounded-full border-0">Recommended</Badge>
                                                            <Badge className="bg-[#e8faf6] text-[#2ec4a0] text-xs font-semibold rounded-full border-0">{(kpi.category || 'Monthly')}</Badge>
                                                        </div>
                                                        <h3 className="mb-1 break-words text-lg font-bold text-[#1a2b4a] dark:text-slate-100">
                                                            {kpi.kpi_name || t('performance_system_kpi_review.untitled_kpi')}
                                                        </h3>
                                                        <div className="mb-2 inline-block rounded-full bg-[#f0f2f5] px-3 py-1.5 text-sm text-[#6b7685] dark:bg-slate-800 dark:text-slate-300">
                                                            {formulaText}
                                                        </div>
                                                        <p className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{t('performance_system_kpi_review.weight_label', { weight: kpi.weight ?? 0 })}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-row gap-2 shrink-0 sm:flex-col">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-[#f1f5f9] border-[#e2e8f0] text-[#475569] hover:bg-[#e2e8f0] rounded-lg"
                                                            onClick={() => {
                                                                setEditingKpi(kpi);
                                                                setEditingKpiIndex(globalIndex);
                                                                setEditForm({ ...kpi });
                                                            }}
                                                        >
                                                            <Edit className="w-3.5 h-3.5 mr-1" /> {t('performance_system_kpi_review.edit')}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 rounded-lg"
                                                            onClick={() => handleDeleteKpi(globalIndex)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('performance_system_kpi_review.delete')}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Validation section */}
                                                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7685] dark:text-slate-300">{t('performance_system_kpi_review.validation')}</span>
                                                        <Badge
                                                            className={cn(
                                                                'text-xs font-bold rounded-full',
                                                                completed === 4 ? 'bg-[#16a34a]/20 text-[#16a34a]' : 'bg-red-100 text-red-600'
                                                            )}
                                                        >
                                                            {completed}/4
                                                        </Badge>
                                                        {completed < 4 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> {t('performance_system_kpi_review.incomplete')}
                                                            </span>
                                                        )}
                                                        {measurabilityRequired && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fef9c3] text-amber-800 text-xs font-medium border border-amber-300">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> {t('performance_system_kpi_review.measurability_required')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {VALIDATION_CRITERIA.map((c) => {
                                                            const checked = validation[c.id];
                                                            const isMeasurability = c.id === 'measurability';
                                                            return (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => !checked && openValidationModal(kpiKey, c.id)}
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                                                                        checked
                                                                            ? 'bg-[#2563eb] text-white border-0 cursor-default'
                                                                            : isMeasurability && measurabilityRequired
                                                                            ? 'bg-[#fef9c3] text-amber-800 border border-amber-300 hover:bg-amber-100'
                                                                            : 'bg-[#f1f5f9] text-[#6b7685] border border-[#e2e6ed] hover:bg-[#e2e8f0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                                                                    )}
                                                                >
                                                                    {checked ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] opacity-80" />}
                                                                    {c.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        })}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Validation Guide + Tips */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                    <Card className="overflow-hidden rounded-xl border border-[#e2e6ed] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <CardContent className="p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f2a4a] dark:text-slate-100">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f2a4a] dark:bg-slate-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </span>
                                {t('performance_system_kpi_review.validation_guide')}
                            </h3>
                            <ul className="flex gap-2 overflow-x-auto pb-1 text-sm [scrollbar-width:thin]">
                                {VALIDATION_CRITERIA.map((c) => (
                                    <li
                                        key={c.id}
                                        className="min-w-[210px] shrink-0 rounded-lg border border-[#e2e6ed] bg-[#f8fafc] p-2 dark:border-slate-700 dark:bg-slate-800/60"
                                    >
                                        <span className="mt-0.5 shrink-0 text-[#6b7685] dark:text-slate-400">
                                            {c.id === 'outcome_influence' && <Zap className="w-4 h-4" />}
                                            {c.id === 'job_relevance' && <CheckCircle2 className="w-4 h-4" />}
                                            {c.id === 'measurability' && <TrendingUp className="w-4 h-4" />}
                                            {c.id === 'data_availability' && <Database className="w-4 h-4" />}
                                        </span>
                                        <div>
                                            <span className="font-semibold text-[#0f2a4a] dark:text-slate-100">{c.required ? c.label.replace(' Required', '') : c.label}</span>
                                            {c.required && <span className="text-red-600 text-xs font-semibold ml-1">{t('performance_system_kpi_review.required')}</span>}
                                            <p className="mt-0.5 text-xs text-[#6b7685] dark:text-slate-300">{c.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 text-xs text-[#6b7685] dark:text-slate-300">
                                각 KPI 카드의 기준을 클릭해 검증하세요. 4/4 달성 후 이메일 발송 권장.
                            </p>
                        </CardContent>
                    </Card>
                    <div className="rounded-xl bg-[#0f2a4a] text-white p-5">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-emerald-400" /> ◎ {t('performance_system_kpi_review.tips')}
                        </h3>
                        <ul className="flex gap-2 overflow-x-auto pb-1 text-xs text-[#e2e8f0] [scrollbar-width:thin]">
                            <li className="flex min-w-[220px] shrink-0 items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                                <Circle className="w-1.5 h-1.5 text-emerald-400 shrink-0 mt-1.5 fill-emerald-400" />
                                <span>{t('performance_system_kpi_review.tip_1')}</span>
                            </li>
                            <li className="flex min-w-[220px] shrink-0 items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                                <Circle className="w-1.5 h-1.5 text-blue-400 shrink-0 mt-1.5 fill-blue-400" />
                                <span>{t('performance_system_kpi_review.tip_2')}</span>
                            </li>
                            <li className="flex min-w-[220px] shrink-0 items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                                <Circle className="w-1.5 h-1.5 text-amber-400 shrink-0 mt-1.5 fill-amber-400" />
                                <span>{t('performance_system_kpi_review.tip_3')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer: in flow so it starts after sidebar/header (no full-width under sidebar) */}
            <footer className="sticky bottom-0 z-10 shrink-0 border-t border-[#e0ddd5] bg-white px-6 py-[18px] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:px-[60px] dark:border-slate-700 dark:bg-slate-900">
                <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
                    {onBack ? (
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="rounded-lg border-[#e2e8f0] font-semibold text-[#475569] hover:bg-[#f8fafc] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> {t('common.back')}
                        </Button>
                    ) : (
                        <div />
                    )}
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                onClick={handleSendReviewRequest}
                                disabled={sendingReview || !selectedOrg}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md disabled:opacity-60"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendingReview ? t('common.sending') : (selectedHasReviewSent ? t('performance_system_kpi_review.resend_review_request') : t('performance_system_kpi_review.send_review_request'))}
                            </Button>
                            <Button
                                onClick={() => onContinue(kpis)}
                                disabled={!canContinue}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md"
                            >
                                {t('common.continue')}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                            {!canContinue && (
                                <p className="text-xs text-amber-700">
                                    {t('performance_system_kpi_review.continue_locked_hint')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Edit KPI dialog */}
            <Dialog
                open={editingKpiIndex !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingKpi(null);
                        setEditingKpiIndex(null);
                    }
                }}
            >
                <DialogContent
                    className="max-w-lg rounded-xl"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{t('performance_system_kpi_review.edit_kpi')}</DialogTitle>
                        <DialogDescription>{t('performance_system_kpi_review.edit_kpi_desc')}</DialogDescription>
                    </DialogHeader>
                    {editingKpiIndex !== null && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <Label>{t('performance_system_kpi_review.kpi_name')}</Label>
                                <Input
                                    value={editForm.kpi_name ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, kpi_name: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('performance_system_kpi_review.formula_description')}</Label>
                                <Input
                                    value={editForm.formula ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, formula: e.target.value }))}
                                    className="mt-1"
                                    placeholder={t('performance_system_kpi_review.formula_placeholder')}
                                />
                            </div>
                            <div>
                                <Label>{t('performance_system_kpi_review.weight_percent')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editForm.weight ?? 0}
                                    onChange={(e) => setEditForm((f) => ({ ...f, weight: parseFloat(e.target.value) || 0 }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('performance_system_kpi_review.purpose')}</Label>
                                <Textarea
                                    value={editForm.purpose ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, purpose: e.target.value }))}
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditingKpi(null);
                                        setEditingKpiIndex(null);
                                    }}
                                >
                                    {t('common.cancel')}
                                </Button>
                                    <Button
                                        onClick={() => {
                                            if (editingKpiIndex !== null && editingKpiIndex >= 0) {
                                                handleSaveKpi(editingKpiIndex, editForm);
                                                saveCurrentDraftToServer();
                                            }
                                            setEditingKpi(null);
                                            setEditingKpiIndex(null);
                                        }}
                                        disabled={!editForm.kpi_name?.trim()}
                                    >
                                    {t('common.save')}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
