import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';

interface OrganizationalKpi {
    id: number;
    organization_name: string;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    status: string;
    ceo_approval_status?: string;
    ceo_revision_comment?: string;
    revision_comment?: string;
    updated_at?: string;
    linked_job?: {
        id: number;
        job_name: string;
    };
    hr_draft?: Partial<OrganizationalKpi> | null;
    leader_latest?: Partial<OrganizationalKpi> | null;
}

interface OrgChartMapping {
    org_unit_name: string;
    org_head_name?: string;
    org_head_email?: string;
}

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        };
    };
    kpis: OrganizationalKpi[];
    orgChartMappings?: OrgChartMapping[];
    isAdmin?: boolean;
}

export default function CeoKpiReview({ project, kpis = [], orgChartMappings = [], isAdmin = false }: Props) {
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const { props } = usePage();
    const pageErrors = ((props as any)?.errors ?? {}) as Record<string, string>;
    const [revisionRequests, setRevisionRequests] = useState<Record<string, string>>({});
    const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const kpisByOrganization = kpis.reduce((acc, kpi) => {
        const orgName = kpi.organization_name || '';
        if (!acc[orgName]) acc[orgName] = [];
        acc[orgName].push(kpi);
        return acc;
    }, {} as Record<string, OrganizationalKpi[]>);

    const organizations = Object.keys(kpisByOrganization).sort();

    const totalKpis = kpis.length;
    const approvedCount = kpis.filter((k) => k.ceo_approval_status === 'approved' || k.status === 'approved').length;
    const pendingCount = totalKpis - approvedCount;
    const orgTotals = organizations.map((orgName) => {
        const orgRows = kpisByOrganization[orgName] || [];
        return orgRows.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);
    });
    const WEIGHT_EPS = 0.01;
    const isOrgWeightBalanced = (w: number) => Math.abs(w - 100) <= WEIGHT_EPS;
    const everyOrgBalanced = organizations.length === 0 || orgTotals.every(isOrgWeightBalanced);
    const minOrgWeight = orgTotals.length > 0 ? Math.min(...orgTotals) : 0;
    const maxOrgWeight = orgTotals.length > 0 ? Math.max(...orgTotals) : 0;
    const teamCount = organizations.length;
    const allApproved = totalKpis > 0 && approvedCount === totalKpis;

    // Keep `processing` for button disabled states.
    // We send explicit payloads with `router.post(...)` (no `setData` timing dependency).
    const { processing } = useForm({
        action: 'approve',
        revision_requests: [] as Array<{ organization_name: string; comment: string }>,
    });

    useEffect(() => {
        const flash = (props as any)?.flash;
        if (flash?.ceo_modal_success) {
            setSuccessModalMessage(String(flash.ceo_modal_success));
            setSuccessModalOpen(true);
        }
    }, [props]);

    useEffect(() => {
        // Preload previously submitted CEO revision comments as selected values.
        // Depend on raw KPI rows to avoid object-identity render loops.
        const next: Record<string, string> = {};
        Object.entries(kpisByOrganization).forEach(([orgName, orgKpis]) => {
            const saved =
                orgKpis.find((k) => (k.ceo_revision_comment ?? '').trim())?.ceo_revision_comment ||
                orgKpis.find((k) => (k.revision_comment ?? '').trim())?.revision_comment ||
                '';
            if (saved.trim()) next[orgName] = saved;
        });
        if (Object.keys(next).length === 0) return;
        setRevisionRequests((prev) => {
            const merged = { ...next, ...prev };
            const prevSig = JSON.stringify(prev);
            const nextSig = JSON.stringify(merged);
            return prevSig === nextSig ? prev : merged;
        });
    }, [kpis]);

    const handleApprove = () => {
        const route = isAdmin ? `/admin/kpi-review/${project.id}` : `/ceo/kpi-review/${project.id}`;
        // Use router.post with an explicit payload to avoid any `setData` timing race.
        router.post(
            route,
            { action: 'approve', revision_requests: [] },
            {
                preserveScroll: true,
            },
        );
    };

    const handleRequestRevision = () => {
        const requests = Object.entries(revisionRequests)
            .filter(([_, comment]) => comment.trim())
            .map(([org, comment]) => ({ organization_name: org, comment: comment.trim() }));
        if (requests.length === 0) {
            alert(tx('ceo_kpi.review.revision_alert', 'Please add at least one revision comment.'));
            return;
        }
        const route = isAdmin ? `/admin/kpi-review/${project.id}` : `/ceo/kpi-review/${project.id}`;
        // Use router.post with an explicit payload to avoid any `setData` timing race.
        router.post(
            route,
            { action: 'request_revision', revision_requests: requests },
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string, ceoStatus?: string) => {
        const s = ceoStatus || status;
        if (s === 'approved') return <span className="ckr-badge ckr-badge-done">{tx('ceo_kpi.status_approved', 'Approved')}</span>;
        if (s === 'revision_requested') return <span className="ckr-badge ckr-badge-revision">{tx('ceo_kpi.status_revision_requested', 'Revision requested')}</span>;
        return <span className="ckr-badge ckr-badge-pending">{tx('ceo_kpi.status_pending', 'Pending')}</span>;
    };

    const getOrgStepStatus = (orgKpis: OrganizationalKpi[]) => {
        const hasApproved = orgKpis.some((k) => k.ceo_approval_status === 'approved' || k.status === 'approved');
        const hasRevision = orgKpis.some((k) => k.ceo_approval_status === 'revision_requested');
        if (hasApproved) return { draftSent: true, underReview: true, ceoRequested: true };
        if (hasRevision) return { draftSent: true, underReview: true, ceoRequested: false };
        return { draftSent: true, underReview: false, ceoRequested: false };
    };

    const backHref = isAdmin ? '/admin/dashboard' : '/ceo/dashboard';
    const weightBarWidthPct = everyOrgBalanced ? 100 : Math.min(100, minOrgWeight);
    const weightBarOverCap = maxOrgWeight > 100 + WEIGHT_EPS;
    const statusAlertType: 'ok' | 'warn' | 'idle' = everyOrgBalanced ? 'ok' : orgTotals.some((w) => w > 0) ? 'warn' : 'idle';
    const topProgressPct =
        totalKpis > 0 && approvedCount === totalKpis && everyOrgBalanced
            ? 100
            : totalKpis > 0
              ? (approvedCount / totalKpis) * 100
              : 0;

    return (
        <AppLayout>
            <Head
                title={t('page_heads.ceo_kpi_review', {
                    company:
                        project?.company?.name ||
                        t('page_head_fallbacks.company'),
                })}
            />
            {successModalOpen && (
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
                            {tx('ceo_kpi.review.submission_modal_title', 'Submission status')}
                        </div>
                        <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{successModalMessage}</div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                            <button
                                type="button"
                                onClick={() => setSuccessModalOpen(false)}
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
                                {tx('ceo_kpi.review.submission_modal_ok', 'OK')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="ceo-kpi-review-page w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {pageErrors.error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {pageErrors.error}
                </div>
            )}
            {isAdmin && (
                <div className="mb-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <strong className="text-foreground">{tx('ceo_kpi.review.admin_usage_title', 'When to use this page')}</strong>
                    {': '}
                    {tx(
                        'ceo_kpi.review.admin_usage_body',
                        'Review submitted company KPIs, request revision per organization, or finalize approved KPIs. For default KPI catalogs before project data exists, use KPI Templates.',
                    )}{' '}
                    <Link href="/admin/kpi-templates" className="underline">
                        {tx('ceo_kpi.review.admin_templates_link', 'KPI Templates')}
                    </Link>
                </div>
            )}

            {/* Top bar: same as Job Grades reference (white, 56px, back + title + badge + counter) */}
            <div className="ckr-top-bar">
                <Link href={backHref} className="ckr-back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <span className="ckr-step-title">{tx('ceo_kpi.review.step_title', 'CEO KPI Review')}</span>
                <span className="ckr-step-badge">{tx('ceo_kpi.review.step_badge', 'In Progress')}</span>
                <span className="ckr-step-counter">{tx('ceo_kpi.review.step_counter', '1 of 1')}</span>
            </div>

            {/* Progress bar: 3px mint fill */}
            <div className="ckr-progress-wrap">
                <div className="ckr-progress-track">
                    <div className="ckr-progress-fill" style={{ width: `${Math.min(100, topProgressPct)}%` }} />
                </div>
            </div>

            <div className="ckr-page">
                {/* Section label: same as reference */}
                <div className="ckr-section-label-wrap">
                    <span className="ckr-section-label">{tx('ceo_kpi.review.section_label', 'Company KPI Review')}</span>
                    <span className="ckr-section-line" />
                </div>

                {/* Single full hero card (same structure as Job Grades) */}
                <div className="ckr-hero-card">
                    {/* Hero strip: navy gradient, icon, title, subtitle, pills */}
                    <div className="ckr-hero-strip">
                        <div className="ckr-hero-strip-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 9h6M9 12h6M9 15h4" />
                            </svg>
                        </div>
                        <div className="ckr-hero-strip-text">
                            <h2>{tx('ceo_kpi.review.hero_title', 'Company-wide KPI Review')}</h2>
                            <p>{tx('ceo_kpi.review.hero_subtitle', 'Review submitted KPIs across all teams. Approve or request revisions per organization.')}</p>
                        </div>
                        <div className="ckr-strip-pills">
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{teamCount}</div>
                                <div className="ckr-pill-lbl">{tx('ceo_kpi.review.team_count', 'Teams')}</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{totalKpis}</div>
                                <div className="ckr-pill-lbl">{tx('ceo_kpi.review.total_kpi_count', 'Total KPIs')}</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{approvedCount}</div>
                                <div className="ckr-pill-lbl">{tx('ceo_kpi.review.approved_count', 'Approved')}</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{pendingCount}</div>
                                <div className="ckr-pill-lbl">{tx('ceo_kpi.review.pending_count', 'Pending')}</div>
                            </div>
                            <div className="ckr-strip-divider" />
                            <div className="ckr-strip-pill-ratio">
                                <div className="ckr-pill-val">
                                    {everyOrgBalanced ? '100%' : orgTotals.length > 0 ? `${maxOrgWeight.toFixed(1)}%` : '—'}
                                </div>
                                <div className="ckr-pill-lbl">{tx('ceo_kpi.review.weight_sum', 'Weight Sum')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar: hint only */}
                    <div className="ckr-toolbar">
                        <span className="ckr-toolbar-hint">
                            {tx('ceo_kpi.review.toolbar_hint', 'Review each team KPI · add comments when requesting revision · finalize when all are approved')}
                        </span>
                    </div>

                    {/* Table header: Team Progress */}
                    <div className="ckr-table-head">
                        <div />
                        <div className="ckr-th">{tx('ceo_kpi.review.organization', 'Organization')}</div>
                        <div className="ckr-th">{tx('ceo_kpi.review.leader', 'Leader')}</div>
                        <div className="ckr-th">{tx('ceo_kpi.review.kpi_count', 'KPI Count')}</div>
                        <div className="ckr-th">{tx('ceo_kpi.review.status', 'Status')}</div>
                        <div />
                    </div>

                    {/* Org list: expandable rows inside card */}
                    <div className="ckr-org-list">
                        {organizations.length === 0 ? (
                            <div className="ckr-org-empty-row">
                                <div className="ckr-org-empty">{tx('ceo_kpi.review.no_kpis', 'No KPIs submitted yet. Leaders must complete their review first.')}</div>
                            </div>
                        ) : (
                            organizations.map((orgName) => {
                                const orgKpis = kpisByOrganization[orgName] || [];
                                const leader = orgChartMappings?.find((m) => (m.org_unit_name || '').trim() === (orgName || '').trim());
                                const step = getOrgStepStatus(orgKpis);
                                const isExpanded = expandedOrg === orgName;
                                const revComment =
                                    orgKpis.find((k) => (k.ceo_revision_comment ?? '').trim())?.ceo_revision_comment ||
                                    orgKpis.find((k) => (k.revision_comment ?? '').trim())?.revision_comment ||
                                    '';
                                const orgWeight = orgKpis.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
                                const orgWeightNormalized = Math.round(orgWeight * 100) / 100;
                                const lastUpdated = orgKpis
                                    .map((item) => item.updated_at)
                                    .filter(Boolean)
                                    .sort()
                                    .at(-1);

                                return (
                                    <div key={orgName} className="ckr-org-card">
                                        <div className="ckr-org-row" onClick={() => setExpandedOrg(isExpanded ? null : orgName)}>
                                            <div className="ckr-org-chevron-cell">{isExpanded ? '▲' : '▼'}</div>
                                            <div className="ckr-org-info">
                                                <div className="ckr-org-name">{orgName}</div>
                                            </div>
                                            <div className="ckr-org-leader">{leader?.org_head_name || '—'}</div>
                                            <div className="ckr-org-kpi-count">{orgKpis.length}</div>
                                            <div className="ckr-org-status-cell">
                                                {getStatusBadge(orgKpis[0]?.status || '', orgKpis[0]?.ceo_approval_status)}
                                            </div>
                                            <div />
                                        </div>

                                        <div className={`ckr-org-body ${isExpanded ? 'open' : ''}`}>
                                            <div className="ckr-step-progress">
                                                <div className={`ckr-step-item ${step.draftSent ? 'done' : ''}`}>
                                                    <div className="ckr-step-dot">{step.draftSent ? '✓' : '1'}</div>
                                                    <div className="ckr-step-label">{tx('ceo_kpi.review.step_draft_sent', 'Draft Sent')}</div>
                                                </div>
                                                <div className={`ckr-step-item ${step.underReview ? 'done' : 'active'}`}>
                                                    <div className="ckr-step-dot">{step.underReview ? '✓' : '2'}</div>
                                                    <div className="ckr-step-label">{tx('ceo_kpi.review.step_under_review', 'Under Review')}</div>
                                                </div>
                                                <div className={`ckr-step-item ${step.ceoRequested ? 'done' : ''}`}>
                                                    <div className="ckr-step-dot">{step.ceoRequested ? '✓' : '3'}</div>
                                                    <div className="ckr-step-label">{tx('ceo_kpi.review.step_ceo_requested', 'CEO Review Requested')}</div>
                                                </div>
                                            </div>
                                            {revComment && (
                                                <div className="ckr-revision-box">
                                                    <strong>{tx('ceo_kpi.review.revision_comment', 'Revision comment')}:</strong> {revComment}
                                                </div>
                                            )}

                                            <div className="ckr-leader-detail-grid">
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">{tx('ceo_kpi.review.leader', 'Leader')}</div>
                                                    <div className="ckr-leader-detail-value">{leader?.org_head_name || 'N/A'}</div>
                                                    <div className="ckr-leader-detail-sub">{leader?.org_head_email || tx('ceo_kpi.review.no_email', 'No email configured')}</div>
                                                </div>
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">{tx('ceo_kpi.review.leader_review_status', 'Leader Review Status')}</div>
                                                    <div className="ckr-leader-detail-value">
                                                        {orgKpis.some((k) => (k.status ?? '').toLowerCase() === 'proposed')
                                                            ? tx('ceo_kpi.review.submitted_to_ceo', 'Submitted to CEO')
                                                            : tx('ceo_kpi.review.draft_in_progress', 'Draft in progress')}
                                                    </div>
                                                    <div className="ckr-leader-detail-sub">
                                                        {lastUpdated ? `${tx('ceo_kpi.review.last_update', 'Last update')}: ${new Date(lastUpdated).toLocaleString()}` : tx('ceo_kpi.review.no_update_timestamp', 'No update timestamp')}
                                                    </div>
                                                </div>
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">{tx('ceo_kpi.review.total_team_weight', 'Total Team Weight')}</div>
                                                    <div className="ckr-leader-detail-value">{orgWeightNormalized.toFixed(1)}%</div>
                                                    <div className="ckr-leader-detail-sub">
                                                        {isOrgWeightBalanced(orgWeightNormalized)
                                                            ? tx('ceo_kpi.review.weight_balanced', 'Balanced (100%)')
                                                            : tx('ceo_kpi.review.weight_needs_adjustment', 'Needs adjustment to 100%')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ckr-kpi-table-wrap">
                                                <table className="ckr-kpi-table">
                                                    <thead>
                                                        <tr>
                                                            <th>{tx('ceo_kpi.review.kpi_table_no', 'No.')}</th>
                                                            <th>{tx('ceo_kpi.review.kpi_table_name', 'Name')}</th>
                                                            <th>{tx('ceo_kpi.review.kpi_table_category', 'Category')}</th>
                                                            <th>{tx('ceo_kpi.review.kpi_table_weight', 'Weight')}</th>
                                                            <th>{tx('ceo_kpi.review.kpi_table_details', 'Details')}</th>
                                                            <th>{tx('ceo_kpi.review.kpi_table_status', 'Status')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orgKpis.map((kpi, idx) => (
                                                            (() => {
                                                                const jobLabel =
                                                                    kpi.linked_job?.job_name ||
                                                                    (kpi.linked_job_id ? `Job #${kpi.linked_job_id}` : (kpi.leader_latest?.linked_job_id ? `Job #${kpi.leader_latest.linked_job_id}` : (kpi.hr_draft?.linked_job_id ? `Job #${kpi.hr_draft.linked_job_id}` : '')));
                                                                return (
                                                            <tr key={kpi.id}>
                                                                <td>{idx + 1}</td>
                                                                <td className="ckr-td-name">{kpi.kpi_name}</td>
                                                                <td>{kpi.category || '—'}</td>
                                                                <td>{kpi.weight != null ? `${kpi.weight}%` : '—'}</td>
                                                                <td className="ckr-kpi-detail-cell">
                                                                    <div><strong>{tx('ceo_kpi.review.hr_draft', 'HR Draft')}:</strong> {kpi.hr_draft?.kpi_name || kpi.kpi_name || '—'}</div>
                                                                    <div><strong>{tx('ceo_kpi.review.leader_update', 'Leader Update')}:</strong> {kpi.leader_latest?.kpi_name || kpi.kpi_name || '—'}</div>
                                                                    <div><strong>{tx('ceo_kpi.review.purpose', 'Purpose')}:</strong> {kpi.purpose || '—'}</div>
                                                                    <div><strong>{tx('ceo_kpi.review.formula', 'Formula')}:</strong> {kpi.formula || '—'}</div>
                                                                    <div><strong>{tx('ceo_kpi.review.measure', 'Measure')}:</strong> {kpi.measurement_method || '—'}</div>
                                                                    {jobLabel && (
                                                                        <div><strong>{tx('ceo_kpi.review.job', 'Job')}:</strong> {jobLabel}</div>
                                                                    )}
                                                                </td>
                                                                <td>{getStatusBadge(kpi.status, kpi.ceo_approval_status)}</td>
                                                            </tr>
                                                                );
                                                            })()
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="ckr-revision-input-wrap">
                                                <label className="ckr-field-label">
                                                    {tx('ceo_kpi.review.revision_comment_optional', 'Revision comment (if needed)')}
                                                    {revisionRequests[orgName]?.trim() && (
                                                        <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 700 }}>
                                                            {tx('ceo_kpi.review.selected_label', 'Selected')}
                                                        </span>
                                                    )}
                                                </label>
                                                <textarea
                                                    className="ckr-field-input"
                                                    rows={2}
                                                    placeholder={tx('ceo_kpi.review.revision_comment_placeholder', 'Enter revision comments for this organization...')}
                                                    value={revisionRequests[orgName] || ''}
                                                    onChange={(e) => setRevisionRequests({ ...revisionRequests, [orgName]: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer inside card: Total weight bar + status alert (same as Job Grades) */}
                    <div className="ckr-card-footer">
                        <div className="ckr-hc-summary">
                            <span className="ckr-hc-summary-label">{tx('ceo_kpi.review.total_weight', 'Total weight')}</span>
                            <div className="ckr-hc-bar-outer">
                                <div
                                    className="ckr-hc-bar-fill"
                                    style={{
                                        width: `${weightBarWidthPct}%`,
                                        background: everyOrgBalanced
                                            ? 'linear-gradient(90deg, #2EC4A9, #3DD6BD)'
                                            : weightBarOverCap
                                              ? 'linear-gradient(90deg, #E05252, #f87171)'
                                              : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                                    }}
                                />
                            </div>
                            <div className="ckr-hc-nums">
                                <span className="ckr-hc-total-val">
                                    {everyOrgBalanced ? '100%' : `${minOrgWeight.toFixed(1)}% – ${maxOrgWeight.toFixed(1)}%`}
                                </span>
                                <span className="ckr-hc-of">/ 100%</span>
                            </div>
                        </div>
                        <div className={`ckr-status-alert ${statusAlertType}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>
                                {statusAlertType === 'ok' && tx('ceo_kpi.review.alert_ok', 'Weight is 100% — ready to finalize')}
                                {statusAlertType === 'warn' &&
                                    tx(
                                        'ceo_kpi.review.alert_warn_per_org',
                                        'Each organization must have KPI weights totaling exactly 100%. One or more teams are above or below 100% — adjust before finalizing.',
                                    )}
                                {statusAlertType === 'idle' && tx('ceo_kpi.review.alert_idle', 'Review each team KPI, then approve or request revision.')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom bar: same as reference (Back, hint, actions) */}
                <div className="ckr-bottom-bar">
                    <Link href={backHref} className="ckr-btn-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        {tx('common.back', 'Back')}
                    </Link>
                    <span className="ckr-bottom-hint">
                        <strong>{tx('ceo_kpi.review.step_title', 'CEO KPI Review')}</strong> · {tx('ceo_kpi.review.step_counter', '1 of 1')}
                    </span>
                    <div className="ckr-bottom-actions">
                        <button
                            type="button"
                            className="ckr-btn ckr-btn-outline"
                            onClick={handleRequestRevision}
                            disabled={processing || Object.values(revisionRequests).every((v) => !v.trim())}
                        >
                            {tx('ceo_kpi.review.request_revision', 'Request Revision')}
                        </button>
                        {!allApproved && (
                            <button
                                type="button"
                                className="ckr-btn ckr-btn-primary"
                                onClick={handleApprove}
                                disabled={processing || !everyOrgBalanced}
                                title={
                                    !everyOrgBalanced
                                        ? tx(
                                              'ceo_kpi.review.alert_warn_per_org',
                                              'Each organization must total 100% weight before finalizing.',
                                          )
                                        : undefined
                                }
                            >
                                ✓ {tx('ceo_kpi.review.finalize', 'Finalize Company-wide KPIs')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
