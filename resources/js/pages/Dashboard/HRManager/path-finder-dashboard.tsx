import { Head, Link } from '@inertiajs/react';
import { Building2, Lock, AlertTriangle, BarChart3, ClipboardList, Target, Unlock, CheckCircle2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';

const STEP_CONFIG = [
  { id: 'diagnosis', num: 1 },
  { id: 'job_analysis', num: 2 },
  { id: 'performance', num: 3 },
  { id: 'compensation', num: 4 },
];

interface StageProgressPercentMap {
  diagnosis: number;
  job_analysis: number;
  performance: number;
  compensation: number;
  hr_policy_os: number;
}

interface PathFinderDashboardProps {
  workspaceDone?: boolean;
  user?: { name: string; email: string };
  activeProject?: { id: number; company: { id: number; name: string }; status: string; step_statuses?: Record<string, string> } | null;
  company?: { id: number; name: string; hasCeo: boolean } | null;
  progress?: { completed: number; total: number; currentStepNumber: number; currentStepKey: string | null };
  stepStatuses?: Record<string, string>;
  projectId?: number | null;
  ceoPhilosophyStatus?: string;
  /** Real per-stage % (ProjectStageProgressService) — fixes showing overall 1/5 as step progress */
  stageProgressPercent?: StageProgressPercentMap;
}

type StepUiState = 'completed' | 'current' | 'locked' | 'available';

function getStepState(
  stepId: string,
  stepIndex: number,
  stepStatuses: Record<string, string>,
  currentStepKey: string | null,
  ceoPhilosophyStatus?: string,
  projectId?: number | null
): StepUiState {
  const status = stepStatuses[stepId];
  const isStepComplete = status && ['submitted', 'approved', 'locked', 'completed'].includes(status);

  // Final Dashboard: always reachable when project exists (sidebar + cards)
  if (stepId === 'hr_policy_os' && projectId) {
    if (isStepComplete) {
      return 'completed';
    }
    return 'available';
  }

  if (isStepComplete) return 'completed';

  if (stepIndex === 0) {
    return currentStepKey === stepId ? 'current' : 'locked';
  }
  const isCeoDone = ceoPhilosophyStatus === 'completed';
  if (!isCeoDone) return 'locked';
  for (let i = 0; i < stepIndex; i++) {
    const prev = STEP_CONFIG[i];
    const prevStatus = stepStatuses[prev.id];
    if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) return 'locked';
  }
  return currentStepKey === stepId ? 'current' : 'locked';
}

function stagePctFor(stepId: string, stageProgressPercent?: StageProgressPercentMap): number {
  if (!stageProgressPercent) return 0;
  const v = stageProgressPercent[stepId as keyof StageProgressPercentMap];
  return typeof v === 'number' ? Math.min(100, Math.max(0, Math.round(v))) : 0;
}

function getStepRoute(stepId: string, projectId?: number | null): string {
  if (!projectId) return stepId === 'diagnosis' ? '/hr-manager/diagnosis' : '#';
  const base: Record<string, string> = {
    diagnosis: '/hr-manager/diagnosis',
    job_analysis: '/hr-manager/job-analysis',
    performance: '/hr-manager/performance-system',
    compensation: '/hr-manager/compensation-system',
    hr_policy_os: '/hr-manager/tree',
  };
  const path = base[stepId];
  if (!path) return '#';
  if (stepId === 'hr_policy_os') return `${path}/${projectId}`;
  return `${path}/${projectId}/overview`;
}

