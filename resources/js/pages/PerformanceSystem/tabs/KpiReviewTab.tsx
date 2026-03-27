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
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import { cn } from '@/lib/utils';

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
    const [editForm, setEditForm] = useState<Partial<Kpi>>({});
    const [recommendedTemplates, setRecommendedTemplates] = useState<Array<{ id: number; kpi_name: string; purpose?: string; category?: string; formula?: string; measurement_method?: string; weight?: number }>>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
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

    useEffect(() => {
        const next = normalizeKpis(organizationalKpis || []);
        setKpis((prev) => (areKpisEqual(prev, next) ? prev : next));
    }, [organizationalKpis]);

    useEffect(() => {
        onKpisChange?.(kpis);
    }, [kpis]);

    const orgKpis = kpis.filter((k) => k.organization_name === selectedOrg);
    const orgActiveKpis = orgKpis.filter((k) => k.is_active);
    const leaderName = orgChartMappings.find((m) => m.org_unit_name === selectedOrg)?.org_head_name || '—';
    const isSingleKpiOrg = orgKpis.length === 1;
    const isDefaultAutoSelectedSingleKpi = !!selectedOrg && isSingleKpiOrg && !selectionTouchedByOrg[selectedOrg];
    const orgSelectedKpis = isDefaultAutoSelectedSingleKpi ? orgKpis : orgActiveKpis;

    const totalWeight = orgSelectedKpis.reduce((s, k) => s + (k.weight || 0), 0);
    const weightOk = orgSelectedKpis.length <= 1 ? orgSelectedKpis.length === 1 : Math.abs(totalWeight - 100) < 0.01;

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
        if (!confirm('Are you sure you want to delete this KPI?')) return;
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
                setInlineMsg('KPI deleted successfully.');
            },
            onError: () => {
                setInlineMsg('Failed to delete KPI. Please try again.');
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
            setInlineMsg('KPI name is required.');
            return;
        }
        if ((kpi.weight ?? 0) < 0 || (kpi.weight ?? 0) > 100) {
            setInlineMsg('Weight must be between 0 and 100.');
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
                setInlineMsg(`Total active KPI weight for "${targetOrg}" cannot exceed 100%.`);
            }
            return next;
        });
        setEditingKpi(null);
    };

    const saveCurrentDraftToServer = (successMsg: string) => {
        if (!project?.id) return;
        router.post(
            `/hr-manager/performance-system/${project.id}`,
            {
                tab: 'kpi-review',
                kpis: kpis,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setInlineMsg(successMsg);
                },
                onError: () => {
                    setInlineMsg('Failed to save KPI draft. Please try again.');
                },
            },
        );
    };

    const kpiReviewRecipients = orgChartMappings.filter((m) => m.is_kpi_reviewer && m.org_head_email?.trim());
    const getHasReviewSent = (orgName: string) => {
        const tokens = (kpiReviewTokens as Record<string, unknown[]>)[orgName];
        return Array.isArray(tokens) && tokens.length > 0;
    };
    const getOrgReviewEligibility = (orgName: string) => {
        const orgRows = kpis.filter((k) => k.organization_name === orgName);
        if (orgRows.length === 0) {
            return { canSend: false, reason: 'No KPIs available for this organization.' };
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
                reason: 'Already verified by CEO. Re-send is blocked unless CEO requests revision.',
            };
        }
        return { canSend: true, reason: null as string | null };
    };
    const selectedHasReviewSent = selectedOrg ? getHasReviewSent(selectedOrg) : false;
    const selectedEligibility = selectedOrg
        ? getOrgReviewEligibility(selectedOrg)
        : { canSend: false, reason: 'Select organization first.' };

    // NOTE:
    // We intentionally do NOT auto-call setKpis here.
    // Doing setState in effects caused maximum update depth issues earlier.
    // Instead, the "single KPI default selected" behavior is implemented via derived UI logic above.

    const handleSendReviewRequest = () => {
        if (!selectedOrg || !project?.id) return;
        if (sendingReview) return;
        if (!selectedEligibility.canSend) {
            toast({
                title: toastCopy.notReadyYet,
                description:
                    (selectedEligibility.reason || 'This organization cannot be sent for review.') +
                    ' 준비가 완료되면 다시 시도해 주세요.',
                variant: 'warning',
                duration: 2500,
            });
            return;
        }
        if (!selectedKpisReady) {
            toast({
                title: toastCopy.completeFirst,
                description:
                    'For selected KPIs, make sure all 4 validation criteria are checked and measurability is set. 필수 검증을 완료해 주세요.',
                variant: 'warning',
                duration: 3000,
            });
            return;
        }
        if (!weightOk) {
            toast({
                title: toastCopy.completeFirst,
                description: 'Total selected KPI weight must be exactly 100% before sending review request.',
                variant: 'warning',
                duration: 2800,
            });
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
                    setInlineMsg('Review request email sent successfully to Leader.');
                    setSendSuccessModalOpen(true);
                    setSendingReview(false);
                },
                onError: () => {
                    setInlineMsg('Failed to send review request. Check KPI Reviewer email in Org Chart Mapping and ensure selected KPI total weight is 100%.');
                    setSendingReview(false);
                },
            },
        );
    };

    const handleConfirmAllRecommended = () => {
        // Optional: bulk confirm recommended KPIs; for UI we just close any edit and show feedback
        setInlineMsg('All recommended KPIs confirmed (draft).');
    };

    const currentCriterion = validationModal ? VALIDATION_CRITERIA.find((c) => c.id === validationModal.criterion) : null;
    const allKpisCeoApproved =
        kpis.length > 0 &&
        kpis.every((k) => {
            const ceo = (k.ceo_approval_status ?? '').toLowerCase();
            const status = (k.status ?? '').toLowerCase();
            return ceo === 'approved' || status === 'approved';
        });

    const getKpiKey = (kpi: Kpi) => {
        const globalIndex = kpis.findIndex((x) => x === kpi);
        return `kpi-${kpi.id ?? globalIndex}-${kpi.kpi_name}`;
    };

    const selectedKpisReady = orgSelectedKpis.length > 0 &&
        orgSelectedKpis.every((kpi) => {
            const key = getKpiKey(kpi);
            return completedCount(key) === 4 && (kpi.measurement_method ?? '').trim() !== '';
        });

    const canSendReviewRequest =
        !!selectedOrg &&
        selectedEligibility.canSend &&
        orgSelectedKpis.length > 0 &&
        selectedKpisReady &&
        weightOk;

    return (
        <div className="manager-kpi-draft min-h-full flex flex-col" style={{ background: '#f8f9fb' }}>
            <Dialog open={!!validationModal} onOpenChange={(open) => !open && closeValidationModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Validation</DialogTitle>
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
                            <Button onClick={closeValidationModal}>Close</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={confirmValidationNo}>
                                    No
                                </Button>
                                <Button onClick={confirmValidationYes}>Yes</Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={sendSuccessModalOpen} onOpenChange={setSendSuccessModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Success</DialogTitle>
                        <DialogDescription>
                            Review request sent to Leader successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setSendSuccessModalOpen(false)}>OK</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="flex-1 min-h-0 flex gap-6 md:p-6 flex-col md:flex-row max-w-[1400px] mx-auto w-full overflow-auto">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    <Card className="rounded-xl border border-[#e2e6ed] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            {/* UX guidance: request is per-organization */}
                            <div className="mb-5 rounded-xl border border-[#facc15]/40 bg-[#fefce8] px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-[#92400e] mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-[#78350f]">
                                            Review requests must be sent per organization
                                        </p>
                                        <p className="text-xs text-[#6b7685] mt-1">
                                            After completing the KPIs for an organization, click <strong>Send Review Request</strong> for that organization.
                                            Other organizations will not be requested automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Top row: Organization, Leader, KPI Count */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-semibold text-[#1a2b4a]">Organization:</Label>
                                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                        <SelectTrigger className="w-[220px] border-[#e2e6ed] rounded-lg">
                                            <SelectValue placeholder="Select organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgNames.map((org) => (
                                                <SelectItem key={org} value={org}>
                                                    {org}
                                                    {!getOrgReviewEligibility(org).canSend ? ' (Verified/Locked)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f2f5] border border-[#e2e6ed] text-sm text-[#6b7685]">
                                    <User className="w-4 h-4 text-[#9aa3b2]" />
                                    <span className="font-medium">Leader</span>
                                    <span className="text-[#1a2b4a] font-semibold">{leaderName}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f2f5] border border-[#e2e6ed] text-sm text-[#6b7685]">
                                    <Target className="w-4 h-4 text-[#9aa3b2]" />
                                    <span className="font-medium">KPI Count</span>
                                    <span className="text-[#1a2b4a] font-semibold">{orgKpis.length}</span>
                                </div>
                                {orgKpis.length > 0 && !selectedHasReviewSent && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef9c3] border border-[#facc15] text-sm text-[#92400e]">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-semibold">Pending Request</span>
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
                                    Confirm All Recommended
                                </Button>
                            <Button
                                onClick={handleAddKpi}
                                disabled={!selectedOrg}
                                className="bg-[#2ec4a0] hover:bg-[#25a88a] text-white rounded-lg font-semibold border border-[#b0ede0]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add KPI
                            </Button>
                            </div>

                            {selectedOrg && (
                                <>
                                    {loadingTemplates ? (
                                        <p className="text-sm text-[#6b7685] py-2">Loading recommended KPIs...</p>
                                    ) : recommendedTemplates.length > 0 ? (
                                        <div className="mb-4 rounded-lg border border-[#e2e6ed] bg-[#f8f9fb] p-4">
                                            <h4 className="text-sm font-bold text-[#1a2b4a] mb-2">Recommended KPIs (from Admin templates)</h4>
                                            <p className="text-xs text-[#6b7685] mb-3">Select a template to add it to your list. You can then edit, add, or delete.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recommendedTemplates.map((t) => (
                                                    <div
                                                        key={t.id}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-[#e2e6ed] bg-white px-3 py-2 text-sm"
                                                    >
                                                        <span className="font-medium text-[#1a2b4a]">{t.kpi_name}</span>
                                                        <span className="text-[#6b7685]">{(t.weight ?? 0)}%</span>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleAddFromTemplate(t)}
                                                        >
                                                            Add to list
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
                                <div className="mb-6 rounded-xl border border-[#e2e6ed] bg-[#f8f9fb] p-4">
                                    <h4 className="text-sm font-bold text-[#1a2b4a] mb-3">Team Progress Status</h4>
                                    <div className="space-y-2">
                                        {orgNames.map((orgName) => {
                                            const orgKpisForStatus = kpis.filter((k) => k.organization_name === orgName);
                                            const orgKpiCount = orgKpisForStatus.length;
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
                                                <div
                                                    key={orgName}
                                                    className="flex items-center justify-between rounded-lg border border-[#e2e6ed] bg-white px-4 py-2 text-sm"
                                                >
                                                    <span className="font-medium text-[#1a2b4a]">{orgName}</span>
                                                    <div className="flex items-center gap-2">
                                                        {orgKpiCount === 0 ? (
                                                            <Badge variant="secondary" className="text-xs">
                                                                No KPIs
                                                            </Badge>
                                                        ) : hasReviewSent ? (
                                                            <Badge variant="default" className="text-xs">
                                                                Request Sent
                                                            </Badge>
                                                        ) : !getOrgReviewEligibility(orgName).canSend ? (
                                                            <Badge className="bg-[#334155] text-white text-xs font-semibold">
                                                                Verified (Locked)
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-[#f59e0b] text-white text-xs font-semibold">
                                                                Pending Request
                                                            </Badge>
                                                        )}
                                                        {hasLeaderSubmitted && (
                                                            <Badge className="bg-[#2563eb] text-white text-xs">Leader submitted</Badge>
                                                        )}
                                                        {hasCeoRevisionRequested && (
                                                            <Badge className="bg-[#f59e0b] text-white text-xs">CEO revision</Badge>
                                                        )}
                                                        {allCeoApproved && (
                                                            <Badge className="bg-[#16a34a] text-white text-xs">CEO approved</Badge>
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
                                <span className="text-[#6b7685] font-medium">
                                    KPI {orgSelectedKpis.length}/{orgKpis.length}개
                                </span>
                                <span className="text-[#6b7685]">
                                    ◎ Weight 합계:{' '}
                                    <span
                                        className={cn(
                                            'font-bold',
                                            weightOk ? 'text-[#2ec4a0]' : 'text-[#1a2b4a]'
                                        )}
                                    >
                                        {totalWeight}%
                                    </span>
                                </span>
                                {orgKpis.length > 0 && (
                                    <span className="text-xs text-[#6b7685]">
                                        <span>
                                            Send request for this organization only. You must click <strong>Send Review Request</strong> separately for each organization after finishing its KPIs.
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* KPI cards */}
                            <div className="space-y-4">
                                {!selectedOrg ? (
                                    <p className="text-sm text-[#6b7685] py-8 text-center">Select an organization to view KPIs.</p>
                                ) : orgKpis.length === 0 ? (
                                    <p className="text-sm text-[#6b7685] py-8 text-center">No KPIs for this organization. Click &quot;+ Add KPI&quot; to create one.</p>
                                ) : (
                                    <>
                                        {orgSelectedKpis.length === 0 && (
                                            <p className="text-sm text-[#6b7685] py-4">
                                                Select KPI cards with the <strong>green check</strong> to include them in the review request.
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
                                                    'relative rounded-xl border bg-white p-5 shadow-sm transition-all cursor-pointer',
                                                    isSelected
                                                        ? 'border-[#16a34a] bg-[#ecfdf5]'
                                                        : 'opacity-60 border-[#e2e6ed] hover:border-[#dbe2ea]'
                                                )}
                                            >
                                                {isSelected && (
                                                    <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-[#16a34a]" />
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge className="bg-[#7c3aed] text-white text-xs font-semibold rounded-full border-0">Recommended</Badge>
                                                            <Badge className="bg-[#e8faf6] text-[#2ec4a0] text-xs font-semibold rounded-full border-0">{(kpi.category || 'Monthly')}</Badge>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-[#1a2b4a] mb-1">{kpi.kpi_name || 'Untitled KPI'}</h3>
                                                        <div className="inline-block px-3 py-1.5 rounded-full bg-[#f0f2f5] text-[#6b7685] text-sm mb-2">
                                                            {formulaText}
                                                        </div>
                                                        <p className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>Weight: {kpi.weight ?? 0}%</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 shrink-0">
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
                                                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                                                            onClick={() => {
                                                                handleSaveKpi(globalIndex);
                                                                saveCurrentDraftToServer('KPI saved.');
                                                            }}
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1" /> Save
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 rounded-lg"
                                                            onClick={() => handleDeleteKpi(globalIndex)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={
                                                                isSelected
                                                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 rounded-lg'
                                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg'
                                                            }
                                                            onClick={() => handleExcludeKpi(globalIndex)}
                                                        >
                                                            {isSelected ? 'Unselect' : 'Select'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Validation section */}
                                                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7685]">VALIDATION</span>
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
                                                                <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                                                            </span>
                                                        )}
                                                        {measurabilityRequired && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fef9c3] text-amber-800 text-xs font-medium border border-amber-300">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> Measurability required
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
                                                                            : 'bg-[#f1f5f9] text-[#6b7685] border border-[#e2e6ed] hover:bg-[#e2e8f0]'
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
                <div className="w-[320px] shrink-0 space-y-4">
                    <Card className="rounded-xl border border-[#e2e6ed] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-5">
                            <h3 className="text-sm font-bold text-[#0f2a4a] mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#0f2a4a] flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </span>
                                Validation Guide
                            </h3>
                            <ul className="space-y-3 text-sm">
                                {VALIDATION_CRITERIA.map((c) => (
                                    <li key={c.id} className="flex gap-2">
                                        <span className="text-[#6b7685] shrink-0 mt-0.5">
                                            {c.id === 'outcome_influence' && <Zap className="w-4 h-4" />}
                                            {c.id === 'job_relevance' && <CheckCircle2 className="w-4 h-4" />}
                                            {c.id === 'measurability' && <TrendingUp className="w-4 h-4" />}
                                            {c.id === 'data_availability' && <Database className="w-4 h-4" />}
                                        </span>
                                        <div>
                                            <span className="font-semibold text-[#0f2a4a]">{c.required ? c.label.replace(' Required', '') : c.label}</span>
                                            {c.required && <span className="text-red-600 text-xs font-semibold ml-1">Required</span>}
                                            <p className="text-[#6b7685] text-xs mt-0.5">{c.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-[#6b7685] mt-4">
                                각 KPI 카드의 기준을 클릭해 검증하세요. 4/4 달성 후 이메일 발송 권장.
                            </p>
                        </CardContent>
                    </Card>
                    <div className="rounded-xl bg-[#0f2a4a] text-white p-5">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-emerald-400" /> ◎ Tips
                        </h3>
                        <ul className="space-y-2.5 text-xs text-[#e2e8f0]">
                            <li className="flex items-start gap-2">
                                <Circle className="w-1.5 h-1.5 text-emerald-400 shrink-0 mt-1.5 fill-emerald-400" />
                                <span>Recommended = Pathfinder 제안, 조직 현실에 맞게 조정하세요.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Circle className="w-1.5 h-1.5 text-blue-400 shrink-0 mt-1.5 fill-blue-400" />
                                <span>4개 기준 체크 → 4/4 달성 후 이메일 발송.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Circle className="w-1.5 h-1.5 text-amber-400 shrink-0 mt-1.5 fill-amber-400" />
                                <span>Measurability 는 필수 — 미체크 시 수정 또는 Exclude.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer: in flow so it starts after sidebar/header (no full-width under sidebar) */}
            <footer className="sticky bottom-0 shrink-0 bg-white border-t border-[#e0ddd5] py-[18px] px-6 md:px-[60px] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-10">
                <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
                    {onBack ? (
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] rounded-lg font-semibold"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    ) : (
                        <div />
                    )}
                    <div className="flex flex-col items-start gap-2">
                        {inlineMsg && <p className="text-xs text-[#6b7685]">{inlineMsg}</p>}
                        <p className="text-xs text-[#6b7685]">
                            Only units marked as <strong>KPI Reviewer</strong> with a valid email in Org Chart Mapping receive the request. Recipients: {kpiReviewRecipients.length > 0 ? kpiReviewRecipients.map((m) => m.org_unit_name).join(', ') : 'none designated.'}
                        </p>
                        <p className="text-[11px] text-[#6b7685]">
                            Tip: The button sends the request only for the <strong>selected organization</strong>. If you have multiple organizations, you need to send requests one by one.
                        </p>
                        <FieldErrorMessage fieldKey="kpi-list" errors={fieldErrors} className="w-full" />
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                onClick={handleSendReviewRequest}
                                disabled={sendingReview || !canSendReviewRequest}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md disabled:opacity-60"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendingReview ? 'Sending...' : 'Send Review Request'}
                            </Button>
                            <Button
                                onClick={() => onContinue(kpis)}
                                disabled={!allKpisCeoApproved}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                            {!allKpisCeoApproved && (
                                <p className="text-xs text-amber-700">
                                    Continue will unlock after CEO completes KPI review approval.
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
                <DialogContent className="max-w-lg rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Edit KPI</DialogTitle>
                        <DialogDescription>Update KPI name, formula, weight, and other fields.</DialogDescription>
                    </DialogHeader>
                    {editingKpiIndex !== null && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <Label>KPI Name</Label>
                                <Input
                                    value={editForm.kpi_name ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, kpi_name: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Formula / Description</Label>
                                <Input
                                    value={editForm.formula ?? ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, formula: e.target.value }))}
                                    className="mt-1"
                                    placeholder="e.g. Uptime hrs / Total hrs * 100"
                                />
                            </div>
                            <div>
                                <Label>Weight (%)</Label>
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
                                <Label>Purpose</Label>
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
                                    Cancel
                                </Button>
                                    <Button
                                        onClick={() => {
                                            if (editingKpiIndex !== null && editingKpiIndex >= 0) {
                                                handleSaveKpi(editingKpiIndex, editForm);
                                            }
                                            setEditingKpi(null);
                                            setEditingKpiIndex(null);
                                        }}
                                        disabled={!editForm.kpi_name?.trim()}
                                    >
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
