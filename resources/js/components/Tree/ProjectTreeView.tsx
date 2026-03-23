import { Network, Building2, FileText, CheckCircle2, Users, Target, DollarSign, Award, ChevronRight, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { TreeStep } from '@/config/treeStructure';
import { treeStructure } from '@/config/treeStructure';
import { cn } from '@/lib/utils';

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
        structure_type?: string;
        job_grade_structure?: string;
    };
    performance_management: {
        model?: string;
        method?: string;
        cycle?: string;
        rating_scale?: string;
        evaluation_logic?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_structure_type?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
        benefits_strategic_direction?: string | string[];
    };
    diagnosis?: {
        industry_category?: string;
        industry_subcategory?: string;
        present_headcount?: number;
        expected_headcount_1y?: number;
        average_age?: number;
        gender_ratio?: number;
        total_executives?: number;
        leadership_percentage?: number;
    };
    hr_system_report: {
        status: string;
    };
}

interface ProjectTreeViewProps {
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function ProjectTreeView({ hrSystemSnapshot }: ProjectTreeViewProps) {
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['company', 'diagnosis']));
    
    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        if (Array.isArray(value)) {
            return value.join(', ') || '-';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value) || '-';
        }
        return String(value);
    };

    const toggleStep = (stepId: string) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    // Build hierarchical tree structure with tabs
    const buildTreeNodes = () => {
        return treeStructure.map((step: TreeStep) => {
            const isExpanded = expandedSteps.has(step.id);
            const StepIcon = step.icon;
            
            // Get step-specific data
            let stepData: any = {};
            if (step.id === 'company') {
                stepData = {
                    name: hrSystemSnapshot.company.name,
                    industry: hrSystemSnapshot.company.industry,
                    size: hrSystemSnapshot.company.size,
                    ceo_philosophy: hrSystemSnapshot.ceo_philosophy,
                };
            } else if (step.id === 'diagnosis' && hrSystemSnapshot.diagnosis) {
                stepData = hrSystemSnapshot.diagnosis;
            } else if (step.id === 'job_analysis') {
                stepData = {
                    jobs_defined: hrSystemSnapshot.job_architecture.jobs_defined,
                    structure_type: hrSystemSnapshot.job_architecture.structure_type,
                    job_grade_structure: hrSystemSnapshot.job_architecture.job_grade_structure,
                };
            } else if (step.id === 'performance') {
                stepData = hrSystemSnapshot.performance_management;
            } else if (step.id === 'compensation') {
                stepData = hrSystemSnapshot.compensation_benefits;
            } else if (step.id === 'report') {
                stepData = { status: hrSystemSnapshot.hr_system_report.status };
            }

            return {
                step,
                stepData,
                isExpanded,
            };
        });
    };

    const treeNodes = buildTreeNodes();

    return (
        <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Network className="h-6 w-6 text-primary" />
                    HR System Configuration Tree
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    Complete hierarchical view of all steps and tabs - System Snapshot
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {treeNodes.map((node, nodeIndex) => {
                        const { step, stepData, isExpanded } = node;
                        const StepIcon = step.icon;
                        const hasTabs = step.tabs.length > 0;
                        
                        return (
                            <div key={step.id} className="relative">
                                {/* Step Node */}
                                <div className={`border-l-4 ${step.color} pl-4 py-3 rounded-r-lg hover:shadow-md transition-shadow`}>
                                    <div className="flex items-center gap-3">
                                        {hasTabs && (
                                            <button
                                                onClick={() => toggleStep(step.id)}
                                                className="p-1 hover:bg-white/50 rounded transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        )}
                                        {!hasTabs && <div className="w-6" />}
                                        <div className={`${step.iconColor}`}>
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{step.name}</h3>
                                        </div>
                                    </div>
                                    
                                    {/* Tabs (when expanded) */}
                                    {isExpanded && hasTabs && (
                                        <div className="ml-10 mt-3 space-y-2">
                                            {step.tabs.map((tab, tabIndex) => {
                                                const TabIcon = tab.icon;
                                                return (
                                                    <div
                                                        key={tab.id}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-md text-sm transition-colors",
                                                            "hover:bg-white/50 border-l-2 border-transparent hover:border-primary/30"
                                                        )}
                                                    >
                                                        <TabIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">{tab.name}</span>
                                                        {tab.isEssential && (
                                                            <Badge variant="outline" className="ml-auto text-xs">
                                                                Essential
                                                            </Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    
                                    {/* Step Data Summary (when not expanded or no tabs) */}
                                    {(!isExpanded || !hasTabs) && stepData && Object.keys(stepData).length > 0 && (
                                        <div className="ml-10 mt-2 space-y-1 text-sm">
                                            {step.id === 'company' && (
                                                <>
                                                    <div className="flex gap-2">
                                                        <span className="text-muted-foreground">Company:</span>
                                                        <span className="font-medium">{formatValue(stepData.name)}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-muted-foreground">Industry:</span>
                                                        <span className="font-medium">{formatValue(stepData.industry)}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-muted-foreground">Size:</span>
                                                        <span className="font-medium">{formatValue(stepData.size)} employees</span>
                                                    </div>
                                                </>
                                            )}
                                            {step.id === 'report' && (
                                                <div className="flex gap-2">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <Badge
                                                        className={
                                                            stepData.status === 'Ready'
                                                                ? 'bg-green-500'
                                                                : 'bg-yellow-500'
                                                        }
                                                    >
                                                        {stepData.status}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Connector Line */}
                                {nodeIndex < treeNodes.length - 1 && (
                                    <div className="flex justify-center my-2">
                                        <div className="w-0.5 h-6 bg-primary/30"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