export default function PathFinderDashboard({
  workspaceDone = true,
  user = { name: 'HR Manager', email: 'hrm@company.com' },
  activeProject = null,
  company = null,
  progress = { completed: 0, total: 4, currentStepNumber: 1, currentStepKey: 'diagnosis' },
  stepStatuses = {},
  projectId = null,
  ceoPhilosophyStatus = 'not_started',
  stageProgressPercent,
}: PathFinderDashboardProps) {
  const { t } = useTranslation();
  const currentStepKey = progress.currentStepKey ?? 'diagnosis';
  const currentStepTitle = t(`steps.${currentStepKey}`);
  const companyName = company?.name ?? activeProject?.company?.name ?? null;
  const isCurrentStepSubmitted = (stepStatuses[currentStepKey] ?? 'not_started') === 'submitted';

  const phaseStatusText = useMemo(() => {
    const status = stepStatuses[currentStepKey] ?? 'not_started';
    const title = t(`steps.${currentStepKey}`);
    if (status === 'submitted') {
      return {
        title: t('pathfinder_dashboard.phase.submitted_title', { title }),
        hint: t('pathfinder_dashboard.phase.submitted_hint'),
      };
    }
    if (status === 'in_progress') {
      return {
        title: t('pathfinder_dashboard.phase.in_progress_title', { title }),
        hint: t('pathfinder_dashboard.phase.in_progress_hint'),
      };
    }
    return null;
  }, [currentStepKey, stepStatuses]);

  const stepCards = STEP_CONFIG.map((s, i) => {
    const state = getStepState(s.id, i, stepStatuses, currentStepKey, ceoPhilosophyStatus, projectId);
    const sp = stagePctFor(s.id, stageProgressPercent);
    let stepProgress = 0;
    if (state === 'completed') {
      stepProgress = 100;
    } else if (state === 'available') {
      stepProgress = sp;
    } else if (state === 'current' && s.id === currentStepKey) {
      stepProgress = sp;
    }
    return {
      ...s,
      step: s.num,
      title: t(`steps.${s.id}`),
      desc: t(`pathfinder_dashboard.steps.${s.id}_desc`),
      status: state,
      progress: stepProgress,
      stepStatus: stepStatuses[s.id],
    };
  });

  // First-time / no workspace: show onboarding screen (create company to get started)
  if (!workspaceDone) {
    const onboardingProgress = 0;
    return (
      <AppLayout stepStatuses={{}} projectId={undefined} ceoPhilosophyStatus="not_started">
        <Head title={t('pathfinder_dashboard.page_title')} />
            <div className="min-h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
          <div className="py-[30px] px-4 md:px-9">
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tracking-[-0.4px] leading-tight">
                {t('dashboard.pathfinder.welcome_back', { name: user.name })}
              </h1>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
                {t('dashboard.pathfinder.subtitle', { step: 1, title: t('steps.diagnosis') })}
              </p>
            </div>
            {/* Blue banner - Step 1 in progress */}
            <div className="bg-gradient-to-br from-[var(--hr-navy)] to-[var(--hr-navy-mid)] rounded-[14px] p-7 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 relative overflow-hidden">
              <div className="relative z-[1]">
                <h2 className="text-base font-bold text-white mb-1.5">{t('pathfinder_dashboard.step_1_in_progress')}</h2>
                <p className="text-[12.5px] text-white/55 max-w-[380px] leading-relaxed">
                  {t('dashboard.pathfinder.banner_desc')}
                </p>
              </div>
              <div className="flex items-center gap-6 relative z-[1]">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#4ecdc4" strokeWidth="5" strokeDasharray="163.4" strokeDashoffset={163.4 - (163.4 * onboardingProgress) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <strong className="text-[15px] font-bold text-white leading-none">{onboardingProgress}%</strong>
                    <span className="text-[9px] text-white/40 mt-0.5">{t('dashboard.pathfinder.complete', '완료')}</span>
                  </div>
                </div>
                <Link
                  href="/hr-manager/companies"
                  className="bg-[var(--hr-mint)] text-[var(--hr-navy-deep)] py-2.5 px-5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#5de0d7] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  {t('dashboard.pathfinder.continue', '계속하기')} →
                </Link>
              </div>
            </div>
            {/* Design Steps - Step 1 active, rest locked */}
            <div className="flex items-baseline justify-between mb-3.5">
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-[-0.2px]">{t('dashboard.pathfinder.design_steps')}</h3>
              <span className="text-[11.5px] text-slate-400 dark:text-slate-500">{t('dashboard.pathfinder.completed_count', { done: 0, total: 4 })}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1 - Active */}
              <div className="bg-white dark:bg-slate-900 border border-[#4ecdc4] rounded-xl p-5 pl-[22px] transition-all relative overflow-hidden shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)]">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad]" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">{t('pathfinder_dashboard.step_n', { n: 1 })}</span>
                    <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px]">● {t('dashboard.pathfinder.in_progress')}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(78,205,196,0.12)] flex items-center justify-center text-base mb-2.5">
                  <Building2 className="w-5 h-5 text-[#4ecdc4]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-[-0.2px]">{t('steps.diagnosis')}</h4>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{t('pathfinder_dashboard.steps.diagnosis_desc')}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                    <span>{t('dashboard.pathfinder.progress_label')}</span>
                    <span>{onboardingProgress}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] rounded transition-[width] duration-500" style={{ width: `${onboardingProgress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span />
                  <Link
                    href="/hr-manager/companies"
                    className="bg-[var(--hr-navy)] text-white py-2 px-4 rounded-[7px] text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--hr-navy-mid)] hover:-translate-y-0.5 transition-all"
                  >
                    {t('dashboard.pathfinder.start_btn', '시작하기')} →
                  </Link>
                </div>
              </div>
              {/* Steps 2–4 locked */}
              {STEP_CONFIG.slice(1, 4).map((step) => (
                <div key={step.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 opacity-70">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">{t('pathfinder_dashboard.step_n', { n: step.num })}</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px] inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {t('dashboard.pathfinder.locked')}
                      </span>
                    </div>
                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-[7px] flex items-center justify-center text-[13px]">
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1.5">{t(`steps.${step.id}`)}</h4>
                  <p className="text-[11.5px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4">{t(`pathfinder_dashboard.steps.${step.id}_desc`)}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {t('dashboard.pathfinder.prev_step_required_after')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout stepStatuses={stepStatuses} projectId={projectId ?? undefined} ceoPhilosophyStatus={ceoPhilosophyStatus}>
      <Head title={t('pathfinder_dashboard.page_title')} />
      <div className="min-h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
        <div className="py-[30px] px-4 md:px-9">
            {/* PAGE HEADER + COMPANY TAG */}
            <div className="mb-6">
              {companyName && (
                <div className="inline-flex items-center gap-1.5 bg-[var(--hr-mint-dim)] border border-[rgba(78,205,196,0.25)] rounded-[20px] py-[3px] pl-[6px] pr-2.5 mb-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--hr-mint)]" />
                  <span className="text-[11.5px] font-semibold text-[#2ea89e]">{companyName}</span>
                </div>
              )}
              <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tracking-[-0.4px] leading-tight">
                {t('dashboard.pathfinder.welcome_back', { name: user.name })}
              </h1>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
                {t('dashboard.pathfinder.subtitle', { step: progress.currentStepNumber, title: t(`steps.${currentStepKey}`) })}
              </p>
            </div>

            {/* Submitted - waiting for CEO banner */}
            {phaseStatusText && (
              <div className="mb-6 rounded-xl border border-[var(--hr-mint)] bg-[rgba(78,205,196,0.08)] px-5 py-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--hr-mint)] text-[var(--hr-navy-deep)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--hr-gray-800)]">
                    {phaseStatusText.title}
                  </p>
                  <p className="text-[12px] text-[var(--hr-gray-500)] mt-0.5">
                    {phaseStatusText.hint}
                  </p>
                </div>
              </div>
            )}

            {/* STAT CARDS */}
            <div className="grid grid=cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gradient-to-br from-[var(--hr-navy)] to-[var(--hr-navy-mid)] border-0 rounded-xl p-[18px] pr-5 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-[rgba(78,205,196,0.1)] pointer-events-none" />
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10.5px] font-semibold text-white/45 uppercase tracking-[0.6px]">{t('dashboard.pathfinder.overall_progress')}</span>
                  <span className="text-[9.5px] font-semibold py-0.5 px-1.5 rounded-[20px] bg-[rgba(78,205,196,0.15)] text-[var(--hr-mint)]">
                    {isCurrentStepSubmitted ? t('dashboard.pathfinder.submitted_short', 'Submitted') : t('dashboard.pathfinder.in_progress')}
                  </span>
                </div>
                <div className="text-[26px] font-bold text-white leading-none tracking-[-1px]">
                  {progress.completed} <sup className="text-[14px] font-medium text-white/40">/ {progress.total}</sup>
                </div>
                <div className="text-[11px] text-white/40 mt-1">{t('dashboard.pathfinder.completed_steps')}</div>
                <div className="absolute bottom-3.5 right-4 opacity-15">
                  <BarChart3 className="w-[22px] h-[22px] text-white" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-[18px] pr-5 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.6px] mb-2.5">{t('dashboard.pathfinder.ceo_survey')}</div>
                <div className={`text-[19px] font-bold mt-1 ${ceoPhilosophyStatus === 'completed' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {ceoPhilosophyStatus === 'completed' ? t('dashboard.pathfinder.complete') : ceoPhilosophyStatus === 'in_progress' ? t('dashboard.pathfinder.in_progress') : t('dashboard.pathfinder.not_started')}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  {ceoPhilosophyStatus === 'completed' ? '' : t('dashboard.pathfinder.ceo_survey_start_hint')}
                </div>
                <div className="absolute bottom-3.5 right-4 opacity-[0.08]">
                  <ClipboardList className="w-[22px] h-[22px] text-slate-800 dark:text-slate-100" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-[18px] pr-5 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.6px]">{t('dashboard.pathfinder.current_step')}</span>
                  <span className="text-[9.5px] font-semibold py-0.5 px-1.5 rounded-[20px] bg-[rgba(78,205,196,0.12)] text-[#2ea89e]">{t('dashboard.pathfinder.active')}</span>
                </div>
                <div className="text-[22px] font-bold text-slate-800 dark:text-slate-100 mt-1">{t('pathfinder_dashboard.step_n', { n: progress.currentStepNumber })}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">{currentStepTitle}</div>
                <div className="absolute bottom-3.5 right-4 opacity-[0.08]">
                  <Target className="w-[22px] h-[22px] text-slate-800 dark:text-slate-100" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-[18px] pr-5 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.6px] mb-2.5">{t('dashboard.pathfinder.steps_remaining')}</div>
                <div className="text-[26px] font-bold text-slate-800 dark:text-slate-100 leading-none tracking-[-1px]">{progress.total - progress.completed}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('dashboard.pathfinder.keep_going')}</div>
                <div className="absolute bottom-3.5 right-4 opacity-[0.08]">
                  <Unlock className="w-[22px] h-[22px] text-slate-800 dark:text-slate-100" />
                </div>
              </div>
            </div>

            {/* STEP PROGRESS STRIP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 px-6 flex items-center mb-6">
              {STEP_CONFIG.map((step, index) => {
                const isActive = step.id === currentStepKey;
                const isDone = progress.completed > index;
                const isLocked =
                  !(step.id === 'hr_policy_os' && projectId) && !isActive && !isDone;
                const hasLine = index < STEP_CONFIG.length - 1;
                const lineDone = isDone;
                const lineActive = isActive && !isDone;
                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center gap-2 relative">
                    {hasLine && (
                      <div
                        className="absolute top-[14px] left-[calc(50%+14px)] w-[calc(100%-28px)] h-0.5 pointer-events-none"
                        style={{
                          background: lineDone ? 'var(--hr-mint)' : lineActive ? 'linear-gradient(90deg, var(--hr-mint) 30%, var(--hr-gray-200) 100%)' : 'var(--hr-gray-200)',
                        }}
                      />
                    )}
                    <div
                      className={`relative z-[1] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border-2 ${
                        isLocked
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                          : isActive
                          ? 'bg-[var(--hr-mint)] text-[var(--hr-navy-deep)] border-[var(--hr-mint)] shadow-[0_0_0_4px_rgba(78,205,196,0.15)]'
                          : 'bg-[var(--hr-mint)] text-[var(--hr-navy-deep)] border-[var(--hr-mint)]'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : step.num}
                    </div>
                    <span className={`text-[10.5px] font-medium text-center relative z-[1] ${isActive ? 'text-[var(--hr-navy)] font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* DESIGN STEPS */}
            <div className="flex items-baseline justify-between mb-3.5">
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-[-0.2px]">{t('dashboard.pathfinder.design_steps')}</h3>
              <span className="text-[11.5px] text-slate-400 dark:text-slate-500">{t('dashboard.pathfinder.completed_count', { done: progress.completed, total: progress.total })}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {stepCards.map((card) =>
                card.fullWidth ? (
                  card.status === 'completed' ? (
                    <div
                      key={card.step}
                      className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between py-[18px] px-[22px] rounded-xl border border-[var(--hr-mint)] bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-[9px] bg-[rgba(78,205,196,0.15)] flex items-center justify-center text-base">
                          <CheckCircle2 className="w-4 h-4 text-[#2ea89e]" />
                        </div>
                        <div>
                          <div className="flex gap-1.5 mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">{t('pathfinder_dashboard.step_n', { n: card.step })}</span>
                            <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />{t('dashboard.pathfinder.complete')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{card.title}</h4>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mb-0">{card.desc}</p>
                        </div>
                      </div>
                      <Link href={getStepRoute(card.id, projectId)} className="text-[12px] font-semibold text-[var(--hr-navy)] hover:text-[var(--hr-navy-mid)]">
                        {t('buttons.view', 'View')} →
                      </Link>
                    </div>
                  ) : card.status === 'current' ? (
                    <div key={card.step} className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between py-[18px] px-[22px] rounded-xl border border-[#4ecdc4] bg-white dark:bg-slate-900 shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-[9px] bg-[rgba(78,205,196,0.12)] flex items-center justify-center text-base">
                          <Building2 className="w-4 h-4 text-[#4ecdc4]" />
                        </div>
                        <div>
                          <div className="flex gap-1.5 mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">{t('pathfinder_dashboard.step_n', { n: card.step })}</span>
                            <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px]">● {t('dashboard.pathfinder.in_progress')}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{card.title}</h4>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mb-0">{card.desc}</p>
                        </div>
                      </div>
                      <Link href={getStepRoute(card.id, projectId)} className="bg-[var(--hr-navy)] text-white py-2 px-4 rounded-[7px] text-xs font-semibold hover:bg-[var(--hr-navy-mid)]">
                        {t('dashboard.pathfinder.continue')} →
                      </Link>
                    </div>
                  ) : card.status === 'available' ? (
                    <div
                      key={card.step}
                      className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-[18px] px-[22px] rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-[9px] bg-[rgba(78,205,196,0.12)] flex items-center justify-center text-base flex-shrink-0">
                          <BarChart3 className="w-4 h-4 text-[#4ecdc4]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                              {t('pathfinder_dashboard.step_n', { n: card.step })}
                            </span>
                            <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px]">
                              {t('dashboard.pathfinder.always_open', 'Always open')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{card.title}</h4>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mb-3">{card.desc}</p>
                          <div className="mb-1 max-w-md">
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                              <span>{t('dashboard.pathfinder.progress_label')}</span>
                              <span>{card.progress}%</span>
                            </div>
                            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] rounded transition-[width] duration-500 ease-out"
                                style={{ width: `${card.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={getStepRoute(card.id, projectId)}
                        className="bg-[var(--hr-navy)] text-white py-2 px-4 rounded-[7px] text-xs font-semibold hover:bg-[var(--hr-navy-mid)] flex-shrink-0"
                      >
                        {t('buttons.view', 'View')} →
                      </Link>
                    </div>
                  ) : (
                  <div
                    key={card.step}
                    className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between py-[18px] px-[22px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-[9px] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-base">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <div className="flex gap-1.5 mb-1.5">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                            {t('pathfinder_dashboard.step_n', { n: card.step })}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                            {t('dashboard.pathfinder.locked')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1">{card.title}</h4>
                        <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mb-0">{card.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {t('dashboard.pathfinder.prev_step_required_after')}
                    </div>
                  </div>
                  )
                ) : card.status === 'completed' ? (
                  <div
                    key={card.step}
                    className="bg-white dark:bg-slate-900 border border-[var(--hr-mint)] rounded-xl p-5 pl-[22px] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--hr-mint)]" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                          {t('pathfinder_dashboard.step_n', { n: card.step })}
                        </span>
                        <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('dashboard.pathfinder.complete')}
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-[10px] bg-[rgba(78,205,196,0.15)] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#2ea89e]" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-[-0.2px]">{card.title}</h4>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{card.desc}</p>
                    {card.id === 'diagnosis' && card.stepStatus === 'submitted' && (
                      <p className="text-[11px] text-[#2ea89e] font-medium mb-4">
                        {t('dashboard.pathfinder.submitted_wait_ceo', 'Diagnosis submitted — waiting for CEO review')}
                      </p>
                    )}
                    <Link
                      href={getStepRoute(card.id, projectId)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hr-navy)] hover:text-[var(--hr-navy-mid)]"
                    >
                      {t('buttons.view', 'View')} →
                    </Link>
                  </div>
                ) : card.status === 'current' ? (
                  <div
                    key={card.step}
                    className="bg-white dark:bg-slate-900 border border-[#4ecdc4] rounded-xl p-5 pl-[22px] transition-all relative overflow-hidden shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad]" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                          {t('pathfinder_dashboard.step_n', { n: card.step })}
                        </span>
                        <span className="text-[10px] font-semibold text-[#2ea89e] bg-[var(--hr-mint-dim)] py-0.5 px-2 rounded-[20px]">
                          ● {t('dashboard.pathfinder.in_progress')}
                        </span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-[10px] bg-[rgba(78,205,196,0.12)] flex items-center justify-center text-base mb-2.5">
                      <Building2 className="w-5 h-5 text-[#4ecdc4]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-[-0.2px]">{card.title}</h4>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{card.desc}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                        <span>{t('dashboard.pathfinder.progress_label')}</span>
                        <span>{card.progress}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] rounded transition-[width] duration-500 ease-out"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span />
                      <Link
                        href={getStepRoute(card.id, projectId)}
                        className="bg-[var(--hr-navy)] text-white py-2 px-4 rounded-[7px] text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--hr-navy-mid)] hover:-translate-y-0.5 transition-all"
                      >
                        {card.progress === 0 ? t('dashboard.pathfinder.start_btn') : t('dashboard.pathfinder.continue')} →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div
                    key={card.step}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 opacity-70"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px]">
                            {t('pathfinder_dashboard.step_n', { n: card.step })}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-[20px] inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            {t('dashboard.pathfinder.locked')}
                        </span>
                      </div>
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-[7px] flex items-center justify-center text-[13px]">
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1.5">{card.title}</h4>
                    <p className="text-[11.5px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4">{card.desc}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {t('dashboard.pathfinder.prev_step_required_after')}
                    </div>
                  </div>
                )
              )}
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
