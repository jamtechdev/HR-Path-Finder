import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BenefitsConfiguration } from '../types';

interface BenefitsTabProps {
    configuration: BenefitsConfiguration;
    onUpdate: (config: BenefitsConfiguration) => void;
    snapshotBenefitsPrograms?: string[]; // From Q17 of snapshot
}

export default function BenefitsTab({ configuration, onUpdate, snapshotBenefitsPrograms = [] }: BenefitsTabProps) {
    // Auto-calculate benefits expense ratio
    const benefitsExpenseRatio = configuration.previous_year_total_salary && configuration.previous_year_total_benefits_expense
        ? (configuration.previous_year_total_benefits_expense / configuration.previous_year_total_salary) * 100
        : configuration.benefits_expense_ratio || 0;

    // Initialize current benefits programs from snapshot if not set
    const currentPrograms = configuration.current_benefits_programs || 
        snapshotBenefitsPrograms.map(name => ({ name, status: 'maintain' }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="shadow-sm border">
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Benefits Configuration</h3>
                            </div>

                            {/* Auto-calculated fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="mb-2 block">Previous Year Total Salary (KRW)</Label>
                                    <Input 
                                        type="number" 
                                        value={configuration.previous_year_total_salary || ''} 
                                        onChange={(e) => {
                                            const salary = parseFloat(e.target.value) || undefined;
                                            onUpdate({ ...configuration, previous_year_total_salary: salary });
                                        }}
                                        placeholder="Auto-calculated from Step 4-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">(Auto)</p>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Previous Year Total Benefits Expense (KRW)</Label>
                                    <Input 
                                        type="number" 
                                        value={configuration.previous_year_total_benefits_expense || ''} 
                                        onChange={(e) => {
                                            const expense = parseFloat(e.target.value) || undefined;
                                            onUpdate({ ...configuration, previous_year_total_benefits_expense: expense });
                                        }}
                                        placeholder="Auto-calculated from Step 4-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">(Auto)</p>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Benefits Expense Ratio</Label>
                                    <Input 
                                        type="number" 
                                        value={benefitsExpenseRatio.toFixed(2)} 
                                        disabled
                                        placeholder="Auto-calculated"
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">(Auto-calculated)</p>
                                </div>
                            </div>

                            {/* Benefits Strategic Direction */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Benefits Strategic Direction</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">Select up to 2 (Primary / Secondary objective)</p>
                                    <div className="space-y-2">
                                        {[
                                            'Improve employee satisfaction and retention',
                                            'Strengthen performance-based rewards',
                                            'Enhance tax efficiency (company / employees)',
                                            'Strengthen talent attraction and employer competitiveness'
                                        ].map((option) => {
                                            const selected = configuration.benefits_strategic_direction?.find(d => d.value === option);
                                            const selectedCount = configuration.benefits_strategic_direction?.length || 0;
                                            return (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={!!selected}
                                                        disabled={!selected && selectedCount >= 2}
                                                        onCheckedChange={(checked) => {
                                                            const current = configuration.benefits_strategic_direction || [];
                                                            if (checked) {
                                                                onUpdate({ 
                                                                    ...configuration, 
                                                                    benefits_strategic_direction: [
                                                                        ...current, 
                                                                        { value: option, priority: selectedCount === 0 ? 'primary' : 'secondary' }
                                                                    ]
                                                                });
                                                            } else {
                                                                onUpdate({ 
                                                                    ...configuration, 
                                                                    benefits_strategic_direction: current.filter(d => d.value !== option) 
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <Label className="cursor-pointer">{option}</Label>
                                                    {selected && (
                                                        <Badge variant="outline" className="ml-2">
                                                            {selected.priority === 'primary' ? 'Primary' : 'Secondary'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Current Benefits Programs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Current Benefits Programs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">(Auto-linked from Step 4-1 input)</p>
                                    <div className="space-y-3">
                                        {currentPrograms.map((program, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                                <Label>{program.name}</Label>
                                                <Select 
                                                    value={program.status} 
                                                    onValueChange={(v) => {
                                                        const updated = [...currentPrograms];
                                                        updated[idx] = { ...updated[idx], status: v };
                                                        onUpdate({ ...configuration, current_benefits_programs: updated });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="maintain">Maintain</SelectItem>
                                                        <SelectItem value="expand">Expand</SelectItem>
                                                        <SelectItem value="reduce">Reduce</SelectItem>
                                                        <SelectItem value="discontinue">Discontinue</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Future Programs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Future Programs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Internal Welfare Fund', key: 'internal_welfare_fund' },
                                            { name: 'Employee Stock Ownership Plan (ESOP)', key: 'esop' }
                                        ].map((program) => {
                                            const existing = configuration.future_programs?.find(p => p.name === program.name);
                                            return (
                                                <div key={program.key} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <Label>{program.name}</Label>
                                                    <Select 
                                                        value={existing?.status || 'no_plan'} 
                                                        onValueChange={(v) => {
                                                            const current = configuration.future_programs || [];
                                                            const updated = current.filter(p => p.name !== program.name);
                                                            if (v !== 'no_plan') {
                                                                updated.push({ name: program.name, status: v });
                                                            }
                                                            onUpdate({ ...configuration, future_programs: updated });
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-48">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="no_plan">No plan</SelectItem>
                                                            <SelectItem value="currently_operating">Currently in operation</SelectItem>
                                                            <SelectItem value="planned_3_years">Planned within 3 years</SelectItem>
                                                            <SelectItem value="actively_considering">Actively considering introduction</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-muted/50">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">
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
                                In this step, the company defines the overall operating principles governing the level, structure, and strategic direction of employee benefits.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This includes determining the benefits budget level, key programs, and strategic objectives, forming the foundational framework for the company-wide benefits system.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
