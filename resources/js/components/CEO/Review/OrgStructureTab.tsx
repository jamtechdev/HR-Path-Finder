import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ReadOnlyField } from './ReadOnlyField';

interface OrgStructureTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    readOnly?: boolean;
}

const STRUCTURE_TYPES = [
    { value: 'functional', label: 'Functional' },
    { value: 'divisional', label: 'Divisional Structure' },
    { value: 'matrix', label: 'Project / Matrix Organization' },
    { value: 'hq_subsidiary', label: 'HQ–Subsidiary Structure' },
    { value: 'no_defined', label: 'No Clearly Defined Structure' },
];

export default function OrgStructureTab({ data, setData, readOnly = false }: OrgStructureTabProps) {
    if (readOnly) {
        const selected = (data.org_structure_types || []).filter(Boolean);
        const labels = selected.map((v: string) => STRUCTURE_TYPES.find((t) => t.value === v)?.label || v);
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Organizational Structure</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <ReadOnlyField label="Structure Type" value={labels.length ? labels.join(', ') : '—'} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Organizational Structure</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Label className="text-sm font-semibold block mb-4">Structure Type (Multi-select)</Label>
                    {STRUCTURE_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-3 p-3 border-2 border-border rounded-lg hover:border-primary/40 transition-colors bg-card">
                            <Checkbox
                                id={`structure-${type.value}`}
                                checked={data.org_structure_types?.includes(type.value) || false}
                                onCheckedChange={(checked) => {
                                    const current = data.org_structure_types || [];
                                    if (checked) {
                                        setData('org_structure_types', [...current, type.value]);
                                    } else {
                                        setData('org_structure_types', current.filter(t => t !== type.value));
                                    }
                                }}
                            />
                            <Label htmlFor={`structure-${type.value}`} className="cursor-pointer flex-1 text-sm font-medium">
                                {type.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
