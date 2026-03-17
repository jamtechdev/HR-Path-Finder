import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';

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
    reviewerName?: string;
    reviewerEmail?: string;
    isCompleted?: boolean;
}

const VALIDATIONS = [
    { icon: '🎯', title: 'Outcome Influence', question: "Do these KPIs directly influence the team's core outcomes?", hint: 'Verify they are tied to real results (revenue, quality, speed) — not just activity metrics like meeting attendance.' },
    { icon: '📋', title: 'Job Relevance', question: 'Do these KPIs align with the responsibilities of this team?', hint: "Check that no item overlaps with another team's scope or falls outside what this team can realistically control." },
    { icon: '📐', title: 'Measurability', question: 'Can all KPIs be measured with objective criteria or numbers?', hint: 'Ensure each KPI has a clearly defined formula, a designated measurement owner, and a set frequency.' },
    { icon: '🗄', title: 'Data Availability', question: 'Is the data needed for measurement actually accessible?', hint: 'Confirm that data sources (systems, reports, etc.) exist and can be accessed on a regular basis.' },
];

export default function KpiReviewToken({
    token,
    project,
    organizationName: defaultOrganizationName,
    allOrganizations = [],
    kpis: initialKpis = [],
    reviewerName,
    reviewerEmail,
    isCompleted = false,
}: Props) {
    const { props } = usePage();
    const propsKpis = (props as any)?.kpis;
    const [selectedOrganization, setSelectedOrganization] = useState<string>(defaultOrganizationName);
    const [kpis, setKpis] = useState<OrganizationalKpi[]>(() => {
        if (propsKpis && Array.isArray(propsKpis) && propsKpis.length > 0) return propsKpis;
        if (initialKpis && Array.isArray(initialKpis) && initialKpis.length > 0) return initialKpis;
        return [];
    });
    const [loading, setLoading] = useState(false);
    const [reviewComments, setReviewComments] = useState<string>('');
    const [completed, setCompleted] = useState<boolean>(isCompleted);
    const [savingKpiIndex, setSavingKpiIndex] = useState<number | null>(null);
    const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false, false]);
    const [currentValIdx, setCurrentValIdx] = useState<number | null>(null);
    const [expandedKpiIndex, setExpandedKpiIndex] = useState<number | null>(0);
    const [editingKpiIndex, setEditingKpiIndex] = useState<number | null>(null);

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
        const flash = (props as any)?.flash;
        if (flash?.success) setCompleted(true);
        if (isCompleted) setCompleted(true);
    }, [props, isCompleted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/kpi-review/token/${token}`, {
            preserveScroll: false,
            onSuccess: () => {
                router.reload({
                    only: ['kpis'],
                    onSuccess: () => {
                        alert('Your KPI review has been submitted. HR will review your changes.');
                    },
                });
            },
            onError: (errors) => {
                console.error('Submit error:', errors);
                alert('Failed to submit review. Please try again.');
            },
        });
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
            alert('Please enter KPI name');
            return;
        }
        setSavingKpiIndex(index);
        router.post(`/kpi-review/token/${token}`, {
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
                alert('KPI saved successfully!');
                setSavingKpiIndex(null);
                setEditingKpiIndex(null);
            },
            onError: (errors) => {
                console.error('Error saving KPI:', errors);
                alert('Failed to save KPI. Please try again.');
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
    const allConfirmed = confirmed.every(Boolean);
    /* Enable submit when: not done, not loading/processing, has KPIs, total weight 100%, and all 4 self-assessments confirmed. */
    const canSubmit = !completed && !processing && !loading && kpis.length > 0 && totalWeight === 100 && allConfirmed;

    return (
        <div className="leader-kpi-review-page">
            <Head title={`Leader KPI Review - ${selectedOrganization}`} />

            <header className="lkr-header">
                <div className="lkr-header-left">
                    <div className="lkr-header-logo">HR <span>Path-Finder</span></div>
                    <div className="lkr-header-divider" />
                    <div className="lkr-header-stage">Performance Management · KPI Design</div>
                </div>
            </header>

            <div className="lkr-page">
                {completed && (
                    <div className="lkr-success-banner">
                        <span className="lkr-success-icon">✓</span>
                        <div>
                            <div className="lkr-success-title">Review Submitted Successfully!</div>
                            <div className="lkr-success-desc">Your KPI review has been submitted. Thank you for your feedback!</div>
                        </div>
                    </div>
                )}

                <div className="lkr-context-banner">
                    <div className="lkr-context-left">
                        <div className="lkr-context-icon">🏢</div>
                        <div>
                            <div className="lkr-context-label">My Organization</div>
                            <div className="lkr-context-value">{selectedOrganization}</div>
                            {allOrganizations.length > 1 && (
                                <div className="lkr-org-select">
                                    <label htmlFor="lkr-org-switcher">Switch Organization</label>
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
                        <span className="lkr-context-tag cycle">KPI Design in Progress</span>
                    </div>
                </div>

                <div className="lkr-guide-banner">
                    <span>💡</span>
                    <span>Review the draft prepared by your manager and edit only what&apos;s necessary. All 4 self-assessment criteria must be confirmed before submitting to the CEO.</span>
                </div>

                {loading ? (
                    <div className="lkr-section-header">
                        <div className="lkr-section-title">Loading KPIs...</div>
                    </div>
                ) : (
                    <form id="lkr-review-form" onSubmit={handleSubmit}>
                        <div className="lkr-section-header">
                            <div className="lkr-section-title">
                                Team KPIs
                                <span className="lkr-count" id="kpiCount">{kpis.length}</span>
                            </div>
                            <button type="button" className="lkr-btn-add" onClick={addKpi} disabled={completed}>
                                + Add KPI
                            </button>
                        </div>

                        {kpis.length === 0 ? (
                            <div className="lkr-kpi-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--lkr-text-secondary)' }}>No KPIs yet. Add one using the button above.</p>
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
                                                <div className="lkr-kpi-name">{kpi.kpi_name || '(Untitled KPI)'}</div>
                                                <div className="lkr-kpi-badges">
                                                    <span className="lkr-badge lkr-badge-cycle">{kpi.category || '—'}</span>
                                                    <span className="lkr-badge lkr-badge-weight">Weight {kpi.weight != null ? `${kpi.weight}%` : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lkr-kpi-card-actions">
                                            <button
                                                type="button"
                                                className={`lkr-icon-btn ${editingKpiIndex === index ? 'edit-active' : ''}`}
                                                title={editingKpiIndex === index ? 'Save' : 'Edit'}
                                                onClick={(e) => { e.stopPropagation(); toggleEdit(index); }}
                                                disabled={completed || savingKpiIndex === index}
                                            >
                                                {editingKpiIndex === index ? (savingKpiIndex === index ? '…' : '✓') : '✏'}
                                            </button>
                                            <button
                                                type="button"
                                                className="lkr-icon-btn danger"
                                                title="Delete"
                                                onClick={(e) => { e.stopPropagation(); removeKpi(index); }}
                                                disabled={completed}
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
                                                        <div className="lkr-field-label">KPI Name *</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.kpi_name}
                                                            onChange={(e) => updateKpi(index, 'kpi_name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">Weight (%)</div>
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
                                                        <div className="lkr-field-label">Purpose</div>
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
                                                        <div className="lkr-field-label">Formula</div>
                                                        <input
                                                            type="text"
                                                            className="lkr-field-input"
                                                            value={kpi.formula || ''}
                                                            onChange={(e) => updateKpi(index, 'formula', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">Category</div>
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
                                                        <div className="lkr-field-label">Measurement Method</div>
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
                                                        <div className="lkr-field-label">KPI Name</div>
                                                        <div className="lkr-field-value">{kpi.kpi_name || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">Weight (%)</div>
                                                        <div className="lkr-field-value">{kpi.weight != null ? kpi.weight : '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">Purpose</div>
                                                        <div className="lkr-field-value">{kpi.purpose || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row">
                                                    <div>
                                                        <div className="lkr-field-label">Formula</div>
                                                        <div className="lkr-field-value">{kpi.formula || '—'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="lkr-field-label">Category</div>
                                                        <div className="lkr-field-value">{kpi.category || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className="lkr-field-row full">
                                                    <div>
                                                        <div className="lkr-field-label">Measurement Method</div>
                                                        <div className="lkr-field-value">{kpi.measurement_method || '—'}</div>
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
                                <div className="lkr-comments-title">💬 Overall Review Comments</div>
                                <div className="lkr-comments-desc">Please provide any additional comments or feedback about the KPIs:</div>
                                <textarea
                                    className="lkr-comments-textarea"
                                    placeholder="Enter your review comments, feedback, or suggestions here..."
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    disabled={completed}
                                />
                                <div className="lkr-comments-hint">Your comments will be shared with HR for consideration.</div>
                            </div>
                        )}

                        <div className="lkr-validation-section">
                            <div className="lkr-validation-title">Self-Assessment Before Finalizing KPIs</div>
                            <div className="lkr-validation-desc">All 4 criteria must be confirmed before you can submit to the CEO. Click each item to review.</div>
                            <div className="lkr-validation-grid">
                                {VALIDATIONS.map((v, idx) => (
                                    <div
                                        key={idx}
                                        className={`lkr-val-card ${confirmed[idx] ? 'confirmed' : ''}`}
                                        onClick={() => openPopup(idx)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && openPopup(idx)}
                                    >
                                        <div className="lkr-val-card-top">
                                            <span className="lkr-val-tag">{v.title.replace(/\s+/g, ' ')}</span>
                                            <div className="lkr-val-check">✓</div>
                                        </div>
                                        <div className="lkr-val-question">{v.question}</div>
                                        <div className="lkr-val-hint">{v.hint}</div>
                                        <button type="button" className="lkr-val-yes-btn" onClick={(e) => { e.stopPropagation(); confirmVal(); }}>Confirm →</button>
                                        <div className="lkr-val-confirmed-label">✓ Confirmed</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                )}

                <div className="lkr-bottom-bar">
                    <div className="lkr-submit-summary">
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">KPIs</span>
                            <span className="lkr-s-value">{kpis.length}</span>
                        </div>
                        <div className="lkr-summary-divider" />
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">Total Weight</span>
                            <span className={`lkr-s-value ${totalWeight === 100 ? 'ok' : ''}`}>{totalWeight}%</span>
                        </div>
                        <div className="lkr-summary-divider" />
                        <div className="lkr-summary-chip">
                            <span className="lkr-s-label">Self-Assessment</span>
                            <div className="lkr-val-dots" style={{ marginTop: 2 }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className={`lkr-val-dot ${confirmed[i] ? 'done' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lkr-submit-right">
                        <span className={`lkr-submit-hint ${allConfirmed && totalWeight === 100 ? 'hidden' : ''}`}>
                            {!allConfirmed
                                ? `Complete self-assessment (${confirmed.filter(Boolean).length}/4) and set total weight to 100% to enable submit`
                                : 'Set total weight to 100% to enable submit'}
                        </span>
                        <button
                            type="submit"
                            form="lkr-review-form"
                            className="lkr-btn-submit"
                            disabled={!canSubmit}
                        >
                            Request CEO Review →
                        </button>
                    </div>
                </div>
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
                            <div className="lkr-popup-title" id="lkr-popup-title">{VALIDATIONS[currentValIdx].title}</div>
                            <div className="lkr-popup-question">{VALIDATIONS[currentValIdx].question}</div>
                            <div className="lkr-popup-hint">{VALIDATIONS[currentValIdx].hint}</div>
                            <div className="lkr-popup-actions">
                                <button type="button" className="lkr-btn-cancel" onClick={closePopup}>
                                    No
                                </button>
                                <button type="button" className="lkr-btn-confirm" onClick={confirmVal}>
                                    Yes, Confirmed
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
