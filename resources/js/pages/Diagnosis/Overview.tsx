import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, ArrowRight, Check, Upload } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    businessProfile?: BusinessProfile | null;
    workforce?: Workforce | null;
    executives?: Executive[] | null;
    jobGrades?: JobGrade[] | null;
    organizationalCharts?: OrganizationalChart[] | null;
    hrIssues?: HrIssue[] | null;
    currentHrStatus?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidentialNote?: ConfidentialNote | null;
}

interface BusinessProfile {
    id?: number;
}

interface Workforce {
    id?: number;
}

interface CurrentHrStatus {
    id?: number;
}

interface Culture {
    id?: number;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    id?: number;
}

interface Executive {
    id?: number;
}

interface JobGrade {
    id?: number;
}

interface OrganizationalChart {
    id?: number;
    chart_year_month?: string;
    file_path?: string | null;
    file_name?: string | null;
}

interface OrganizationDesign {
    structure_types?: string[] | null;
}

interface HrIssue {
    id?: number;
}

interface Project {
    id: number;
    status: string;
    current_step?: string | null;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    executives?: Executive[] | null;
    job_grades?: JobGrade[] | null;
    organizational_charts?: OrganizationalChart[] | null;
    organization_design?: OrganizationDesign | null;
    hr_issues?: HrIssue[] | null;
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
    stepStatuses?: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
}

const stepOrder = ['company-info', 'business-profile', 'workforce', 'executives', 'job-grades', 'organizational-charts', 'organizational-structure', 'hr-issues', 'current-hr', 'culture', 'confidential', 'review'] as const;

