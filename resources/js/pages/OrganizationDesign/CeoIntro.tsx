import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Shield, Lock, CheckCircle2 } from 'lucide-react';

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

export default function CeoJobAnalysisIntro({ project, introText, introCompleted = false }: Props) {
    const defaultContent = `This stage is not intended to redesign or change your current organizational structure. Its purpose is to organize and clarify the job standards and role expectations as they are currently operated within your company.

There are no right or wrong answers to any of the questions. Your responses will be used solely as baseline inputs for the subsequent design of the performance management and compensation systems.

All inputs are confidential and will not be shared with other employees.`;

    return (
        <AppLayout>
                    <Head title={`Job Analysis - ${project?.company?.name || 'Organization Design'}`} />
                    
                    {/* Header Section - Image and Content First */}
                    <div className="bg-white border-b">
                        <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
                            <div className="text-center">
                                {/* Icon/Image */}
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gray-100 mb-6">
                                    <FileText className="w-12 h-12 text-primary" />
                                </div>
                                
                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                                    Job Analysis
                                </h1>
                                
                                {/* Description */}
                                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                    Welcome to the Job Analysis stage. Let's begin by understanding what this process entails.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-12">
                        <Card className="border-2 shadow-lg overflow-hidden">
                            <CardContent className="p-8 md:p-10 space-y-8">
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

                                {/* Status Indicator */}
                                {introCompleted && (
                                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            The Job Analysis process has been started by the HR Manager.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
        </AppLayout>
    );
}
