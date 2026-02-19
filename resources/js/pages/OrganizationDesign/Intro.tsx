import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, FileText, Shield, Lock, ArrowRight } from 'lucide-react';

interface IntroText {
    title?: string;
    content: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    introText?: IntroText;
    introCompleted?: boolean;
}

export default function JobAnalysisIntro({ project, introText, introCompleted = false }: Props) {
    const [agreed, setAgreed] = useState(introCompleted);
    
    const { post, processing } = useForm({
        agreed: introCompleted,
    });

    const handleContinue = () => {
        if (!agreed) return;
        
        post(`/hr-manager/job-analysis/${project.id}/intro/store`, {
            onSuccess: () => {
                router.visit(`/hr-manager/job-analysis/${project.id}/policy-snapshot`);
            },
        });
    };

    const defaultContent = `This stage is not intended to redesign or change your current organizational structure. Its purpose is to organize and clarify the job standards and role expectations as they are currently operated within your company.

There are no right or wrong answers to any of the questions. Your responses will be used solely as baseline inputs for the subsequent design of the performance management and compensation systems.

All inputs are confidential and will not be shared with other employees.`;

    return (
        <AppLayout>
            <Head title={`Job Analysis - ${project?.company?.name || 'Organization Design'}`} />
            <div className="p-6 md:p-8 max-w-5xl mx-auto bg-gradient-to-br from-background via-muted/20 to-background">
                        {/* Header Section */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Job Analysis
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Welcome to the Job Analysis stage. Let's begin by understanding what this process entails.
                            </p>
                        </div>

                        {/* Main Card */}
                        <Card className="border-2 shadow-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Before You Begin</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Important information about the Job Analysis process
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                {/* Content Section */}
                                <div className="prose prose-lg max-w-none">
                                    <div className="whitespace-pre-line text-base leading-relaxed text-foreground space-y-4">
                                        {introText?.content || defaultContent}
                                    </div>
                                </div>

                                {/* Key Points */}
                                <div className="grid md:grid-cols-3 gap-4 pt-4">
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                                        <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📋 Purpose</div>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            Organize and clarify current job standards and role expectations
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                        <div className="font-semibold text-green-900 dark:text-green-100 mb-2">✅ No Wrong Answers</div>
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            Your responses are baseline inputs for performance and compensation systems
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                                        <div className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                            <Lock className="w-4 h-4 inline mr-1" />
                                            Confidential
                                        </div>
                                        <p className="text-sm text-purple-800 dark:text-purple-200">
                                            All inputs are confidential and will not be shared with other employees
                                        </p>
                                    </div>
                                </div>

                                {/* Agreement Section */}
                                <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-xl border-2 border-muted-foreground/20 hover:bg-muted transition-colors duration-200">
                                    <Checkbox
                                        id="agree"
                                        checked={agreed}
                                        onCheckedChange={(checked) => setAgreed(checked === true)}
                                        className="mt-1 w-5 h-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor="agree" className="flex-1 cursor-pointer">
                                        <span className="text-lg font-semibold text-foreground block mb-2">
                                            I understand and agree to proceed
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            By checking this box, you confirm that you understand the purpose of this stage and agree to proceed with the job analysis process. Your progress will be saved automatically.
                                        </p>
                                    </label>
                                </div>

                                {/* Action Button */}
                                <div className="pt-4">
                                    <Button
                                        onClick={handleContinue}
                                        disabled={!agreed || processing}
                                        size="lg"
                                        className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Starting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                                Agree & Continue
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Indicator */}
                        {introCompleted && (
                            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    You've already started the Job Analysis process. You can continue from where you left off.
                                </p>
                            </div>
                        )}
                    </div>
        </AppLayout>
    );
}
