import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import DynamicList from '@/components/Forms/DynamicList';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Diagnosis {
    id: number;
    job_categories?: string[];
    job_functions?: string[];
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
}

const DEFAULT_JOB_FUNCTIONS = [
    'HR',
    'General Affairs',
    'Finance',
    'Accounting',
    'Treasury',
    'IT',
    'Tax',
];

export default function JobStructure({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [jobCategories, setJobCategories] = useState<string[]>(
        diagnosis?.job_categories || []
    );
    const [jobFunctions, setJobFunctions] = useState<string[]>(
        diagnosis?.job_functions || []
    );
    const [customJobFunction, setCustomJobFunction] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        job_categories: [] as string[],
        job_functions: [] as string[],
    });

    // Update form data when changes occur
    useEffect(() => {
        setData('job_categories', jobCategories);
        setData('job_functions', jobFunctions);
    }, [jobCategories, jobFunctions]);

    // Removed auto-save - only save on review and submit

    const addCustomJobFunction = () => {
        if (customJobFunction.trim() && !jobFunctions.includes(customJobFunction.trim())) {
            setJobFunctions([...jobFunctions, customJobFunction.trim()]);
            setCustomJobFunction('');
        }
    };

    return (
        <>
            <Head title={`Job Structure - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Job Structure"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-structure"
                nextRoute="hr-issues"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="px-6">
                        {/* Job Categories */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Job Category</Label>
                            <DynamicList
                                label=""
                                items={jobCategories}
                                onChange={setJobCategories}
                                placeholder="Enter job category (e.g., Management, Support)"
                                addLabel="Add Job Category"
                            />
                        </div>

                        {/* Job Functions */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Job Function</Label>
                            <MultiSelectQuestion
                                question="Select job functions"
                                value={jobFunctions.filter(f => DEFAULT_JOB_FUNCTIONS.includes(f))}
                                onChange={(selected) => {
                                    const customFunctions = jobFunctions.filter(f => !DEFAULT_JOB_FUNCTIONS.includes(f));
                                    setJobFunctions([...selected, ...customFunctions]);
                                }}
                                options={DEFAULT_JOB_FUNCTIONS}
                                columns={2}
                            />
                            
                            {/* Custom Job Functions */}
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="text"
                                    value={customJobFunction}
                                    onChange={(e) => setCustomJobFunction(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomJobFunction();
                                        }
                                    }}
                                    placeholder="Add custom job function"
                                    className="flex-1 px-3 py-2 border rounded-md"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCustomJobFunction}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            {/* Display selected custom functions */}
                            {jobFunctions.filter(f => !DEFAULT_JOB_FUNCTIONS.includes(f)).length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <Label className="text-xs text-muted-foreground">Custom Job Functions:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {jobFunctions
                                            .filter(f => !DEFAULT_JOB_FUNCTIONS.includes(f))
                                            .map((func, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                                                >
                                                    {func}
                                                    <button
                                                        type="button"
                                                        onClick={() => setJobFunctions(jobFunctions.filter(f => f !== func))}
                                                        className="ml-2 text-primary/70 hover:text-primary"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
