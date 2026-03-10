import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DiagnosisHeader from '@/components/CEO/Review/DiagnosisHeader';
import DiagnosisTabs from '@/components/CEO/Review/DiagnosisTabs';
import CompanyInfoTab from '@/components/CEO/Review/CompanyInfoTab';
import WorkforceTab from '@/components/CEO/Review/WorkforceTab';
import ExecutivesTab from '@/components/CEO/Review/ExecutivesTab';
import LeadersTab from '@/components/CEO/Review/LeadersTab';
import JobGradesTab from '@/components/CEO/Review/JobGradesTab';
import OrgChartsTab from '@/components/CEO/Review/OrgChartsTab';
import OrgStructureTab from '@/components/CEO/Review/OrgStructureTab';
import JobStructureTab from '@/components/CEO/Review/JobStructureTab';
import HrIssuesTab from '@/components/CEO/Review/HrIssuesTab';
import ChangeHistoryTab from '@/components/CEO/Review/ChangeHistoryTab';
import DiagnosisActions from '@/components/CEO/Review/DiagnosisActions';
import SuccessModal from '@/components/Modals/SuccessModal';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Diagnosis {
    id: number;
    status: string;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    expected_headcount_2y?: number;
    expected_headcount_3y?: number;
    average_tenure_active?: number;
    average_tenure_leavers?: number;
    average_age?: number;
    gender_male?: number;
    gender_female?: number;
    gender_ratio?: number;
    total_executives?: number;
    executive_positions?: Array<{ role: string; count: number }> | Record<string, number>;
    leadership_count?: number;
    leadership_percentage?: number;
    job_grade_names?: string[];
    promotion_years?: Record<string, number | null>;
    org_structure_types?: string[];
    organizational_charts?: Record<string, string>;
    hr_issues?: string[];
    custom_hr_issues?: string;
    job_categories?: string[];
    job_functions?: string[];
    [key: string]: any;
}

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    is_public?: boolean;
    public_listing_status?: string;
    brand_name?: string;
    foundation_date?: string;
    logo_path?: string;
}

interface ReviewLog {
    id: number;
    field_name: string;
    original_value: string;
    modified_value: string;
    created_at: string;
    modifier: {
        name: string;
    };
}

interface IndustryCategory {
    id: number;
    name: string;
    subCategories: Array<{ id: number; name: string }>;
}

interface HrIssue {
    id: number;
    name: string;
    category: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
    };
    diagnosis?: Diagnosis;
    company: Company;
    reviewLogs?: ReviewLog[];
    industryCategories?: IndustryCategory[];
    hqLocations?: string[];
    hrIssues?: HrIssue[];
}

