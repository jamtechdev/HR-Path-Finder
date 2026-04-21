import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface OrganizationalKpi {
    id?: number;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    is_active: boolean;
    organization_name?: string;
    status?: string;
    ceo_approval_status?: string;
    ceo_revision_comment?: string;
    revision_comment?: string;
    hr_draft?: Partial<OrganizationalKpi> | null;
    leader_latest?: Partial<OrganizationalKpi> | null;
    linked_job?: {
        id: number;
        job_name: string;
    };
}

interface Props {
    token: string;
    project: {
        id: number;
        company?: {
            name: string;
        };
    };
    organizationName: string;
    allOrganizations?: string[];
    kpis: OrganizationalKpi[];
    ceos?: Array<{
        id: number;
        name?: string;
        email?: string;
    }>;
    reviewerName?: string;
    reviewerEmail?: string;
    isCompleted?: boolean;
    reviewComments?: string;
}

const VALIDATIONS = [
    { icon: '🎯', key: 'outcome_influence' },
    { icon: '📋', key: 'job_relevance' },
    { icon: '📐', key: 'measurability' },
    { icon: '🗄', key: 'data_availability' },
] as const;

export default function KpiReviewToken({
    token,
    project,
    organizationName: defaultOrganizationName,
    allOrganizations = [],
    kpis: initialKpis = [],
    ceos = [],
    reviewerName,
    reviewerEmail,
    isCompleted = false,
    reviewComments: initialReviewComments = '',
}: Props) {
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const { props } = usePage();
    const propsKpis = (props as any)?.kpis;
    const [selectedOrganization, setSelectedOrganization] = useState<string>(defaultOrganizationName);
    const [kpis, setKpis] = useState<OrganizationalKpi[]>(() => {
        if (propsKpis && Array.isArray(propsKpis) && propsKpis.length > 0) return propsKpis;
        if (initialKpis && Array.isArray(initialKpis) && initialKpis.length > 0) return initialKpis;
        return [];
    });
    const [loading, setLoading] = useState(false);
    const [reviewComments, setReviewComments] = useState<string>(initialReviewComments || '');
    const [completed, setCompleted] = useState<boolean>(isCompleted);
    const [savingKpiIndex, setSavingKpiIndex] = useState<number | null>(null);
    const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false, false]);
    const [currentValIdx, setCurrentValIdx] = useState<number | null>(null);
    const [expandedKpiIndex, setExpandedKpiIndex] = useState<number | null>(0);
    const [editingKpiIndex, setEditingKpiIndex] = useState<number | null>(null);
    const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
    const [submitPopupMessage, setSubmitPopupMessage] = useState('');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const [ceoPickerOpen, setCeoPickerOpen] = useState(false);
    const [selectedCeoIds, setSelectedCeoIds] = useState<number[]>(() => ceos.map((c) => c.id));
    const flash = ((props as any)?.flash ?? {}) as Record<string, string>;

    useEffect(() => {
        // Keep selection in sync with available CEO list.
        // If user hasn't selected anything yet, default to "all".
        setSelectedCeoIds((prev) => (prev.length ? prev : ceos.map((c) => c.id)));
    }, [ceos]);

    useEffect(() => {
        const pageKpis = (props as any)?.kpis;
        if (pageKpis && Array.isArray(pageKpis)) {
            setKpis(pageKpis);
        } else if (initialKpis && Array.isArray(initialKpis) && initialKpis.length > 0) {
            setKpis(initialKpis);
        } else if (initialKpis && Array.isArray(initialKpis)) {
            setKpis([]);
        }
    }, [props, initialKpis]);

    useEffect(() => {
        setReviewComments(initialReviewComments || '');
    }, [initialReviewComments]);

    useEffect(() => {
        if (selectedOrganization) {
            setLoading(true);
            fetch(`/kpi-review/token/${token}/organization/${encodeURIComponent(selectedOrganization)}`)
                .then((res) => res.json())
                .then((data) => {
                    setKpis(data.kpis || []);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Error loading KPIs:', err);
                    setKpis([]);
                    setLoading(false);
                });
        }
    }, [selectedOrganization, token]);

    const { data, setData, post, processing } = useForm({
        final_submit: false,
        self_assessment: [false, false, false, false] as boolean[],
        organization_name: selectedOrganization,
        review_comments: reviewComments,
        kpis: kpis.map((kpi) => ({
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            purpose: kpi.purpose || '',
            category: kpi.category || '',
            linked_job_id: kpi.linked_job_id || null,
            linked_csf: kpi.linked_csf || '',
            formula: kpi.formula || '',
            measurement_method: kpi.measurement_method || '',
            weight: kpi.weight || null,
            is_active: kpi.is_active,
        })),
    });

    const hasCeoRevisionRequest = kpis.some((k) => {
        const ceo = String((k as any).ceo_approval_status ?? '').toLowerCase();
        const status = String(k.status ?? '').toLowerCase();
        return ceo === 'revision_requested' || status === 'revision_requested';
    });
    const hasCeoFinalized =
        kpis.length > 0 &&
        kpis.every((k) => {
            const ceo = String((k as any).ceo_approval_status ?? '').toLowerCase();
            const status = String(k.status ?? '').toLowerCase();
            return ceo === 'approved' || status === 'approved' || status === 'verified';
        });
    const isReadOnly = completed && !hasCeoRevisionRequest;
    const showLeaderSubmittedScreen = isReadOnly && !hasCeoFinalized;
    const ceoRevisionComment =
        kpis.find((k) => String(k.ceo_revision_comment ?? '').trim())?.ceo_revision_comment ||
        kpis.find((k) => String(k.revision_comment ?? '').trim())?.revision_comment ||
        '';

    useEffect(() => {
        setData('organization_name', selectedOrganization);
        setData('review_comments', reviewComments);
        setData(
            'kpis',
            kpis.map((kpi) => ({
                id: kpi.id,
                kpi_name: kpi.kpi_name,
                purpose: kpi.purpose || '',
                category: kpi.category || '',
                linked_job_id: kpi.linked_job_id || null,
                linked_csf: kpi.linked_csf || '',
                formula: kpi.formula || '',
                measurement_method: kpi.measurement_method || '',
                weight: kpi.weight || null,
                is_active: kpi.is_active ?? true,
            }))
        );
    }, [kpis, selectedOrganization, reviewComments, setData]);

    useEffect(() => {
        // Mark completed only for final-submit style messages, not draft-save flashes.
        const successText = String(flash?.success ?? '');
        const warningText = String(flash?.warning ?? '');
        const finalSubmitByFlash =
            /submitted successfully/i.test(successText) ||
            /submitted successfully/i.test(warningText);
        if (finalSubmitByFlash) {
            setCompleted(true);
            setSubmitPopupMessage(successText || warningText);
            setSubmitPopupOpen(true);
        }
        if (isCompleted) setCompleted(true);
    }, [flash?.success, flash?.warning, isCompleted]);

    const submitFinalReviewToSelectedCeo = (ceoIds: number[]) => {
        router.post(
            `/kpi-review/token/${token}`,
            {
                final_submit: true,
                self_assessment: confirmed,
                organization_name: selectedOrganization,
                review_comments: reviewComments,
                ceo_user_ids: ceoIds,
                kpis: kpis.map((kpi) => ({
                    id: kpi.id,
                    kpi_name: kpi.kpi_name,
                    purpose: kpi.purpose || '',
                    category: kpi.category || '',
                    linked_job_id: kpi.linked_job_id || null,
                    linked_csf: kpi.linked_csf || '',
                    formula: kpi.formula || '',
                    measurement_method: kpi.measurement_method || '',
                    weight: kpi.weight || null,
                    is_active: kpi.is_active,
                })),
            },
            {
                preserveScroll: false,
                onSuccess: () => {
                    router.reload({
                        onSuccess: (page) => {
                            const flash = (page as any)?.props?.flash ?? {};
                            const submitMessage =
                                flash?.success ||
                                flash?.warning ||
                                tx('kpi_review_token.review_submitted_success', 'Your KPI review has been submitted successfully.');
                            setSubmitPopupMessage(String(submitMessage));
                            setSubmitPopupOpen(true);
                            setCompleted(true);
                            setCeoPickerOpen(false);
                        },
                    });
                },
                onError: (errors) => {
                    console.error('Submit error:', errors);
                    const firstError = Object.values(errors || {})[0];
                    const msg =
                        typeof firstError === 'string'
                            ? firstError
                            : tx('kpi_review_token.submit_failed', 'Failed to submit review. Please try again.');
                    setValidationMessage(msg);
                },
            },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationMessage(null);

        // If prerequisites are not met, keep the button clickable but show
        // why the CEO request cannot be sent yet.
        const totalWeightLocal = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
        const totalWeightNormalizedLocal = Math.round(totalWeightLocal * 100) / 100;
        const allConfirmedLocal = confirmed.every(Boolean);
        const invalidKpiIndicesLocal = kpis.reduce<number[]>((acc, kpi, index) => {
            const nameInvalid = !String(kpi.kpi_name ?? '').trim();
            const weightNum = Number(kpi.weight);
            const weightInvalid = Number.isNaN(weightNum) || weightNum < 0 || weightNum > 100;
            if (nameInvalid || weightInvalid) acc.push(index + 1);
            return acc;
        }, []);

        const weightOkLocal = Math.abs(totalWeightNormalizedLocal - 100) < 0.01;
        const confirmedCountLocal = confirmed.filter(Boolean).length;
        const hasInvalidKpisLocal = invalidKpiIndicesLocal.length > 0;

        let blockingMessage: string | null = null;
        if (isReadOnly) {
            blockingMessage = tx('kpi_review_token.already_submitted_block', 'You already submitted this review.');
        } else if (processing || loading) {
            blockingMessage = tx('kpi_review_token.please_wait_processing', 'Please wait... the request is being processed.');
        } else if (kpis.length === 0) {
            blockingMessage = tx('kpi_review_token.add_one_kpi_required', 'Add at least one KPI before requesting a CEO review.');
        } else if (ceos.length === 0) {
            blockingMessage = tx('kpi_review_token.no_ceo_configured', 'No CEO recipient is configured for this company (missing CEO email).');
        } else if (!weightOkLocal) {
            blockingMessage = tx('kpi_review_token.total_weight_must_be_100', 'Total KPI weight must be 100%. Current: {{value}}%.').replace('{{value}}', String(totalWeightNormalizedLocal));
        } else if (!allConfirmedLocal) {
            blockingMessage = tx('kpi_review_token.confirm_all_checks', 'Please confirm all 4 self-assessment checks ({{count}}/4 confirmed).').replace('{{count}}', String(confirmedCountLocal));
        } else if (hasInvalidKpisLocal) {
            blockingMessage = tx('kpi_review_token.fix_invalid_kpi', 'Fix KPI #{{indices}}: KPI name is required and weight must be 0-100.').replace('{{indices}}', invalidKpiIndicesLocal.join(', '));
        }

        if (blockingMessage) {
            setValidationMessage(blockingMessage);
            return;
        }

        // prerequisites are satisfied
        // If only one CEO exists -> send immediately (no popup).
        // If multiple CEOs exist -> open chooser popup.
        if (ceos.length <= 1) {
            const firstId = ceos[0]?.id;
            if (!firstId) {
                setValidationMessage(tx('kpi_review_token.no_ceo_configured', 'No CEO recipient is configured for this company (missing CEO email).'));
                return;
            }
            submitFinalReviewToSelectedCeo([firstId]);
        } else {
            setCeoPickerOpen(true);
        }
    };

    const addKpi = () => {
        const newKpi: OrganizationalKpi = {
            id: 0,
            organization_name: selectedOrganization,
            kpi_name: '',
            is_active: true,
            status: 'draft',
        };
        setKpis([...kpis, newKpi]);
        setData('kpis', [
            ...data.kpis,
            {
                id: 0,
                kpi_name: '',
                purpose: '',
                category: '',
                linked_job_id: null,
                linked_csf: '',
                formula: '',
                measurement_method: '',
                weight: null,
                is_active: true,
            },
        ]);
        setExpandedKpiIndex(kpis.length);
        setEditingKpiIndex(kpis.length);
    };

    const removeKpi = (index: number) => {
        if (!confirm('Are you sure you want to delete this KPI?')) return;
        const updated = kpis.filter((_, i) => i !== index);
        setKpis(updated);
        setData(
            'kpis',
            updated.map((kpi) => ({
                id: kpi.id,
                kpi_name: kpi.kpi_name,
                purpose: kpi.purpose || '',
                category: kpi.category || '',
                linked_job_id: kpi.linked_job_id || null,
                linked_csf: kpi.linked_csf || '',
                formula: kpi.formula || '',
                measurement_method: kpi.measurement_method || '',
                weight: kpi.weight || null,
                is_active: kpi.is_active,
            }))
        );
        if (editingKpiIndex === index) setEditingKpiIndex(null);
        else if (editingKpiIndex !== null && editingKpiIndex > index) setEditingKpiIndex(editingKpiIndex - 1);
        if (expandedKpiIndex === index) setExpandedKpiIndex(Math.max(0, index - 1));
        else if (expandedKpiIndex !== null && expandedKpiIndex > index) setExpandedKpiIndex(expandedKpiIndex - 1);
    };

    const updateKpi = (index: number, field: string, value: unknown) => {
        const updated = [...kpis];
        updated[index] = { ...updated[index], [field]: value };
        setKpis(updated);
        const updatedData = [...data.kpis];
        updatedData[index] = { ...updatedData[index], [field]: value };
        setData('kpis', updatedData);
    };

    const handleSaveKpi = async (index: number) => {
        const kpi = kpis[index];
        if (!kpi.kpi_name?.trim()) {
            alert(tx('kpi_review_token.enter_kpi_name', 'Please enter KPI name'));
            return;
        }
        setSavingKpiIndex(index);
        router.post(`/kpi-review/token/${token}`, {
            final_submit: false,
            organization_name: selectedOrganization,
            kpis: [
                {
                    id: kpi.id || null,
                    kpi_name: kpi.kpi_name,
                    purpose: kpi.purpose || '',
                    category: kpi.category || '',
                    linked_job_id: kpi.linked_job_id || null,
                    linked_csf: kpi.linked_csf || '',
                    formula: kpi.formula || '',
                    measurement_method: kpi.measurement_method || '',
                    weight: kpi.weight || null,
                    is_active: kpi.is_active,
                },
            ],
        }, {
            preserveScroll: true,
            onSuccess: () => {
                fetch(`/kpi-review/token/${token}/organization/${encodeURIComponent(selectedOrganization)}`)
                    .then((res) => res.json())
                    .then((data) => setKpis(data.kpis || []))
                    .catch((err) => console.error('Error reloading:', err));
                setSubmitPopupMessage(tx('kpi_review_token.kpi_draft_saved', 'KPI draft saved successfully.'));
                setSubmitPopupOpen(true);
                setSavingKpiIndex(null);
                setEditingKpiIndex(null);
            },
            onError: (errors) => {
                console.error('Error saving KPI:', errors);
                const firstError = Object.values(errors || {})[0];
                setSubmitPopupMessage(typeof firstError === 'string' ? firstError : tx('kpi_review_token.kpi_save_failed', 'Failed to save KPI. Please try again.'));
                setSubmitPopupOpen(true);
                setSavingKpiIndex(null);
            },
        });
    };

    const openPopup = (idx: number) => {
        if (confirmed[idx]) return;
        setCurrentValIdx(idx);
    };

    const closePopup = () => setCurrentValIdx(null);

    const confirmVal = () => {
        if (currentValIdx === null) return;
        setConfirmed((prev) => {
            const next = [...prev];
            next[currentValIdx] = true;
            return next;
        });
        closePopup();
    };

    const toggleKpiExpand = (index: number) => {
        setExpandedKpiIndex((prev) => (prev === index ? null : index));
    };

    const toggleEdit = (index: number) => {
        if (editingKpiIndex === index) {
            handleSaveKpi(index);
            return;
        }
        setEditingKpiIndex(index);
        setExpandedKpiIndex(index);
    };

    const totalWeight = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
    const totalWeightNormalized = Math.round(totalWeight * 100) / 100; // avoid float issues (e.g. 99.999999)
    const allConfirmed = confirmed.every(Boolean);
    const invalidKpiIndices = kpis.reduce<number[]>((acc, kpi, index) => {
        const nameInvalid = !String(kpi.kpi_name ?? '').trim();
        const weightNum = Number(kpi.weight);
        const weightInvalid = Number.isNaN(weightNum) || weightNum < 0 || weightNum > 100;
        if (nameInvalid || weightInvalid) acc.push(index + 1);
        return acc;
    }, []);
    const hasInvalidKpis = invalidKpiIndices.length > 0;
    const confirmedCount = confirmed.filter(Boolean).length;
    const weightOk = Math.abs(totalWeightNormalized - 100) < 0.01;
    /* Enable submit when: not done, not loading/processing, has KPIs, total weight ~100%, and all 4 self-assessments confirmed. */
    const canSubmit =
        !completed &&
        !processing &&
        !loading &&
        kpis.length > 0 &&
        weightOk &&
        allConfirmed &&
        !hasInvalidKpis;

    return (
        <div className="leader-kpi-review-page">
            <Head
                title={t('page_heads.leader_kpi_review', {
                    organization: selectedOrganization,
                })}
            />

            {submitPopupOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: 'min(92vw, 460px)',
                            background: '#ffffff',
                            borderRadius: 14,
                            border: '1px solid #dbe3ef',
                            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.22)',
                            padding: '18px 20px',
                        }}
                    >
                        <div style={{ fontWeight: 700, color: '#0f2a4a', marginBottom: 8 }}>
                            {tx('kpi_review_token.submission_status', 'Submission Status')}
                        </div>
                        <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{submitPopupMessage}</div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                            <button
                                type="button"
                                onClick={() => setSubmitPopupOpen(false)}
                                style={{
                                    background: '#0f2a4a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '8px 16px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {tx('kpi_review_token.ok', 'OK')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ceoPickerOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setCeoPickerOpen(false)}
                >
                    <div
                        style={{
                            width: 'min(92vw, 520px)',
                            background: '#ffffff',
                            borderRadius: 14,
                            border: '1px solid #dbe3ef',
                            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.22)',
                            padding: '18px 20px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontWeight: 800, color: '#0f2a4a', marginBottom: 6 }}>
                            {tx('kpi_review_token.choose_ceo_recipients', 'Choose CEO recipient(s)')}
                        </div>
                        <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                            {tx('kpi_review_token.choose_ceo_recipients_desc', 'Select which CEO(s) should receive the KPI review request email.')}
                        </div>

                        <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
                            {ceos.length === 0 ? (
                                <div style={{ color: '#b91c1c', fontSize: 13 }}>
                                    {tx('kpi_review_token.no_ceo_recipients', 'No CEO recipients are available (missing email).')}
                                </div>
                            ) : (
                                ceos.map((ceo) => {
                                    const checked = selectedCeoIds.includes(ceo.id);
                                    return (
                                        <label
                                            key={ceo.id}
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                alignItems: 'flex-start',
                                                padding: '10px 0',
                                                borderBottom: '1px solid #e5e7eb',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setSelectedCeoIds((prev) => {
                                                        if (prev.includes(ceo.id)) {
                                                            return prev.filter((id) => id !== ceo.id);
                                                        }
                                                        return [...prev, ceo.id];
                                                    });
                                                }}
                                                style={{ marginTop: 4 }}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, color: '#0f2a4a' }}>
                                                    {ceo.name || ceo.email || `CEO #${ceo.id}`}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, wordBreak: 'break-word' }}>
                                                    {ceo.email}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCeoIds(ceos.map((c) => c.id))}
                                    style={{
                                        background: '#f8fafc',
                                        color: '#0f2a4a',
                                        border: '1px solid #dbe3ef',
                                        borderRadius: 10,
                                        padding: '8px 12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tx('kpi_review_token.select_all', 'Select All')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCeoIds([])}
                                    style={{
                                        background: '#f8fafc',
                                        color: '#0f2a4a',
                                        border: '1px solid #dbe3ef',
                                        borderRadius: 10,
                                        padding: '8px 12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tx('kpi_review_token.select_none', 'Select None')}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCeoPickerOpen(false)}
                                style={{
                                    background: '#fff',
                                    color: '#0f2a4a',
                                    border: '1px solid #dbe3ef',
                                    borderRadius: 10,
                                    padding: '8px 14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                {tx('kpi_review_token.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedCeoIds.length === 0) {
                                        setValidationMessage(tx('kpi_review_token.select_at_least_one_ceo', 'Please select at least one CEO recipient.'));
                                        return;
                                    }
                                    setValidationMessage(null);
                                    submitFinalReviewToSelectedCeo(selectedCeoIds);
                                }}
                                style={{
                                    background: '#0f2a4a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '8px 16px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                {tx('kpi_review_token.send_to_selected_ceos', 'Send to selected CEO(s)')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="lkr-header">
                <div className="lkr-header-left">
                    <div className="lkr-header-logo">HR <span>Path-Finder</span></div>
                    <div className="lkr-header-divider" />
                    <div className="lkr-header-stage">{tx('kpi_review_token.header_stage', 'Performance Management · KPI Design')}</div>
                </div>
            </header>

            <div className="lkr-page">
                {completed && (
                    <div className="lkr-success-banner">
                        <span className="lkr-success-icon">✓</span>
                        <div>
                            <div className="lkr-success-title">{tx('kpi_review_token.review_submitted_title', 'Review Submitted Successfully!')}</div>
                            <div className="lkr-success-desc">{tx('kpi_review_token.review_submitted_desc', 'Your KPI review has been submitted. Thank you for your feedback!')}</div>
                        </div>
                    </div>
                )}

                <div className="lkr-context-banner">
                    <div className="lkr-context-left">
                        <div className="lkr-context-icon">🏢</div>
                        <div>
                            <div className="lkr-context-label">{tx('kpi_review_token.my_organization', 'My Organization')}</div>
                            <div className="lkr-context-value">{selectedOrganization}</div>
                            {allOrganizations.length > 1 && (
                                <div className="lkr-org-select">
                                    <label htmlFor="lkr-org-switcher">{tx('kpi_review_token.switch_organization', 'Switch Organization')}</label>
                                    <select
                                        id="lkr-org-switcher"
                                        value={selectedOrganization}
                                        onChange={(e) => setSelectedOrganization(e.target.value)}
                                    >
                                        {allOrganizations.map((org) => (
                                            <option key={org} value={org}>{org}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lkr-context-meta">
                        <span className="lkr-context-tag cycle">{tx('kpi_review_token.kpi_design_in_progress', 'KPI Design in Progress')}</span>
                    </div>
                </div>

                {hasCeoFinalized && (
                    <div className="lkr-kpi-card" style={{ padding: '36px', textAlign: 'center' }}>
                        <div className="lkr-success-title" style={{ fontSize: 24, marginBottom: 8 }}>
                            {tx('kpi_review_token.ceo_finalized', 'CEO Finalized')}
                        </div>
                        <div className="lkr-success-desc" style={{ marginBottom: 16 }}>
                            {tx('kpi_review_token.ceo_finalized_desc', 'CEO has finalized this KPI review. No further action is required on this link.')}
                        </div>
                        <button type="button" className="lkr-btn-submit" onClick={() => router.reload()}>
                            {tx('kpi_review_token.refresh', 'Refresh')}
                        </button>
                    </div>
                )}

                {showLeaderSubmittedScreen && (
                    <div className="lkr-kpi-card" style={{ padding: '36px', textAlign: 'center' }}>
                        <div className="lkr-success-title" style={{ fontSize: 24, marginBottom: 8 }}>
                            {tx('kpi_review_token.already_submitted_title', 'You have submitted successfully')}
                        </div>
                        <div className="lkr-success-desc" style={{ marginBottom: 16 }}>
                            {tx('kpi_review_token.already_submitted_desc', 'Your review is already submitted. Please refresh this page to see latest CEO status.')}
                        </div>
                        <button type="button" className="lkr-btn-submit" onClick={() => router.reload()}>
                            {tx('kpi_review_token.refresh', 'Refresh')}
                        </button>
                    </div>
                )}

                {!hasCeoFinalized && !showLeaderSubmittedScreen && (
                    <>
                <div className="lkr-guide-banner">
                    <span>💡</span>
                    <span>
                        {hasCeoRevisionRequest
                            ? tx('kpi_review_token.guide_revision', 'CEO requested revision. Please update KPI/comment and resubmit using the same checklist as the first submission.')
                            : tx('kpi_review_token.guide_default', "Review the draft prepared by your manager and edit only what's necessary. All 4 self-assessment criteria must be confirmed before submitting to the CEO.")}
                    </span>
                </div>

                {hasCeoRevisionRequest && (
                    <div className="lkr-revision-panel">
                        <div className="lkr-revision-title">{tx('kpi_review_token.ceo_revision_requested', 'CEO Revision Requested')}</div>
                        <div className="lkr-revision-desc">
                            {tx('kpi_review_token.ceo_revision_desc', 'CEO requested updates. Please revise KPI details and submit again following the same process as the first submission.')}
                        </div>
                        {ceoRevisionComment && (
                            <div className="lkr-revision-comment">
                                <strong>{tx('kpi_review_token.ceo_comment', 'CEO Comment')}:</strong> {ceoRevisionComment}
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="lkr-section-header">
                        <div className="lkr-section-title">{tx('kpi_review_token.loading_kpis', 'Loading KPIs...')}</div>
                    </div>
                ) : (
                    <form id="lkr-review-form" onSubmit={handleSubmit}>
                        <div className="lkr-section-header">
                            <div className="lkr-section-title">
                                {tx('kpi_review_token.team_kpis', 'Team KPIs')}
                                <span className="lkr-count" id="kpiCount">{kpis.length}</span>
                            </div>
                            <button type="button" className="lkr-btn-add" onClick={addKpi} disabled={isReadOnly}>
                                {tx('kpi_review_token.add_kpi', '+ Add KPI')}
                            </button>
                        </div>

                        {kpis.length === 0 ? (
                            <div className="lkr-kpi-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--lkr-text-secondary)' }}>{tx('kpi_review_token.no_kpis', 'No KPIs yet. Add one using the button above.')}</p>
                            </div>
                        ) : (
                            kpis.map((kpi, index) => (
                                <div key={kpi.id ?? `new-${index}`} className="lkr-kpi-card">
                                    <div className="lkr-kpi-card-header">
                                        <div className="lkr-kpi-card-left">
                                            <div
                                                className={`lkr-kpi-number ${expandedKpiIndex === index || editingKpiIndex === index ? 'active' : ''}`}
                                                onClick={() => toggleKpiExpand(index)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div style={{ flex: 1 }} onClick={() => toggleKpiExpand(index)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleKpiExpand(index)}>
                                                <div className="lkr-kpi-name">{kpi.kpi_name || tx('kpi_review_token.untitled_kpi', '(Untitled KPI)')}</div>
                                                <div className="lkr-kpi-badges">
                                                    <span className="lkr-badge lkr-badge-cycle">{kpi.category || '—'}</span>
                                                    <span className="lkr-badge lkr-badge-weight">{tx('kpi_review_token.weight', 'Weight')} {kpi.weight != null ? `${kpi.weight}%` : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lkr-kpi-card-actions">
                                            <button
                                                type="button"
                                                className={`lkr-icon-btn ${editingKpiIndex === index ? 'edit-active' : ''}`}
                                                title={editingKpiIndex === index ? tx('kpi_review_token.save', 'Save') : tx('kpi_review_token.edit', 'Edit')}
                                                onClick={(e) => { e.stopPropagation(); toggleEdit(index); }}
                                                disabled={isReadOnly || savingKpiIndex === index}
                                            >
                                                {editingKpiIndex === index ? (savingKpiIndex === index ? '…' : '✓') : '✏'}
                                            </button>
                                            <button
                                                type="button"
                                                className="lkr-icon-btn danger"
                                                title={tx('kpi_review_token.delete', 'Delete')}
                                                onClick={(e) => { e.stopPropagation(); removeKpi(index); }}
                                                disabled={isReadOnly}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`lkr-kpi-body ${expandedKpiIndex === index || editingKpiIndex === index ? 'open' : ''}`}>
                                        {editingKpiIndex === index ? (
                                            <>
                                                <div className="lkr-field-row">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.kpi_name_required', 'KPI Name *')}</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.kpi_name}
                                                            onChange={(e) => updateKpi(index, 'kpi_name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.weight_percent', 'Weight (%)')}</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.weight ?? ''}
                                                            onChange={(e) => updateKpi(index, 'weight', e.target.value === '' ? null : parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.purpose', 'Purpose')}</div>
                                                        <textarea
                                                            className="lkr-field-input"
                                                            rows={2}
                                                            value={kpi.purpose || ''}
                                                            onChange={(e) => updateKpi(index, 'purpose', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.formula', 'Formula')}</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.formula || ''}
                                                            onChange={(e) => updateKpi(index, 'formula', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.category', 'Category')}</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.category || ''}
                                                            onChange={(e) => updateKpi(index, 'category', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.measurement_method', 'Measurement Method')}</div>
                                                        <textarea
                                                            className="lkr-field-input"
                                                            rows={3}
                                                            value={kpi.measurement_method || ''}
                                                            onChange={(e) => updateKpi(index, 'measurement_method', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="lkr-field-row">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.kpi_name', 'KPI Name')}</div>
                                                        <div className="lkr-field-value">{kpi.kpi_name || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.weight_percent', 'Weight (%)')}</div>
                                                        <div className="lkr-field-value">{kpi.weight != null ? kpi.weight : '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.purpose', 'Purpose')}</div>
                                                        <div className="lkr-field-value">{kpi.purpose || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.formula', 'Formula')}</div>
                                                        <div className="lkr-field-value">{kpi.formula || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.category', 'Category')}</div>
                                                        <div className="lkr-field-value">{kpi.category || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.measurement_method', 'Measurement Method')}</div>
                                                        <div className="lkr-field-value">{kpi.measurement_method || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">{tx('kpi_review_token.revision_history', 'Revision History (HR Draft vs Leader Latest)')}</div>
                                                        <div className="lkr-history-grid">
                                                            <div className="lkr-history-card">
                                                                <div className="lkr-history-head">{tx('kpi_review_token.hr_draft', 'HR Draft')}</div>
                                                                <div><strong>{tx('kpi_review_token.kpi', 'KPI')}:</strong> {kpi.hr_draft?.kpi_name || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.purpose', 'Purpose')}:</strong> {kpi.hr_draft?.purpose || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.formula', 'Formula')}:</strong> {kpi.hr_draft?.formula || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.category', 'Category')}:</strong> {kpi.hr_draft?.category || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.measure', 'Measure')}:</strong> {kpi.hr_draft?.measurement_method || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.weight', 'Weight')}:</strong> {kpi.hr_draft?.weight != null ? `${kpi.hr_draft?.weight}%` : '—'}</div>
                                                            </div>
                                                            <div className="lkr-history-card">
                                                                <div className="lkr-history-head">{tx('kpi_review_token.leader_latest', 'Leader Latest')}</div>
                                                                <div><strong>{tx('kpi_review_token.kpi', 'KPI')}:</strong> {kpi.leader_latest?.kpi_name || kpi.kpi_name || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.purpose', 'Purpose')}:</strong> {kpi.leader_latest?.purpose || kpi.purpose || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.formula', 'Formula')}:</strong> {kpi.leader_latest?.formula || kpi.formula || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.category', 'Category')}:</strong> {kpi.leader_latest?.category || kpi.category || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.measure', 'Measure')}:</strong> {kpi.leader_latest?.measurement_method || kpi.measurement_method || '—'}</div>
                                                                <div><strong>{tx('kpi_review_token.weight', 'Weight')}:</strong> {(kpi.leader_latest?.weight ?? kpi.weight) != null ? `${kpi.leader_latest?.weight ?? kpi.weight}%` : '—'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {kpis.length > 0 && (
                            <div className="lkr-comments-card">
                                <div className="lkr-comments-title">💬 {tx('kpi_review_token.overall_review_comments', 'Overall Review Comments')}</div>
                                <div className="lkr-comments-desc">{tx('kpi_review_token.overall_review_comments_desc', 'Please provide any additional comments or feedback about the KPIs:')}</div>
                                <textarea
                                    className="lkr-comments-textarea"
                                    placeholder={tx('kpi_review_token.comments_placeholder', 'Enter your review comments, feedback, or suggestions here...')}
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    disabled={isReadOnly}
                                />
                                <div className="lkr-comments-hint">{tx('kpi_review_token.comments_hint', 'Your comments will be shared with HR for consideration.')}</div>
                            </div>
                        )}

                        <div className="lkr-validation-section">
                            <div className="lkr-validation-title">{tx('kpi_review_token.self_assessment_title', 'Self-Assessment Before Finalizing KPIs')}</div>
                            <div className="lkr-validation-desc">{tx('kpi_review_token.self_assessment_desc', 'All 4 criteria must be confirmed before you can submit to the CEO. Click each item to review.')}</div>
                            <div className="lkr-validation-grid">
                                {VALIDATIONS.map((v, idx) => (
                                    <div
                                        key={idx}
                                        className={`lkr-val-card ${confirmed[idx] ? 'confirmed' : ''}`}
                                    >
                                        <div className="lkr-val-card-top">
                                            <span className="lkr-val-tag">{tx(`kpi_review_token.validation.${v.key}.title`, v.key)}</span>
                                            <div className="lkr-val-check">✓</div>
                                        </div>
                                        <div className="lkr-val-question">{tx(`kpi_review_token.validation.${v.key}.question`, '')}</div>
                                        <div className="lkr-val-hint">{tx(`kpi_review_token.validation.${v.key}.hint`, '')}</div>
                                        <button type="button" className="lkr-val-yes-btn" onClick={() => openPopup(idx)}>
                                            {confirmed[idx] ? tx('kpi_review_token.selected', 'Selected') : tx('kpi_review_token.select_arrow', 'Select →')}
                                        </button>
                                        <div className="lkr-val-confirmed-label">✓ {tx('kpi_review_token.confirmed', 'Confirmed')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {validationMessage && (
                            <div className="lkr-comments-card" style={{ borderColor: '#fecaca', background: '#fff1f2' }}>
                                <div className="lkr-comments-title" style={{ color: '#991b1b' }}>{tx('kpi_review_token.validation_required', 'Validation Required')}</div>
                                <div className="lkr-comments-desc" style={{ color: '#b91c1c' }}>{validationMessage}</div>
                            </div>
                        )}
                    </form>
                )}

                <div className="lkr-bottom-bar">
                    <div className="lkr-submit-summary">
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">{tx('kpi_review_token.kpis', 'KPIs')}</span>
                            <span className="lkr-s-value">{kpis.length}</span>
                        </div>
                        <div className="lkr-summary-divider" />
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">{tx('kpi_review_token.total_weight', 'Total Weight')}</span>
                            <span className={`lkr-s-value ${weightOk ? 'ok' : ''}`}>{totalWeightNormalized}%</span>
                        </div>
                        <div className="lkr-summary-divider" />
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">{tx('kpi_review_token.self_assessment', 'Self-Assessment')}</span>
                            <div className="lkr-val-dots" style={{ marginTop: 2 }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className={`lkr-val-dot ${confirmed[i] ? 'done' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lkr-submit-right">
                            {hasInvalidKpis ? (
                                <span className="lkr-submit-hint" style={{ color: '#dc2626' }}>
                                    {tx('kpi_review_token.fix_invalid_kpi', 'Fix KPI #{{indices}}: KPI name is required and weight must be 0-100.').replace('{{indices}}', invalidKpiIndices.join(', '))}
                                </span>
                            ) : !allConfirmed ? (
                                <span className="lkr-submit-hint">
                                    {tx('kpi_review_token.confirm_all_checks', 'Confirm all 4 checks first ({{count}}/4 confirmed).').replace('{{count}}', String(confirmedCount))}
                                </span>
                            ) : !weightOk ? (
                                <span className="lkr-submit-hint">
                                    {tx('kpi_review_token.total_weight_must_be_100', 'Total weight must be 100%. Current: {{value}}%.').replace('{{value}}', String(totalWeightNormalized))}
                                </span>
                            ) : (
                                <span className="lkr-submit-hint hidden">{tx('kpi_review_token.ready', 'Ready')}</span>
                            )}
                        <button
                            type="submit"
                            form="lkr-review-form"
                            className="lkr-btn-submit"
                        >
                            {tx('kpi_review_token.request_ceo_review', 'Request CEO Review →')}
                        </button>
                    </div>
                </div>
                    </>
                )}
            </div>

            <div
                className={`lkr-popup-overlay ${currentValIdx !== null ? 'open' : ''}`}
                onClick={(e) => e.target === e.currentTarget && closePopup()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lkr-popup-title"
            >
                <div className="lkr-popup" onClick={(e) => e.stopPropagation()}>
                    {currentValIdx !== null && (
                        <>
                            <div className="lkr-popup-icon">{VALIDATIONS[currentValIdx].icon}</div>
                            <div className="lkr-popup-title" id="lkr-popup-title">
                                {tx(`kpi_review_token.validation.${VALIDATIONS[currentValIdx].key}.title`, '')}
                            </div>
                            <div className="lkr-popup-question">
                                {tx(`kpi_review_token.validation.${VALIDATIONS[currentValIdx].key}.question`, '')}
                            </div>
                            <div className="lkr-popup-hint">
                                {tx(`kpi_review_token.validation.${VALIDATIONS[currentValIdx].key}.hint`, '')}
                            </div>
                            <div className="lkr-popup-actions">
                                <button type="button" className="lkr-btn-cancel" onClick={closePopup}>
                                    {tx('kpi_review_token.no', 'No')}
                                </button>
                                <button type="button" className="lkr-btn-confirm" onClick={confirmVal}>
                                    {tx('kpi_review_token.yes_confirmed', 'Yes, Confirmed')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
