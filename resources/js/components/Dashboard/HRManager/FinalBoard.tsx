import { router } from '@inertiajs/react';
import type { TFunction } from 'i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

function progressLabel(t: TFunction, pct: number, uiStatus: StageUiStatus): string {
  if (uiStatus === 'done') {
    return t('hr_tree.final_board.progress_complete');
  }
  if (uiStatus === 'active') {
    return t('hr_tree.final_board.progress_active', { pct });
  }
  return pct > 0 ? t('hr_tree.final_board.progress_pending_pct', { pct }) : t('hr_tree.final_board.progress_pending');
}

interface FinalBoardProps {
  projectId: number;
  companyName: string;
  stepStatuses: Record<string, StepStatus | string>;
  hrSystemSnapshot: HrSystemSnapshot;
  /** Real stage %; without it, done→100% and other states→0% (no fake 87/72). */
  stageProgressPercent?: StageProgressPercent;
  viewerRole?: 'hr_manager' | 'ceo' | 'admin';
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
  viewerRole: 'hr_manager' | 'ceo' | 'admin'
) {
  if (viewerRole === 'admin') {
    return `/admin/review/${projectId}`;
  }

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
  if (v === null || v === undefined || v === '') return 'Not configured';
  if (Array.isArray(v)) return v.length ? v.join(', ') : 'Not configured';
  return String(v);
}

type StageItem = { icon: string; bg: string; labelKey: string; val: string; sub: string };

