import { Head, useForm, Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
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
    const { props } = usePage();
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
    const totalWeight = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
    const teamCount = organizations.length;
    const allApproved = totalKpis > 0 && approvedCount === totalKpis;

    const { data, setData, post, processing } = useForm({
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
        const next: Record<string, string> = {};
        Object.entries(kpisByOrganization).forEach(([orgName, orgKpis]) => {
            const saved =
                orgKpis.find((k) => (k.ceo_revision_comment ?? '').trim())?.ceo_revision_comment ||
                orgKpis.find((k) => (k.revision_comment ?? '').trim())?.revision_comment ||
                '';
            if (saved.trim()) next[orgName] = saved;
        });
        if (Object.keys(next).length > 0) {
            setRevisionRequests((prev) => ({ ...next, ...prev }));
        }
    }, [kpisByOrganization]);

    const handleApprove = () => {
        const route = isAdmin ? `/admin/kpi-review/${project.id}` : `/ceo/kpi-review/${project.id}`;
        setData({ action: 'approve', revision_requests: [] });
        post(route, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessModalMessage('Company-wide KPIs have been finalized and approved.');
                setSuccessModalOpen(true);
            },
        });
    };

    const handleRequestRevision = () => {
        const requests = Object.entries(revisionRequests)
            .filter(([_, comment]) => comment.trim())
            .map(([org, comment]) => ({ organization_name: org, comment: comment.trim() }));
        if (requests.length === 0) {
            alert('Please add at least one revision comment.');
            return;
        }
        const route = isAdmin ? `/admin/kpi-review/${project.id}` : `/ceo/kpi-review/${project.id}`;
        setData({ action: 'request_revision', revision_requests: requests });
        post(route, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessModalMessage('Revision requests have been sent to organization leaders.');
                setSuccessModalOpen(true);
            },
        });
    };

    const getStatusBadge = (status: string, ceoStatus?: string) => {
        const s = ceoStatus || status;
        if (s === 'approved') return <span className="ckr-badge ckr-badge-done">Approved</span>;
        if (s === 'revision_requested') return <span className="ckr-badge ckr-badge-revision">Revision requested</span>;
        return <span className="ckr-badge ckr-badge-pending">Pending</span>;
    };

    const getOrgStepStatus = (orgKpis: OrganizationalKpi[]) => {
        const hasApproved = orgKpis.some((k) => k.ceo_approval_status === 'approved' || k.status === 'approved');
        const hasRevision = orgKpis.some((k) => k.ceo_approval_status === 'revision_requested');
        if (hasApproved) return { draftSent: true, underReview: true, ceoRequested: true };
        if (hasRevision) return { draftSent: true, underReview: true, ceoRequested: false };
        return { draftSent: true, underReview: false, ceoRequested: false };
    };

    const backHref = isAdmin ? '/admin/dashboard' : '/ceo/dashboard';
    const weightPct = Math.min(100, totalWeight);
    const statusAlertType = totalWeight === 100 ? 'ok' : totalWeight > 0 ? 'warn' : 'idle';

    return (
        <AppLayout>
            <Head title={`CEO KPI Review - ${project?.company?.name || 'Company'}`} />
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
                        <div style={{ fontWeight: 700, color: '#0f2a4a', marginBottom: 8 }}>Submission Status</div>
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
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="ceo-kpi-review-page w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

            {/* Top bar: same as Job Grades reference (white, 56px, back + title + badge + counter) */}
            <div className="ckr-top-bar">
                <Link href={backHref} className="ckr-back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <span className="ckr-step-title">CEO KPI Review</span>
                <span className="ckr-step-badge">진행중</span>
                <span className="ckr-step-counter">1 of 1</span>
            </div>

            {/* Progress bar: 3px mint fill */}
            <div className="ckr-progress-wrap">
                <div className="ckr-progress-track">
                    <div className="ckr-progress-fill" style={{ width: totalWeight === 100 && approvedCount === totalKpis ? '100%' : '60%' }} />
                </div>
            </div>

            <div className="ckr-page">
                {/* Section label: same as reference */}
                <div className="ckr-section-label-wrap">
                    <span className="ckr-section-label">전사 KPI 검토</span>
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
                            <h2>Company-wide KPI Review</h2>
                            <p>Review submitted KPIs across all teams. Approve or request revisions per organization.</p>
                        </div>
                        <div className="ckr-strip-pills">
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{teamCount}</div>
                                <div className="ckr-pill-lbl">팀 수</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{totalKpis}</div>
                                <div className="ckr-pill-lbl">총 KPI 수</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{approvedCount}</div>
                                <div className="ckr-pill-lbl">승인 완료</div>
                            </div>
                            <div className="ckr-strip-pill">
                                <div className="ckr-pill-val">{pendingCount}</div>
                                <div className="ckr-pill-lbl">검토 대기</div>
                            </div>
                            <div className="ckr-strip-divider" />
                            <div className="ckr-strip-pill-ratio">
                                <div className="ckr-pill-val">{totalWeight === 100 ? '100%' : totalWeight > 0 ? `${totalWeight.toFixed(0)}%` : '—'}</div>
                                <div className="ckr-pill-lbl">가중치 합계</div>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar: hint only */}
                    <div className="ckr-toolbar">
                        <span className="ckr-toolbar-hint">
                            · 팀별 KPI 확인 · <strong>수정 요청</strong> 시 해당 팀에 코멘트 입력 · 모두 승인 시 <strong>최종 확정</strong>
                        </span>
                    </div>

                    {/* Table header: Team Progress */}
                    <div className="ckr-table-head">
                        <div />
                        <div className="ckr-th">조직<span className="ckr-th-sub">ORGANIZATION</span></div>
                        <div className="ckr-th">리더<span className="ckr-th-sub">LEADER</span></div>
                        <div className="ckr-th">KPI 수<span className="ckr-th-sub">COUNT</span></div>
                        <div className="ckr-th">상태<span className="ckr-th-sub">STATUS</span></div>
                        <div />
                    </div>

                    {/* Org list: expandable rows inside card */}
                    <div className="ckr-org-list">
                        {organizations.length === 0 ? (
                            <div className="ckr-org-empty-row">
                                <div className="ckr-org-empty">No KPIs submitted yet. Leaders must complete their review first.</div>
                            </div>
                        ) : (
                            organizations.map((orgName) => {
                                const orgKpis = kpisByOrganization[orgName] || [];
                                const leader = orgChartMappings?.find((m) => (m.org_unit_name || '').trim() === (orgName || '').trim());
                                const step = getOrgStepStatus(orgKpis);
                                const isExpanded = expandedOrg === orgName;
                                const revComment = orgKpis[0]?.ceo_revision_comment || orgKpis[0]?.revision_comment;
                                const orgWeight = orgKpis.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
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
                                                    <div className="ckr-step-label">Draft Sent</div>
                                                </div>
                                                <div className={`ckr-step-item ${step.underReview ? 'done' : 'active'}`}>
                                                    <div className="ckr-step-dot">{step.underReview ? '✓' : '2'}</div>
                                                    <div className="ckr-step-label">Under Review</div>
                                                </div>
                                                <div className={`ckr-step-item ${step.ceoRequested ? 'done' : ''}`}>
                                                    <div className="ckr-step-dot">{step.ceoRequested ? '✓' : '3'}</div>
                                                    <div className="ckr-step-label">CEO Review Requested</div>
                                                </div>
                                            </div>
                                            {revComment && (
                                                <div className="ckr-revision-box">
                                                    <strong>Revision comment:</strong> {revComment}
                                                </div>
                                            )}

                                            <div className="ckr-leader-detail-grid">
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">Leader</div>
                                                    <div className="ckr-leader-detail-value">{leader?.org_head_name || 'N/A'}</div>
                                                    <div className="ckr-leader-detail-sub">{leader?.org_head_email || 'No email configured'}</div>
                                                </div>
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">Leader Review Status</div>
                                                    <div className="ckr-leader-detail-value">
                                                        {orgKpis.some((k) => (k.status ?? '').toLowerCase() === 'proposed')
                                                            ? 'Submitted to CEO'
                                                            : 'Draft in progress'}
                                                    </div>
                                                    <div className="ckr-leader-detail-sub">
                                                        {lastUpdated ? `Last update: ${new Date(lastUpdated).toLocaleString()}` : 'No update timestamp'}
                                                    </div>
                                                </div>
                                                <div className="ckr-leader-detail-card">
                                                    <div className="ckr-leader-detail-label">Total Team Weight</div>
                                                    <div className="ckr-leader-detail-value">{orgWeight.toFixed(1)}%</div>
                                                    <div className="ckr-leader-detail-sub">
                                                        {orgWeight === 100 ? 'Balanced (100%)' : 'Needs adjustment to 100%'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ckr-kpi-table-wrap">
                                                <table className="ckr-kpi-table">
                                                    <thead>
                                                        <tr>
                                                            <th>No.</th>
                                                            <th>Name</th>
                                                            <th>Category</th>
                                                            <th>Weight</th>
                                                            <th>Details</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orgKpis.map((kpi, idx) => (
                                                            <tr key={kpi.id}>
                                                                <td>{idx + 1}</td>
                                                                <td className="ckr-td-name">{kpi.kpi_name}</td>
                                                                <td>{kpi.category || '—'}</td>
                                                                <td>{kpi.weight != null ? `${kpi.weight}%` : '—'}</td>
                                                                <td className="ckr-kpi-detail-cell">
                                                                    <div><strong>HR Draft:</strong> {kpi.hr_draft?.kpi_name || kpi.kpi_name || '—'}</div>
                                                                    <div><strong>Leader Update:</strong> {kpi.leader_latest?.kpi_name || kpi.kpi_name || '—'}</div>
                                                                    <div><strong>Purpose:</strong> {kpi.purpose || '—'}</div>
                                                                    <div><strong>Formula:</strong> {kpi.formula || '—'}</div>
                                                                    <div><strong>Measure:</strong> {kpi.measurement_method || '—'}</div>
                                                                    <div><strong>Job:</strong> {kpi.linked_job?.job_name || '—'}</div>
                                                                </td>
                                                                <td>{getStatusBadge(kpi.status, kpi.ceo_approval_status)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="ckr-revision-input-wrap">
                                                <label className="ckr-field-label">
                                                    Revision comment (if needed)
                                                    {revisionRequests[orgName]?.trim() && (
                                                        <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 700 }}>Selected</span>
                                                    )}
                                                </label>
                                                <textarea
                                                    className="ckr-field-input"
                                                    rows={2}
                                                    placeholder="Enter revision comments for this organization..."
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
                            <span className="ckr-hc-summary-label">Total weight</span>
                            <div className="ckr-hc-bar-outer">
                                <div
                                    className="ckr-hc-bar-fill"
                                    style={{
                                        width: `${weightPct}%`,
                                        background: totalWeight === 100 ? 'linear-gradient(90deg, #2EC4A9, #3DD6BD)' : totalWeight > 100 ? 'linear-gradient(90deg, #E05252, #f87171)' : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                                    }}
                                />
                            </div>
                            <div className="ckr-hc-nums">
                                <span className="ckr-hc-total-val">{totalWeight.toFixed(1)}%</span>
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
                                {statusAlertType === 'ok' && '✓ 가중치 100% — 최종 승인 가능'}
                                {statusAlertType === 'warn' && `가중치 합계 ${totalWeight.toFixed(1)}%. 100%가 되면 최종 확정할 수 있습니다.`}
                                {statusAlertType === 'idle' && '팀별 KPI를 검토한 뒤 승인 또는 수정 요청을 선택하세요.'}
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
                        Back
                    </Link>
                    <span className="ckr-bottom-hint">
                        <strong>CEO KPI Review</strong> · 1 of 1
                    </span>
                    <div className="ckr-bottom-actions">
                        <button
                            type="button"
                            className="ckr-btn ckr-btn-outline"
                            onClick={handleRequestRevision}
                            disabled={processing || Object.values(revisionRequests).every((v) => !v.trim())}
                        >
                            Request Revision
                        </button>
                        {!allApproved && (
                            <button type="button" className="ckr-btn ckr-btn-primary" onClick={handleApprove} disabled={processing}>
                                ✓ Finalize Company-wide KPIs
                            </button>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
