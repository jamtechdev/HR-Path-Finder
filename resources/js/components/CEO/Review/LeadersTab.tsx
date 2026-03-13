import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReadOnlyField } from './ReadOnlyField';

interface LeadersTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    readOnly?: boolean;
}

export default function LeadersTab({ data, setData, readOnly = false }: LeadersTabProps) {
    if (readOnly) {
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl font-bold">Leaders</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Excludes executives</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <ReadOnlyField label="Total Leaders" value={data.leadership_count ?? '—'} />
                    {data.leadership_percentage != null && (
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                            <p className="text-xs sm:text-sm font-medium leading-relaxed">
                                Leaders ratio: {Number(data.leadership_percentage).toFixed(2)}%
                                <span className="text-muted-foreground ml-1 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                                    ({data.leadership_count ?? 0} / {data.present_headcount ?? 0} workforce)
                                </span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl font-bold">Leaders</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Excludes executives</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Total Leaders</Label>
                    <Input 
                        type="number"
                        value={data.leadership_count || ''} 
                        onChange={(e) => setData('leadership_count', parseInt(e.target.value) || 0)}
                        className="h-11 min-h-[44px] max-w-xs w-full"
                    />
                </div>
                {data.leadership_percentage !== undefined && data.leadership_percentage !== null && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                            <strong>Leaders Ratio:</strong> {Number(data.leadership_percentage).toFixed(2)}%
                            <span className="text-muted-foreground ml-1 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                                ({data.leadership_count || 0} leaders / {data.present_headcount || 0} workforce)
                            </span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