export default function FinalBoard({
  projectId,
  companyName,
  stepStatuses,
  hrSystemSnapshot,
  stageProgressPercent,
  viewerRole = 'hr_manager',
}: FinalBoardProps) {
  const { t } = useTranslation();
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (!toastMsg) return;
    let cancelled = false;
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    const handle = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 2600, fill: 'both' });
    void handle.finished.catch(() => undefined).finally(() => {
      try {
        el.remove();
      } catch {
        /* already detached */
      }
      if (!cancelled) setToastMsg('');
    });
    return () => {
      cancelled = true;
      handle.cancel();
    };
  }, [toastMsg]);

  const stages = useMemo(() => {
    const diagnosisStatus = toStageStatus(stepStatuses.diagnosis as string | undefined);
    const jobStatus = toStageStatus(stepStatuses.job_analysis as string | undefined);
    const perfStatus = toStageStatus(stepStatuses.performance as string | undefined);
    const compStatus = toStageStatus(stepStatuses.compensation as string | undefined);

    const diagnosisPct = pctFromBackend(stageProgressPercent, 'diagnosis', diagnosisStatus);
    const jobPct = pctFromBackend(stageProgressPercent, 'job_analysis', jobStatus);
    const perfPct = pctFromBackend(stageProgressPercent, 'performance', perfStatus);
    const compPct = pctFromBackend(stageProgressPercent, 'compensation', compStatus);

    const leadPct = hrSystemSnapshot.diagnosis?.leadership_percentage;
    const leadSub =
      leadPct != null ? t('hr_tree.final_board.diagnosis.leader_ratio', { pct: leadPct }) : '';

    const ceoSub = hrSystemSnapshot.ceo_philosophy.secondary_trait
      ? t('hr_tree.final_board.diagnosis.secondary', { trait: hrSystemSnapshot.ceo_philosophy.secondary_trait })
      : '';

    const orgSub = hrSystemSnapshot.job_architecture.job_grade_structure
      ? t('hr_tree.final_board.diagnosis.grade', { grade: hrSystemSnapshot.job_architecture.job_grade_structure })
      : '';

    const perfCycleSub = hrSystemSnapshot.performance_management.cycle
      ? t('hr_tree.final_board.performance.cycle', { cycle: hrSystemSnapshot.performance_management.cycle })
      : '';

    const compStructureSub = hrSystemSnapshot.compensation_benefits.salary_structure_type
      ? t('hr_tree.final_board.compensation.structure', {
          type: hrSystemSnapshot.compensation_benefits.salary_structure_type,
        })
      : '';

    const benefitsRatioSub =
      hrSystemSnapshot.compensation_benefits.benefits_level != null
        ? t('hr_tree.final_board.compensation.benefits_ratio', {
            pct: hrSystemSnapshot.compensation_benefits.benefits_level,
          })
        : '';

    return [
      {
        id: 'diagnosis' as const,
        step: '01',
        spineKey: 'diagnosis' as const,
        tagKey: 'hr_tree.final_board.diagnosis.tag',
        titleKey: 'hr_tree.final_board.diagnosis.title',
        status: diagnosisStatus,
        pct: diagnosisPct,
        items: [
          {
            icon: '🏢',
            bg: 'rgba(59,130,246,0.18)',
            labelKey: 'hr_tree.final_board.diagnosis.industry',
            val: fmt(hrSystemSnapshot.diagnosis?.industry_category ?? hrSystemSnapshot.company.industry),
            sub: hrSystemSnapshot.diagnosis?.industry_subcategory
              ? fmt(hrSystemSnapshot.diagnosis.industry_subcategory)
              : '',
          },
          {
            icon: '⚠️',
            bg: 'rgba(245,158,11,0.18)',
            labelKey: 'hr_tree.final_board.diagnosis.key_issues',
            val: leadPct != null ? `Leader ratio ${leadPct}%` : 'Not configured',
            sub: leadSub,
          },
          {
            icon: '🧭',
            bg: 'rgba(16,185,129,0.18)',
            labelKey: 'hr_tree.final_board.diagnosis.ceo_philosophy',
            val: fmt(hrSystemSnapshot.ceo_philosophy.main_trait),
            sub: ceoSub,
          },
          {
            icon: '🏗️',
            bg: 'rgba(167,139,250,0.2)',
            labelKey: 'hr_tree.final_board.diagnosis.org_structure',
            val: fmt(hrSystemSnapshot.job_architecture.structure_type),
            sub: orgSub,
          },
        ] satisfies StageItem[],
        progLabel: progressLabel(t, diagnosisPct, diagnosisStatus),
        navHintKey: diagnosisStatus === 'done' ? ('hr_tree.final_board.nav_diagnosis' as const) : null,
      },
      {
        id: 'job_analysis' as const,
        step: '02',
        spineKey: 'job_analysis' as const,
        tagKey: 'hr_tree.final_board.job.tag',
        titleKey: 'hr_tree.final_board.job.title',
        status: jobStatus,
        pct: jobPct,
        items: [
          {
            icon: '📊',
            bg: 'rgba(16,185,129,0.18)',
            labelKey: 'hr_tree.final_board.job.families',
            val: t('hr_tree.final_board.job.jobs_suffix', { count: hrSystemSnapshot.job_architecture.jobs_defined }),
            sub: t('hr_tree.final_board.job.jobs_sub'),
          },
          {
            icon: '📝',
            bg: 'rgba(245,158,11,0.18)',
            labelKey: 'hr_tree.final_board.job.jd_status',
            val: fmt((hrSystemSnapshot.job_architecture as { job_description_status?: string }).job_description_status),
            sub: '',
          },
        ] satisfies StageItem[],
        progLabel: progressLabel(t, jobPct, jobStatus),
        navHintKey: jobStatus === 'done' ? ('hr_tree.final_board.nav_job' as const) : null,
      },
      {
        id: 'performance' as const,
        step: '03',
        spineKey: 'performance' as const,
        tagKey: 'hr_tree.final_board.performance.tag',
        titleKey: 'hr_tree.final_board.performance.title',
        status: perfStatus,
        pct: perfPct,
        items: [
          {
            icon: '📈',
            bg: 'rgba(59,130,246,0.18)',
            labelKey: 'hr_tree.final_board.performance.eval_unit',
            val: fmt(hrSystemSnapshot.performance_management.model),
            sub: perfCycleSub,
          },
          {
            icon: '🗂️',
            bg: 'rgba(59,130,246,0.14)',
            labelKey: 'hr_tree.final_board.performance.eval_model',
            val: fmt(hrSystemSnapshot.performance_management.method),
            sub: '',
          },
          {
            icon: '🔄',
            bg: 'rgba(59,130,246,0.14)',
            labelKey: 'hr_tree.final_board.performance.rating',
            val: fmt(hrSystemSnapshot.performance_management.rating_scale),
            sub: '',
          },
          {
            icon: '⏳',
            bg: 'rgba(245,158,11,0.18)',
            labelKey: 'hr_tree.final_board.performance.result_use',
            val: fmt(hrSystemSnapshot.performance_management.evaluation_logic),
            sub: '',
          },
        ] satisfies StageItem[],
        progLabel: progressLabel(t, perfPct, perfStatus),
        navHintKey: null,
      },
      {
        id: 'compensation' as const,
        step: '04',
        spineKey: 'compensation' as const,
        tagKey: 'hr_tree.final_board.compensation.tag',
        titleKey: 'hr_tree.final_board.compensation.title',
        status: compStatus,
        pct: compPct,
        items: [
          {
            icon: '💵',
            bg: 'rgba(148,163,184,0.2)',
            labelKey: 'hr_tree.final_board.compensation.salary_system',
            val: fmt(hrSystemSnapshot.compensation_benefits.salary_system),
            sub: compStructureSub,
          },
          {
            icon: '📊',
            bg: 'rgba(148,163,184,0.16)',
            labelKey: 'hr_tree.final_board.compensation.increase_process',
            val: fmt(hrSystemSnapshot.compensation_benefits.salary_increase_process),
            sub: '',
          },
          {
            icon: '🏆',
            bg: 'rgba(148,163,184,0.16)',
            labelKey: 'hr_tree.final_board.compensation.bonus_metric',
            val: fmt(hrSystemSnapshot.compensation_benefits.bonus_metric),
            sub: '',
          },
          {
            icon: '🎁',
            bg: 'rgba(148,163,184,0.16)',
            labelKey: 'hr_tree.final_board.compensation.benefits',
            val: fmt(hrSystemSnapshot.compensation_benefits.welfare_program),
            sub: benefitsRatioSub,
          },
        ] satisfies StageItem[],
        progLabel:
          compStatus === 'locked' ? t('hr_tree.final_board.progress_comp_locked') : progressLabel(t, compPct, compStatus),
        navHintKey: null,
      },
    ];
  }, [hrSystemSnapshot, stepStatuses, stageProgressPercent, t]);

  const completedCount = stages.filter((s) => s.status === 'done').length;
  const totalCount = stages.length;
  const opFillPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="finalBoardRoot">
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        .finalBoardRoot, .finalBoardRoot * { box-sizing: border-box; }
        .finalBoardRoot{
          --navy:#0B1E3D; --bg:hsl(217 69% 10%); --surface:hsl(217 58% 14%); --border:rgba(148,163,184,0.18); --border-d:rgba(148,163,184,0.28);
          --text:#f1f5f9; --text-mid:#cbd5e1; --text-dim:#94a3b8; --text-ph:#64748b;
          --green:#10b981; --green-bg:rgba(16,185,129,0.12); --amber:#f59e0b; --amber-bg:rgba(245,158,11,0.12);
          --blue:#38bdf8; --blue-bg:rgba(56,189,248,0.12);
          --sh-s:0 1px 3px rgba(0,0,0,0.35); --sh-m:0 8px 24px rgba(0,0,0,0.35); --sh-l:0 16px 40px rgba(0,0,0,0.45);
          font-family:'Pretendard',-apple-system,sans-serif;
          background:var(--bg); color:var(--text); font-size:14px; min-height:100vh;
        }
        .wrapper{max-width:1000px;margin:0 auto;padding:32px 24px 72px;}
        .pg-head{margin-bottom:24px;}
        .pg-head h1{font-size:20px;font-weight:700;color:var(--text);}
        .pg-head p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .op{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 20px;margin-bottom:28px;box-shadow:var(--sh-s);display:flex;align-items:center;gap:16px;}
        .op-lbl{font-size:11px;font-weight:600;color:var(--text-mid);white-space:nowrap;}
        .op-trk{flex:1;height:6px;background:var(--border);border-radius:99px;overflow:hidden;}
        .op-fil{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--navy),var(--blue));transition:width 1s cubic-bezier(.22,1,.36,1);}
        .op-pct{font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;}
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
        .sr.active .sp-k{color:var(--text);}
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
        .ch{padding:12px 18px 10px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
        .ch-l .ch-tag{font-size:10px;font-weight:600;letter-spacing:.10em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
        .ch-l .ch-ttl{font-size:17px;font-weight:800;color:var(--text);}
        .ch-r{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
        .badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;}
        .badge-done{background:var(--green-bg);color:var(--green);}
        .badge-active{background:var(--blue-bg);color:var(--blue);}
        .badge-locked{background:var(--bg);color:var(--text-dim);border:1px solid var(--border);}
        .ch-pct{font-size:20px;font-weight:800;color:var(--text);}
        .sr.active .ch-pct{color:var(--blue);}
        .sr.locked .ch-pct{color:var(--text-dim);}
        .cb{padding:14px 18px;}
        .ig{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
        .ii{display:flex;align-items:flex-start;gap:10px;background:rgba(15,23,42,0.45);border:1px solid var(--border);border-radius:8px;padding:10px 12px;}
        .ii-ico{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
        .ii-lbl{font-size:9px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
        .ii-val{font-size:14px;font-weight:800;color:var(--text);line-height:1.3;}
        .ii-sub{font-size:11px;color:var(--text-dim);margin-top:2px;line-height:1.4;}
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
        .fb-btn-final{background:#f59e0b;color:#0f172a;border:none;padding:8px 18px;font-size:11px;font-weight:700;letter-spacing:.03em;cursor:pointer;border-radius:8px;box-shadow:0 4px 14px rgba(245,158,11,0.35);}
        .fb-btn-final:hover{background:#fbbf24;}
        .fb-btn-final:disabled{opacity:0.5;cursor:not-allowed;}
      `}</style>

      <div className="wrapper">
        <div className="pg-head">
          <h1>{t('hr_tree.final_board.title')}</h1>
          <p>{t('hr_tree.final_board.subtitle')}</p>
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
                  if (!window.confirm(t('hr_tree.final_board.submit_confirm'))) return;
                  router.post(`/hr-manager/tree/${projectId}/submit-final`, {}, { preserveScroll: true });
                }}
              >
                {t('hr_tree.final_board.submit_ceo')}
              </button>
            </div>
          );
        })()}

        <div className="op">
          <div className="op-lbl">{t('hr_tree.final_board.overall_progress')}</div>
          <div className="op-trk">
            <div className="op-fil" style={{ width: `${opFillPct}%` }} />
          </div>
          <div className="op-pct">
            {t('hr_tree.final_board.stages_count', { completed: completedCount, total: totalCount })}
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
            const badgeText =
              s.status === 'done'
                ? t('hr_tree.final_board.badge_complete')
                : s.status === 'active'
                  ? t('hr_tree.final_board.badge_in_progress')
                  : t('hr_tree.final_board.badge_pending');
            const spineParts = t(`hr_tree.final_board.spine.${s.spineKey}`).split('|');

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
                  <div className="sp-n">{t('hr_tree.final_board.step_label', { step: s.step })}</div>
                  <div className="sp-k">
                    {spineParts.map((line, li) => (
                      <React.Fragment key={li}>
                        {li > 0 ? <br /> : null}
                        {line}
                      </React.Fragment>
                    ))}
                  </div>
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
                        showToast(t('hr_tree.final_board.toast_prev_stage'));
                        return;
                      }
                      router.visit(getStageRoute(s.id, projectId, viewerRole));
                    }}
                  >
                    <div className="cbar" />
                    <div className="ch">
                      <div className="ch-l">
                        <div className="ch-tag">{t(s.tagKey)}</div>
                        <div className="ch-ttl">{t(s.titleKey)}</div>
                      </div>
                      <div className="ch-r">
                        <span className={`badge ${badgeClass}`}>{badgeIcon}{badgeText}</span>
                        <span className="ch-pct">{s.pct}%</span>
                      </div>
                    </div>
                    <div className="cb">
                      <div className="ig" style={{ gridTemplateColumns: s.items.length <= 2 ? '1fr' : '1fr 1fr' }}>
                        {s.items.map((it, idx) => (
                          <div key={idx} className="ii">
                            <div className="ii-ico" style={{ background: it.bg }}>{it.icon}</div>
                            <div>
                              <div className="ii-lbl">{t(it.labelKey)}</div>
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

                      {s.navHintKey ? (
                        <div className="nh">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                          </svg>
                          {t(s.navHintKey)}
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
      <div style={{ position: 'fixed', right: 16, bottom: 16, fontSize: 11, color: 'rgba(148,163,184,0.55)' }}>
        {companyName}
      </div>
    </div>
  );
}

