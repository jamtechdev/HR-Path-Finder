import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, FolderOpen, Target, Network, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CEOSidebarProps {
    isCollapsed?: boolean;
}

interface Project {
    id: number;
    company?: { name: string } | null;
    step_statuses?: Record<string, string>;
    kpi_review_status?: string;
    kpi_total?: number;
    kpi_approved?: number;
}

export default function CEOSidebar({ isCollapsed = false }: CEOSidebarProps) {
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];

    const projects: Project[] = (props as any).projects || [];
    const currentProjectId = (props as any).project?.id || (props as any).hrProject?.id;

    const isActive = (path: string) => {
        if (path === '/') return currentPath === '/';
        if (path === '/ceo/dashboard') return currentPath === '/ceo/dashboard' || currentPath.startsWith('/ceo/dashboard/');
        if (path === '/ceo/projects') return currentPath === '/ceo/projects' || currentPath.startsWith('/ceo/projects/') || currentPath.startsWith('/ceo/review/') || currentPath.startsWith('/ceo/philosophy/') || currentPath.startsWith('/ceo/final-review/');
        if (path === '/ceo/kpi-review') return currentPath.startsWith('/ceo/kpi-review/');
        if (path.startsWith('/ceo/tree/')) return currentPath.startsWith('/ceo/tree/');
        if (path.startsWith('/ceo/report/')) return currentPath.startsWith('/ceo/report/');
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const projectsWithKpis = projects.filter((p) => (p.kpi_total ?? 0) > 0);

    const menuItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { href: '/ceo/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { href: '/ceo/projects', label: 'Projects', icon: FolderOpen },
    ];
    if (currentProjectId) {
        menuItems.push({ href: `/ceo/tree/${currentProjectId}/overview`, label: 'Tree', icon: Network });
        menuItems.push({ href: `/ceo/report/${currentProjectId}`, label: 'Report', icon: FileBarChart });
    }
    if (isCollapsed && projectsWithKpis.length > 0) {
        menuItems.push({ href: `/ceo/kpi-review/${projectsWithKpis[0].id}`, label: 'KPI Review', icon: Target });
    }

    const kpiStatusLabel = (status: string) => {
        if (status === 'approved') return 'Approved';
        if (status === 'revision_requested') return 'Revision requested';
        if (status === 'pending') return 'Pending';
        if (status === 'in_progress') return 'In Progress';
        return '—';
    };

    return (
        <div className="relative flex h-full w-full flex-col bg-[#111d35] min-h-0">
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[rgba(78,205,196,0.3)] to-transparent pointer-events-none" aria-hidden />

            <div className="py-[18px] px-5 border-b border-white/[0.06] flex items-center gap-2.5 flex-shrink-0 relative">
                <div className="w-8 h-8 bg-[#4ecdc4] rounded-lg flex items-center justify-center font-bold text-[13px] text-[#111d35] flex-shrink-0">
                    HR
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <strong className="text-[13px] font-bold text-white tracking-[-0.2px] leading-tight">HR Path-Finder</strong>
                        <span className="text-[10px] text-[#9ba5bc] font-normal">by BetterCompany</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-5 px-3 pb-2 min-h-0">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mb-1.5">Menu</div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-[9px] py-2 px-2.5 rounded-lg mb-0.5 transition-colors relative',
                                active ? 'bg-[rgba(78,205,196,0.12)]' : 'hover:bg-white/[0.06]'
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-[#4ecdc4] rounded-r-[2px]" />
                            )}
                            <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'opacity-100 text-[#4ecdc4]' : 'opacity-70 text-white')} />
                            {!isCollapsed && (
                                <span className={cn('text-[12.5px] font-medium', active ? 'text-[#4ecdc4] font-semibold' : 'text-white/60')}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* KPI Review: all projects with KPIs (old & new) – CEO review status */}
                {!isCollapsed && projectsWithKpis.length > 0 && (
                    <>
                        <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mt-4 mb-1.5">KPI Review (all)</div>
                        <div className="space-y-0.5">
                            {projectsWithKpis.map((project) => {
                                const href = `/ceo/kpi-review/${project.id}`;
                                const active = currentPath === href || currentPath.startsWith(href + '/');
                                const status = project.kpi_review_status ?? 'none';
                                const label = project.company?.name ?? `Project ${project.id}`;
                                return (
                                    <Link
                                        key={project.id}
                                        href={href}
                                        className={cn(
                                            'flex items-center justify-between gap-2 py-2 px-2.5 rounded-lg transition-colors relative',
                                            active ? 'bg-[rgba(78,205,196,0.12)]' : 'hover:bg-white/[0.06]'
                                        )}
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-[#4ecdc4] rounded-r-[2px]" />
                                        )}
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Target className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'text-[#4ecdc4]' : 'text-white/70')} />
                                            <span className={cn('text-[12px] font-medium truncate', active ? 'text-[#4ecdc4]' : 'text-white/80')}>{label}</span>
                                        </div>
                                        <span
                                            className={cn(
                                                'flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded',
                                                status === 'approved' && 'bg-emerald-500/20 text-emerald-400',
                                                status === 'revision_requested' && 'bg-orange-500/20 text-orange-400',
                                                status === 'pending' && 'bg-amber-500/20 text-amber-400',
                                                (status === 'in_progress' || status === 'none') && 'bg-white/10 text-white/70'
                                            )}
                                        >
                                            {kpiStatusLabel(status)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
                {!isCollapsed && projectsWithKpis.length === 0 && (
                    <>
                        <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mt-4 mb-1.5">KPI Review (all)</div>
                        <p className="text-[11px] text-white/50 px-2 py-1">No KPIs yet</p>
                    </>
                )}
            </div>
        </div>
    );
}
