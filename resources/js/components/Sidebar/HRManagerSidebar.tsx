import { Link, usePage } from '@inertiajs/react';
import { Target, DollarSign, Building2, LayoutGrid, Award, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StepConfig {
    id: string;
    step: number;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
}

const MAIN_STEPS: StepConfig[] = [
    { id: 'diagnosis', step: 1, name: 'Diagnosis', icon: Building2, route: '/hr-manager/diagnosis' },
    { id: 'job_analysis', step: 2, name: 'Job Analysis', icon: Building2, route: '/hr-manager/job-analysis' },
    { id: 'performance', step: 3, name: 'Performance System', icon: Target, route: '/hr-manager/performance-system' },
    { id: 'compensation', step: 4, name: 'Compensation System', icon: DollarSign, route: '/hr-manager/compensation-system' },
    { id: 'hr_policy_os', step: 5, name: 'Final Dashboard', icon: Award, route: '/hr-manager/tree' },
    { id: 'report', step: 6, name: 'Report', icon: FileText, route: '/hr-manager/report' },
];

export default function HRManagerSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
    const { t } = useTranslation();
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    const stepStatuses: Record<string, string> = (props as any).stepStatuses
        || (props as any).mainStepStatuses
        || (props as any).step_statuses
        || (props as any).activeProject?.step_statuses
        || {};
    const projectId = (props as any).projectId || (props as any).project?.id;
    const ceoPhilosophyStatus = (props as any).ceoPhilosophyStatus || 'not_started';
    const appName = (props as any).appConfig?.name || 'HR Path-Finder';
    const appLogo = (props as any).appConfig?.logo || '/logo.svg';

    const isDashboardActive = currentPath === '/hr-manager/dashboard' || currentPath.startsWith('/hr-manager/dashboard/');
    const isCompaniesActive = currentPath === '/hr-manager/companies' || currentPath.startsWith('/hr-manager/companies/');

    const getStepState = (stepId: string): 'current' | 'locked' | 'completed' => {
        const status = stepStatuses[stepId];
        const stepIndex = MAIN_STEPS.findIndex((s) => s.id === stepId);
        const isStepActive = currentPath.startsWith(MAIN_STEPS.find((s) => s.id === stepId)?.route ?? '');
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        const diagnosisStatus = stepStatuses['diagnosis'];
        const diagnosisOk = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);

        if ((stepId === 'hr_policy_os' || stepId === 'report') && projectId) {
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
            if (status === 'submitted') {
                return 'current';
            }
            return 'current';
        }

        if (stepId === 'diagnosis') {
            if (status && ['approved', 'locked', 'completed'].includes(status)) return 'completed';
            if (status === 'submitted') return 'current';
        } else {
            if (status && ['approved', 'locked', 'completed'].includes(status)) return 'completed';
        }
        if (isStepActive) return 'current';
        if (status === 'submitted') return 'current';
        if (stepIndex === 0 && (!status || status === 'not_started')) return 'current';
        if (stepIndex > 0) {
            if (!isCeoSurveyCompleted) return 'locked';
            for (let i = 0; i < stepIndex; i++) {
                const prevStatus = stepStatuses[MAIN_STEPS[i].id];
                if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) return 'locked';
            }
            if (!status || status === 'not_started' || status === 'in_progress') return 'current';
        }
        return 'locked';
    };

    const isStepActuallyLocked = (stepId: string): boolean => {
        // Final Dashboard (step 5) is always reachable when a project exists
        if ((stepId === 'hr_policy_os' || stepId === 'report') && projectId) {
            return false;
        }
        const status = stepStatuses[stepId] ?? 'not_started';
        const stepIndex = MAIN_STEPS.findIndex((s) => s.id === stepId);
        if (stepIndex === 0) return false;
        if (currentPath.startsWith(MAIN_STEPS.find((s) => s.id === stepId)?.route ?? '')) return false;
        if (status === 'submitted' || status === 'in_progress') return false;
        if (status && ['approved', 'locked', 'completed'].includes(status)) return false;
        if (ceoPhilosophyStatus !== 'completed' && stepId !== 'diagnosis') return true;
        for (let i = 0; i < stepIndex; i++) {
            const prevStatus = stepStatuses[MAIN_STEPS[i].id];
            if (!prevStatus || !['submitted', 'approved', 'locked', 'completed'].includes(prevStatus)) return true;
        }
        return false;
    };

    const getStepRoute = (step: StepConfig): string => {
        if (!projectId) return step.id === 'diagnosis' ? step.route : '#';
        if (step.id === 'hr_policy_os') return `/hr-manager/tree/${projectId}`;
        if (step.id === 'report') return `/hr-manager/report/${projectId}`;
        return `${step.route}/${projectId}/overview`;
    };

    return (
        <div className="relative flex h-full w-full flex-col bg-[#111d35] min-h-0">
            {/* Right edge gradient line */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[rgba(78,205,196,0.3)] to-transparent pointer-events-none" aria-hidden />

            {/* Logo */}
            <div className="py-[18px] px-5 border-b border-white/[0.06] flex items-center gap-2.5 flex-shrink-0 relative">
                <div className="w-8 h-8 bg-[#4ecdc4] rounded-lg flex items-center justify-center font-bold text-[13px] text-[#111d35] flex-shrink-0 overflow-hidden">
                    <img src={appLogo} alt={appName} className="w-6 h-6 object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <strong className="text-[13px] font-bold text-white tracking-[-0.2px] leading-tight">{appName}</strong>
                        <span className="text-[10px] text-[#9ba5bc] font-normal">by BetterCompany</span>
                    </div>
                )}
            </div>

            {/* Scrollable section */}
            <div className="flex-1 overflow-y-auto py-5 px-3 pb-2 min-h-0">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mb-1.5">{t('sidebar.menu')}</div>

                <Link
                    href="/hr-manager/dashboard"
                    className={`flex items-center gap-[9px] py-2 px-2.5 rounded-lg mb-0.5 transition-colors relative ${isDashboardActive ? 'bg-[rgba(78,205,196,0.12)]' : 'hover:bg-white/[0.06]'}`}
                >
                    {isDashboardActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-[#4ecdc4] rounded-r-[2px]" />
                    )}
                    <LayoutGrid className={`w-[18px] h-[18px] flex-shrink-0 ${isDashboardActive ? 'opacity-100 text-[#4ecdc4]' : 'opacity-70 text-white'}`} />
                    {!isCollapsed && (
                        <span className={`text-[12.5px] font-medium ${isDashboardActive ? 'text-[#4ecdc4] font-semibold' : 'text-white/60'}`}>
                            {t('navigation.dashboard')}
                        </span>
                    )}
                </Link>

                <Link
                    href="/hr-manager/companies"
                    className={`flex items-center gap-[9px] py-2 px-2.5 rounded-lg mb-0.5 transition-colors relative ${isCompaniesActive ? 'bg-[rgba(78,205,196,0.12)]' : 'hover:bg-white/[0.06]'}`}
                >
                    {isCompaniesActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-[#4ecdc4] rounded-r-[2px]" />
                    )}
                    <Building2 className={`w-[18px] h-[18px] flex-shrink-0 ${isCompaniesActive ? 'opacity-100 text-[#4ecdc4]' : 'opacity-70 text-white'}`} />
                    {!isCollapsed && (
                        <span className={`text-[12.5px] font-medium ${isCompaniesActive ? 'text-[#4ecdc4] font-semibold' : 'text-white/60'}`}>
                            {t('navigation.companies')}
                        </span>
                    )}
                </Link>

                <div className="mt-4">
                    <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mb-1.5 mt-2">{t('sidebar.design_steps')}</div>
                    {MAIN_STEPS.map((step) => {
                        const state = getStepState(step.id);
                        const locked = isStepActuallyLocked(step.id);
                        const active = state === 'current' || state === 'completed';
                        const href = getStepRoute(step);
                        const StepIcon = step.icon;

                        if (locked) {
                            return (
                                <div
                                    key={step.id}
                                    className="flex items-center gap-[9px] py-1.5 px-2.5 rounded-[7px] mb-0.5 opacity-45 cursor-not-allowed"
                                >
                                    <div className="w-5 h-5 rounded-full border-[1.5px] border-white/20 flex items-center justify-center text-[9px] font-bold flex-shrink-0 text-white/40">
                                        {step.step}
                                    </div>
                                    {!isCollapsed && <span className="text-[11.5px] text-white/50">{t(`steps.${step.id}`)}</span>}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={step.id}
                                href={href}
                                className={`flex items-center gap-[9px] py-1.5 px-2.5 rounded-[7px] mb-0.5 transition-all cursor-pointer ${
                                    active ? 'opacity-100 bg-[rgba(78,205,196,0.08)]' : 'opacity-45 hover:opacity-65'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 border-[1.5px] ${
                                        active
                                            ? 'border-[#4ecdc4] bg-[#4ecdc4] text-[#111d35]'
                                            : 'border-white/20 text-white/40'
                                    }`}
                                >
                                    {step.step}
                                </div>
                                {!isCollapsed && (
                                    <span className={`text-[11.5px] ${active ? 'text-white/90 font-medium' : 'text-white/50 font-normal'}`}>
                                        {t(`steps.${step.id}`)}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
