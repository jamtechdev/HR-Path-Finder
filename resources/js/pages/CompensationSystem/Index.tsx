import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import TabNavigation from '@/components/DesignSteps/TabNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, CheckCircle2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PerformanceSystem {
    performance_method?: string;
    evaluation_unit?: string;
}

interface CompensationSystem {
    id?: number;
    compensation_structure?: string;
    differentiation_logic?: string;
    incentive_types?: string[];
}

interface ConsultantRecommendation {
    id: number;
    recommended_option: string;
    rationale: string;
    created_at: string;
}

interface AlgorithmRecommendation {
    score: number;
    reasons: string[];
    recommended: boolean;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
        performanceSystem?: PerformanceSystem;
    };
    compensationSystem?: CompensationSystem;
    consultantRecommendation?: ConsultantRecommendation;
    algorithmRecommendations?: Record<string, AlgorithmRecommendation>;
    activeTab?: string;
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'structure', label: 'Compensation Structure' },
    { id: 'differentiation', label: 'Differentiation Method' },
    { id: 'incentives', label: 'Incentive Components' },
    { id: 'review', label: 'Review & Submit' },
];

const STRUCTURE_OPTIONS = [
    { value: 'fixed', label: 'Fixed Compensation' },
    { value: 'mixed', label: 'Mixed Compensation' },
    { value: 'performance_based', label: 'Performance-Based Compensation' },
];
const DIFFERENTIATION_OPTIONS = [
    { value: 'merit', label: 'Merit Increase', desc: 'Salary increases based on performance ratings and achievements' },
    { value: 'incentives', label: 'Incentives', desc: 'Bonus payments tied to specific goals or results' },
    { value: 'role-based', label: 'Role-Based Pay', desc: 'Compensation determined by job role and responsibility level' },
];
const INCENTIVE_OPTIONS = [
    { value: 'individual', label: 'Individual Incentives', desc: 'Bonuses based on personal performance' },
    { value: 'organizational', label: 'Organizational Incentives', desc: 'Bonuses based on team/department results' },
    { value: 'task-force', label: 'Task-Force Incentives', desc: 'Project-based bonus for special initiatives' },
    { value: 'long-term', label: 'Long-Term Incentives', desc: 'Stock options, RSUs, or deferred compensation' },
];

