import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ExecutivesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    executivePositions: Array<{ role: string; count: number }>;
    setExecutivePositions: (positions: Array<{ role: string; count: number }>) => void;
}

export default function ExecutivesTab({ 
    data, 
    setData, 
    executivePositions, 
    setExecutivePositions 
}: ExecutivesTabProps) {
    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Executives</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Total Executives</Label>
                    <Input 
                        type="number"
                        value={data.total_executives || ''} 
                        onChange={(e) => setData('total_executives', parseInt(e.target.value) || 0)}
                        className="h-11 max-w-xs"
                    />
                </div>
                <div className="space-y-4 pt-4 border-t">
                    <Label className="text-sm font-semibold block">Executive Positions</Label>
                    {executivePositions.map((pos, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border-2 border-border rounded-lg bg-card">
                            <Input
                                placeholder="Position name"
                                value={pos.role}
                                onChange={(e) => {
                                    const updated = [...executivePositions];
                                    updated[index].role = e.target.value;
                                    setExecutivePositions(updated);
                                }}
                                className="flex-1 h-11"
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
                                className="w-32 h-11"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setExecutivePositions(executivePositions.filter((_, i) => i !== index))}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExecutivePositions([...executivePositions, { role: '', count: 1 }])}
                        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Position
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
