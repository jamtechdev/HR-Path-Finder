import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisTabs from '@/components/Diagnosis/DiagnosisTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
    
    // Validation function (same as in DiagnosisTabs)
    const validateStepCompletion = (tabId: string, diagnosis: any): boolean => {
        if (!diagnosis) return false;

        switch (tabId) {
            case 'company-info':
                return !!(diagnosis.industry_category && diagnosis.industry_category.trim() !== '');
            case 'workforce':
                return !!(diagnosis.present_headcount && diagnosis.present_headcount > 0);
            case 'organizational-charts':
                if (diagnosis.organizational_charts) {
                    if (Array.isArray(diagnosis.organizational_charts)) {
                        return diagnosis.organizational_charts.length > 0;
                    }
                    return Object.keys(diagnosis.organizational_charts).length > 0;
                }
                return false;
            case 'organizational-structure':
                const structure = diagnosis.org_structure_types || diagnosis.organizational_structure;
                if (structure) {
                    if (Array.isArray(structure)) {
                        return structure.length > 0;
                    }
                    return Object.keys(structure).length > 0;
                }
                return false;
            case 'job-structure':
                return !!((diagnosis.job_categories && diagnosis.job_categories.length > 0) ||
                         (diagnosis.job_functions && diagnosis.job_functions.length > 0));
            case 'hr-issues':
                return !!(diagnosis.hr_issues && 
                         (Array.isArray(diagnosis.hr_issues) ? diagnosis.hr_issues.length > 0 : false)) ||
                       !!(diagnosis.custom_hr_issues && diagnosis.custom_hr_issues.trim() !== '');
            case 'review':
                return diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
            default:
                return false;
        }
    };
    
    const completedCount = displayTabs.filter(tab => {
        // Review tab is completed when diagnosis is submitted
        if (tab.id === 'review') {
            return diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
        }
        
        const status = stepStatuses[tab.id];
        const isStatusCompleted = status && (
            status === true || 
            status === 'completed' ||
            status === 'submitted' || 
            status === 'approved' || 
            status === 'locked'
        );
        
        // Check if step has required fields filled
        return isStatusCompleted || validateStepCompletion(tab.id, diagnosis);
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
    
    // Check if all tabs are completed
    const allTabsCompleted = completedCount === displayTabs.length;

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Step 1: Diagnosis - ${company?.name || project?.company?.name || 'Company'}`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
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
                                <span className={cn(
                                    "text-sm font-semibold",
                                    allTabsCompleted ? "text-green-600" : "text-gray-600"
                                )}>
                                    {completedCount} of {displayTabs.length}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        allTabsCompleted ? "bg-green-500" : "bg-primary"
                                    )}
                                    style={{ width: `${(completedCount / displayTabs.length) * 100}%` }}
                                />
                            </div>
                            
                            {/* All completed message */}
                            {allTabsCompleted && (
                                <Alert className="mt-4 border-green-200 bg-green-50">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-sm text-green-800">
                                        <span className="font-medium">All steps completed!</span> Please proceed to Review & Submit.
                                    </AlertDescription>
                                </Alert>
                            )}
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
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
                                            Company Diagnosis
                                        </h1>
                                    </div>

                                    {/* Description */}
                                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed text-muted-foreground">
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
        </AppLayout>
    );
}
