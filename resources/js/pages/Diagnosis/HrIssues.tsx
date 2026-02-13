import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';
import TextQuestion from '@/components/Forms/TextQuestion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Diagnosis {
    id: number;
    hr_issues?: string[];
    custom_hr_issues?: string;
}

interface HrIssue {
    id: number;
    category: string;
    name: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    hrIssues?: HrIssue[];
}

const ISSUE_CATEGORIES = [
    'recruitment_retention',
    'organization',
    'culture_leadership',
    'evaluation_compensation',
    'upskilling',
    'others',
];

const CATEGORY_LABELS: Record<string, string> = {
    recruitment_retention: 'Recruitment / Retention',
    organization: 'Organization',
    culture_leadership: 'Culture / Leadership',
    evaluation_compensation: 'Evaluation / Compensation',
    upskilling: 'Upskilling',
    others: 'Others',
};

export default function HrIssues({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    hrIssues = [],
}: Props) {
    const [selectedIssues, setSelectedIssues] = useState<string[]>(
        diagnosis?.hr_issues || []
    );

    const { data, setData, post, processing, errors } = useForm({
        hr_issues: [] as string[],
        custom_hr_issues: diagnosis?.custom_hr_issues || '',
    });

    // Update form data when selections change
    useEffect(() => {
        setData('hr_issues', selectedIssues);
    }, [selectedIssues]);

    // Removed auto-save - only save on review and submit

    // Group issues by category
    const issuesByCategory = ISSUE_CATEGORIES.reduce((acc, category) => {
        acc[category] = hrIssues.filter(issue => issue.category === category);
        return acc;
    }, {} as Record<string, HrIssue[]>);

    return (
        <>
            <Head title={`Key HR/Organizational Issues - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Key HR/Organizational Issues"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="job-structure"
                nextRoute="review"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="px-6">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-muted-foreground">
                                Select all issues that apply to your organization. You can add additional items if needed.
                            </p>
                        </div>

                        {/* Issues by Category */}
                        {ISSUE_CATEGORIES.map((category) => {
                            const categoryIssues = issuesByCategory[category] || [];
                            if (categoryIssues.length === 0) return null;

                            return (
                                <div key={category} className="space-y-3">
                                    <Label className="text-sm font-semibold">
                                        {CATEGORY_LABELS[category]}
                                    </Label>
                                    <MultiSelectQuestion
                                        question=""
                                        value={selectedIssues.filter(issueId => 
                                            categoryIssues.some(issue => issue.id.toString() === issueId)
                                        )}
                                        onChange={(selected) => {
                                            const otherCategoryIssues = selectedIssues.filter(issueId =>
                                                !categoryIssues.some(issue => issue.id.toString() === issueId)
                                            );
                                            setSelectedIssues([...otherCategoryIssues, ...selected]);
                                        }}
                                        options={categoryIssues.map(issue => ({
                                            value: issue.id.toString(),
                                            label: issue.name,
                                        }))}
                                        columns={1}
                                    />
                                </div>
                            );
                        })}

                        {/* Custom HR Issues */}
                        <div className="space-y-2">
                            <TextQuestion
                                question="Additional Issues (Optional)"
                                value={data.custom_hr_issues}
                                onChange={(value) => setData('custom_hr_issues', value)}
                                type="textarea"
                                placeholder="Add any additional HR or organizational issues not listed above"
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
