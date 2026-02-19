import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DynamicList from '@/components/Forms/DynamicList';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
    job_description?: string;
    is_finalized?: boolean;
    job_specification?: {
        education?: { required?: string; preferred?: string };
        experience?: { required?: string; preferred?: string };
        skills?: { required?: string; preferred?: string };
        communication?: { required?: string; preferred?: string };
    };
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
}

interface JobDefinitionTemplate {
    job_description?: string;
    job_specification?: any;
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
    selectedJob?: JobDefinition;
    template?: JobDefinitionTemplate;
}

export default function JobDefinitionPage({ project, jobDefinitions, selectedJob, template }: Props) {
    const [activeJobId, setActiveJobId] = useState<number | null>(selectedJob?.id || jobDefinitions[0]?.id || null);
    const [activeTab, setActiveTab] = useState('description');

    const currentJob = jobDefinitions.find(j => j.id === activeJobId) || selectedJob;
    const currentTemplate = template;
    const isFinalized = currentJob?.is_finalized || false;

    const { data, setData, post, processing } = useForm({
        job_description: currentJob?.job_description || currentTemplate?.job_description || '',
        job_specification: currentJob?.job_specification || currentTemplate?.job_specification || {
            education: { required: '', preferred: '' },
            experience: { required: '', preferred: '' },
            skills: { required: '', preferred: '' },
            communication: { required: '', preferred: '' },
        },
        competency_levels: currentJob?.competency_levels || currentTemplate?.competency_levels || [
            { level: 'LV1', description: '' },
            { level: 'LV2', description: '' },
            { level: 'LV3', description: '' },
        ],
        csfs: currentJob?.csfs || currentTemplate?.csfs || [],
    });

    useEffect(() => {
        const job = jobDefinitions.find(j => j.id === activeJobId);
        if (job) {
            setData('job_description', job.job_description || currentTemplate?.job_description || '');
            setData('job_specification', job.job_specification || currentTemplate?.job_specification || {
                education: { required: '', preferred: '' },
                experience: { required: '', preferred: '' },
                skills: { required: '', preferred: '' },
                communication: { required: '', preferred: '' },
            });
            setData('competency_levels', job.competency_levels || currentTemplate?.competency_levels || []);
            setData('csfs', job.csfs || currentTemplate?.csfs || []);
        }
    }, [activeJobId]);

    const handleSave = () => {
        if (activeJobId) {
            post(`/hr-manager/job-analysis/${project.id}/job-definition/${activeJobId}`, {
                preserveScroll: true,
            });
        }
    };

    const addCompetencyLevel = () => {
        const newLevel = { level: `LV${data.competency_levels.length + 1}`, description: '' };
        setData('competency_levels', [...data.competency_levels, newLevel]);
    };

    const addCSF = () => {
        setData('csfs', [...data.csfs, { name: '', description: '' }]);
    };

    return (
        <AppLayout>
            <Head title={`Job Definition - ${project?.company?.name || 'Job Analysis'}`} />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Job Definition</h1>
                                <p className="text-muted-foreground">
                                    Define job standards for each selected role. You can use suggested content or customize as needed.
                                </p>
                            </div>
                            <Select value={activeJobId?.toString() || ''} onValueChange={(value) => setActiveJobId(parseInt(value))}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Select a job" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobDefinitions.map((job) => (
                                        <SelectItem key={job.id} value={job.id.toString()}>
                                            {job.job_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {currentJob && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{currentJob.job_name}</CardTitle>
                                        {currentJob.is_finalized && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                Finalized
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {currentJob.is_finalized && (
                                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Note:</strong> This job definition has been finalized and cannot be edited. Please contact admin if changes are needed.
                                            </p>
                                        </div>
                                    )}
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="description">Job Description</TabsTrigger>
                                            <TabsTrigger value="specification">Job Specification</TabsTrigger>
                                            <TabsTrigger value="competency">Competency Levels</TabsTrigger>
                                            <TabsTrigger value="csfs">Critical Success Factors</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="description" className="space-y-4">
                                            <div>
                                                <Label>Job Description</Label>
                                                <Textarea
                                                    value={data.job_description}
                                                    onChange={(e) => setData('job_description', e.target.value)}
                                                    rows={10}
                                                    placeholder="Job purpose, key responsibilities, scope..."
                                                    disabled={isFinalized}
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="specification" className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Education - Required</Label>
                                                    <Input
                                                        value={data.job_specification.education?.required || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            education: {
                                                                ...data.job_specification.education,
                                                                required: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Education - Preferred</Label>
                                                    <Input
                                                        value={data.job_specification.education?.preferred || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            education: {
                                                                ...data.job_specification.education,
                                                                preferred: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Experience - Required</Label>
                                                    <Input
                                                        value={data.job_specification.experience?.required || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            experience: {
                                                                ...data.job_specification.experience,
                                                                required: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Experience - Preferred</Label>
                                                    <Input
                                                        value={data.job_specification.experience?.preferred || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            experience: {
                                                                ...data.job_specification.experience,
                                                                preferred: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Skills - Required</Label>
                                                    <Textarea
                                                        value={data.job_specification.skills?.required || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            skills: {
                                                                ...data.job_specification.skills,
                                                                required: e.target.value,
                                                            },
                                                        })}
                                                        rows={3}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Skills - Preferred</Label>
                                                    <Textarea
                                                        value={data.job_specification.skills?.preferred || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            skills: {
                                                                ...data.job_specification.skills,
                                                                preferred: e.target.value,
                                                            },
                                                        })}
                                                        rows={3}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Communication - Required</Label>
                                                    <Input
                                                        value={data.job_specification.communication?.required || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            communication: {
                                                                ...data.job_specification.communication,
                                                                required: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Communication - Preferred</Label>
                                                    <Input
                                                        value={data.job_specification.communication?.preferred || ''}
                                                        onChange={(e) => setData('job_specification', {
                                                            ...data.job_specification,
                                                            communication: {
                                                                ...data.job_specification.communication,
                                                                preferred: e.target.value,
                                                            },
                                                        })}
                                                        disabled={isFinalized}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="competency" className="space-y-4">
                                            <div className="space-y-3">
                                                {data.competency_levels.map((level, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                                                        <Input
                                                            value={level.level}
                                                            onChange={(e) => {
                                                                const newLevels = [...data.competency_levels];
                                                                newLevels[index].level = e.target.value;
                                                                setData('competency_levels', newLevels);
                                                            }}
                                                            className="w-24"
                                                            disabled={isFinalized}
                                                        />
                                                        <Textarea
                                                            value={level.description}
                                                            onChange={(e) => {
                                                                const newLevels = [...data.competency_levels];
                                                                newLevels[index].description = e.target.value;
                                                                setData('competency_levels', newLevels);
                                                            }}
                                                            placeholder="Description..."
                                                            className="flex-1"
                                                            rows={2}
                                                            disabled={isFinalized}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('competency_levels', data.competency_levels.filter((_, i) => i !== index));
                                                            }}
                                                            disabled={isFinalized}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" onClick={addCompetencyLevel} disabled={isFinalized}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Level
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="csfs" className="space-y-4">
                                            <div className="space-y-3">
                                                {data.csfs.map((csf, index) => (
                                                    <div key={index} className="p-3 border rounded-md space-y-2">
                                                        <Input
                                                            value={csf.name}
                                                            onChange={(e) => {
                                                                const newCsfs = [...data.csfs];
                                                                newCsfs[index].name = e.target.value;
                                                                setData('csfs', newCsfs);
                                                            }}
                                                            placeholder="CSF Name"
                                                            disabled={isFinalized}
                                                        />
                                                        <Textarea
                                                            value={csf.description}
                                                            onChange={(e) => {
                                                                const newCsfs = [...data.csfs];
                                                                newCsfs[index].description = e.target.value;
                                                                setData('csfs', newCsfs);
                                                            }}
                                                            placeholder="Description..."
                                                            rows={2}
                                                            disabled={isFinalized}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('csfs', data.csfs.filter((_, i) => i !== index));
                                                            }}
                                                            disabled={isFinalized}
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" onClick={addCSF} disabled={isFinalized}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add CSF
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/job-list-selection`)}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleSave} 
                                    disabled={processing || currentJob?.is_finalized}
                                >
                                    Save
                                </Button>
                                <Button
                                    onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/finalization`)}
                                >
                                    Continue to Finalization
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
        </AppLayout>
    );
}
