import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, Building2, Target, Wallet, FileText, UserPlus } from 'lucide-react';

export default function HRManagerSidebar() {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    return (
        <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 w-64">
            <div className="flex flex-col h-full">
                <div className="flex items-center h-16 px-4 border-b border-sidebar-border gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HR</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-semibold text-sidebar-foreground text-sm">HR Path-Finder</span>
                        <span className="text-[10px] text-sidebar-foreground/60">by BetterCompany</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-4 px-2 overflow-y-auto">
                    <div className="space-y-1">
                        <Link
                            href="/dashboard"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/dashboard')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span className="flex-1 text-left truncate">Dashboard</span>
                        </Link>
                        
                        <Link
                            href="/diagnosis?tab=overview"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/diagnosis')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Diagnosis</span>
                        </Link>
                        
                        <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/30 cursor-not-allowed">
                            <Building2 className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Organization</span>
                            <div className="w-2 h-2 rounded-full bg-sidebar-foreground/20"></div>
                        </button>
                        
                        <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/30 cursor-not-allowed">
                            <Target className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Performance</span>
                            <div className="w-2 h-2 rounded-full bg-sidebar-foreground/20"></div>
                        </button>
                        
                        <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/30 cursor-not-allowed">
                            <Wallet className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Compensation</span>
                            <div className="w-2 h-2 rounded-full bg-sidebar-foreground/20"></div>
                        </button>
                        
                        <Link
                            href="/hr-system-output"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/hr-system-output')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">HR System Output</span>
                        </Link>
                    </div>
                    
                    {/* CEO Management Section */}
                    <div className="mt-4 pt-4 border-t border-sidebar-border">
                        <div className="px-3 mb-2">
                            <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Management</span>
                        </div>
                        <div className="space-y-1">
                            <Link
                                href="/ceos"
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive('/ceos')
                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                                }`}
                            >
                                <UserPlus className="w-5 h-5 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">CEO Management</span>
                            </Link>
                            
                            <Link
                                href="/companies"
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive('/companies')
                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                                }`}
                            >
                                <Building2 className="w-5 h-5 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">Companies</span>
                            </Link>
                        </div>
                    </div>
                </nav>
                
                <div className="p-3 border-t border-sidebar-border">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">HM</span>
                        </span>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">HR Manager</p>
                            <p className="text-xs text-sidebar-foreground/60 truncate">hr@company.com</p>
                        </div>
                    </button>
                </div>
            </div>
        </aside>
    );
}