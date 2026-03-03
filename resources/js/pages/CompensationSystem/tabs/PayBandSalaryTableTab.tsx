import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import type { PayBand, SalaryTable, PayBandOperationCriteria, BaseSalaryFramework } from '../types';

interface PayBandSalaryTableTabProps {
    projectId: number;
    salaryDeterminationStandard?: string;
    payBands: PayBand[];
    salaryTables: SalaryTable[];
    operationCriteria: PayBandOperationCriteria;
    onPayBandsUpdate: (bands: PayBand[]) => void;
    onSalaryTablesUpdate: (tables: SalaryTable[]) => void;
    onOperationCriteriaUpdate: (criteria: PayBandOperationCriteria) => void;
}

export default function PayBandSalaryTableTab({
    projectId,
    salaryDeterminationStandard,
    payBands,
    salaryTables,
    operationCriteria,
    onPayBandsUpdate,
    onSalaryTablesUpdate,
    onOperationCriteriaUpdate,
}: PayBandSalaryTableTabProps) {
    const [activeType, setActiveType] = useState<'pay_band' | 'salary_table'>(
        salaryDeterminationStandard === 'salary_table' ? 'salary_table' : 'pay_band'
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Pay Band / Salary Table</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {salaryDeterminationStandard === 'pay_band' 
                        ? 'Create and configure your pay band structure with visual representation.'
                        : 'Create and configure your salary table structure.'}
                </p>
            </div>
            
            <Tabs value={activeType} onValueChange={(v) => setActiveType(v as 'pay_band' | 'salary_table')}>
                <TabsList>
                    <TabsTrigger value="pay_band">Pay Band</TabsTrigger>
                    <TabsTrigger value="salary_table">Salary Table</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pay_band" className="mt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Pay Band Structure</Label>
                            <Button 
                                onClick={() => onPayBandsUpdate([...payBands, { 
                                    id: Date.now(), 
                                    job_grade: '', 
                                    min_salary: 0, 
                                    max_salary: 0, 
                                    order: payBands.length 
                                }])} 
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Pay Band
                            </Button>
                        </div>
                        {payBands.map((band, idx) => (
                            <Card key={band.id || idx}>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label>Job Grade</Label>
                                            <Input 
                                                value={band.job_grade} 
                                                onChange={(e) => {
                                                    const updated = [...payBands];
                                                    updated[idx].job_grade = e.target.value;
                                                    onPayBandsUpdate(updated);
                                                }} 
                                            />
                                        </div>
                                        <div>
                                            <Label>Min Salary (KRW)</Label>
                                            <Input 
                                                type="number" 
                                                value={band.min_salary} 
                                                onChange={(e) => {
                                                    const updated = [...payBands];
                                                    updated[idx].min_salary = parseFloat(e.target.value) || 0;
                                                    onPayBandsUpdate(updated);
                                                }} 
                                            />
                                        </div>
                                        <div>
                                            <Label>Max Salary (KRW)</Label>
                                            <Input 
                                                type="number" 
                                                value={band.max_salary} 
                                                onChange={(e) => {
                                                    const updated = [...payBands];
                                                    updated[idx].max_salary = parseFloat(e.target.value) || 0;
                                                    onPayBandsUpdate(updated);
                                                }} 
                                            />
                                        </div>
                                        <div>
                                            <Label>Target Salary (KRW)</Label>
                                            <Input 
                                                type="number" 
                                                value={band.target_salary || ''} 
                                                onChange={(e) => {
                                                    const updated = [...payBands];
                                                    updated[idx].target_salary = parseFloat(e.target.value) || undefined;
                                                    onPayBandsUpdate(updated);
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2" 
                                        onClick={() => onPayBandsUpdate(payBands.filter((_, i) => i !== idx))}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {payBands.length === 0 && (
                            <Card className="border-dashed">
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground">No pay bands configured. Click "Add Pay Band" to get started.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="salary_table" className="mt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Salary Table Structure</Label>
                            <Button 
                                onClick={() => onSalaryTablesUpdate([...salaryTables, { 
                                    id: Date.now(), 
                                    job_role: '', 
                                    grade: '', 
                                    years_in_grade: 1, 
                                    order: salaryTables.length 
                                }])} 
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Row
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job Role</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Years in Grade</TableHead>
                                        <TableHead>LV.1</TableHead>
                                        <TableHead>LV.2</TableHead>
                                        <TableHead>LV.3</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salaryTables.map((table, idx) => (
                                        <TableRow key={table.id || idx}>
                                            <TableCell>
                                                <Input 
                                                    value={table.job_role} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].job_role = e.target.value;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-32" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={table.grade} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].grade = e.target.value;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-24" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={table.years_in_grade} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].years_in_grade = parseInt(e.target.value) || 1;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-20" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={table.level_1 || ''} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].level_1 = parseFloat(e.target.value) || undefined;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-24" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={table.level_2 || ''} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].level_2 = parseFloat(e.target.value) || undefined;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-24" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={table.level_3 || ''} 
                                                    onChange={(e) => {
                                                        const updated = [...salaryTables];
                                                        updated[idx].level_3 = parseFloat(e.target.value) || undefined;
                                                        onSalaryTablesUpdate(updated);
                                                    }} 
                                                    className="w-24" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => onSalaryTablesUpdate(salaryTables.filter((_, i) => i !== idx))}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {salaryTables.length === 0 && (
                            <Card className="border-dashed">
                                <CardContent className="p-8 text-center">
                                    <p className="text-muted-foreground">No salary table rows configured. Click "Add Row" to get started.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
            
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Operation Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="mb-2 block">Outlier (Above Max, Below Min)</Label>
                            <Select 
                                value={operationCriteria.outlier_handling || ''} 
                                onValueChange={(v) => onOperationCriteriaUpdate({ ...operationCriteria, outlier_handling: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="not_allowed">Not allowed</SelectItem>
                                    <SelectItem value="allowed_with_ceo_approval">Allowed by CEO's Approval</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-2 block">Promotion Movement Rule</Label>
                            <Select 
                                value={operationCriteria.promotion_movement_rule || ''} 
                                onValueChange={(v) => onOperationCriteriaUpdate({ ...operationCriteria, promotion_movement_rule: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guarantee_minimum">Minimum of the new pay band is guaranteed</SelectItem>
                                    <SelectItem value="below_minimum_allowed">Below minimum allowed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-2 block">Band Review Cycle</Label>
                            <Select 
                                value={operationCriteria.band_review_cycle || ''} 
                                onValueChange={(v) => onOperationCriteriaUpdate({ ...operationCriteria, band_review_cycle: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="every_2_years">Every 2 years</SelectItem>
                                    <SelectItem value="ad_hoc">Ad-hoc only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
