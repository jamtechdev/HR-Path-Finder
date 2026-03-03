import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    FileText, 
    Target, 
    Settings, 
    CheckCircle2,
    Send,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    projectId: number;
    snapshotResponses?: Record<number, { response: string[]; text_response?: string }>;
    organizationalKpis?: any[];
    evaluationModelAssignments?: any[];
    evaluationStructure?: any;
    onBack: () => void;
    onSubmit: () => void;
}

export default function PerformanceSystemReviewSubmit({
    projectId,
    snapshotResponses = {},
    organizationalKpis = [],
    evaluationModelAssignments = [],
    evaluationStructure,
    onBack,
    onSubmit,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['snapshot', 'kpis']));

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleSubmit = () => {
        if (processing) return;
        setProcessing(true);
        onSubmit();
    };

    const snapshotCount = Object.keys(snapshotResponses).length;
    const kpiCount = organizationalKpis.length;
    const assignmentCount = evaluationModelAssignments.length;
    const hasStructure = !!evaluationStructure;

    const allCompleted = snapshotCount > 0 && kpiCount > 0 && assignmentCount > 0 && hasStructure;

    return (
        <div className="space-y-6">
            <Card className="border-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Review & Submit</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Review all collected data before final submission. Once submitted, the Performance System step will be completed.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Snapshot Responses</p>
                            <p className="text-2xl font-bold text-blue-700">{snapshotCount}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-green-900 mb-1">Organizational KPIs</p>
                            <p className="text-2xl font-bold text-green-700">{kpiCount}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-purple-900 mb-1">Model Assignments</p>
                            <p className="text-2xl font-bold text-purple-700">{assignmentCount}</p>
                        </div>
                        <Settings className="w-8 h-8 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-orange-900 mb-1">Evaluation Structure</p>
                            <p className="text-2xl font-bold text-orange-700">{hasStructure ? 'Yes' : 'No'}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-orange-600" />
                    </div>
                </Card>
            </div>

            {!allCompleted && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-900 font-semibold">
                            Please complete all steps before submitting. Missing: {
                                [
                                    snapshotCount === 0 && 'Performance Snapshot',
                                    kpiCount === 0 && 'KPI Review',
                                    assignmentCount === 0 && 'Model Assignment',
                                    !hasStructure && 'Evaluation Structure'
                                ].filter(Boolean).join(', ')
                            }
                        </p>
                    </div>
                </Card>
            )}

            {/* Performance Snapshot Summary */}
            {snapshotCount > 0 && (
                <Card className="border-2">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection('snapshot')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-primary" />
                                <CardTitle className="text-xl">Performance Snapshot</CardTitle>
                                <Badge variant="secondary">{snapshotCount} Responses</Badge>
                            </div>
                            {expandedSections.has('snapshot') ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    {expandedSections.has('snapshot') && (
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {snapshotCount} performance snapshot question{snapshotCount !== 1 ? 's' : ''} answered.
                            </p>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* KPIs Summary */}
            {kpiCount > 0 && (
                <Card className="border-2">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection('kpis')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target className="w-6 h-6 text-primary" />
                                <CardTitle className="text-xl">Organizational KPIs</CardTitle>
                                <Badge variant="secondary">{kpiCount} KPIs</Badge>
                            </div>
                            {expandedSections.has('kpis') ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    {expandedSections.has('kpis') && (
                        <CardContent className="space-y-2">
                            {organizationalKpis.map((kpi, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{kpi.kpi_name}</p>
                                            <p className="text-sm text-muted-foreground">{kpi.organization_name}</p>
                                        </div>
                                        {kpi.category && (
                                            <Badge variant="outline">{kpi.category}</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Model Assignments Summary */}
            {assignmentCount > 0 && (
                <Card className="border-2">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection('assignments')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-primary" />
                                <CardTitle className="text-xl">Evaluation Model Assignments</CardTitle>
                                <Badge variant="secondary">{assignmentCount} Assignments</Badge>
                            </div>
                            {expandedSections.has('assignments') ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    {expandedSections.has('assignments') && (
                        <CardContent className="space-y-2">
                            {evaluationModelAssignments.map((assignment, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {assignment.job_definition?.job_name || `Job ${assignment.job_definition_id}`}
                                            </p>
                                        </div>
                                        <Badge variant="default" className="uppercase">
                                            {assignment.evaluation_model}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Evaluation Structure Summary */}
            {hasStructure && (
                <Card className="border-2">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection('structure')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                <CardTitle className="text-xl">Evaluation Structure</CardTitle>
                                <Badge variant="secondary">Configured</Badge>
                            </div>
                            {expandedSections.has('structure') ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    {expandedSections.has('structure') && (
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {evaluationStructure.org_evaluator_type && (
                                    <div>
                                        <strong>Org Evaluator:</strong> {evaluationStructure.org_evaluator_type}
                                    </div>
                                )}
                                {evaluationStructure.individual_evaluator_types && (
                                    <div>
                                        <strong>Individual Evaluators:</strong> {evaluationStructure.individual_evaluator_types.join(', ')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={processing}
                >
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={processing || !allCompleted}
                    className="min-w-[200px]"
                >
                    {processing ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Performance System
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
