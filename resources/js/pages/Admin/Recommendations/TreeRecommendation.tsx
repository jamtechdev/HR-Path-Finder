import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import JobMatrixCard from '@/components/JobMatrix/JobMatrixCard';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_specification?: any;
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
    job_keyword?: {
        id: number;
        name: string;
        category?: string;
    };
    reporting_structure?: any;
    job_group?: string;
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
    jobDefinitions: JobDefinition[];
    existingRecommendation?: AdminRecommendation | null;
}

export default function TreeRecommendationPage({
    project,
    jobDefinitions,
    existingRecommendation,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        comment: existingRecommendation?.comment || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/recommendations/tree/${project.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={`TREE Recommendations - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit(`/admin/tree/${project.id}/overview`)}
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to TREE Overview
                            </Button>
                            <h1 className="text-3xl font-bold mb-2 text-foreground">TREE Recommendations</h1>
                            <p className="text-muted-foreground">
                                Review job matrix cards and provide recommendations for the HR team.
                            </p>
                        </div>

                        {/* Job Matrix Cards */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-4">Job Matrix Cards</h2>
                            <div className="space-y-6">
                                {jobDefinitions.map((job) => (
                                    <JobMatrixCard
                                        key={job.id}
                                        job={job}
                                        companyName={project.company.name}
                                        companyLogo={project.company.logo}
                                        isAdminView={true}
                                        showCSFs={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Provide Recommendations</CardTitle>
                                <CardDescription>
                                    Review the job matrix cards above and provide your recommendations for the HR team.
                                    These recommendations will be visible to HR managers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="comment">Recommendations</Label>
                                        <Textarea
                                            id="comment"
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            rows={8}
                                            placeholder="Provide your recommendations based on the job matrix cards above..."
                                            className="mt-2"
                                        />
                                        {errors.comment && (
                                            <p className="text-sm text-red-600 mt-1">{errors.comment}</p>
                                        )}
                                    </div>

                                    {existingRecommendation && (
                                        <Alert>
                                            <CheckCircle2 className="h-4 w-4" />
                                            <AlertDescription>
                                                You have an existing recommendation. Submitting will update it.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(`/admin/tree/${project.id}/overview`)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {existingRecommendation ? 'Update Recommendation' : 'Save Recommendation'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