export default function CompensationSystemIndex({ 
    project, 
    compensationSystem,
    consultantRecommendation,
    algorithmRecommendations,
    activeTab: initialTab = 'overview'
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);
    const [isRationaleOpen, setIsRationaleOpen] = useState(true);

    const { data, setData, post, processing } = useForm({
        compensation_structure: compensationSystem?.compensation_structure || '',
        differentiation_logic: compensationSystem?.differentiation_logic || '',
        incentive_types: compensationSystem?.incentive_types || [] as string[],
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.compensation_structure || data.differentiation_logic) {
                post(`/hr-manager/compensation-system/${project.id}`, { preserveScroll: true });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [data.compensation_structure, data.differentiation_logic, data.incentive_types]);

    const handleSubmit = () => {
        post(`/hr-manager/compensation-system/${project.id}/submit`, {
            onSuccess: () => setCompletedTabs([...TABS.map(t => t.id)]),
        });
    };

    const toggleIncentive = (value: string) => {
        const current = data.incentive_types || [];
        setData('incentive_types', current.includes(value) ? current.filter(i => i !== value) : [...current, value]);
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Compensation System - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href="/hr-manager/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Step 4: Compensation System</h1>
                                <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Design your compensation and rewards framework.</p>
                        </div>

                        {/* Consultant Recommendation */}
                        {consultantRecommendation && (
                            <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">Consultant Recommendation</h3>
                                                <Badge variant="default" className="bg-primary">
                                                    {STRUCTURE_OPTIONS.find(s => s.value === consultantRecommendation.recommended_option)?.label || consultantRecommendation.recommended_option.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Your consultant has prepared a recommendation based on your performance system selection and company context.
                                            </p>
                                            <Collapsible open={isRationaleOpen} onOpenChange={setIsRationaleOpen}>
                                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                                                    <MessageSquare className="w-4 h-4" />
                                                    View Consultant's Rationale
                                                    {isRationaleOpen ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-3">
                                                    <div className="p-4 bg-background border rounded-lg">
                                                        <p className="text-sm whitespace-pre-line leading-relaxed">
                                                            {consultantRecommendation.rationale}
                                                        </p>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {project.performanceSystem && (
                            <Card className="mb-6 bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-muted-foreground">ℹ️</div>
                                        <div>
                                            <p className="font-medium mb-1">Performance System (Read-only)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Method: <strong>{project.performanceSystem.performance_method || 'N/A'}</strong> | 
                                                Unit: <strong>{project.performanceSystem.evaluation_unit || 'N/A'}</strong>
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
                                        <DollarSign className="w-16 h-16 mx-auto mb-4 text-primary" />
                                        <h2 className="text-2xl font-bold mb-2">Compensation System Design</h2>
                                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                            Design your compensation structure, differentiation methods, and incentive components based on your performance system design.
                                        </p>
                                        <Button onClick={() => setActiveTab('structure')} size="lg">Start Design →</Button>
                                    </div>
                                )}

                                {activeTab === 'structure' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Compensation Structure</h3>
                                        <RadioGroup value={data.compensation_structure} onValueChange={(v) => setData('compensation_structure', v)} className="space-y-3">
                                            {STRUCTURE_OPTIONS.map(opt => {
                                                const isConsultantRecommended = consultantRecommendation?.recommended_option === opt.value;
                                                const isAlgorithmRecommended = algorithmRecommendations?.[opt.value]?.recommended;
                                                return (
                                                    <div key={opt.value} className={`relative ${isConsultantRecommended ? 'ring-2 ring-primary' : ''}`}>
                                                        <label className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${isConsultantRecommended ? 'bg-primary/5 border-primary/30' : ''}`}>
                                                            <RadioGroupItem value={opt.value} id={opt.value} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-semibold">{opt.label}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        {isConsultantRecommended && (
                                                                            <Badge variant="default" className="bg-primary">
                                                                                Consultant Recommended
                                                                            </Badge>
                                                                        )}
                                                                        {!isConsultantRecommended && isAlgorithmRecommended && (
                                                                            <Badge variant="outline">Algorithm Recommended</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {isConsultantRecommended && (
                                                                    <p className="text-xs text-primary mt-1 font-medium">
                                                                        ✓ This is your consultant's recommended option
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'differentiation' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Differentiation Method</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select how compensation differences will be determined.</p>
                                        <RadioGroup value={data.differentiation_logic} onValueChange={(v) => setData('differentiation_logic', v)} className="space-y-3">
                                            {DIFFERENTIATION_OPTIONS.map(opt => (
                                                <div key={opt.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                                                    <RadioGroupItem value={opt.value} id={opt.value} />
                                                    <label htmlFor={opt.value} className="flex-1 cursor-pointer">
                                                        <div className="font-semibold mb-1">{opt.label}</div>
                                                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {activeTab === 'incentives' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-2">Incentive Components</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select the incentive components to include (select all that apply).</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {INCENTIVE_OPTIONS.map(opt => (
                                                <div key={opt.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                                                    <Checkbox
                                                        id={opt.value}
                                                        checked={(data.incentive_types || []).includes(opt.value)}
                                                        onCheckedChange={() => toggleIncentive(opt.value)}
                                                    />
                                                    <label htmlFor={opt.value} className="flex-1 cursor-pointer">
                                                        <div className="font-semibold mb-1">{opt.label}</div>
                                                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'review' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold mb-4">Review & Submit Compensation System</h3>
                                        <div className="space-y-3">
                                            <Card><CardContent className="p-4"><strong>Compensation Structure:</strong> {data.compensation_structure || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Differentiation Method:</strong> {data.differentiation_logic || '-'}</CardContent></Card>
                                            <Card><CardContent className="p-4"><strong>Incentive Components:</strong> {(data.incentive_types || []).length > 0 ? data.incentive_types?.join(', ') : '-'}</CardContent></Card>
                                        </div>
                                        <Card className="bg-success/10 border-success/20">
                                            <CardContent className="p-4">
                                                <p className="text-sm font-medium text-success">
                                                    Congratulations! After submission, all 4 steps will be complete. The consultant will review your HR system, and then the CEO can give final approval.
                                                </p>
                                            </CardContent>
                                        </Card>
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
                                <Button onClick={handleSubmit} disabled={processing}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit & Lock Step 4
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
