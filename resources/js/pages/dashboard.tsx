import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    Users,
    Calendar,
    Building2,
    Target,
    Wallet,
    ArrowRight,
    Lock,
    Check,
} from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function Dashboard() {
    const progressSteps = [
        { id: 1, label: 'Diagnosis', state: 'completed' },
        { id: 2, label: 'Organization', state: 'current' },
        { id: 3, label: 'Performance', state: 'locked' },
        { id: 4, label: 'Compensation', state: 'locked' },
    ] as const;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                <Head title="Dashboard" />
                
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-display font-bold tracking-tight">Welcome back, Sarah</h1>
                                </div>
                                <p className="text-muted-foreground mt-1">Continue building your company's HR system</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Progress</p>
                                    <p className="text-2xl font-bold">1 / 4</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">CEO Survey</p>
                                    <p className="text-2xl font-bold">Not Started</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Step</p>
                                    <p className="text-2xl font-bold">Step 2</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Tracker */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 pb-4">
                            <h3 className="font-semibold tracking-tight text-lg">HR System Design Progress</h3>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="flex items-center justify-between">
                                {progressSteps.map((step, index) => {
                                    const isCompleted = step.state === 'completed';
                                    const isCurrent = step.state === 'current';
                                    return (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                        isCompleted
                                                            ? 'bg-success/10 text-success border-success'
                                                            : isCurrent
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-muted text-muted-foreground border-border'
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : step.state === 'locked' ? (
                                                        <Lock className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <span className="text-sm font-semibold">{step.id}</span>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <p
                                                        className={`text-xs font-medium ${
                                                            isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < progressSteps.length - 1 && (
                                                <div
                                                    className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${
                                                        isCompleted ? 'bg-success' : 'bg-border'
                                                    }`}
                                                ></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Design Steps */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Design Steps</h2>
                        <div className="grid gap-4">
                        <Link href="/diagnosis?tab=overview" className="rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-300 card-hover cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-success/10 text-success">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-muted-foreground">Step 1</span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">Submitted</span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1 truncate">Diagnosis</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">Input company information, business profile, workforce details, and organizational culture.</p>
                                        </div>
                                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3 flex-shrink-0">
                                            Edit
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                            
                            {[
                                { step: 2, title: 'Organization Design', desc: 'Define organization structure, job grades, titles, and managerial roles.', icon: Building2 },
                                { step: 3, title: 'Performance System', desc: 'Design evaluation units, performance management methods, and assessment structures.', icon: Target },
                                { step: 4, title: 'Compensation System', desc: 'Define compensation structure, differentiation methods, and incentive components.', icon: Wallet }
                            ].map((item) => (
                                <div key={item.step} className="rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-300 opacity-60">
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-muted-foreground">Step {item.step}</span>
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Locked</span>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-1 truncate">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA Section */}
                    <div className="rounded-lg border bg-card shadow-sm gradient-primary text-white">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Ready to continue?</h3>
                                <p className="text-white/80">Pick up where you left off and complete your HR system design.</p>
                            </div>
                        <Link href="/diagnosis?tab=overview" className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8 whitespace-nowrap">
                                Continue Step 1
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
