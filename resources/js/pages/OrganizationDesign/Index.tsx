import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import RecommendationBadge from '@/components/DesignSteps/RecommendationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Target, Users, CheckCircle2 } from 'lucide-react';

interface CeoPhilosophy {
    main_trait?: string;
    secondary_trait?: string;
}

interface OrganizationDesign {
    id?: number;
    structure_type?: string;
    job_grade_structure?: string;
    grade_title_relationship?: string;
    managerial_criteria?: string[];
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
        ceoPhilosophy?: CeoPhilosophy;
    };
    organizationDesign?: OrganizationDesign;
    recommendations?: {
        structure_type?: string;
    };
    stepStatuses?: Record<string, string>;
    projectId?: number;
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'structure', label: 'Organization Structure' },
    { id: 'grade', label: 'Job Grade Structure' },
    { id: 'relationship', label: 'Grade-Title Relationship' },
    { id: 'managerial', label: 'Managerial Role Definition' },
];

const STRUCTURE_OPTIONS = [
    { value: 'functional', label: 'Functional Organization', desc: 'Departments organized by function (HR, Finance, Marketing).', icon: Building2 },
    { value: 'team-based', label: 'Team-based Organization', desc: 'Cross-functional teams with shared responsibility.', icon: Users },
    { value: 'divisional', label: 'Divisional Organization', desc: 'Independent divisions by product, market, or region.', icon: Building2 },
    { value: 'matrix', label: 'Matrix Organization', desc: 'Dual reporting: functional project/product lines.', icon: Target },
];

const GRADE_OPTIONS = [
    { value: 'single', label: 'Single-Grade Structure', desc: 'One unified grade system across the organization. Best for smaller companies or flat hierarchies.' },
    { value: 'multi', label: 'Multi-Grade Structure', desc: 'Multiple grade tracks for different functions or career paths. Suitable for larger organizations.' },
];

const RELATIONSHIP_OPTIONS = [
    { value: 'integrated', label: 'Integrated', desc: 'Job grades and titles are directly linked. Each grade has specific corresponding titles.' },
    { value: 'separated', label: 'Separated', desc: 'Job grades and titles are managed independently. Allows more flexibility in title assignments.' },
];

const MANAGERIAL_CRITERIA = [
    { value: 'team_leadership', label: 'Team Leadership', desc: 'Manages a team of direct reports' },
    { value: 'budget_authority', label: 'Budget Authority', desc: 'Has budget approval responsibilities' },
    { value: 'hiring_authority', label: 'Hiring Authority', desc: 'Participates in hiring decisions' },
];

