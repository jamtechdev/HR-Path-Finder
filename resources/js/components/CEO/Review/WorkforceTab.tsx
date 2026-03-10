import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReadOnlyField } from './ReadOnlyField';

interface WorkforceTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    readOnly?: boolean;
}

export default function WorkforceTab({ data, setData, readOnly = false }: WorkforceTabProps) {
    if (readOnly) {
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Workforce Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadOnlyField label="Current Workforce Size" value={data.present_headcount ?? '—'} />
                        <ReadOnlyField label="Average Age (years)" value={data.average_age ?? '—'} />
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-sm font-semibold block mb-4">Workforce Forecast</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReadOnlyField label="After 1 year" value={data.expected_headcount_1y ?? '—'} />
                            <ReadOnlyField label="After 2 years" value={data.expected_headcount_2y ?? '—'} />
                            <ReadOnlyField label="After 3 years" value={data.expected_headcount_3y ?? '—'} />
                        </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-sm font-semibold block mb-4">Average Tenure</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Active employees (years)" value={data.average_tenure_active ?? '—'} />
                            <ReadOnlyField label="Leavers (years)" value={data.average_tenure_leavers ?? '—'} />
                        </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-sm font-semibold block mb-4">Gender Composition</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Male (count)" value={data.gender_male ?? '—'} />
                            <ReadOnlyField label="Female (count)" value={data.gender_female ?? '—'} />
                        </div>
                        {data.gender_ratio != null && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm font-medium">
                                    Male: {Number(data.gender_ratio).toFixed(2)}% | Female: {(100 - Number(data.gender_ratio)).toFixed(2)}%
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Workforce Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Current Workforce Size (Active employees)</Label>
                        <Input 
                            type="number"
                            value={data.present_headcount || ''} 
                            onChange={(e) => setData('present_headcount', parseInt(e.target.value) || 0)}
                            className="h-11"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-semibold block mb-4">Workforce Forecast</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>After 1 year</Label>
                            <Input 
                                type="number"
                                value={data.expected_headcount_1y || ''} 
                                onChange={(e) => setData('expected_headcount_1y', parseInt(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>After 2 years</Label>
                            <Input 
                                type="number"
                                value={data.expected_headcount_2y || ''} 
                                onChange={(e) => setData('expected_headcount_2y', parseInt(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>After 3 years</Label>
                            <Input 
                                type="number"
                                value={data.expected_headcount_3y || ''} 
                                onChange={(e) => setData('expected_headcount_3y', parseInt(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-semibold block mb-4">Average Tenure</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Active employees (years)</Label>
                            <Input 
                                type="number"
                                step="0.1"
                                value={data.average_tenure_active || ''} 
                                onChange={(e) => setData('average_tenure_active', parseFloat(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Leavers (years)</Label>
                            <Input 
                                type="number"
                                step="0.1"
                                value={data.average_tenure_leavers || ''} 
                                onChange={(e) => setData('average_tenure_leavers', parseFloat(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label className="text-sm font-semibold">Average Age (years)</Label>
                    <Input 
                        type="number"
                        step="0.1"
                        value={data.average_age || ''} 
                        onChange={(e) => setData('average_age', parseFloat(e.target.value) || 0)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-semibold block mb-4">Gender Composition</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Male (count)</Label>
                            <Input 
                                type="number"
                                value={data.gender_male || ''} 
                                onChange={(e) => setData('gender_male', parseInt(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Female (count)</Label>
                            <Input 
                                type="number"
                                value={data.gender_female || ''} 
                                onChange={(e) => setData('gender_female', parseInt(e.target.value) || 0)}
                                className="h-11"
                            />
                        </div>
                    </div>
                    {data.gender_ratio !== undefined && data.gender_ratio !== null && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium">
                                <strong>Male %:</strong> {Number(data.gender_ratio).toFixed(2)}% | 
                                <strong> Female %:</strong> {(100 - Number(data.gender_ratio)).toFixed(2)}%
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