export default function CeoReviewDiagnosis({ 
    project, 
    diagnosis, 
    company, 
    reviewLogs = [],
    industryCategories = [],
    hqLocations = [],
    hrIssues = [],
}: Props) {
    const [activeTab, setActiveTab] = useState('summary');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        ...diagnosis,
        registration_number: diagnosis?.registration_number || company.registration_number || '',
        hq_location: diagnosis?.hq_location || company.hq_location || '',
        is_public: company.is_public ?? false,
        brand_name: company.brand_name || '',
        foundation_date: company.foundation_date || '',
    });

    // Update form data when diagnosis or company props change (after save/reload)
    useEffect(() => {
        if (diagnosis) {
            Object.keys(diagnosis).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                    setData(key as any, diagnosis[key as keyof typeof diagnosis]);
                }
            });
        }
        
        setData('registration_number', diagnosis?.registration_number || company.registration_number || '');
        setData('hq_location', diagnosis?.hq_location || company.hq_location || '');
        setData('is_public', company.is_public ?? false);
        setData('brand_name', company.brand_name || '');
        setData('foundation_date', company.foundation_date || '');
    }, [diagnosis, company]);

    // Calculate gender ratio
    useEffect(() => {
        const total = (data.gender_male || 0) + (data.gender_female || 0);
        if (total > 0) {
            const ratio = ((data.gender_male || 0) / total) * 100;
            setData('gender_ratio', Math.round(ratio * 100) / 100);
        }
    }, [data.gender_male, data.gender_female]);

    // Calculate leadership percentage
    useEffect(() => {
        if (data.present_headcount && data.leadership_count) {
            const percentage = (data.leadership_count / data.present_headcount) * 100;
            setData('leadership_percentage', Math.round(percentage * 100) / 100);
        }
    }, [data.present_headcount, data.leadership_count]);

    // Handle executive positions
    const [executivePositions, setExecutivePositions] = useState<Array<{ role: string; count: number }>>(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                return diagnosis.executive_positions;
            } else {
                return Object.entries(diagnosis.executive_positions).map(([role, count]) => ({
                    role,
                    count: count as number,
                }));
            }
        }
        return [];
    });

    // Update executive positions when diagnosis changes (after save/reload)
    useEffect(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                setExecutivePositions(diagnosis.executive_positions);
            } else {
                setExecutivePositions(
                    Object.entries(diagnosis.executive_positions).map(([role, count]) => ({
                        role,
                        count: count as number,
                    }))
                );
            }
        } else {
            setExecutivePositions([]);
        }
    }, [diagnosis]);

    useEffect(() => {
        setData('executive_positions', executivePositions);
    }, [executivePositions]);

    const handleSave = () => {
        post(`/ceo/review/diagnosis/${project.id}/update`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Your changes have been saved successfully.' });
                router.reload({
                    only: ['diagnosis', 'company', 'reviewLogs'],
                });
            },
        });
    };

    const handleConfirm = () => {
        post(`/ceo/review/diagnosis/${project.id}/confirm`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: () => {
                // Validation/backend errors are shared via Inertia; ensure user sees feedback
                router.reload({ only: ['diagnosis', 'company'] });
            },
        });
    };

    const handleNextStep = () => {
        router.visit(`/ceo/philosophy/survey/${project.id}`);
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Review Diagnosis - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <DiagnosisHeader 
                            status={diagnosis?.status}
                        />

                        {diagnosis && diagnosis.status !== 'submitted' && (
                            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription>
                                    Diagnosis must be submitted by HR before you can save changes or confirm. Ask your HR Manager to complete and submit the Diagnosis step, then return here to review and save.
                                </AlertDescription>
                            </Alert>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {Object.entries(errors).map(([key, msg]) => (
                                        <p key={key}>{String(msg)}</p>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <DiagnosisTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            <TabsContent value="summary" className="space-y-4">
                                <div className="rounded-lg border bg-card p-6">
                                    <h2 className="text-xl font-semibold mb-4">HR Summary – Pain Points Overview</h2>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Quick overview of the main HR and organizational issues identified from the diagnosis inputs.
                                    </p>
                                    {((diagnosis?.hr_issues && diagnosis.hr_issues.length > 0) || diagnosis?.custom_hr_issues?.trim()) ? (
                                        <ul className="space-y-2">
                                            {(diagnosis?.hr_issues || []).map((issueId) => {
                                                const issue = hrIssues.find((i) => i.id.toString() === issueId.toString());
                                                return (
                                                    <li key={issueId} className="flex items-start gap-2">
                                                        <span className="text-destructive mt-0.5">•</span>
                                                        <span>{issue ? issue.name : issueId}</span>
                                                    </li>
                                                );
                                            })}
                                            {diagnosis?.custom_hr_issues?.trim() && (
                                                <li className="flex items-start gap-2">
                                                    <span className="text-destructive mt-0.5">•</span>
                                                    <span>{diagnosis.custom_hr_issues}</span>
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No HR issues or pain points have been recorded yet.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="company-info" className="space-y-4">
                                <CompanyInfoTab
                                    company={company}
                                    data={data}
                                    setData={setData}
                                    industryCategories={industryCategories}
                                    hqLocations={hqLocations}
                                />
                            </TabsContent>

                            <TabsContent value="workforce" className="space-y-4">
                                <WorkforceTab data={data} setData={setData} />
                            </TabsContent>

                            <TabsContent value="executives" className="space-y-4">
                                <ExecutivesTab 
                                    data={data} 
                                    setData={setData}
                                    executivePositions={executivePositions}
                                    setExecutivePositions={setExecutivePositions}
                                />
                            </TabsContent>

                            <TabsContent value="leaders" className="space-y-4">
                                <LeadersTab data={data} setData={setData} />
                            </TabsContent>

                            <TabsContent value="job-grades" className="space-y-4">
                                <JobGradesTab data={data} setData={setData} />
                            </TabsContent>

                            <TabsContent value="organizational-charts" className="space-y-4">
                                <OrgChartsTab organizationalCharts={diagnosis?.organizational_charts || data.organizational_charts} />
                            </TabsContent>

                            <TabsContent value="organizational-structure" className="space-y-4">
                                <OrgStructureTab data={data} setData={setData} />
                            </TabsContent>

                            <TabsContent value="job-structure" className="space-y-4">
                                <JobStructureTab data={data} setData={setData} />
                            </TabsContent>

                            <TabsContent value="hr-issues" className="space-y-4">
                                <HrIssuesTab 
                                    data={data} 
                                    setData={setData} 
                                    hrIssues={hrIssues}
                                />
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <ChangeHistoryTab reviewLogs={reviewLogs} />
                            </TabsContent>
                        </Tabs>

                        <DiagnosisActions
                            onSave={handleSave}
                            onConfirm={handleConfirm}
                            processing={processing}
                            diagnosisStatus={diagnosis?.status}
                        />
                    </div>
                </main>
            </SidebarInset>
            
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Diagnosis Confirmed!"
                message="Diagnosis has been confirmed and locked. You can now proceed to complete the Management Philosophy Survey."
                nextStepLabel="Proceed to Survey"
                onNextStep={handleNextStep}
            />
        <Toaster />
        </SidebarProvider>
    );
}
