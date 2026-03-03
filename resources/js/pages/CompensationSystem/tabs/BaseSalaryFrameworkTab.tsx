import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BaseSalaryFramework } from '../types';

interface BaseSalaryFrameworkTabProps {
    framework: BaseSalaryFramework;
    onUpdate: (framework: BaseSalaryFramework) => void;
}

export default function BaseSalaryFrameworkTab({ framework, onUpdate }: BaseSalaryFrameworkTabProps) {
    const generateSummaryNote = (): string => {
        const parts: string[] = [];
        
        if (framework.salary_structure_type) {
            const typeMap: Record<string, string> = {
                'annual_accumulated': 'Annual Salary System (Accumulated)',
                'annual_non_accumulated': 'Annual Salary System (Non-Accumulated)',
                'annual_hybrid': 'Annual Salary System (Hybrid)',
                'seniority_based': 'Seniority-based Pay System',
                'job_based': 'Job-based Pay System',
            };
            parts.push(`{${typeMap[framework.salary_structure_type] || framework.salary_structure_type}}`);
        }
        
        if (framework.salary_adjustment_unit) {
            parts.push(`Salary Adjustment Unit: ${framework.salary_adjustment_unit === 'percentage' ? '%' : 'KRW'}`);
        }
        
        if (framework.salary_determination_standard) {
            const standardMap: Record<string, string> = {
                'pay_band': 'Pay Band',
                'salary_table': 'Salary Table',
            };
            parts.push(`Salary Determination Standard: ${standardMap[framework.salary_determination_standard] || framework.salary_determination_standard}`);
        }
        
        return `Based on a comprehensive review of the company's organizational characteristics and management objectives, the company has established a ${parts[0] || 'compensation system'}. Base salary adjustments will be applied using the defined Salary Adjustment Unit (${framework.salary_adjustment_unit === 'percentage' ? '%' : 'KRW'}), and compensation will be administered according to the configured Salary Adjustment Grouping and Timing.

The salary increase framework incorporates the company's policy regarding the Common Salary Increase Rate, including its applicability and determination basis (such as inflation linkage, company performance linkage, or management discretion), as well as the defined level of Performance-based Increase Differentiation, ensuring alignment between individual performance and compensation outcomes.

In addition, salary levels will be established and managed based on the selected Salary Determination Standard (${framework.salary_determination_standard === 'pay_band' ? 'Pay Band' : 'Salary Table'}), forming a consistent compensation framework. This framework will serve as the foundational reference for future compensation-related decisions, including pay band or salary range establishment by job level, salary adjustments, and new hire salary determination.`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="shadow-sm border">
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Salary Structure Configuration</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Define the core principles that determine how base salaries are structured and adjusted within your organization.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="mb-2 block">Salary Structure Type</Label>
                                    <Select 
                                        value={framework.salary_structure_type || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, salary_structure_type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select structure type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="annual_accumulated">Annual Salary System (Accumulated)</SelectItem>
                                            <SelectItem value="annual_non_accumulated">Annual Salary System (Non-Accumulated)</SelectItem>
                                            <SelectItem value="annual_hybrid">Annual Salary System (Hybrid)</SelectItem>
                                            <SelectItem value="seniority_based">Seniority-based Pay System</SelectItem>
                                            <SelectItem value="job_based">Job-based Pay System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Salary Adjustment Unit</Label>
                                    <Select 
                                        value={framework.salary_adjustment_unit || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, salary_adjustment_unit: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">%</SelectItem>
                                            <SelectItem value="krw">KRW</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Salary Adjustment Grouping</Label>
                                    <Select 
                                        value={framework.salary_adjustment_grouping || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, salary_adjustment_grouping: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grouping" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single group (entire organization adjusted at once)</SelectItem>
                                            <SelectItem value="dual">Dual group (employees divided into two groups based on hire timing, adjusted separately)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Salary Adjustment Timing</Label>
                                    <Select 
                                        value={framework.salary_adjustment_timing?.[0]?.toString() || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, salary_adjustment_timing: [parseInt(v)] })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Salary Determination Standard</Label>
                                    <Select 
                                        value={framework.salary_determination_standard || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, salary_determination_standard: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select standard" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pay_band">Pay Band</SelectItem>
                                            <SelectItem value="salary_table">Salary Table</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Common Salary Increase Rate</Label>
                                    <Select 
                                        value={framework.common_salary_increase_rate || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, common_salary_increase_rate: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="required">Required</SelectItem>
                                            <SelectItem value="not_required">Not Required</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {framework.common_salary_increase_rate === 'required' && (
                                    <div>
                                        <Label className="mb-2 block">Common Increase Rate Basis</Label>
                                        <Select 
                                            value={framework.common_increase_rate_basis || ''} 
                                            onValueChange={(v) => onUpdate({ ...framework, common_increase_rate_basis: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select basis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="inflation">Follows inflation rate</SelectItem>
                                                <SelectItem value="company_performance">Linked to company performance</SelectItem>
                                                <SelectItem value="management_discretion">Determined at management discretion each year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div>
                                    <Label className="mb-2 block">Performance-based Increase Differentiation Level</Label>
                                    <Select 
                                        value={framework.performance_based_increase_differentiation || ''} 
                                        onValueChange={(v) => onUpdate({ ...framework, performance_based_increase_differentiation: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="strong">Strong differentiation</SelectItem>
                                            <SelectItem value="moderate">Moderate differentiation</SelectItem>
                                            <SelectItem value="none">No differentiation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Summary Note</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={generateSummaryNote()}
                                        readOnly
                                        rows={8}
                                        className="w-full bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        ※ A final HR system design report, incorporating professional consultant review and recommendations based on the company's inputs and organizational characteristics, will be provided.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-base">Step Purpose</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                In this step, you define the core principles that determine how base salaries are structured and adjusted within your organization.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                You will configure the salary structure type, increase method, adjustment cycle, performance linkage level, and salary determination criteria, creating a standardized compensation framework for the entire company.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                These principles will be used to automatically generate pay bands or salary tables and will serve as the foundation for all compensation decisions, including hiring, salary increases, and labor cost management.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
