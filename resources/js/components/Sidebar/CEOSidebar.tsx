import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Building2, Target, FileBarChart, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CEOSidebarProps {
    isCollapsed?: boolean;
}

export default function CEOSidebar({ isCollapsed = false }: CEOSidebarProps) {
    const { url, props } = usePage<any>();
    const currentPath = url.split('?')[0];
    const appName = props?.appConfig?.name || 'HR Path-Finder';
    const appLogo = props?.appConfig?.logo || '/logo.svg';

    const menuItems: {
        href: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        isActive: (path: string) => boolean;
    }[] = [
        {
            href: '/ceo/dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
            isActive: (path) => path === '/ceo/dashboard' || path.startsWith('/ceo/dashboard/'),
        },
        {
            href: '/ceo/projects',
            label: 'Companies',
            icon: Building2,
            isActive: (path) => path === '/ceo/projects' || path.startsWith('/ceo/projects/'),
        },
        {
            href: '/ceo/kpi-review',
            label: 'KPI Review (all)',
            icon: Target,
            isActive: (path) => path === '/ceo/kpi-review' || path.startsWith('/ceo/kpi-review/'),
        },
        {
            href: '/ceo/tree',
            label: 'Tree',
            icon: FolderKanban,
            isActive: (path) => path === '/ceo/tree' || path.startsWith('/ceo/tree/'),
        },
        {
            href: '/ceo/report',
            label: 'Report',
            icon: FileBarChart,
            isActive: (path) => path === '/ceo/report' || path.startsWith('/ceo/report/'),
        },
    ];

    return (
        <div className="relative flex h-full w-full flex-col bg-[#111d35] min-h-0">
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[rgba(78,205,196,0.3)] to-transparent pointer-events-none" aria-hidden />

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

            <div className="flex-1 overflow-y-auto py-5 px-3 pb-2 min-h-0">
                <div className="text-[9px] font-semibold tracking-[1.2px] uppercase text-[rgba(155,165,188,0.5)] px-2 mb-1.5">Menu</div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.isActive(currentPath);
                    return (
                        <Link
                            key={`${item.href}-${item.label}`}
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
            </div>
        </div>
    );
}
