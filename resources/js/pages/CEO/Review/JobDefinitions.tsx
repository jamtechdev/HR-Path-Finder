import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

interface JobKeyword {
    id: number;
    name: string;
}

interface JobDefinition {
    id: number;
    job_keyword_id?: number;
    job_name: string;
    grouped_job_keyword_ids?: number[];
    job_description?: string;
    job_specification?: Record<string, any>;
    competency_levels?: Record<string, any>;
    csfs?: Record<string, any>;
    is_finalized?: boolean;
    job_keyword?: JobKeyword;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
    industry?: string;
    sizeRange?: string;
}

export default function CeoReviewJobDefinitions({ 
    project, 
    jobDefinitions,
    industry,
    sizeRange 
}: Props) {
    const [selectedJobId, setSelectedJobId] = React.useState<number | null>(
        jobDefinitions.length > 0 ? jobDefinitions[0].id : null
    );

    const selectedJob = jobDefinitions.find(job => job.id === selectedJobId) || jobDefinitions[0];

    return (
        <AppLayout>
            <Head title={`Job Definitions Review - ${project?.company?.name || 'Job Analysis'}`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Job Definitions Review</h1>
                    <p className="text-muted-foreground">
                        Review the detailed job definitions created by your HR Manager.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Job List Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Job List</CardTitle>
                                <CardDescription>
                                    {jobDefinitions.length} job{jobDefinitions.length !== 1 ? 's' : ''} defined
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[600px] overflow-y-auto">
                                    {jobDefinitions.map((job) => (
                                        <button
                                            key={job.id}
                                            onClick={() => setSelectedJobId(job.id)}
                                            className={`w-full text-left p-4 border-b last:border-b-0 transition-colors ${
                                                selectedJobId === job.id
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium">{job.job_name}</p>
                                                    {job.is_finalized && (
                                                        <Badge variant="secondary" className="mt-1 text-xs">
                                                            Finalized
                                                        </Badge>
                                                    )}
                                                </div>
                                                {selectedJobId === job.id && (
                                                    <CheckCircle2 className="w-4 h-4 text-primary ml-2" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Job Details */}
                    <div className="lg:col-span-2">
                        {selectedJob ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{selectedJob.job_name}</CardTitle>
                                            {selectedJob.job_keyword && (
                                                <CardDescription>
                                                    Based on: {selectedJob.job_keyword.name}
                                                </CardDescription>
                                            )}
                                        </div>
                                        {selectedJob.is_finalized && (
                                            <Badge>Finalized</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="description" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="description">Description</TabsTrigger>
                                            <TabsTrigger value="specification">Specification</TabsTrigger>
                                            <TabsTrigger value="competency">Competency</TabsTrigger>
                                            <TabsTrigger value="csfs">CSFs</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="description" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Job Description</h3>
                                                <div className="p-4 bg-muted rounded-lg">
                                                    {selectedJob.job_description ? (
                                                        <p className="whitespace-pre-wrap text-sm">
                                                            {selectedJob.job_description}
                                                        </p>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm italic">
                                                            No description provided yet.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="specification" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Job Specification</h3>
                                                {selectedJob.job_specification && Object.keys(selectedJob.job_specification).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.job_specification).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            No specification provided yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="competency" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Competency Levels</h3>
                                                {selectedJob.competency_levels && Object.keys(selectedJob.competency_levels).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.competency_levels).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            No competency levels defined yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="csfs" className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Critical Success Factors (CSFs)</h3>
                                                {selectedJob.csfs && Object.keys(selectedJob.csfs).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {Object.entries(selectedJob.csfs).map(([key, value]) => (
                                                            <div key={key} className="p-3 border rounded-lg">
                                                                <p className="font-medium text-sm mb-1">{key}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground text-sm italic">
                                                            No CSFs defined yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No job definitions available yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(`/ceo/review/job-analysis/${project.id}/job-list`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Job List
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
