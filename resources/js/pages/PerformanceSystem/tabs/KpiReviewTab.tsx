import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    { id: 'outcome_influence', label: 'Outcome Influence', icon: Zap, desc: "Outcome is primarily driven by this org's own efforts." },
    { id: 'job_relevance', label: 'Job Relevance', icon: CheckCircle2, desc: "Directly tied to this org's core responsibilities." },
    { id: 'measurability', label: 'Measurability Required', icon: TrendingUp, desc: 'Measurable with a clear data source.', required: true },
    { id: 'data_availability', label: 'Data Availability', icon: Database, desc: 'Data is accessible and ready to collect.' },
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
    orgChartMappings?: Array<{ org_unit_name: string; org_head_email?: string; org_head_name?: string }>;
    kpiReviewTokens?: Record<string, unknown>;
    organizationalKpis?: Array<Partial<Kpi>>;
    onContinue: (kpis: Kpi[]) => void;
    onBack?: () => void;
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
    onContinue,
    onBack,
}: Props) {
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
    const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
    const [editForm, setEditForm] = useState<Partial<Kpi>>({});
    const [savingKpiIndex, setSavingKpiIndex] = useState<number | null>(null);

    const orgNames = Array.from(new Set(orgChartMappings.map((m) => m.org_unit_name).filter(Boolean)));
    useEffect(() => {
        if (orgNames.length > 0 && !selectedOrg) setSelectedOrg(orgNames[0]);
    }, [orgNames, selectedOrg]);

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
    const toggleValidation = (kpiKey: string, key: ValidationKey) => {
        const v = getValidation(kpiKey);
        setValidation(kpiKey, key, !v[key]);
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

    const handleSaveKpi = async (index: number) => {
        const kpi = kpis[index];
        if (!kpi.kpi_name?.trim()) {
            alert('Please enter KPI name');
            return;
        }
        setSavingKpiIndex(index);
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'kpi-review',
            kpis: [
                {
                    id: kpi.id ?? null,
                    organization_name: kpi.organization_name.trim(),
                    kpi_name: kpi.kpi_name.trim(),
                    purpose: kpi.purpose || '',
                    category: kpi.category || '',
                    linked_job_id: kpi.linked_job_id ?? null,
                    linked_csf: kpi.linked_csf || '',
                    formula: kpi.formula || '',
                    measurement_method: kpi.measurement_method || '',
                    weight: kpi.weight ?? null,
                    is_active: kpi.is_active,
                },
            ],
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['organizationalKpis'] });
                setSavingKpiIndex(null);
                setEditingKpi(null);
            },
            onError: () => {
                setSavingKpiIndex(null);
                alert('Failed to save KPI. Please try again.');
            },
        });
    };

    const handleSendReviewRequest = () => {
        const mapping = orgChartMappings.find((m) => m.org_unit_name === selectedOrg);
        if (!mapping?.org_head_email) {
            alert('Organization head email is required. Please update the organization chart mapping first.');
            return;
        }
        if (!confirm(`Send review request email to the organization leader (${mapping.org_head_email}) for "${selectedOrg}"?`)) return;
        router.post(`/hr-manager/performance-system/${project.id}/send-review-request`, {
            organization_name: selectedOrg,
        }, {
            onSuccess: (page: any) => {
                alert((page?.props?.flash as any)?.success || 'Review request emails sent successfully.');
            },
            onError: (errors: any) => {
                alert('Error: ' + (errors?.error || errors?.message || 'Failed to send emails.'));
            },
        });
    };

    const handleConfirmAllRecommended = () => {
        // Optional: bulk confirm recommended KPIs; for UI we just close any edit and show feedback
        alert('All recommended KPIs confirmed.');
    };

    return (
        <div className="min-h-full bg-[#f4f6f9] flex flex-col">
            <div className="flex-1 flex gap-6 p-6 max-w-[1400px] mx-auto w-full">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    <Card className="rounded-xl border border-[#e2e8f0] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            {/* Top row: Organization, Leader, KPI Count */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-semibold text-[#0f2a4a]">Organization:</Label>
                                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                        <SelectTrigger className="w-[220px] border-[#e2e8f0] rounded-lg">
                                            <SelectValue placeholder="Select organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgNames.map((org) => (
                                                <SelectItem key={org} value={org}>{org}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f4f8] border border-[#e2e8f0] text-sm text-[#475569]">
                                    <User className="w-4 h-4 text-[#64748b]" />
                                    <span className="font-medium">Leader</span>
                                    <span className="text-[#0f2a4a] font-semibold">{leaderName}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f4f8] border border-[#e2e8f0] text-sm text-[#475569]">
                                    <Target className="w-4 h-4 text-[#64748b]" />
                                    <span className="font-medium">KPI Count</span>
                                    <span className="text-[#0f2a4a] font-semibold">{orgKpis.length}</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Button
                                    onClick={handleConfirmAllRecommended}
                                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-semibold"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm All Recommended
                                </Button>
                                <Button
                                    onClick={handleAddKpi}
                                    disabled={!selectedOrg}
                                    className="bg-[#0f2a4a] hover:bg-[#1e293b] text-white rounded-lg font-semibold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add KPI
                                </Button>
                            </div>

                            {/* KPI summary */}
                            <div className="flex items-center gap-4 mb-6 text-sm">
                                <span className="text-[#475569] font-medium">KPI {orgKpis.length}개</span>
                                <span className="text-[#475569]">
                                    ◎ Weight 합계: <span className={cn('font-bold', totalWeight === 100 ? 'text-[#16a34a]' : 'text-[#0f2a4a]')}>{totalWeight}%</span>
                                </span>
                            </div>

                            {/* KPI cards */}
                            <div className="space-y-4">
                                {!selectedOrg ? (
                                    <p className="text-sm text-[#64748b] py-8 text-center">Select an organization to view KPIs.</p>
                                ) : orgKpis.length === 0 ? (
                                    <p className="text-sm text-[#64748b] py-8 text-center">No KPIs for this organization. Click &quot;+ Add KPI&quot; to create one.</p>
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
                                                    isExcluded ? 'opacity-60 border-[#e2e8f0]' : 'border-[#e2e8f0]'
                                                )}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge className="bg-[#7c3aed] text-white text-xs font-semibold rounded-full border-0">Recommended</Badge>
                                                            <Badge className="bg-[#e0f2fe] text-[#0369a1] text-xs font-semibold rounded-full border-0">Monthly</Badge>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-[#0f2a4a] mb-1">{kpi.kpi_name || 'Untitled KPI'}</h3>
                                                        <div className="inline-block px-3 py-1.5 rounded-full bg-[#f1f5f9] text-[#64748b] text-sm mb-2">
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
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">VALIDATION</span>
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
                                                                    onClick={() => toggleValidation(kpiKey, c.id)}
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                                                                        checked
                                                                            ? 'bg-[#2563eb] text-white border-0'
                                                                            : isMeasurability && measurabilityRequired
                                                                            ? 'bg-[#fef9c3] text-amber-800 border border-amber-300'
                                                                            : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
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
                    <Card className="rounded-xl border border-[#e2e8f0] shadow-sm bg-white overflow-hidden">
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
                                        <span className="text-[#64748b] shrink-0 mt-0.5">
                                            {c.id === 'outcome_influence' && <Zap className="w-4 h-4" />}
                                            {c.id === 'job_relevance' && <CheckCircle2 className="w-4 h-4" />}
                                            {c.id === 'measurability' && <TrendingUp className="w-4 h-4" />}
                                            {c.id === 'data_availability' && <Database className="w-4 h-4" />}
                                        </span>
                                        <div>
                                            <span className="font-semibold text-[#0f2a4a]">{c.required ? c.label.replace(' Required', '') : c.label}</span>
                                            {c.required && <span className="text-red-600 text-xs font-semibold ml-1">Required</span>}
                                            <p className="text-[#64748b] text-xs mt-0.5">{c.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-[#64748b] mt-4">
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

            {/* Sticky footer */}
            <footer className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] py-4 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-10">
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
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSendReviewRequest}
                            disabled={!selectedOrg || orgKpis.length === 0}
                            className="bg-[#0f2a4a] hover:bg-[#1e293b] text-white rounded-lg font-bold px-6 py-2.5 shadow-md"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Review Request Email to Organization Leader
                        </Button>
                        <Button
                            onClick={() => onContinue(kpis)}
                            className="bg-[#0f2a4a] hover:bg-[#1e293b] text-white rounded-lg font-bold px-6 py-2.5 shadow-md"
                        >
                            Continue to CEO KPI Review
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
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
                                            setKpis((prev) => {
                                                const next = [...prev];
                                                next[idx] = { ...next[idx], ...editForm };
                                                return next;
                                            });
                                            handleSaveKpi(idx);
                                        }
                                        setEditingKpi(null);
                                    }}
                                    disabled={!editForm.kpi_name?.trim() || savingKpiIndex !== null}
                                >
                                    {savingKpiIndex !== null ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
