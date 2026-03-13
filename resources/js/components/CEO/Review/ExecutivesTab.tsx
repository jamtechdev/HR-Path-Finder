import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ReadOnlyField } from './ReadOnlyField';

interface ExecutivesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    executivePositions: Array<{ role: string; count: number }>;
    setExecutivePositions: (positions: Array<{ role: string; count: number }>) => void;
    readOnly?: boolean;
}

export default function ExecutivesTab({ 
    data, 
    setData, 
    executivePositions, 
    setExecutivePositions,
    readOnly = false,
}: ExecutivesTabProps) {
    if (readOnly) {
        const positionsStr = executivePositions.length
            ? executivePositions.map((p) => `${p.role}: ${p.count}`).join(', ')
            : '—';
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl font-bold">Executives</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <ReadOnlyField label="Total Executives" value={data.total_executives ?? '—'} />
                    <ReadOnlyField label="Executive Positions" value={positionsStr} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl font-bold">Executives</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Total Executives</Label>
                    <Input 
                        type="number"
                        value={data.total_executives || ''} 
                        onChange={(e) => setData('total_executives', parseInt(e.target.value) || 0)}
                        className="h-11 min-h-[44px] max-w-xs w-full"
                    />
                </div>
                <div className="space-y-3 sm:space-y-4 pt-4 border-t">
                    <Label className="text-sm font-semibold block">Executive Positions</Label>
                    {executivePositions.map((pos, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-border rounded-lg bg-card">
                            <Input
                                placeholder="Position name"
                                value={pos.role}
                                onChange={(e) => {
                                    const updated = [...executivePositions];
                                    updated[index].role = e.target.value;
                                    setExecutivePositions(updated);
                                }}
                                className="flex-1 h-11 min-h-[44px]"
                            />
                            <Input
                                type="number"
                                placeholder="Count"
                                value={pos.count || ''}
                                onChange={(e) => {
                                    const updated = [...executivePositions];
                                    updated[index].count = parseInt(e.target.value) || 0;
                                    setExecutivePositions(updated);
                                }}
                                className="w-full sm:w-32 h-11 min-h-[44px]"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setExecutivePositions(executivePositions.filter((_, i) => i !== index))}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11 min-h-[44px] sm:min-h-0 w-11 flex-shrink-0 mt-1 sm:mt-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExecutivePositions([...executivePositions, { role: '', count: 1 }])}
                        className="w-full h-11 min-h-[44px] border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Position
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
