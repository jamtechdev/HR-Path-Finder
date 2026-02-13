import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Diagnosis {
    id: number;
    org_structure_types?: string[];
    org_structure_explanations?: Record<string, string>;
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

const STRUCTURE_TYPES = [
    {
        value: 'functional',
        label: 'Functional',
        description: 'Teams are organized by function, such as Sales, HR, Finance, or Production. Example: Separate teams for Sales, Production, HR, and Finance.',
    },
    {
        value: 'divisional',
        label: 'Divisional Structure',
        description: 'Teams are organized by business units, products, or brands. Example: Business Unit A / Business Unit B / Overseas Business Unit.',
    },
    {
        value: 'matrix',
        label: 'Project / Matrix Organization',
        description: 'Employees belong to a functional team but also work under project or product leaders. Example: An engineer reports to both a team manager and a project manager.',
    },
    {
        value: 'hq_subsidiary',
        label: 'HQ–Subsidiary Structure',
        description: 'The headquarters manages and oversees multiple subsidiaries or business sites. Example: HQ handles planning and management, while subsidiaries focus on operations.',
    },
    {
        value: 'no_defined',
        label: 'No Clearly Defined Structure',
        description: 'Roles and reporting lines are flexible and not clearly defined.',
    },
];

export default function OrganizationalStructure({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(
        diagnosis?.org_structure_types || []
    );

    const { data, setData, post, processing, errors } = useForm({
        org_structure_types: [] as string[],
    });

    // Update form data when selections change
    useEffect(() => {
        setData('org_structure_types', selectedTypes);
    }, [selectedTypes]);

    // Removed auto-save - only save on review and submit

    return (
        <>
            <Head title={`Organizational Structure - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Organizational Structure"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-charts"
                nextRoute="job-structure"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="px-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">
                                Organizational Structure (Multiple Selection) <span className="text-destructive">*</span>
                            </Label>

                            <div className="space-y-3">
                                {STRUCTURE_TYPES.map((type) => (
                                    <div key={type.value} className="flex items-start gap-4 p-4 border rounded-lg shadow-sm hover:bg-muted/50 transition duration-300 ease-in-out">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id={`structure-${type.value}`}
                                                    checked={selectedTypes.includes(type.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTypes([...selectedTypes, type.value]);
                                                        } else {
                                                            setSelectedTypes(selectedTypes.filter(t => t !== type.value));
                                                        }
                                                    }}
                                                    className="w-5 h-5 rounded-sm border-gray-400 cursor-pointer transition duration-200"
                                                />
                                                <Label htmlFor={`structure-${type.value}`} className="font-medium text-lg text-primary-dark cursor-pointer">
                                                    {type.label}
                                                </Label>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="w-5 h-5 text-muted-foreground hover:text-primary transition duration-200" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-sm p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg">
                                                            <p>{type.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            <p className="text-sm text-muted-foreground mt-2 ml-8 leading-tight">{type.description}</p>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
