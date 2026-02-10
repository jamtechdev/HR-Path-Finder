import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, CheckCircle2, Info } from 'lucide-react';

interface Project {
    id: number;
    company?: {
        name: string;
    };
    diagnosis?: {
        industry_category?: string;
    };
    ceoPhilosophy?: {
        main_trait?: string;
    };
    performanceSystem?: {
        performance_method?: string;
        evaluation_unit?: string;
    };
    organizationalSentiment?: {
        reward_sensitivity?: number;
    };
}

interface AlgorithmRecommendation {
    score: number;
    reasons: string[];
    recommended: boolean;
}

interface ExistingRecommendation {
    id: number;
    recommended_option: string;
    rationale: string;
}

interface Props {
    project: Project;
    existingRecommendation?: ExistingRecommendation;
    algorithmRecommendations: Record<string, AlgorithmRecommendation>;
}

const COMPENSATION_OPTIONS = [
    { 
        value: 'fixed', 
        label: 'Fixed Compensation', 
        desc: 'Stable, predictable compensation structure with minimal variable components.' 
    },
    { 
        value: 'mixed', 
        label: 'Mixed Compensation', 
        desc: 'Combination of fixed base salary with variable performance-based components.' 
    },
    { 
        value: 'performance_based', 
        label: 'Performance-Based Compensation', 
        desc: 'Compensation heavily tied to performance metrics and results.' 
    },
];

export default function CompensationRecommendation({ 
    project, 
    existingRecommendation,
    algorithmRecommendations 
}: Props) {
    const { data, setData, post, processing } = useForm({
        recommended_option: existingRecommendation?.recommended_option || '',
        rationale: existingRecommendation?.rationale || '',
    });

    const [charCount, setCharCount] = useState(data.rationale.length);

    const handleRationaleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCharCount(value.length);
        setData('rationale', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/recommendations/compensation/${project.id}`, {
            onSuccess: () => {
                // Success handled by flash message
            },
        });
    };

    // Get recommended option from algorithm
    const algorithmRecommended = Object.entries(algorithmRecommendations)
        .find(([_, rec]) => rec.recommended)?.[0];

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Step 4.5: Compensation Recommendation - ${project?.company?.name || 'Project'}`} />
                    <div className="p-6 md:p-8 max-w-5xl mx-auto">
                        <div className="mb-6">
                            <Link 
                                href="/admin/dashboard" 
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Link>
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-8 h-8 text-primary" />
                                <h1 className="text-3xl font-bold">Step 4.5: Prepare Compensation & Benefits Recommendation</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Review the project context and prepare a recommendation for the Compensation & Benefits system.
                            </p>
                        </div>

                        {/* Project Context */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Project Context</CardTitle>
                                <CardDescription>Key information from previous steps</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold">Company</Label>
                                    <p className="text-sm text-muted-foreground">{project?.company?.name || 'N/A'}</p>
                                </div>
                                {project?.diagnosis?.industry_category && (
                                    <div>
                                        <Label className="text-sm font-semibold">Industry</Label>
                                        <p className="text-sm text-muted-foreground">{project.diagnosis.industry_category}</p>
                                    </div>
                                )}
                                {project?.ceoPhilosophy?.main_trait && (
                                    <div>
                                        <Label className="text-sm font-semibold">CEO Philosophy</Label>
                                        <p className="text-sm text-muted-foreground capitalize">{project.ceoPhilosophy.main_trait}</p>
                                    </div>
                                )}
                                {project?.performanceSystem?.performance_method && (
                                    <div>
                                        <Label className="text-sm font-semibold">Performance System Selected</Label>
                                        <p className="text-sm text-muted-foreground uppercase">
                                            {project.performanceSystem.performance_method}
                                        </p>
                                    </div>
                                )}
                                {project?.performanceSystem?.evaluation_unit && (
                                    <div>
                                        <Label className="text-sm font-semibold">Evaluation Unit</Label>
                                        <p className="text-sm text-muted-foreground">{project.performanceSystem.evaluation_unit}</p>
                                    </div>
                                )}
                                {project?.organizationalSentiment?.reward_sensitivity && (
                                    <div>
                                        <Label className="text-sm font-semibold">Reward Sensitivity</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {project.organizationalSentiment.reward_sensitivity} / 5
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Algorithm Recommendations Reference */}
                        {algorithmRecommended && (
                            <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        Algorithm-Based Recommendation (Reference)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-blue-600">
                                                Recommended: {COMPENSATION_OPTIONS.find(o => o.value === algorithmRecommended)?.label}
                                            </Badge>
                                        </div>
                                        {algorithmRecommendations[algorithmRecommended]?.reasons && (
                                            <div className="mt-2">
                                                <p className="text-sm font-semibold mb-1">Reasons:</p>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    {algorithmRecommendations[algorithmRecommended].reasons.map((reason, idx) => (
                                                        <li key={idx}>{reason}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recommendation Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Recommendation</CardTitle>
                                <CardDescription>
                                    Select the compensation structure you recommend and provide a clear rationale explaining 
                                    how it connects to the performance design and job structure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label className="text-base font-semibold mb-4 block">Compensation Structure</Label>
                                        <RadioGroup
                                            value={data.recommended_option}
                                            onValueChange={(value) => setData('recommended_option', value)}
                                            className="space-y-3"
                                        >
                                            {COMPENSATION_OPTIONS.map((option) => {
                                                const algoRec = algorithmRecommendations[option.value];
                                                return (
                                                    <div key={option.value} className="flex items-start space-x-3">
                                                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                                        <Label
                                                            htmlFor={option.value}
                                                            className="flex-1 cursor-pointer space-y-1"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{option.label}</span>
                                                                {algoRec?.recommended && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Algorithm Recommended
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                            {algoRec && algoRec.score > 0 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Score: {algoRec.score} | {algoRec.reasons.length} reason{algoRec.reasons.length !== 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>

                                    <div>
                                        <Label htmlFor="rationale" className="text-base font-semibold mb-2 block">
                                            Rationale <span className="text-red-500">*</span>
                                        </Label>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Explain why this pay mix is realistic, how it connects to the performance design 
                                            selected in Step 4, and how it aligns with the job structure. Write in clear, client-friendly language.
                                        </p>
                                        <Textarea
                                            id="rationale"
                                            value={data.rationale}
                                            onChange={handleRationaleChange}
                                            placeholder="Example: Based on your performance system selection and company context, we recommend mixed compensation because..."
                                            className="min-h-[200px]"
                                            required
                                            maxLength={5000}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                {charCount} / 5000 characters
                                            </p>
                                            {charCount < 100 && (
                                                <p className="text-xs text-amber-600">
                                                    Please provide a more detailed rationale (minimum 100 characters recommended)
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t">
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.recommended_option || !data.rationale || data.rationale.length < 50}
                                            className="flex items-center gap-2"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {existingRecommendation ? 'Update Recommendation' : 'Save Recommendation'}
                                                </>
                                            )}
                                        </Button>
                                        {existingRecommendation && (
                                            <p className="text-sm text-muted-foreground">
                                                This will replace the existing recommendation.
                                            </p>
                                        )}
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
