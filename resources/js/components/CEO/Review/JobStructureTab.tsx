import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JobStructureTabProps {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function JobStructureTab({ data, setData }: JobStructureTabProps) {
    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Job Structure</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Job Categories</Label>
                    <Textarea 
                        value={Array.isArray(data.job_categories) ? data.job_categories.join(', ') : ''} 
                        onChange={(e) => setData('job_categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Enter job categories separated by commas"
                        rows={4}
                        className="resize-y"
                    />
                </div>
                <div className="space-y-2 pt-4 border-t">
                    <Label className="text-sm font-semibold">Job Functions</Label>
                    <Textarea 
                        value={Array.isArray(data.job_functions) ? data.job_functions.join(', ') : ''} 
                        onChange={(e) => setData('job_functions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Enter job functions separated by commas"
                        rows={4}
                        className="resize-y"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
