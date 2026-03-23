import { Plus, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReadOnlyField } from './ReadOnlyField';

interface JobGradesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    readOnly?: boolean;
}

export default function JobGradesTab({ data, setData, readOnly = false }: JobGradesTabProps) {
    if (readOnly) {
        const grades = data.job_grade_names?.length ? data.job_grade_names.map((g: string, i: number) => {
            const yrs = data.promotion_years?.[g] ?? '—';
            return `${g} (promotion: ${yrs} yrs)`;
        }).join(' · ') : '—';
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Job Grade System</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <ReadOnlyField label="Grade Names & Promotion Years" value={grades} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Job Grade System</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <Label className="text-sm font-semibold block">Grade Names</Label>
                    {data.job_grade_names?.map((grade: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-card">
                            <Input
                                value={grade}
                                onChange={(e) => {
                                    const updated = [...(data.job_grade_names || [])];
                                    updated[index] = e.target.value;
                                    setData('job_grade_names', updated);
                                }}
                                className="flex-1 h-11"
                                placeholder="Grade name"
                            />
                            <Input
                                type="number"
                                placeholder="Promotion years"
                                value={data.promotion_years?.[grade] || ''}
                                onChange={(e) => {
                                    const updated = { ...(data.promotion_years || {}) };
                                    updated[grade] = e.target.value ? parseInt(e.target.value) : null;
                                    setData('promotion_years', updated);
                                }}
                                className="w-40 h-11"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const updated = [...(data.job_grade_names || [])];
                                    updated.splice(index, 1);
                                    setData('job_grade_names', updated);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            const updated = [...(data.job_grade_names || []), ''];
                            setData('job_grade_names', updated);
                        }}
                        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Grade
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
