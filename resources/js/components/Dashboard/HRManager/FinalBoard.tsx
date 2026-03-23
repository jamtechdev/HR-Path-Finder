import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'locked' | 'completed';
type StageUiStatus = 'done' | 'active' | 'locked';

interface HrSystemSnapshot {
  company: { name: string; industry: string; size: number };
  ceo_philosophy: { main_trait?: string; secondary_trait?: string };
  job_architecture: { jobs_defined: number; structure_type?: string | null; job_grade_structure?: string | null };
  performance_management: { model?: string | null; method?: string | null; cycle?: string | null; rating_scale?: string | null; evaluation_logic?: string | null };
  compensation_benefits: {
    salary_system?: string | null;
    salary_structure_type?: string | null;
    salary_increase_process?: string | null;
    bonus_metric?: string | null;
    benefits_level?: number | null;
    welfare_program?: string | null;
    benefits_strategic_direction?: string | string[] | null;
  };
  diagnosis?: {
    industry_category?: string | null;
    industry_subcategory?: string | null;
    present_headcount?: number | null;
    expected_headcount_1y?: number | null;
    average_age?: number | null;
    gender_ratio?: number | null;
    total_executives?: number | null;
    leadership_percentage?: number | null;
  };
  hr_system_report: { status: string };
}

/** Per-stage completion % from backend (ProjectStageProgressService). */
export interface StageProgressPercent {
  diagnosis: number;
  job_analysis: number;
  performance: number;
  compensation: number;
  hr_policy_os?: number;
}

function pctFromBackend(
  stageProgressPercent: StageProgressPercent | undefined,
  stageKey: keyof Pick<StageProgressPercent, 'diagnosis' | 'job_analysis' | 'performance' | 'compensation'>,
  uiStatus: StageUiStatus
): number {
  const raw = stageProgressPercent?.[stageKey];
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return Math.min(100, Math.max(0, Math.round(raw)));
  }
  if (uiStatus === 'done') {
    return 100;
  }
  return 0;
}

function progressLabel(pct: number, uiStatus: StageUiStatus): string {
  if (uiStatus === 'done') {
    return 'Complete';
  }
  if (uiStatus === 'active') {
    return `${pct}% · In progress`;
  }
  return pct > 0 ? `${pct}% · Pending` : 'Pending';
}

interface FinalBoardProps {
  projectId: number;
  companyName: string;
  stepStatuses: Record<string, StepStatus | string>;
  hrSystemSnapshot: HrSystemSnapshot;
  /** Real stage %; without it, done→100% and other states→0% (no fake 87/72). */
  stageProgressPercent?: StageProgressPercent;
  viewerRole?: 'hr_manager' | 'ceo';
}

function toStageStatus(stepStatus?: string): StageUiStatus {
  if (!stepStatus) return 'locked';
  if (['submitted', 'approved', 'locked', 'completed'].includes(stepStatus)) return 'done';
  if (stepStatus === 'in_progress') return 'active';
  return 'locked';
}

function getStageRoute(
  stageId: 'diagnosis' | 'job_analysis' | 'performance' | 'compensation',
  projectId: number,
  viewerRole: 'hr_manager' | 'ceo'
) {
  if (viewerRole === 'ceo') {
    switch (stageId) {
      case 'diagnosis':
        return `/ceo/review/diagnosis/${projectId}`;
      case 'job_analysis':
        return `/ceo/job-analysis/${projectId}/intro`;
      case 'performance':
        return `/ceo/review/performance-system/${projectId}`;
      case 'compensation':
        return `/ceo/review/compensation/${projectId}`;
    }
  }

  // hr_manager
  switch (stageId) {
    case 'diagnosis':
      return `/hr-manager/diagnosis/${projectId}/overview`;
    case 'job_analysis':
      return `/hr-manager/job-analysis/${projectId}/overview`;
    case 'performance':
      return `/hr-manager/performance-system/${projectId}/overview`;
    case 'compensation':
      return `/hr-manager/compensation-system/${projectId}/overview`;
  }
}

