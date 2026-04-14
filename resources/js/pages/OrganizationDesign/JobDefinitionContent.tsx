import { useForm, router } from '@inertiajs/react';
import { Plus, ChevronRight, X, FileText, User, TrendingUp, Target, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DynamicList from '@/components/Forms/DynamicList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { waitWebAnimationMs } from '@/lib/deferred';
import { cn } from '@/lib/utils';
import { readJobAnalysisState, mergeJobAnalysisState } from '@/pages/JobAnalysis/utils/jobAnalysisStorage';

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
    onContinue: () => void;
}

export default function JobDefinitionContent({ project, jobDefinitions, selectedJob, template, onContinue }: Props) {
    const [activeJobId, setActiveJobId] = useState<number | null>(selectedJob?.id || jobDefinitions[0]?.id || null);
    const [activeTab, setActiveTab] = useState('description');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    const currentJob = jobDefinitions.find(j => j.id === activeJobId) || selectedJob;
    // Get template from currentJob if it has one, otherwise use passed template
    const currentTemplate = (currentJob as any)?.template || template;
    const isFinalized = currentJob?.is_finalized || false;

    const { data, setData } = useForm({
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
            const jobTemplate = (job as any)?.template || currentTemplate;
            setData('job_description', job.job_description || jobTemplate?.job_description || '');
            setData('job_specification', job.job_specification || jobTemplate?.job_specification || {
                education: { required: '', preferred: '' },
                experience: { required: '', preferred: '' },
                skills: { required: '', preferred: '' },
                communication: { required: '', preferred: '' },
            });
            setData('competency_levels', job.competency_levels || jobTemplate?.competency_levels || [
                { level: 'LV1', description: '' },
                { level: 'LV2', description: '' },
                { level: 'LV3', description: '' },
            ]);
            setData('csfs', job.csfs || jobTemplate?.csfs || []);
        }
    }, [activeJobId, jobDefinitions]);

    const handleSave = () => {
        if (!activeJobId || !currentJob) return;
        const key = currentJob.job_keyword_id != null
            ? String(currentJob.job_keyword_id)
            : `group-${currentJob.id}`;
        const current = readJobAnalysisState(project.id);
        const jobDefinitions = {
            ...current.jobDefinitions,
            [key]: {
                job_keyword_id: currentJob.job_keyword_id,
                job_name: currentJob.job_name,
                grouped_job_keyword_ids: (currentJob as { grouped_job_keyword_ids?: number[] }).grouped_job_keyword_ids,
                job_description: data.job_description,
                job_specification: data.job_specification,
                competency_levels: data.competency_levels,
                csfs: data.csfs,
            },
        };
        setSaving(true);
        mergeJobAnalysisState(project.id, { jobDefinitions });
        router.post(`/hr-manager/job-analysis/${project.id}/job-definition/${activeJobId}`, {
            job_description: data.job_description,
            job_specification: data.job_specification,
            competency_levels: data.competency_levels,
            csfs: data.csfs,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveSuccess(true);
                void waitWebAnimationMs(3000).then(() => setSaveSuccess(false));
            },
            onFinish: () => setSaving(false),
        });
    };

    const handleSaveAndNext = () => {
        if (activeJobId && currentJob) {
            setSaving(true);
            mergeJobAnalysisState(project.id, {
                jobDefinitions: {
                    ...readJobAnalysisState(project.id).jobDefinitions,
                    [currentJob.job_keyword_id != null ? String(currentJob.job_keyword_id) : `group-${currentJob.id}`]: {
                        job_keyword_id: currentJob.job_keyword_id,
                        job_name: currentJob.job_name,
                        grouped_job_keyword_ids: (currentJob as { grouped_job_keyword_ids?: number[] }).grouped_job_keyword_ids,
                        job_description: data.job_description,
                        job_specification: data.job_specification,
                        competency_levels: data.competency_levels,
                        csfs: data.csfs,
                    },
                },
            });
            router.post(`/hr-manager/job-analysis/${project.id}/job-definition/${activeJobId}`, {
                job_description: data.job_description,
                job_specification: data.job_specification,
                competency_levels: data.competency_levels,
                csfs: data.csfs,
            }, {
                preserveScroll: false,
                onSuccess: () => {
                    setSaveSuccess(true);
                    void waitWebAnimationMs(2000)
                        .then(() => setSaveSuccess(false))
                        .then(() => waitWebAnimationMs(400))
                        .then(() => {
                            if (onContinue) onContinue();
                        });
                },
                onFinish: () => setSaving(false),
            });
        } else if (onContinue) {
            onContinue();
        }
    };

    const addCompetencyLevel = () => {
        setData('competency_levels', [...data.competency_levels, { level: '', description: '' }]);
    };

    const addCSF = () => {
        setData('csfs', [...data.csfs, { 
            name: '', 
            description: '', 
            strategic_importance: undefined,
            execution_capability: undefined,
            rank: undefined
        }]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Step 3 — Job Definition</h2>
                        <p className="text-muted-foreground">
                            Define job standards for each selected role. You can use suggested content or customize as needed.
                        </p>
                    </div>
                    <Select value={activeJobId?.toString() || ''} onValueChange={(value) => setActiveJobId(parseInt(value))}>
                        <SelectTrigger className="w-64 h-11 shadow-sm">
                            <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                        <SelectContent>
                            {jobDefinitions.map((job) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                    {job.job_name}
                                    {job.is_finalized && (
                                        <Badge variant="outline" className="ml-2 text-xs">Finalized</Badge>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Save Success Message */}
                {saveSuccess && (
                    <Alert className="mb-4 border-green-200 bg-green-50 animate-in slide-in-from-top-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Job definition saved successfully!
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {currentJob && (
                <Card className="shadow-sm border">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                        <div className="flex items-center justify-between flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{currentJob.job_name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Define complete job standards and requirements
                                    </p>
                                </div>
                            </div>
                            {currentJob.is_finalized && (
                                <Badge className="px-4 py-2 bg-green-500 text-white border-0">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Finalized
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {currentJob.is_finalized && (
                            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    <strong>Note:</strong> This job definition has been finalized and cannot be edited. Please contact admin if changes are needed.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                                <TabsTrigger 
                                    value="description" 
                                    className={cn(
                                        "flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                        activeTab === 'description' && "font-semibold"
                                    )}
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">Job Description</span>
                                    <span className="sm:hidden">Description</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="specification"
                                    className={cn(
                                        "flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                        activeTab === 'specification' && "font-semibold"
                                    )}
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Job Specification</span>
                                    <span className="sm:hidden">Specification</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="competency"
                                    className={cn(
                                        "flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                        activeTab === 'competency' && "font-semibold"
                                    )}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">Competency Levels</span>
                                    <span className="sm:hidden">Competency</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="csfs"
                                    className={cn(
                                        "flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                        activeTab === 'csfs' && "font-semibold"
                                    )}
                                >
                                    <Target className="w-4 h-4" />
                                    <span className="hidden sm:inline">Critical Success Factors</span>
                                    <span className="sm:hidden">CSFs</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="space-y-4 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Job Description
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Define the job purpose, key responsibilities, and scope of work.
                                    </p>
                                    <Textarea
                                        value={data.job_description}
                                        onChange={(e) => setData('job_description', e.target.value)}
                                        rows={12}
                                        placeholder="Job purpose, key responsibilities, scope..."
                                        disabled={isFinalized}
                                        className={cn(
                                            "mt-2 resize-y",
                                            isFinalized && "bg-muted cursor-not-allowed"
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="specification" className="space-y-6 mt-6">
                                <div className="space-y-2 mb-4">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Job Specification
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Define required competencies, skills, and personal attributes. Each item can be marked as Required or Preferred.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Education - Required
                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Education - Preferred
                                            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-300">Preferred</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Experience - Required
                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Experience - Preferred
                                            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-300">Preferred</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Skills - Required
                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Skills - Preferred
                                            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-300">Preferred</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Communication - Required
                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                                        </Label>
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
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            Communication - Preferred
                                            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 text-green-700 border-green-300">Preferred</Badge>
                                        </Label>
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

                            <TabsContent value="competency" className="space-y-6 mt-6">
                                <div className="space-y-2 mb-4">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Competency Levels
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Classify levels of execution difficulty and capability. You can add or remove levels as needed.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {data.competency_levels.map((level, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 border-2 border-border rounded-lg hover:border-primary/40 transition-colors bg-card">
                                            <div className="w-28">
                                                <Badge variant="outline" className="w-full justify-center py-2 text-sm font-semibold">
                                                    {level.level || 'Level'}
                                                </Badge>
                                                <Input
                                                    value={level.level}
                                                    onChange={(e) => {
                                                        const newLevels = [...data.competency_levels];
                                                        newLevels[index].level = e.target.value;
                                                        setData('competency_levels', newLevels);
                                                    }}
                                                    className="w-full mt-2"
                                                    placeholder="LV1, LV2, etc."
                                                    disabled={isFinalized}
                                                />
                                            </div>
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
                                    <Button 
                                        variant="outline" 
                                        onClick={addCompetencyLevel} 
                                        disabled={isFinalized}
                                        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Competency Level
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="csfs" className="space-y-6 mt-6">
                                <div className="space-y-2 mb-4">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary" />
                                        Critical Success Factors (CSFs)
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Define the key criteria used to evaluate performance and success in this role. Set strategic importance and execution capability for each CSF.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {data.csfs.map((csf, index) => (
                                        <Card key={index} className="p-5 border-2 border-border hover:border-primary/40 transition-colors shadow-sm">
                                            <CardContent className="space-y-4 p-0">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-sm font-semibold mb-2 block">CSF Name</Label>
                                                        <Input
                                                            value={csf.name || ''}
                                                            onChange={(e) => {
                                                                const newCsfs = [...data.csfs];
                                                                newCsfs[index] = { ...newCsfs[index], name: e.target.value };
                                                                setData('csfs', newCsfs);
                                                            }}
                                                            placeholder="Enter CSF name (e.g., Alignment of Performance & Compensation System)"
                                                            disabled={isFinalized}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <Label className="text-sm font-semibold mb-2 block">Description</Label>
                                                        <Textarea
                                                            value={csf.description || ''}
                                                            onChange={(e) => {
                                                                const newCsfs = [...data.csfs];
                                                                newCsfs[index] = { ...newCsfs[index], description: e.target.value };
                                                                setData('csfs', newCsfs);
                                                            }}
                                                            placeholder="Enter CSF description..."
                                                            rows={3}
                                                            disabled={isFinalized}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Card className="p-4 bg-blue-50/50 border-blue-200">
                                                            <Label className="text-sm font-semibold mb-3 block text-blue-900">Strategic Importance</Label>
                                                            <RadioGroup
                                                                value={csf.strategic_importance || ''}
                                                                onValueChange={(value) => {
                                                                    const newCsfs = [...data.csfs];
                                                                    newCsfs[index] = { ...newCsfs[index], strategic_importance: value as 'high' | 'medium' | 'low' };
                                                                    setData('csfs', newCsfs);
                                                                }}
                                                                disabled={isFinalized}
                                                                className="space-y-2"
                                                            >
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-100 cursor-pointer">
                                                                    <RadioGroupItem value="high" id={`csf-${index}-importance-high`} />
                                                                    <Label htmlFor={`csf-${index}-importance-high`} className="font-normal cursor-pointer flex-1">High</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-100 cursor-pointer">
                                                                    <RadioGroupItem value="medium" id={`csf-${index}-importance-medium`} />
                                                                    <Label htmlFor={`csf-${index}-importance-medium`} className="font-normal cursor-pointer flex-1">Medium</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-100 cursor-pointer">
                                                                    <RadioGroupItem value="low" id={`csf-${index}-importance-low`} />
                                                                    <Label htmlFor={`csf-${index}-importance-low`} className="font-normal cursor-pointer flex-1">Low</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </Card>

                                                        <Card className="p-4 bg-green-50/50 border-green-200">
                                                            <Label className="text-sm font-semibold mb-3 block text-green-900">Internal Execution Capability</Label>
                                                            <RadioGroup
                                                                value={csf.execution_capability || ''}
                                                                onValueChange={(value) => {
                                                                    const newCsfs = [...data.csfs];
                                                                    newCsfs[index] = { ...newCsfs[index], execution_capability: value as 'high' | 'medium' | 'low' };
                                                                    setData('csfs', newCsfs);
                                                                }}
                                                                disabled={isFinalized}
                                                                className="space-y-2"
                                                            >
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-green-100 cursor-pointer">
                                                                    <RadioGroupItem value="high" id={`csf-${index}-capability-high`} />
                                                                    <Label htmlFor={`csf-${index}-capability-high`} className="font-normal cursor-pointer flex-1">High</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-green-100 cursor-pointer">
                                                                    <RadioGroupItem value="medium" id={`csf-${index}-capability-medium`} />
                                                                    <Label htmlFor={`csf-${index}-capability-medium`} className="font-normal cursor-pointer flex-1">Medium</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-green-100 cursor-pointer">
                                                                    <RadioGroupItem value="low" id={`csf-${index}-capability-low`} />
                                                                    <Label htmlFor={`csf-${index}-capability-low`} className="font-normal cursor-pointer flex-1">Low</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </Card>
                                                    </div>

                                                    <div className="flex items-center justify-between flex-wrap pt-2 border-t">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-sm font-medium">Rank (Optional):</Label>
                                                            <Input
                                                                type="number"
                                                                value={csf.rank || ''}
                                                                onChange={(e) => {
                                                                    const newCsfs = [...data.csfs];
                                                                    newCsfs[index] = { ...newCsfs[index], rank: e.target.value ? parseInt(e.target.value) : undefined };
                                                                    setData('csfs', newCsfs);
                                                                }}
                                                                placeholder="1"
                                                                disabled={isFinalized}
                                                                className="w-20"
                                                                min="1"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('csfs', data.csfs.filter((_, i) => i !== index));
                                                            }}
                                                            disabled={isFinalized}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Remove CSF
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        onClick={addCSF} 
                                        disabled={isFinalized}
                                        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Critical Success Factor
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
                <Button 
                    variant="outline" 
                    onClick={handleSave} 
                    disabled={saving || currentJob?.is_finalized}
                    size="lg"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleSaveAndNext}
                    disabled={saving || currentJob?.is_finalized}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            Save & Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
