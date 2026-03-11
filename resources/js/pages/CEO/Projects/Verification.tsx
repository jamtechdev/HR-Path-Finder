import React from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StepVerificationCard from '@/components/Dashboard/CEO/StepVerificationCard';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lock, Eye, ClipboardList } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    project: {
        id: number;
        company?: {
            id: number;
            name: string;
        } | null;
        step_statuses?: Record<string, string>;
        survey_available?: boolean;
    };
}

export default function CeoProjectVerification({ project }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background dark:bg-slate-900">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head title={`Step Verification - ${project.company?.name || 'Project'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/ceo/projects')}
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                            <h1 className="text-3xl font-bold mb-2 text-foreground">
                                Step Verification - {project.company?.name || `Project #${project.id}`}
                            </h1>
                            <p className="text-muted-foreground">
                                Review and verify each step of the HR project
                            </p>
                        </div>

                        {project.survey_available && (
                            <Link
                                href={`/ceo/philosophy/survey/${project.id}`}
                                className="block mb-6"
                            >
                                <Card className="shadow-lg border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                            <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg">Start Survey</p>
                                            <p className="text-sm text-muted-foreground">
                                                Complete the Management Philosophy Survey for this project
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    </CardContent>
                                </Card>
                            </Link>
                        )}

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">Step Verification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StepVerificationCard
                                    projectId={project.id}
                                    stepStatuses={project.step_statuses || {}}
                                    surveyAvailable={project.survey_available}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