export default function DiagnosisOverview({ company, project, stepStatuses }: PageProps) {
    // Determine status from database first, then fall back to localStorage
    const getStatus = (): 'not_started' | 'in_progress' | 'submitted' => {
        // First check database status from stepStatuses prop
        if (stepStatuses?.diagnosis) {
            const dbStatus = stepStatuses.diagnosis;
            if (dbStatus === 'submitted' || dbStatus === 'completed') {
                return 'submitted';
            }
            if (dbStatus === 'in_progress') {
                return 'in_progress';
            }
        }
        
        // If project exists and has status, use that
        // Note: hr_projects.status ENUM values: 'not_started', 'in_progress', 'completed', 'locked', 'pending_consultant_review'
        if (project?.status) {
            if (project.status === 'completed') {
                return 'submitted'; // Map 'completed' to 'submitted' for frontend display
            }
            if (project.status === 'in_progress') {
                return 'in_progress';
            }
        }
        
        // Fall back to localStorage only if no database data
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('diagnosis_status');
                if (stored === 'in_progress' || stored === 'submitted') return stored;
            } catch {
                // Ignore localStorage errors
            }
        }
        
        return 'not_started';
    };
    
    // Calculate step completion status - ALWAYS check database first if data exists
    const checkStepComplete = (key: string): boolean => {
        // Always check database first if project/company exists
        if (project || company) {
            const keyMap: Record<string, string> = {
                'company': 'company',
                'company-info': 'company',
                'business-profile': 'business_profile',
                'workforce': 'workforce',
                'executives': 'executives',
                'job-grades': 'job_grades',
                'organizational-charts': 'organizational_charts',
                'organizational-structure': 'organization_design',
                'hr-issues': 'hr_issues',
                'current-hr': 'current_hr_status',
                'culture': 'culture',
                'confidential': 'confidential_note',
            };
            
            const dbKey = keyMap[key];
            if (dbKey) {
                // Check project data first
                if (project && (project as any)[dbKey]) {
                    const data = (project as any)[dbKey];
                    if (Array.isArray(data)) {
                        return data.length > 0;
                    }
                    if (typeof data === 'object' && data !== null) {
                        // Check if object has meaningful data
                        const keys = Object.keys(data);
                        if (keys.length === 0) return false;
                        // Check if at least one value is not null/empty
                        return Object.values(data).some(v => {
                            if (v === null || v === undefined || v === '') return false;
                            if (Array.isArray(v)) return v.length > 0;
                            if (typeof v === 'object') return Object.keys(v).length > 0;
                            return true;
                        });
                    }
                    return !!data;
                }
                
                // Check company data directly for company-info
                if (company && dbKey === 'company') {
                    return !!company.id && !!company.name;
                }
                
                // Also check company's related models for other steps
                if (company) {
                    switch (dbKey) {
                        case 'business_profile':
                            return !!company.businessProfile?.id;
                        case 'workforce':
                            return !!company.workforce?.id;
                        case 'executives':
                            return Array.isArray(company.executives) && company.executives.length > 0;
                        case 'job_grades':
                            return Array.isArray(company.jobGrades) && company.jobGrades.length > 0;
                        case 'organizational_charts':
                            return Array.isArray(company.organizationalCharts) && company.organizationalCharts.length > 0;
                        case 'hr_issues':
                            return Array.isArray(company.hrIssues) && company.hrIssues.length > 0;
                        case 'current_hr_status':
                            return !!company.currentHrStatus?.id;
                        case 'culture':
                            return !!company.culture?.id;
                        case 'confidential_note':
                            return !!company.confidentialNote?.id;
                    }
                }
            }
        }
        
        // Fall back to localStorage check only if no database data
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            // Check if data has meaningful content
            if (Array.isArray(data)) {
                return data.length > 0 && data.some((item: any) => 
                    Object.values(item).some(v => v !== null && v !== '')
                );
            }
            return Object.keys(data).length > 0 && Object.values(data).some(v => 
                v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
            );
        } catch {
            return false;
        }
    };

    // Calculate step status first (without review)
    const calculateStepStatus = () => {
        return {
            'overview': checkStepComplete('company') || checkStepComplete('company-info'),
            'company-info': checkStepComplete('company') || checkStepComplete('company-info'),
            'business-profile': checkStepComplete('business-profile'),
            'workforce': checkStepComplete('workforce'),
            'executives': checkStepComplete('executives'),
            'job-grades': checkStepComplete('job-grades'),
            'organizational-charts': checkStepComplete('organizational-charts'),
            'organizational-structure': checkStepComplete('organizational-structure'),
            'hr-issues': checkStepComplete('hr-issues'),
            'current-hr': checkStepComplete('current-hr'),
            'culture': checkStepComplete('culture'),
            'confidential': checkStepComplete('confidential'),
        };
    };

    // Calculate initial status based on step completion
    const calculateInitialStatus = (): 'not_started' | 'in_progress' | 'submitted' => {
        const tempStepStatus = calculateStepStatus();
        const tempCompletedSteps = Object.values(tempStepStatus).filter(Boolean).length;
        // If all 11 diagnosis steps (excluding review) are completed, status should be submitted
        if (tempCompletedSteps === 11) {
            return 'submitted';
        }
        // Otherwise check database status
        return getStatus();
    };

    const [status, setStatus] = React.useState<'not_started' | 'in_progress' | 'submitted'>(calculateInitialStatus);
    
    // Update status when props change or step completion changes
    React.useEffect(() => {
        // First check stepStatuses prop (most reliable source from database)
        if (stepStatuses?.diagnosis === 'submitted' || stepStatuses?.diagnosis === 'completed') {
            setStatus('submitted');
            return;
        }
        
        // Then check if all steps are completed
        const tempStepStatus = calculateStepStatus();
        const tempCompletedSteps = Object.values(tempStepStatus).filter(Boolean).length;
        
        // If all 11 diagnosis steps are completed, status should be submitted
        if (tempCompletedSteps === 11) {
            setStatus('submitted');
        } else {
            const newStatus = getStatus();
            if (newStatus !== status) {
                setStatus(newStatus);
            }
        }
    }, [stepStatuses, project, company]);

    // Calculate final step status including review
    const stepStatus = {
        ...calculateStepStatus(),
        'review': status === 'submitted' || 
                  (project && (project.status === 'submitted' || project.status === 'completed')) ||
                  (stepStatuses?.diagnosis === 'submitted' || stepStatuses?.diagnosis === 'completed'),
    };

    // Count completed steps (excluding overview from count, but including review)
    const completedSteps = Object.entries(stepStatus)
        .filter(([key, value]) => key !== 'overview' && value)
        .length;
    const totalSteps = 12; // 11 diagnosis steps + Review = 12 total steps
    
    // If all steps are completed, show 100%
    const allStepsCompleted = completedSteps === totalSteps;
    
    // Check if any form data exists in localStorage (only if not submitted)
    React.useEffect(() => {
        if (status === 'submitted') return; // Don't check localStorage if already submitted
        
        const checkLocalStorage = () => {
            const keys = ['company', 'business-profile', 'workforce', 'executives', 'job-grades', 
                         'organizational-charts', 'organizational-structure', 'hr-issues', 
                         'current-hr', 'culture', 'confidential'];
            const hasData = keys.some(key => {
                const stored = localStorage.getItem(`diagnosis_form_${key}`);
                return stored && stored !== '{}' && stored !== 'null';
            });
            if (hasData && status === 'not_started') {
                setStatus('in_progress');
                localStorage.setItem('diagnosis_status', 'in_progress');
            }
        };
        checkLocalStorage();
    }, [status]);
    
    const handleStartDiagnosis = () => {
        // Clear any old data
        const keys = ['company', 'business-profile', 'workforce', 'executives', 'job-grades', 
                     'organizational-charts', 'organizational-structure', 'hr-issues', 
                     'current-hr', 'culture', 'confidential'];
        keys.forEach(key => localStorage.removeItem(`diagnosis_form_${key}`));
        
        // Set status to in_progress
        setStatus('in_progress');
        localStorage.setItem('diagnosis_status', 'in_progress');
        
        // Navigate to company-info
        router.visit('/hr-manager/diagnosis/company-info');
    };

    // Use shared tabs configuration
    const tabs = diagnosisTabs;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:234',message:'Before render return','data':{hasCompany:!!company,hasProject:!!project,basePath:typeof window!=='undefined'?window.location.pathname:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // #region agent log
    try {
        fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:238','message':'Starting render','data':{status,tabsLength:tabs.length,hasDiagnosisHeader:true,hasDiagnosisProgressBar:true,hasDiagnosisTabs:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    } catch(e) {
        console.error('Log error:', e);
    }
    // #endregion

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Step 1: Diagnosis" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    {/* #region agent log */}
                    {(() => {
                        try {
                            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:252','message':'Before DiagnosisHeader','data':{status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        } catch(e) {}
                        return null;
                    })()}
                    {/* #endregion */}
                    <DiagnosisHeader
                        title="Step 1: Diagnosis"
                        description="Input company information and organizational context"
                        status={status}
                        backHref="/hr-manager/dashboard"
                    />

                    {/* #region agent log */}
                    {(() => {
                        try {
                            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:264','message':'After DiagnosisHeader, before DiagnosisProgressBar','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        } catch(e) {}
                        return null;
                    })()}
                    {/* #endregion */}
                    <DiagnosisProgressBar
                        stepName="Overview"
                        completedSteps={allStepsCompleted ? totalSteps : completedSteps}
                        totalSteps={totalSteps}
                        isCompleted={allStepsCompleted}
                    />

                    {/* #region agent log */}
                    {(() => {
                        try {
                            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:275','message':'After DiagnosisProgressBar, before DiagnosisTabs','data':{tabsLength:tabs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        } catch(e) {}
                        return null;
                    })()}
                    {/* #endregion */}
                    <DiagnosisTabs
                        tabs={tabs}
                        activeTab="overview"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={null}
                    />

                    {/* Overview Card - Matching HTML Structure */}
                    <Card>
                        <CardContent className="p-8 text-center space-y-6">
                            {/* Blue Icon */}
                            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>

                            {/* Title and Description */}
                            <div>
                                <h2 className="text-2xl font-display font-bold mb-2">Company Diagnosis</h2>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    {status === 'in_progress' 
                                        ? 'You have started the Diagnosis process. Complete all sections below and submit when ready.'
                                        : status === 'submitted'
                                        ? 'Diagnosis has been completed and submitted. Waiting for CEO verification to unlock Step 2.'
                                        : 'In this step, you\'ll provide comprehensive information about your company, including business profile, workforce composition, current HR systems, and organizational culture. This data will serve as the foundation for designing your HR system.'}
                                </p>
                            </div>

                            {/* Step Tags - Using Badge Component with secondary variant */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Company Info
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Business Profile
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Workforce
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Executives
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Job Grades
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Org Charts
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Org Structure
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    HR Issues
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Current HR
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1 cursor-pointer">
                                    Culture
                                </Badge>
                            </div>

                            {/* Start Diagnosis Button */}
                            {status === 'submitted' ? (
                                <div className="pt-4">
                                    <Badge className="bg-success/10 text-success border-success/20 px-4 py-1.5">
                                        Submitted - Waiting for CEO Verification
                                    </Badge>
                                </div>
                            ) : (
                                <Button 
                                    onClick={handleStartDiagnosis}
                                    size="lg"
                                    className="h-11 has-[>svg]:px-8 cursor-pointer"
                                >
                                    Start Diagnosis
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Display Organizational Charts if completed */}
                    {stepStatus['organizational-charts'] && (project?.organizational_charts || company?.organizationalCharts) && 
                     ((project?.organizational_charts && project.organizational_charts.length > 0) || 
                      (company?.organizationalCharts && company.organizationalCharts.length > 0)) && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Upload className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Organizational Charts</h3>
                                    <Badge className="bg-success/10 text-success border-success/20 ml-auto">
                                        <Check className="w-3 h-3 mr-1" />
                                        Completed
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(project?.organizational_charts || company?.organizationalCharts || []).map((chart: any, idx: number) => {
                                        const filePath = chart.file_path;
                                        const fileName = chart.file_name || chart.chart_year_month || `Chart ${idx + 1}`;
                                        const yearMonth = chart.chart_year_month || '';
                                        const isImage = filePath && (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.includes('/storage/'));
                                        
                                        return (
                                            <div key={idx} className="border rounded-lg p-4 text-center">
                                                <p className="text-sm font-medium mb-2">{yearMonth || fileName}</p>
                                                {filePath ? (
                                                    <>
                                                        {isImage ? (
                                                            <img 
                                                                src={filePath.startsWith('http') || filePath.startsWith('/') ? filePath : `/storage/${filePath}`}
                                                                alt={fileName}
                                                                className="w-full h-40 object-contain mx-auto mb-2 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => window.open(filePath.startsWith('http') || filePath.startsWith('/') ? filePath : `/storage/${filePath}`, '_blank')}
                                                            />
                                                        ) : (
                                                            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                                                        )}
                                                        <a 
                                                            href={filePath.startsWith('http') || filePath.startsWith('/') ? filePath : `/storage/${filePath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            View File
                                                        </a>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">No file uploaded</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* #region agent log */}
                    {(() => {
                        try {
                            fetch('http://127.0.0.1:7244/ingest/37ad418c-1f1a-45d5-845c-a1ee722a9836',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Overview.tsx:375','message':'After all components, render complete','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        } catch(e) {}
                        return null;
                    })()}
                    {/* #endregion */}

                </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
