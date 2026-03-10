import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ReadOnlyField } from './ReadOnlyField';

interface HrIssue {
    id: number;
    name: string;
    category: string;
}

interface HrIssuesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    hrIssues: HrIssue[];
    readOnly?: boolean;
}

const categoryLabels: Record<string, string> = {
    recruitment_retention: 'Recruitment / Retention',
    organization: 'Organization',
    culture_leadership: 'Culture / Leadership',
    evaluation_compensation: 'Evaluation / Compensation',
    upskilling: 'Upskilling',
    others: 'Others',
};

export default function HrIssuesTab({ data, setData, hrIssues, readOnly = false }: HrIssuesTabProps) {
    const issuesByCategory = hrIssues.reduce((acc, issue) => {
        if (!acc[issue.category]) {
            acc[issue.category] = [];
        }
        acc[issue.category].push(issue);
        return acc;
    }, {} as Record<string, HrIssue[]>);

    if (readOnly) {
        const selectedIds = new Set((data.hr_issues || []).map((id: string) => id.toString()));
        const selectedNames = hrIssues.filter((i) => selectedIds.has(i.id.toString())).map((i) => i.name);
        const custom = (data.custom_hr_issues || '').trim();
        return (
            <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-xl">Key HR / Organizational Issues</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <ReadOnlyField
                        label="Selected issues"
                        value={selectedNames.length ? selectedNames.join('; ') : '—'}
                    />
                    {custom && <ReadOnlyField label="Additional issues (free text)" value={custom} />}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl">Key HR / Organizational Issues</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {Object.entries(issuesByCategory).map(([category, issues]) => (
                    <div key={category} className="space-y-3">
                        <Label className="text-sm font-semibold block pb-2 border-b">
                            {categoryLabels[category] || category}
                        </Label>
                        <div className="space-y-3">
                            {issues.map((issue) => (
                                <div key={issue.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:border-primary/40 transition-colors">
                                    <Checkbox
                                        id={`issue-${issue.id}`}
                                        checked={data.hr_issues?.includes(issue.id.toString()) || false}
                                        onCheckedChange={(checked) => {
                                            const current = data.hr_issues || [];
                                            if (checked) {
                                                setData('hr_issues', [...current, issue.id.toString()]);
                                            } else {
                                                setData('hr_issues', current.filter(id => id !== issue.id.toString()));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`issue-${issue.id}`} className="cursor-pointer flex-1 text-sm font-medium">
                                        {issue.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="space-y-2 pt-4 border-t">
                    <Label className="text-sm font-semibold">Additional Issues (Free Text)</Label>
                    <Textarea 
                        value={data.custom_hr_issues || ''} 
                        onChange={(e) => setData('custom_hr_issues', e.target.value)}
                        rows={5}
                        placeholder="Add any additional HR or organizational issues not listed above"
                        className="resize-y"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