function fmt(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

export default function FinalBoard({
  projectId,
  companyName,
  stepStatuses,
  hrSystemSnapshot,
  stageProgressPercent,
  viewerRole = 'hr_manager',
}: FinalBoardProps) {
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const stages = useMemo(() => {
    const diagnosisStatus = toStageStatus(stepStatuses.diagnosis as string | undefined);
    const jobStatus = toStageStatus(stepStatuses.job_analysis as string | undefined);
    const perfStatus = toStageStatus(stepStatuses.performance as string | undefined);
    const compStatus = toStageStatus(stepStatuses.compensation as string | undefined);

    const diagnosisPct = pctFromBackend(stageProgressPercent, 'diagnosis', diagnosisStatus);
    const jobPct = pctFromBackend(stageProgressPercent, 'job_analysis', jobStatus);
    const perfPct = pctFromBackend(stageProgressPercent, 'performance', perfStatus);
    const compPct = pctFromBackend(stageProgressPercent, 'compensation', compStatus);

    return [
      {
        id: 'diagnosis' as const,
        step: '01',
        spineLabel: 'Org\nDiagnosis',
        tag: 'Organizational Diagnosis',
        title: 'Diagnosis Results',
        status: diagnosisStatus,
        pct: diagnosisPct,
        badgeText: diagnosisStatus === 'done' ? 'Complete' : diagnosisStatus === 'active' ? 'In Progress' : 'Pending',
        items: [
          { icon: '🏢', bg: '#EEF3FC', label: 'Industry · Growth Stage', val: fmt(hrSystemSnapshot.diagnosis?.industry_category ?? hrSystemSnapshot.company.industry), sub: hrSystemSnapshot.diagnosis?.industry_subcategory ? fmt(hrSystemSnapshot.diagnosis.industry_subcategory) : '' },
          { icon: '⚠️', bg: '#FEF4E2', label: 'Key Issues', val: '—', sub: hrSystemSnapshot.diagnosis?.leadership_percentage != null ? `Leader Ratio ${hrSystemSnapshot.diagnosis.leadership_percentage}%` : '' },
          { icon: '🧭', bg: '#E8F9F1', label: 'CEO Management Philosophy', val: fmt(hrSystemSnapshot.ceo_philosophy.main_trait), sub: hrSystemSnapshot.ceo_philosophy.secondary_trait ? `Secondary: ${hrSystemSnapshot.ceo_philosophy.secondary_trait}` : '' },
          { icon: '🏗️', bg: '#F3EEFF', label: 'Org Structure', val: fmt(hrSystemSnapshot.job_architecture.structure_type), sub: hrSystemSnapshot.job_architecture.job_grade_structure ? `Grade: ${hrSystemSnapshot.job_architecture.job_grade_structure}` : '' },
        ],
        progLabel: progressLabel(diagnosisPct, diagnosisStatus),
        navHint: diagnosisStatus === 'done' ? 'Go to Diagnosis Detail' : null,
      },
      {
        id: 'job_analysis' as const,
        step: '02',
        spineLabel: 'Job\nAnalysis',
        tag: 'Job Analysis Framework',
        title: 'Job Analysis',
        status: jobStatus,
        pct: jobPct,
        badgeText: jobStatus === 'done' ? 'Complete' : jobStatus === 'active' ? 'In Progress' : 'Pending',
        items: [
          { icon: '📊', bg: '#E8F9F1', label: 'Job Families · Job Count', val: `${hrSystemSnapshot.job_architecture.jobs_defined} Jobs`, sub: 'Finalized job definitions' },
          { icon: '📝', bg: '#FEF4E2', label: 'Job Description Status', val: '—', sub: '' },
        ],
        progLabel: progressLabel(jobPct, jobStatus),
        navHint: jobStatus === 'done' ? 'Go to Job Analysis' : null,
      },
      {
        id: 'performance' as const,
        step: '03',
        spineLabel: 'Performance\nMgmt.',
        tag: 'Performance Management',
        title: 'Performance System',
        status: perfStatus,
        pct: perfPct,
        badgeText: perfStatus === 'done' ? 'Complete' : perfStatus === 'active' ? 'In Progress' : 'Pending',
        items: [
          { icon: '📈', bg: '#EBF2FD', label: 'Evaluation Unit', val: fmt(hrSystemSnapshot.performance_management.model), sub: hrSystemSnapshot.performance_management.cycle ? `Cycle: ${hrSystemSnapshot.performance_management.cycle}` : '' },
          { icon: '🗂️', bg: '#EBF2FD', label: 'Evaluation Model', val: fmt(hrSystemSnapshot.performance_management.method), sub: '' },
          { icon: '🔄', bg: '#EBF2FD', label: 'Rating Structure', val: fmt(hrSystemSnapshot.performance_management.rating_scale), sub: '' },
          { icon: '⏳', bg: '#FEF4E2', label: 'Result Utilization', val: fmt(hrSystemSnapshot.performance_management.evaluation_logic), sub: '' },
        ],
        progLabel: progressLabel(perfPct, perfStatus),
        navHint: null,
      },
      {
        id: 'compensation' as const,
        step: '04',
        spineLabel: 'Compensation\nSystem',
        tag: 'Compensation System',
        title: 'Compensation Design',
        status: compStatus,
        pct: compPct,
        badgeText: compStatus === 'done' ? 'Complete' : compStatus === 'active' ? 'In Progress' : 'Pending',
        items: [
          { icon: '💵', bg: '#F4F6FB', label: 'Salary System', val: fmt(hrSystemSnapshot.compensation_benefits.salary_system), sub: hrSystemSnapshot.compensation_benefits.salary_structure_type ? `Structure: ${hrSystemSnapshot.compensation_benefits.salary_structure_type}` : '' },
          { icon: '📊', bg: '#F4F6FB', label: 'Salary Increase Process', val: fmt(hrSystemSnapshot.compensation_benefits.salary_increase_process), sub: '' },
          { icon: '🏆', bg: '#F4F6FB', label: 'Bonus Metric', val: fmt(hrSystemSnapshot.compensation_benefits.bonus_metric), sub: '' },
          { icon: '🎁', bg: '#F4F6FB', label: 'Benefits Program', val: fmt(hrSystemSnapshot.compensation_benefits.welfare_program), sub: hrSystemSnapshot.compensation_benefits.benefits_level != null ? `Benefits ratio: ${hrSystemSnapshot.compensation_benefits.benefits_level}%` : '' },
        ],
        progLabel:
          compStatus === 'locked'
            ? 'Activates after Performance Stage'
            : progressLabel(compPct, compStatus),
        navHint: null,
      },
    ];
  }, [hrSystemSnapshot, stepStatuses, stageProgressPercent]);

  const completedCount = stages.filter((s) => s.status === 'done').length;
  const totalCount = stages.length;
  const opFillPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="finalBoardRoot">
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        .finalBoardRoot, .finalBoardRoot * { box-sizing: border-box; }
        .finalBoardRoot{
          --navy:#1B2E5A; --bg:#F4F6FB; --surface:#FFFFFF; --border:#E2E6EF; --border-d:#CDD4E8;
          --text:#1B2E5A; --text-mid:#4A5C80; --text-dim:#8A97B0; --text-ph:#C0C9DA;
          --green:#1DB87A; --green-bg:#E8F9F1; --amber:#D08000; --amber-bg:#FEF4E2;
          --blue:#2D64D4; --blue-bg:#EBF2FD;
          --sh-s:0 1px 4px rgba(27,46,90,0.07); --sh-m:0 4px 16px rgba(27,46,90,0.10); --sh-l:0 8px 32px rgba(27,46,90,0.13);
          font-family:'Pretendard',-apple-system,sans-serif;
          background:var(--bg); color:var(--text); font-size:14px; min-height:100vh;
        }
        .wrapper{max-width:1000px;margin:0 auto;padding:32px 24px 72px;}
        .pg-head{margin-bottom:24px;}
        .pg-head h1{font-size:20px;font-weight:700;color:var(--navy);}
        .pg-head p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .op{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 20px;margin-bottom:28px;box-shadow:var(--sh-s);display:flex;align-items:center;gap:16px;}
        .op-lbl{font-size:11px;font-weight:600;color:var(--text-mid);white-space:nowrap;}
        .op-trk{flex:1;height:6px;background:var(--border);border-radius:99px;overflow:hidden;}
        .op-fil{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--navy),var(--blue));transition:width 1s cubic-bezier(.22,1,.36,1);}
        .op-pct{font-size:14px;font-weight:700;color:var(--navy);white-space:nowrap;}
        .op-dots{display:flex;gap:4px;}
        .op-dot{width:8px;height:8px;border-radius:50%;background:var(--border);}
        .op-dot.done{background:var(--green);}
        .op-dot.active{background:var(--blue);box-shadow:0 0 5px rgba(45,100,212,.5);}
        .tree{display:flex;flex-direction:column;}
        .sr{display:grid;grid-template-columns:76px 36px 1fr;opacity:0;animation:fu .45s ease forwards;}
        .sr:nth-child(1){animation-delay:.05s}
        .sr:nth-child(2){animation-delay:.12s}
        .sr:nth-child(3){animation-delay:.19s}
        .sr:nth-child(4){animation-delay:.26s}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .spine{padding:26px 10px 26px 0;text-align:right;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;}
        .sp-n{font-size:9px;font-weight:600;letter-spacing:.15em;color:var(--text-ph);text-transform:uppercase;margin-bottom:5px;}
        .sp-k{font-size:13px;font-weight:700;color:var(--text-dim);line-height:1.25;text-align:right;}
        .sr.done .sp-k{color:var(--text);}
        .sr.active .sp-k{color:var(--navy);}
        .sr.locked .sp-k{color:var(--text-ph);}
        .conn{display:flex;flex-direction:column;align-items:center;padding-top:30px;}
        .cn{width:14px;height:14px;border-radius:50%;border:2px solid var(--border-d);background:var(--surface);flex-shrink:0;position:relative;z-index:2;}
        .cl{flex:1;width:2px;background:var(--border);position:relative;overflow:hidden;min-height:16px;}
        .cl::after{content:'';position:absolute;left:0;right:0;height:40%;top:-40%;animation:fd 2.4s linear infinite;}
        @keyframes fd{to{top:140%}}
        .sr:last-child .cl{display:none;}
        .sr.done .cn{border-color:var(--green);background:var(--green);box-shadow:0 0 0 3px var(--green-bg);}
        .sr.done .cl::after{background:linear-gradient(transparent,var(--green),transparent);}
        .sr.active .cn{border-color:var(--blue);background:var(--surface);box-shadow:0 0 0 4px var(--blue-bg);}
        .sr.active .cl::after{background:linear-gradient(transparent,var(--blue),transparent);}
        .sr.locked .cn{border-color:var(--border);background:var(--bg);}
        .sr.locked .cl::after{display:none;}
        .sc{padding:16px 0 16px 16px;}
        .card{background:var(--surface);border:1.5px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--sh-s);transition:all .22s;}
        .sr.done .card{cursor:pointer;}
        .sr.done .card:hover{transform:translateY(-2px);box-shadow:var(--sh-l);}
        .sr.active .card{border-color:var(--blue);box-shadow:0 0 0 3px rgba(45,100,212,.09),var(--sh-m);}
        .sr.locked .card{opacity:.45;cursor:not-allowed;}
        .cbar{height:4px;}
        .sr.done .cbar{background:var(--green);}
        .sr.active .cbar{background:linear-gradient(90deg,var(--blue),var(--navy));}
        .sr.locked .cbar{background:var(--border);}
        .ch{padding:14px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
        .ch-l .ch-tag{font-size:10px;font-weight:600;letter-spacing:.10em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
        .ch-l .ch-ttl{font-size:16px;font-weight:700;color:var(--navy);}
        .ch-r{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
        .badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:99px;}
        .badge-done{background:var(--green-bg);color:var(--green);}
        .badge-active{background:var(--blue-bg);color:var(--blue);}
        .badge-locked{background:var(--bg);color:var(--text-dim);border:1px solid var(--border);}
        .ch-pct{font-size:18px;font-weight:700;color:var(--navy);}
        .sr.active .ch-pct{color:var(--blue);}
        .sr.locked .ch-pct{color:var(--text-dim);}
        .cb{padding:16px 20px;}
        .ig{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
        .ii{display:flex;align-items:flex-start;gap:10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;}
        .ii-ico{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
        .ii-lbl{font-size:9px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
        .ii-val{font-size:13px;font-weight:700;color:var(--navy);line-height:1.3;}
        .ii-sub{font-size:10px;color:var(--text-dim);margin-top:2px;line-height:1.4;}
        .sr.locked .ii-val{color:var(--text-mid);}
        .pm{display:flex;align-items:center;gap:10px;margin-top:4px;}
        .pm-trk{flex:1;height:4px;background:var(--border);border-radius:99px;overflow:hidden;}
        .pm-fil{height:100%;border-radius:99px;transition:width 1s cubic-bezier(.22,1,.36,1);}
        .sr.done .pm-fil{background:var(--green);}
        .sr.active .pm-fil{background:var(--blue);}
        .sr.locked .pm-fil{background:var(--border-d);}
        .pm-lbl{font-size:10px;color:var(--text-dim);white-space:nowrap;}
        .nh{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--blue);font-weight:600;margin-top:10px;opacity:0;transition:opacity .18s;}
        .sr.done .card:hover .nh{opacity:1;}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(14px);background:var(--navy);color:#fff;padding:10px 22px;border-radius:4px;font-size:12px;font-weight:500;letter-spacing:.04em;z-index:300;opacity:0;pointer-events:none;transition:all .28s cubic-bezier(.22,1,.36,1);white-space:nowrap;box-shadow:var(--sh-l);}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .fb-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:12px;margin-bottom:20px;}
        .fb-btn-final{background:#F5C400;color:#1B2E5A;border:none;padding:7px 18px;font-size:11px;font-weight:700;letter-spacing:.03em;cursor:pointer;border-radius:4px;box-shadow:0 2px 8px rgba(245,196,0,0.35);}
        .fb-btn-final:hover{background:#FFD332;}
        .fb-btn-final:disabled{opacity:0.5;cursor:not-allowed;}
      `}</style>

      <div className="wrapper">
        <div className="pg-head">
          <h1>Design Progress</h1>
          <p>Key outputs summarized from input data at each stage.</p>
        </div>

        {viewerRole === 'hr_manager' &&
          (() => {
          const finalSt = String(stepStatuses.hr_policy_os ?? 'not_started');
          const canSubmit = ['not_started', 'in_progress'].includes(finalSt);
          if (!canSubmit) return null;
          return (
            <div className="fb-actions">
              <button
                type="button"
                className="fb-btn-final"
                onClick={() => {
                  if (!window.confirm('Submit Final Dashboard for CEO review?')) return;
                  router.post(`/hr-manager/tree/${projectId}/submit-final`, {}, { preserveScroll: true });
                }}
              >
                Submit for CEO Approval
              </button>
            </div>
          );
        })()}

        <div className="op">
          <div className="op-lbl">Overall Progress</div>
          <div className="op-trk">
            <div className="op-fil" style={{ width: `${opFillPct}%` }} />
          </div>
          <div className="op-pct">
            {completedCount} / {totalCount} Stages
          </div>
          <div className="op-dots">
            {stages.map((s, idx) => (
              <div key={idx} className={`op-dot ${s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="tree">
          {stages.map((s, i) => {
            const isLast = i === stages.length - 1;
            const isClickable = s.status !== 'locked';

            const badgeClass = s.status === 'done' ? 'badge-done' : s.status === 'active' ? 'badge-active' : 'badge-locked';
            const badgeIcon = s.status === 'done' ? '✓ ' : '';

            const nodeInner =
              s.status === 'done' ? (
                <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} width="8" height="7" viewBox="0 0 10 9">
                  <path d="M1 4.5l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : s.status === 'active' ? (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, borderRadius: 999, background: 'var(--blue)' }} />
              ) : null;

            return (
              <div key={s.id} className={`sr ${s.status}`}>
                <div className="spine">
                  <div className="sp-n">STEP {s.step}</div>
                  <div className="sp-k" dangerouslySetInnerHTML={{ __html: s.spineLabel.replace('\n', '<br>') }} />
                </div>

                <div className="conn">
                  <div className="cn">{nodeInner}</div>
                  {!isLast ? <div className="cl" /> : null}
                </div>

                <div className="sc">
                  <div
                    className="card"
                    onClick={() => {
                      if (!isClickable) {
                        showToast('Available after completing the previous stage.');
                        return;
                      }
                      router.visit(getStageRoute(s.id, projectId, viewerRole));
                    }}
                  >
                    <div className="cbar" />
                    <div className="ch">
                      <div className="ch-l">
                        <div className="ch-tag">{s.tag}</div>
                        <div className="ch-ttl">{s.title}</div>
                      </div>
                      <div className="ch-r">
                        <span className={`badge ${badgeClass}`}>{badgeIcon}{s.badgeText}</span>
                        <span className="ch-pct">{s.pct}%</span>
                      </div>
                    </div>
                    <div className="cb">
                      <div className="ig" style={{ gridTemplateColumns: s.items.length <= 2 ? '1fr' : '1fr 1fr' }}>
                        {s.items.map((it, idx) => (
                          <div key={idx} className="ii">
                            <div className="ii-ico" style={{ background: it.bg }}>{it.icon}</div>
                            <div>
                              <div className="ii-lbl">{it.label}</div>
                              <div className="ii-val">{it.val}</div>
                              <div className="ii-sub">{it.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pm">
                        <div className="pm-trk">
                          <div className="pm-fil" style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="pm-lbl">{s.progLabel}</span>
                      </div>

                      {s.navHint ? (
                        <div className="nh">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                          </svg>
                          {s.navHint}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      <div style={{ position: 'fixed', right: 16, bottom: 16, fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
        {companyName}
      </div>
    </div>
  );
}

