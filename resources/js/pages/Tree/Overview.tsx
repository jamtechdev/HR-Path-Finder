import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import WorkflowStepsSidebar from '@/components/Sidebar/WorkflowStepsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobMatrixCard from '@/components/JobMatrix/JobMatrixCard';
import { Search, FileText, CheckCircle2, MessageSquare, ArrowRight, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { router, useForm } from '@inertiajs/react';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_specification?: any;
    competency_levels?: Array<{ level: string; description: string; dev_period?: string }>;
    csfs?: Array<{ name: string; description: string }>;
    job_keyword?: {
        id: number;
        name: string;
        category?: string;
    };
    reporting_structure?: {
        executive_director?: string;
        reporting_hierarchy?: string;
    };
    job_group?: string;
    job_code?: string;
}

interface AdminRecommendation {
    id?: number;
    comment?: string;
    recommendation_type?: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
            logo?: string;
        };
    };
    stepStatuses: Record<string, string>;
    activeTab: string;
    projectId: number;
    jobDefinitions?: JobDefinition[];
    adminRecommendations?: AdminRecommendation | null;
    isAdminView?: boolean;
    isCeoView?: boolean;
}

export default function TreeOverview({ 
    project, 
    stepStatuses, 
    activeTab, 
    projectId,
    jobDefinitions = [],
    adminRecommendations,
    isAdminView = false,
    isCeoView = false,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    // Get unique job groups
    const jobGroups = Array.from(new Set(
        jobDefinitions
            .map(job => job.job_group || job.job_keyword?.category || 'Other')
            .filter(Boolean)
    ));

    // Filter jobs
    const filteredJobs = jobDefinitions.filter(job => {
        const matchesSearch = searchTerm === '' || 
            job.job_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.job_description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const jobGroup = job.job_group || job.job_keyword?.category || 'Other';
        const matchesGroup = selectedGroup === 'all' || jobGroup === selectedGroup;

        return matchesSearch && matchesGroup;
    });

    const handleTabChange = (value: string) => {
        router.visit(`/hr-manager/tree/${projectId}/${value}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const treeStatus = stepStatuses.tree || 'not_started';
    const canEdit = !isAdminView && !isCeoView && treeStatus !== 'locked' && treeStatus !== 'approved';
    const canSubmit = !isAdminView && !isCeoView && treeStatus === 'in_progress' && jobDefinitions.length > 0;

    const { post: submitPost, processing: submitting } = useForm({});

    const handleSubmit = () => {
        if (confirm('Are you sure you want to submit the TREE step? This will send it to the CEO for verification.')) {
            submitPost(`/hr-manager/tree/${projectId}/submit`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar stepStatuses={stepStatuses} projectId={projectId} />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`TREE - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">TREE</h1>
                                    <p className="text-muted-foreground">
                                        Talent Review, Evaluation, and Enhancement system.
                                    </p>
                                </div>
                                {isAdminView && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        Admin View
                                    </Badge>
                                )}
                                {isCeoView && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        CEO View
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="talent-review">Talent Review</TabsTrigger>
                                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                                <TabsTrigger value="enhancement">Enhancement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Job Matrix Cards Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-semibold mb-1">Job Matrix Cards</h2>
                                            <p className="text-sm text-muted-foreground">
                                                View all finalized job definitions with complete details
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    {jobDefinitions.length > 0 && (
                                        <div className="flex gap-4 mb-6">
                                            <div className="relative flex-1 max-w-md">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    placeholder="Search jobs..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {jobGroups.length > 0 && (
                                                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                                    <SelectTrigger className="w-48">
                                                        <SelectValue placeholder="Filter by group" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Groups</SelectItem>
                                                        {jobGroups.map((group) => (
                                                            <SelectItem key={group} value={group}>
                                                                {group}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    )}

                                    {/* Job Matrix Cards Grid */}
                                    {filteredJobs.length > 0 ? (
                                        <div className="space-y-6">
                                            {filteredJobs.map((job) => (
                                                <JobMatrixCard
                                                    key={job.id}
                                                    job={job}
                                                    companyName={project.company.name}
                                                    companyLogo={project.company.logo}
                                                    isAdminView={isAdminView}
                                                    adminRecommendations={adminRecommendations || undefined}
                                                    showCSFs={true}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="p-12 text-center">
                                                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Job Matrix Cards Found</h3>
                                                <p className="text-muted-foreground">
                                                    {jobDefinitions.length === 0
                                                        ? 'No finalized job definitions available. Please complete the Job Analysis step first.'
                                                        : 'No jobs match your search criteria.'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Admin Recommendations Section */}
                                {isAdminView && (
                                    <Card className="border-yellow-200 bg-yellow-50">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                                                    Admin Recommendations
                                                </CardTitle>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/recommendations/tree/${project.id}`)}
                                                >
                                                    {adminRecommendations ? 'Update' : 'Add'} Recommendations
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {adminRecommendations ? (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {adminRecommendations.comment}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No recommendations provided yet. Click the button above to add recommendations.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Show Admin Recommendations to HR and CEO */}
                                {!isAdminView && adminRecommendations && (
                                    <Card className="border-blue-200 bg-blue-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                Admin Recommendations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {adminRecommendations.comment}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Submit Button for HR */}
                                {canSubmit && (
                                    <Card className="border-green-200 bg-green-50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold mb-1">Ready to Submit?</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Submit the TREE step for CEO verification.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={submitting}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit TREE
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Status Messages */}
                                {treeStatus === 'submitted' && !isAdminView && !isCeoView && (
                                    <Card className="border-blue-200 bg-blue-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                <p className="text-sm font-medium">
                                                    TREE step has been submitted and is awaiting CEO verification.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {(treeStatus === 'approved' || treeStatus === 'locked') && (
                                    <Card className="border-green-200 bg-green-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <p className="text-sm font-medium">
                                                    TREE step has been verified and approved by CEO.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
