import { Link } from '@inertiajs/react';
import { CheckCircle, Clock, Building2, FileText, Users } from 'lucide-react';

export default function CEOSidebar() {
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
                        <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-sidebar-accent text-sidebar-primary">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span className="flex-1 text-left truncate">Dashboard</span>
                        </Link>
                        
                        <Link href="/dashboard/ceo/approvals" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Pending Approvals</span>
                        </Link>
                        
                        <Link href="/companies" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                            <Building2 className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Companies</span>
                        </Link>
                        
                        <Link href="/ceo-philosophy" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                            <Users className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">CEO Philosophy</span>
                        </Link>
                        
                        <Link href="/reports" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Reports</span>
                        </Link>
                    </div>
                </nav>
                
                <div className="p-3 border-t border-sidebar-border">
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">CEO</span>
                        </span>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">CEO</p>
                            <p className="text-xs text-sidebar-foreground/60 truncate">ceo@company.com</p>
                        </div>
                    </button>
                </div>
            </div>
        </aside>
    );
}