export default function OrganizationDesignIndex({ project, organizationDesign, recommendations }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);

    const { data, setData, post, processing } = useForm({
        structure_type: organizationDesign?.structure_type || '',
        job_grade_structure: organizationDesign?.job_grade_structure || '',
        grade_title_relationship: organizationDesign?.grade_title_relationship || '',
        managerial_criteria: organizationDesign?.managerial_criteria || [] as string[],
    });

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.structure_type || data.job_grade_structure) {
                post(`/hr-manager/organization-design/${project.id}`, {
                    preserveScroll: true,
                });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [data.structure_type, data.job_grade_structure, data.grade_title_relationship, data.managerial_criteria]);

    const handleSubmit = () => {
        post(`/hr-manager/organization-design/${project.id}/submit`, {
            onSuccess: () => {
                setCompletedTabs([...TABS.map(t => t.id)]);
            },
        });
    };

    const toggleManagerialCriteria = (value: string) => {
        const current = data.managerial_criteria || [];
        if (current.includes(value)) {
            setData('managerial_criteria', current.filter(c => c !== value));
        } else {
            setData('managerial_criteria', [...current, value]);
        }
    };

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={project.id}
        >
                    <Head title={`Organization Design - ${project?.company?.name || 'Organization Design'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <Link href="/hr-manager/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Step 2: Organization Design</h1>
                                <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Define your organization structure and job system.</p>
                        </div>

                        {/* CEO Philosophy Card */}
                        {project.ceoPhilosophy && (
                            <Card className="mb-6 bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-muted-foreground">ℹ️</div>
                                        <div>
                                            <p className="font-medium mb-1">CEO Management Philosophy (Read-only)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Main Trait: <strong>{project.ceoPhilosophy.main_trait || 'N/A'}</strong> | 
                                                Sub Trait: <strong>{project.ceoPhilosophy.secondary_trait || 'N/A'}</strong>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab Navigation */}
                        <TabNavigation
                            tabs={TABS}
                            activeTab={activeTab}
                            completedTabs={completedTabs}
                            onTabChange={setActiveTab}
                        />

                        {/* Tab Content */}
                        <Card>
                            <CardContent className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="text-center py-12">
                                        <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Organization Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Based on your diagnosis and CEO's management philosophy, design your organization structure, job grade system, and managerial role definitions.
                                        </p>
                                        <Button onClick={() => setActiveTab('structure')} size="lg">
                                            Start Design →
                                        </Button>
                                    </div>
                                )}

                                {activeTab === 'structure' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Organization Structure</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Select the organization structure that best fits your company. The recommended option is highlighted based on your company profile.
                                            </p>
                                        </div>
                                        <RadioGroup
                                            value={data.structure_type}
                                            onValueChange={(value) => setData('structure_type', value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {STRUCTURE_OPTIONS.map((option) => {
                                                const Icon = option.icon;
                                                const isRecommended = recommendations?.structure_type === option.value;
                                                return (
                                                    <div key={option.value} className="relative">
                                                        <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                                            <RadioGroupItem value={option.value} id={option.value} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-semibold">{option.label}</span>
                                                                    {isRecommended && <RecommendationBadge />}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'grade' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Job Grade Structure</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Choose between a single-grade or multi-grade structure for your organization.
                                            </p>
                                        </div>
                                        <RadioGroup
                                            value={data.job_grade_structure}
                                            onValueChange={(value) => setData('job_grade_structure', value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {GRADE_OPTIONS.map((option) => (
                                                <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                                    <RadioGroupItem value={option.value} id={option.value} />
                                                    <label htmlFor={option.value} className="flex-1 cursor-pointer">
                                                        <div className="font-semibold mb-1">{option.label}</div>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'relationship' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Grade-Title Relationship</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Define how job grades and titles relate to each other in your organization.
                                            </p>
                                        </div>
                                        <RadioGroup
                                            value={data.grade_title_relationship}
                                            onValueChange={(value) => setData('grade_title_relationship', value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {RELATIONSHIP_OPTIONS.map((option) => (
                                                <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                                    <RadioGroupItem value={option.value} id={option.value} />
                                                    <label htmlFor={option.value} className="flex-1 cursor-pointer">
                                                        <div className="font-semibold mb-1">{option.label}</div>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'managerial' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Managerial Role Definition</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Select the criteria that define managerial roles in your organization (select all that apply).
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {MANAGERIAL_CRITERIA.map((criterion) => (
                                                <div key={criterion.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                                                    <Checkbox
                                                        id={criterion.value}
                                                        checked={(data.managerial_criteria || []).includes(criterion.value)}
                                                        onCheckedChange={() => toggleManagerialCriteria(criterion.value)}
                                                    />
                                                    <label htmlFor={criterion.value} className="flex-1 cursor-pointer">
                                                        <div className="font-semibold mb-1">{criterion.label}</div>
                                                        <p className="text-sm text-muted-foreground">{criterion.desc}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const currentIndex = TABS.findIndex(t => t.id === activeTab);
                                    if (currentIndex > 0) {
                                        setActiveTab(TABS[currentIndex - 1].id);
                                    }
                                }}
                                disabled={activeTab === 'overview'}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            {activeTab !== 'managerial' ? (
                                <Button
                                    onClick={() => {
                                        const currentIndex = TABS.findIndex(t => t.id === activeTab);
                                        if (currentIndex < TABS.length - 1) {
                                            setActiveTab(TABS[currentIndex + 1].id);
                                        }
                                    }}
                                >
                                    Next →
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing}>
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
        </AppLayout>
    );
}
