import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LeadersTabProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function LeadersTab({ data, setData }: LeadersTabProps) {
    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Leaders</CardTitle>
                <CardDescription>Excludes executives</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Total Leaders</Label>
                    <Input 
                        type="number"
                        value={data.leadership_count || ''} 
                        onChange={(e) => setData('leadership_count', parseInt(e.target.value) || 0)}
                        className="h-11 max-w-xs"
                    />
                </div>
                {data.leadership_percentage !== undefined && data.leadership_percentage !== null && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium">
                            <strong>Leaders Ratio:</strong> {Number(data.leadership_percentage).toFixed(2)}%
                            <span className="text-muted-foreground ml-2">
                                ({data.leadership_count || 0} leaders / {data.present_headcount || 0} workforce)
                            </span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
