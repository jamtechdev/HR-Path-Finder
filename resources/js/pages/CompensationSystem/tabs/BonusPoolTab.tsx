import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BonusPoolConfiguration } from '../types';

interface BonusPoolTabProps {
    configuration: BonusPoolConfiguration;
    onUpdate: (config: BonusPoolConfiguration) => void;
}

export default function BonusPoolTab({ configuration, onUpdate }: BonusPoolTabProps) {
    const generateSummaryNote = (): string => {
        return `Considering the company's organizational characteristics and management objectives, the company intends to determine the bonus pool based on the defined ${configuration.bonus_pool_determination_criteria || '[Bonus Pool Determination Criteria]'}, and to distribute performance bonuses to employees within the defined ${configuration.eligibility_scope || '[Eligibility Scope]'}, using the configured ${configuration.allocation_scope || '[Allocation Method]'} to ensure differentiated and performance-aligned compensation.

Performance bonuses will be paid upon satisfaction of the defined ${configuration.payment_trigger_condition || '[Payment Trigger Condition]'}, and will be administered according to the established payment timing as a general operating principle.

In addition, performance bonuses will be calculated based on performance outcomes within the defined calculation period, ensuring that compensation is distributed fairly and consistently in alignment with both organizational and individual performance results.`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="shadow-sm border">
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Bonus Pool Configuration</h3>
                            </div>
                            
                            {/* Bonus Pool Determination */}
                            <div className="space-y-4">
                                <h4 className="font-semibold">Bonus Pool Determination</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Payment Trigger Condition</Label>
                                        <Select 
                                            value={configuration.payment_trigger_condition || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, payment_trigger_condition: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="profit_generated">Paid when profit is generated</SelectItem>
                                                <SelectItem value="company_targets">Paid when company-wide targets are achieved</SelectItem>
                                                <SelectItem value="org_targets">Paid when organizational targets are achieved</SelectItem>
                                                <SelectItem value="ceo_discretion">Discretionary (CEO decision)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Bonus Pool Determination Criteria</Label>
                                        <Select 
                                            value={configuration.bonus_pool_determination_criteria || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, bonus_pool_determination_criteria: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select criteria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="revenue">Revenue</SelectItem>
                                                <SelectItem value="operating_profit">Operating profit</SelectItem>
                                                <SelectItem value="net_profit">Net profit</SelectItem>
                                                <SelectItem value="projected_revenue">Projected revenue</SelectItem>
                                                <SelectItem value="projected_operating_profit">Projected operating profit (after tax)</SelectItem>
                                                <SelectItem value="projected_net_profit">Projected net profit (after tax)</SelectItem>
                                                <SelectItem value="ebitda">EBITDA</SelectItem>
                                                <SelectItem value="ceo_discretion">Discretionary (CEO decision)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Bonus Pool Determination Method</Label>
                                        <Select 
                                            value={configuration.bonus_pool_determination_method || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, bonus_pool_determination_method: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed_percentage">Fixed percentage of profit</SelectItem>
                                                <SelectItem value="range_based">Range-based determination</SelectItem>
                                                <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                                                <SelectItem value="separate_by_year">Separate determination by business year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility Determination */}
                            <div className="space-y-4">
                                <h4 className="font-semibold">Eligibility Determination</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Eligibility Scope</Label>
                                        <Select 
                                            value={configuration.eligibility_scope || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, eligibility_scope: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select scope" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_employees">All employees (excluding executives / including contract employees)</SelectItem>
                                                <SelectItem value="regular_only">Regular employees only</SelectItem>
                                                <SelectItem value="above_job_level">Employees above specific job level</SelectItem>
                                                <SelectItem value="specific_org_units">Specific organizational units only</SelectItem>
                                                <SelectItem value="other">Other (manual input)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Eligibility Criteria</Label>
                                        <Select 
                                            value={configuration.eligibility_criteria || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, eligibility_criteria: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select criteria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="year_end_employed">Must be employed as of year-end</SelectItem>
                                                <SelectItem value="announcement_date">Must be employed at bonus announcement date</SelectItem>
                                                <SelectItem value="3_months_after_hire">Must have at least 3 months of service after hire</SelectItem>
                                                <SelectItem value="3_months_in_period">Must have at least 3 months of service within calculation period</SelectItem>
                                                <SelectItem value="other">Other (manual input)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Inclusion of Employees on Leave</Label>
                                        <Select 
                                            value={configuration.inclusion_of_employees_on_leave || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, inclusion_of_employees_on_leave: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="included">Included (working days)</SelectItem>
                                                <SelectItem value="excluded">Excluded</SelectItem>
                                                <SelectItem value="other">Other (manual input)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Allocation Method */}
                            <div className="space-y-4">
                                <h4 className="font-semibold">Allocation Method</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Bonus Calculation Unit</Label>
                                        <Select 
                                            value={configuration.bonus_calculation_unit || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, bonus_calculation_unit: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (% of salary-based calculation)</SelectItem>
                                                <SelectItem value="fixed_amount">Fixed amount (based on salary band or predefined amount)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Allocation Scope</Label>
                                        <Select 
                                            value={configuration.allocation_scope || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, allocation_scope: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select scope" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equal_company_wide">Equal allocation company-wide</SelectItem>
                                                <SelectItem value="differentiated_by_org">Differentiated by organization</SelectItem>
                                                <SelectItem value="differentiated_by_individual">Differentiated by individual performance</SelectItem>
                                                <SelectItem value="differentiated_by_both">Differentiated by organization and individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Allocation Criteria (Select multiple)</Label>
                                        <div className="space-y-2 border rounded-md p-3">
                                            {[
                                                'Individual performance rating',
                                                'Organizational performance results',
                                                'Job grade',
                                                'Job position',
                                                'Role level',
                                            ].map((criteria) => {
                                                const selected = configuration.allocation_criteria?.includes(criteria) || false;
                                                return (
                                                    <div key={criteria} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={selected}
                                                            onCheckedChange={(checked) => {
                                                                const current = configuration.allocation_criteria || [];
                                                                if (checked) {
                                                                    onUpdate({ ...configuration, allocation_criteria: [...current, criteria] });
                                                                } else {
                                                                    onUpdate({ ...configuration, allocation_criteria: current.filter(c => c !== criteria) });
                                                                }
                                                            }}
                                                        />
                                                        <Label className="cursor-pointer text-sm">{criteria}</Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Timing */}
                            <div className="space-y-4">
                                <h4 className="font-semibold">Payment Timing</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Bonus Pool Finalization Timing</Label>
                                        <Select 
                                            value={configuration.bonus_pool_finalization_timing?.toString() || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, bonus_pool_finalization_timing: parseInt(v) })}
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
                                        <Label className="mb-2 block">Bonus Payment Month</Label>
                                        <Select 
                                            value={configuration.bonus_payment_month?.toString() || ''} 
                                            onValueChange={(v) => onUpdate({ ...configuration, bonus_payment_month: parseInt(v) })}
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
                                        <Label className="mb-2 block">Calculation Period Start Date</Label>
                                        <Input
                                            type="date"
                                            value={configuration.calculation_period_start || ''}
                                            onChange={(e) => onUpdate({ ...configuration, calculation_period_start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Calculation Period End Date</Label>
                                        <Input
                                            type="date"
                                            value={configuration.calculation_period_end || ''}
                                            onChange={(e) => onUpdate({ ...configuration, calculation_period_end: e.target.value })}
                                        />
                                    </div>
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
                                        rows={6}
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
                                In this step, the company defines the core operating principles governing how performance bonuses are determined, who is eligible, and how and when bonuses are distributed.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This includes configuring the bonus pool determination criteria, eligibility scope, allocation method, and payment timing, thereby establishing the foundational framework for performance-based compensation applied across the organization.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                The principles defined in this step will serve as the basis for bonus pool calculation, organizational and individual bonus allocation, and labor cost simulation, enabling a consistent and structured linkage between performance outcomes and compensation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
