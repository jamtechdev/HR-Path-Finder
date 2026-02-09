import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import RecommendationBadge from '@/components/DesignSteps/RecommendationBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Settings } from 'lucide-react';

interface PerformanceSystem {
    id?: number;
    evaluation_unit?: string;
    performance_method?: string;
    evaluation_type?: string;
    evaluation_scale?: string;
}

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        } | null;
        organizationDesign?: {
            structure_type?: string;
            job_grade_structure?: string;
        };
    };
    performanceSystem?: PerformanceSystem;
    recommendations?: {
        performance_method?: string;
    };
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'unit', label: 'Evaluation Unit' },
    { id: 'method', label: 'Performance Method' },
    { id: 'structure', label: 'Evaluation Structure' },
    { id: 'review', label: 'Review & Submit' },
];

const UNIT_OPTIONS = ['Individual', 'Team', 'Department', 'Organization'];
const METHOD_OPTIONS = [
    { value: 'kpi', label: 'KPI', desc: 'Key Performance Indicators - Track measurable targets.' },
    { value: 'mbo', label: 'MBO', desc: 'Management by Objectives - Goal-setting approach.' },
    { value: 'okr', label: 'OKR', desc: 'Objectives and Key Results - Align individual and team goals with strategic objectives.' },
    { value: 'bsc', label: 'BSC', desc: 'Balanced Scorecard - Holistic performance measurement across multiple perspectives.' },
];
const TYPE_OPTIONS = ['Quantitative', 'Qualitative', 'Hybrid'];
const SCALE_OPTIONS = ['Relative', 'Absolute', 'Hybrid'];

export default function PerformanceSystemIndex({ project, performanceSystem, recommendations }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);

    const { data, setData, post, processing } = useForm({
        evaluation_unit: performanceSystem?.evaluation_unit || '',
        performance_method: performanceSystem?.performance_method || '',
        evaluation_type: performanceSystem?.evaluation_type || '',
        evaluation_scale: performanceSystem?.evaluation_scale || '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.evaluation_unit || data.performance_method) {
                post(`/hr-manager/performance-system/${project.id}`, { preserveScroll: true });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [data.evaluation_unit, data.performance_method, data.evaluation_type, data.evaluation_scale]);

    const handleSubmit = () => {
        post(`/hr-manager/performance-system/${project.id}/submit`, {
            onSuccess: () => setCompletedTabs([...TABS.map(t => t.id)]),
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Performance System - ${project?.company?.name || 'Performance System'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href="/hr-manager/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Step 3: Performance System</h1>
                                <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Design your performance evaluation framework</p>
                        </div>

                        {project.organizationDesign && (
                            <Card className="mb-6 bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-muted-foreground">ℹ️</div>
                                        <div>
                                            <p className="font-medium mb-1">Organization Structure (Read-only)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Structure: <strong>{project.organizationDesign.structure_type || 'N/A'}</strong> | 
                                                Grade: <strong>{project.organizationDesign.job_grade_structure || 'N/A'}</strong>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <TabNavigation tabs={TABS} activeTab={activeTab} completedTabs={completedTabs} onTabChange={setActiveTab} />

                        <Card>
                            <CardContent className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="text-center py-12">
                                        <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Performance System Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Design your performance evaluation framework including evaluation units, management methods (KPI/MBO/OKR/BSC), and assessment structures.
                                        </p>
                                        <Button onClick={() => setActiveTab('unit')} size="lg">Start Design →</Button>
                                    </div>
                                )}

                                {activeTab === 'unit' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Evaluation Unit</h3>
                                        <RadioGroup value={data.evaluation_unit} onValueChange={(v) => setData('evaluation_unit', v)} className="grid grid-cols-2 gap-4">
                                            {UNIT_OPTIONS.map(opt => (
                                                <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                    <RadioGroupItem value={opt.toLowerCase()} id={opt} />
                                                    <Label htmlFor={opt} className="cursor-pointer flex-1">{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'method' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Performance Management Method</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select the performance management methodology for your organization.</p>
                                        <RadioGroup value={data.performance_method} onValueChange={(v) => setData('performance_method', v)} className="grid grid-cols-2 gap-4">
                                            {METHOD_OPTIONS.map(opt => {
                                                const isRecommended = recommendations?.performance_method === opt.value;
                                                return (
                                                    <div key={opt.value} className="relative">
                                                        <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                                            <RadioGroupItem value={opt.value} id={opt.value} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-semibold">{opt.label}</span>
                                                                    {isRecommended && <RecommendationBadge />}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'structure' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Evaluation Structure</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="mb-2 block">Evaluation Type</Label>
                                                    <RadioGroup value={data.evaluation_type} onValueChange={(v) => setData('evaluation_type', v)} className="grid grid-cols-3 gap-4">
                                                        {TYPE_OPTIONS.map(opt => (
                                                            <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                                <RadioGroupItem value={opt.toLowerCase()} id={`type-${opt}`} />
                                                                <Label htmlFor={`type-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                                <div>
                                                    <Label className="mb-2 block">Evaluation Scale</Label>
                                                    <RadioGroup value={data.evaluation_scale} onValueChange={(v) => setData('evaluation_scale', v)} className="grid grid-cols-3 gap-4">
                                                        {SCALE_OPTIONS.map(opt => (
                                                            <div key={opt} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                                <RadioGroupItem value={opt.toLowerCase()} id={`scale-${opt}`} />
                                                                <Label htmlFor={`scale-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'review' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Review & Submit Performance System</h3>
                                        <div className="space-y-3">
                                            <Card><CardContent className="p-4"><strong>Evaluation Unit:</strong> {data.evaluation_unit || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Performance Method:</strong> {data.performance_method || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Evaluation Structure:</strong> Type: {data.evaluation_type || '-'} | Scale: {data.evaluation_scale || '-'}</CardContent></Card>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between pt-6 border-t mt-6">
                            <Button variant="outline" onClick={() => {
                                const idx = TABS.findIndex(t => t.id === activeTab);
                                if (idx > 0) setActiveTab(TABS[idx - 1].id);
                            }} disabled={activeTab === 'overview'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {activeTab !== 'review' ? (
                                <Button onClick={() => {
                                    const idx = TABS.findIndex(t => t.id === activeTab);
                                    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                                }}>Next →</Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={processing}>Submit</Button>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
