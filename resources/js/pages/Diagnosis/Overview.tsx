import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisTabs from '@/components/Diagnosis/DiagnosisTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Diagnosis {
    id: number;
    status: string;
}

interface Project {
    id: number;
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
}

interface Props {
    project: Project;
    company: Project['company'];
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

const CATEGORIES = [
    { id: 'company-info', name: 'Company Info', route: 'company-info' },
    { id: 'workforce', name: 'Workforce', route: 'workforce' },
    { id: 'organizational-charts', name: 'Org Charts', route: 'organizational-charts' },
    { id: 'organizational-structure', name: 'Org Structure', route: 'organizational-structure' },
    { id: 'hr-issues', name: 'HR Issues', route: 'hr-issues' },
];

export default function DiagnosisOverview({ 
    project, 
    company, 
    diagnosis, 
    activeTab, 
    diagnosisStatus,
    stepStatuses,
    projectId 
}: Props) {
    const getStartRoute = () => {
        if (projectId) {
            return `/hr-manager/diagnosis/${projectId}/company-info`;
        }
        return `/hr-manager/diagnosis/company-info`;
    };

    // Calculate progress - filter out overview tab
    const displayTabs = diagnosisTabs.filter(tab => tab.id !== 'overview');
    const completedCount = displayTabs.filter(tab => {
        // Review tab is completed when diagnosis is submitted
        if (tab.id === 'review') {
            return diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        }
        const status = stepStatuses[tab.id];
        return status && ['submitted', 'approved', 'locked', 'completed', 'in_progress'].includes(status);
    }).length;

    // Get status for header
    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        if (diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked') {
            return 'submitted';
        }
        if (diagnosisStatus === 'in_progress' || completedCount > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    const getBackHref = () => {
        if (projectId) {
            return `/hr-manager/diagnosis/${projectId}`;
        }
        return '/hr-manager/diagnosis';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={`Step 1: Diagnosis - ${company?.name || project?.company?.name || 'Company'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header - Match reference */}
                        <div className="mb-6">
                            <DiagnosisHeader
                                title="Step 1: Diagnosis"
                                description="Input company information and organizational context."
                                status={getStatusForHeader()}
                                backHref={getBackHref()}
                            />
                        </div>

                        {/* Progress Overview - Match reference */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Overview</span>
                                <span className="text-sm text-gray-600">{completedCount} of {displayTabs.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className="bg-primary h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${(completedCount / displayTabs.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Tabs Navigation - Match reference */}
                        <div className="mb-8">
                            <DiagnosisTabs
                                tabs={diagnosisTabs}
                                activeTab={activeTab as any}
                                stepStatus={stepStatuses}
                                stepOrder={diagnosisTabs.map(t => t.id)}
                                projectId={projectId}
                                diagnosisStatus={diagnosisStatus as any}
                                diagnosis={diagnosis}
                            />
                        </div>

                        {/* Main Content Card - Match reference */}
                        <Card className="shadow-lg">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    {/* Icon */}
                                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-md">
                                        <FileText className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                            Company Diagnosis
                                        </h1>
                                    </div>

                                    {/* Description */}
                                    <p className="text-base md:text-lg text-gray-600 max-w-lg leading-relaxed">
                                        In this step, you'll provide comprehensive information about your company, including basic info, industry, workforce composition, organizational structure, and HR issues. This data will serve as the foundation for designing your HR system.
                                    </p>

                                    {/* Category Tags */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 pt-2">
                                        {CATEGORIES.map((category) => (
                                            <span
                                                key={category.id}
                                                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Start Button */}
                                    <div className="pt-4">
                                        <Link href={getStartRoute()}>
                                            <Button 
                                                size="lg" 
                                                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                                Start Diagnosis
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
