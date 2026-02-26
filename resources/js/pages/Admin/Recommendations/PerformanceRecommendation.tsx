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
import { ArrowLeft, Target, CheckCircle2, Info } from 'lucide-react';

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
    companyAttributes?: {
        growth_stage?: string;
    };
    organizationDesign?: {
        structure_type?: string;
    };
}

interface JobDefinition {
    id: number;
    job_name: string;
    csfs?: Array<{ name: string; description: string }>;
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
    jobDefinitions: JobDefinition[];
    existingRecommendation?: ExistingRecommendation;
    algorithmRecommendations: Record<string, AlgorithmRecommendation>;
}

const PERFORMANCE_OPTIONS = [
    { value: 'kpi', label: 'KPI', desc: 'Key Performance Indicators - Track measurable targets and metrics.' },
    { value: 'mbo', label: 'MBO', desc: 'Management by Objectives - Goal-setting approach focused on specific objectives.' },
    { value: 'okr', label: 'OKR', desc: 'Objectives and Key Results - Align individual and team goals with strategic objectives.' },
    { value: 'bsc', label: 'BSC', desc: 'Balanced Scorecard - Holistic performance measurement across multiple perspectives.' },
];

export default function PerformanceRecommendation({ 
    project, 
    jobDefinitions, 
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
        post(`/admin/recommendations/performance/${project.id}`, {
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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={`Step 3.5: Performance Recommendation - ${project?.company?.name || 'Project'}`} />
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
                                <Target className="w-8 h-8 text-primary" />
                                <h1 className="text-3xl font-bold">Step 3.5: Prepare Performance Management Recommendation</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Review the project context and prepare a recommendation for the Performance Management system.
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
                                {project?.companyAttributes?.growth_stage && (
                                    <div>
                                        <Label className="text-sm font-semibold">Growth Stage</Label>
                                        <p className="text-sm text-muted-foreground">{project.companyAttributes.growth_stage}</p>
                                    </div>
                                )}
                                {project?.ceoPhilosophy?.main_trait && (
                                    <div>
                                        <Label className="text-sm font-semibold">CEO Philosophy</Label>
                                        <p className="text-sm text-muted-foreground capitalize">{project.ceoPhilosophy.main_trait}</p>
                                    </div>
                                )}
                                {project?.organizationDesign?.structure_type && (
                                    <div>
                                        <Label className="text-sm font-semibold">Organization Structure</Label>
                                        <p className="text-sm text-muted-foreground capitalize">{project.organizationDesign.structure_type}</p>
                                    </div>
                                )}
                                {jobDefinitions.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-semibold">Job Definitions</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {jobDefinitions.length} job{jobDefinitions.length !== 1 ? 's' : ''} defined
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
                                                Recommended: {PERFORMANCE_OPTIONS.find(o => o.value === algorithmRecommended)?.label}
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
                                    Select the performance management method you recommend and provide a clear rationale.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label className="text-base font-semibold mb-4 block">Performance Management Method</Label>
                                        <RadioGroup
                                            value={data.recommended_option}
                                            onValueChange={(value) => setData('recommended_option', value)}
                                            className="space-y-3"
                                        >
                                            {PERFORMANCE_OPTIONS.map((option) => {
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
                                            Explain why this option fits the company's growth stage, matches the CEO's management philosophy, 
                                            and aligns with the defined CSFs. Write in clear, client-friendly language.
                                        </p>
                                        <Textarea
                                            id="rationale"
                                            value={data.rationale}
                                            onChange={handleRationaleChange}
                                            placeholder="Example: Based on your company's growth stage and CEO philosophy, we recommend KPI because..."
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
