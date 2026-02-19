import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ConsultantRecommendation {
    id: number;
    recommended_option: string;
    rationale: string;
    created_at: string;
}

interface AlgorithmRecommendation {
    score: number;
    reasons: string[];
    recommended: boolean;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    compensationSystem?: any;
    consultantRecommendation?: ConsultantRecommendation;
    algorithmRecommendations?: Record<string, AlgorithmRecommendation>;
    stepStatuses: Record<string, string>;
    activeTab: string;
    projectId: number;
}

const COMPENSATION_OPTIONS = [
    { value: 'fixed', label: 'Fixed Compensation' },
    { value: 'mixed', label: 'Mixed Compensation' },
    { value: 'performance_based', label: 'Performance-Based Compensation' },
];

export default function CompensationSystemOverview({ 
    project, 
    compensationSystem, 
    consultantRecommendation,
    algorithmRecommendations,
    stepStatuses, 
    activeTab, 
    projectId 
}: Props) {
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);

    return (
        <AppLayout stepStatuses={stepStatuses} projectId={projectId}>
            <Head title={`Compensation System - ${project.company.name}`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Compensation & Benefits (C&B)</h1>
                            <p className="text-muted-foreground">
                                Define compensation structure, differentiation methods, and incentive components.
                            </p>
                        </div>

                        {/* Consultant Recommendation */}
                        {consultantRecommendation && (
                            <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">Consultant Recommendation</h3>
                                                <Badge variant="default" className="bg-primary">
                                                    {COMPENSATION_OPTIONS.find(c => c.value === consultantRecommendation.recommended_option)?.label || consultantRecommendation.recommended_option.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Your consultant has prepared a recommendation based on your performance system selection and company context.
                                            </p>
                                            <Collapsible open={isRationaleOpen} onOpenChange={setIsRationaleOpen}>
                                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                                                    <MessageSquare className="w-4 h-4" />
                                                    View Consultant's Rationale
                                                    {isRationaleOpen ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-3">
                                                    <div className="p-4 bg-background border rounded-lg">
                                                        <p className="text-sm whitespace-pre-line leading-relaxed">
                                                            {consultantRecommendation.rationale}
                                                        </p>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Tabs value={activeTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="compensation-structure">Compensation Structure</TabsTrigger>
                                <TabsTrigger value="differentiation">Differentiation Methods</TabsTrigger>
                                <TabsTrigger value="incentives">Incentive Components</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>C&B System Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            This section allows you to design your compensation and benefits system.
                                        </p>
                                        {consultantRecommendation && (
                                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm font-medium mb-1">Recommended Structure:</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {COMPENSATION_OPTIONS.find(c => c.value === consultantRecommendation.recommended_option)?.label}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
        </AppLayout>
    );
}
