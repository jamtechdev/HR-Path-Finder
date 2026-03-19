import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const VALIDATION_CRITERIA = [
    { id: 'outcome_influence', label: 'Outcome Influence', icon: Zap, desc: "Outcome is primarily driven by this org's own efforts.", question: 'Is the outcome primarily influenced by this organization\'s own efforts?', noHint: 'Please refine the KPI so it reflects outcomes your org can directly control.' },
    { id: 'job_relevance', label: 'Job Relevance', icon: CheckCircle2, desc: "Directly tied to this org's core responsibilities.", question: 'Is this KPI directly tied to this organization\'s core responsibilities and performance?', noHint: 'Please align the KPI with this org\'s core job scope.' },
    { id: 'measurability', label: 'Measurability Required', icon: TrendingUp, desc: 'Measurable with a clear data source.', required: true, question: 'Is this KPI clearly measurable with numerical data?', noHint: 'Please refine the KPI name and formula to be more quantitative.' },
    { id: 'data_availability', label: 'Data Availability', icon: Database, desc: 'Data is accessible and ready to collect.', question: 'Is the data for this KPI accessible and ready to collect?', noHint: 'Please ensure a clear data source exists before confirming.' },
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
}

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
}: Props) {
    const [inlineMsg, setInlineMsg] = useState<string | null>(null);
    const [kpis, setKpis] = useState<Kpi[]>(() =>
        (organizationalKpis || []).length === 0
            ? []
            : (() => {
                  const map = new Map<string, Kpi>();
                  organizationalKpis.forEach((k: any) => {
                      const key = `${(k.organization_name || '').trim().toLowerCase()}::${(k.kpi_name || '').trim().toLowerCase()}`;
                      if (!map.has(key) || (k.id && (!map.get(key)!.id || k.id > map.get(key)!.id)))
                          map.set(key, {
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
                          });
                  });
                  return Array.from(map.values());
              })()
    );
    const [selectedOrg, setSelectedOrg] = useState('');
    const [validationByKpi, setValidationByKpi] = useState<Record<string, ValidationState>>({});
    const [validationModal, setValidationModal] = useState<{ kpiKey: string; criterion: ValidationKey } | null>(null);
    const [validationModalNoHint, setValidationModalNoHint] = useState<string | null>(null);
    const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
    const [sendingReview, setSendingReview] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Kpi>>({});
    const [recommendedTemplates, setRecommendedTemplates] = useState<Array<{ id: number; kpi_name: string; purpose?: string; category?: string; formula?: string; measurement_method?: string; weight?: number }>>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

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
        if (!organizationalKpis?.length) return;
        const map = new Map<string, Kpi>();
        organizationalKpis.forEach((k: any) => {
            const key = `${(k.organization_name || '').trim().toLowerCase()}::${(k.kpi_name || '').trim().toLowerCase()}`;
            if (!map.has(key) || (k.id && (!map.get(key)!.id || k.id > map.get(key)!.id)))
                map.set(key, {
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
                });
        });
        setKpis(Array.from(map.values()));
    }, [organizationalKpis]);

    useEffect(() => {
        onKpisChange?.(kpis);
    }, [kpis, onKpisChange]);

    const orgKpis = kpis.filter((k) => k.organization_name === selectedOrg);
    const leaderName = orgChartMappings.find((m) => m.org_unit_name === selectedOrg)?.org_head_name || '—';
    const totalWeight = orgKpis.reduce((s, k) => s + (k.weight || 0), 0);

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
            is_active: true,
            status: 'draft',
        };
        setKpis((prev) => [...prev, newKpi]);
        setEditingKpi(newKpi);
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
            is_active: true,
            status: 'draft',
        };
        setKpis((prev) => [...prev, newKpi]);
        setEditingKpi(newKpi);
        setEditForm(newKpi);
    };

    const handleDeleteKpi = (index: number) => {
        if (!confirm('Are you sure you want to delete this KPI?')) return;
        setKpis((prev) => prev.filter((_, i) => i !== index));
    };

    const handleExcludeKpi = (index: number) => {
        const kpi = kpis[index];
        setKpis((prev) => {
            const next = [...prev];
            next[index] = { ...kpi, is_active: !kpi.is_active };
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
        setInlineMsg(null);
        setKpis((prev) => {
            const next = [...prev];
            next[index] = { ...kpi, kpi_name: kpi.kpi_name.trim(), organization_name: (kpi.organization_name || '').trim() };
            return next;
        });
        setEditingKpi(null);
    };

    const kpiReviewRecipients = orgChartMappings.filter((m) => m.is_kpi_reviewer && m.org_head_email?.trim());

    const handleSendReviewRequest = () => {
        setInlineMsg('Review request emails will be sent after you click “Review & Submit”.');
    };

    const handleConfirmAllRecommended = () => {
        // Optional: bulk confirm recommended KPIs; for UI we just close any edit and show feedback
        setInlineMsg('All recommended KPIs confirmed (draft).');
    };

    const currentCriterion = validationModal ? VALIDATION_CRITERIA.find((c) => c.id === validationModal.criterion) : null;
    const canSendReviewRequest =
        !!selectedOrg &&
        orgKpis.length > 0 &&
        orgKpis.every((k) => {
            const key = `kpi-${k.id ?? kpis.findIndex((x) => x === k)}-${k.kpi_name}`;
            return completedCount(key) === 4 && (k.measurement_method ?? '').trim() !== '';
        }) &&
        totalWeight === 100;

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
            <div className="flex-1 min-h-0 flex gap-6 md:p-6 flex-col md:flex-row max-w-[1400px] mx-auto w-full overflow-auto">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    <Card className="rounded-xl border border-[#e2e6ed] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
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
                                                <SelectItem key={org} value={org}>{org}</SelectItem>
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
                                            const orgKpiCount = kpis.filter((k) => k.organization_name === orgName).length;
                                            const tokens = (kpiReviewTokens as Record<string, unknown[]>)[orgName];
                                            const hasReviewSent = Array.isArray(tokens) && tokens.length > 0;
                                            return (
                                                <div
                                                    key={orgName}
                                                    className="flex items-center justify-between rounded-lg border border-[#e2e6ed] bg-white px-4 py-2 text-sm"
                                                >
                                                    <span className="font-medium text-[#1a2b4a]">{orgName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={orgKpiCount > 0 ? 'default' : 'secondary'} className="text-xs">
                                                            {orgKpiCount > 0 ? 'Draft' : 'No KPIs'}
                                                        </Badge>
                                                        {hasReviewSent && (
                                                            <Badge className="bg-[#1a2b4a] text-white text-xs">Review sent</Badge>
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
                                <span className="text-[#6b7685] font-medium">KPI {orgKpis.length}개</span>
                                <span className="text-[#6b7685]">
                                    ◎ Weight 합계: <span className={cn('font-bold', totalWeight === 100 ? 'text-[#2ec4a0]' : 'text-[#1a2b4a]')}>{totalWeight}%</span>
                                </span>
                                {orgKpis.length > 0 && (
                                    <span className="text-xs text-[#6b7685]">
                                        {canSendReviewRequest ? (
                                            <span className="text-[#2ec4a0] font-medium">✓ Ready to send — use <strong>Send Review Request</strong> in the bar below.</span>
                                        ) : (
                                            <span>Complete 4/4 validation per KPI, fill Measurement method, and set total weight to 100% to enable <strong>Send Review Request</strong> (bottom bar).</span>
                                        )}
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
                                    orgKpis.map((kpi, idx) => {
                                        const globalIndex = kpis.findIndex((k) => k === kpi);
                                        const kpiKey = `kpi-${kpi.id ?? globalIndex}-${kpi.kpi_name}`;
                                        const validation = getValidation(kpiKey);
                                        const completed = completedCount(kpiKey);
                                        const measurabilityRequired = needsMeasurability(kpiKey);
                                        const formulaText = kpi.formula || kpi.measurement_method || '—';
                                        const isExcluded = !kpi.is_active;

                                        return (
                                            <div
                                                key={kpiKey}
                                                className={cn(
                                                    'rounded-xl border bg-white p-5 shadow-sm transition-all',
                                                    isExcluded ? 'opacity-60 border-[#e2e6ed]' : 'border-[#e2e6ed]'
                                                )}
                                            >
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
                                                                setEditForm({ ...kpi });
                                                            }}
                                                        >
                                                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
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
                                                            className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg"
                                                            onClick={() => handleExcludeKpi(globalIndex)}
                                                        >
                                                            Exclude
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
                                    })
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
                        <FieldErrorMessage fieldKey="kpi-list" errors={fieldErrors} className="w-full" />
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                onClick={handleSendReviewRequest}
                                disabled={sendingReview}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md disabled:opacity-60"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendingReview ? 'Sending...' : 'Send Review Request Email to Organization Leader'}
                            </Button>
                            <Button
                                onClick={() => onContinue(kpis)}
                                className="bg-[#1a2b4a] hover:bg-[#2e4570] text-white rounded-lg font-bold px-6 py-2.5 shadow-md"
                            >
                                Continue to CEO KPI Review
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Edit KPI dialog */}
            <Dialog open={!!editingKpi} onOpenChange={(open) => !open && setEditingKpi(null)}>
                <DialogContent className="max-w-lg rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Edit KPI</DialogTitle>
                        <DialogDescription>Update KPI name, formula, weight, and other fields.</DialogDescription>
                    </DialogHeader>
                    {editingKpi && (
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
                                <Button variant="outline" onClick={() => setEditingKpi(null)}>Cancel</Button>
                                    <Button
                                        onClick={() => {
                                            const idx = kpis.findIndex((k) => k === editingKpi);
                                            if (idx >= 0) {
                                                handleSaveKpi(idx, editForm);
                                            }
                                            setEditingKpi(null);
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
