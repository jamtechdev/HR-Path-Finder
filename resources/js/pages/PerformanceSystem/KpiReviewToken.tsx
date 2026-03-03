import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, Save, Check, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface OrganizationalKpi {
    id?: number;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    is_active: boolean;
    organization_name?: string;
    status?: string;
    linked_job?: {
        id: number;
        job_name: string;
    };
}

interface Props {
    token: string;
    project: {
        id: number;
        company?: {
            name: string;
        };
    };
    organizationName: string;
    allOrganizations?: string[];
    kpis: OrganizationalKpi[];
    reviewerName?: string;
    reviewerEmail?: string;
    isCompleted?: boolean;
}

export default function KpiReviewToken({ token, project, organizationName: defaultOrganizationName, allOrganizations = [], kpis: initialKpis = [], reviewerName, reviewerEmail, isCompleted = false }: Props) {
    const { props } = usePage();
    const [selectedOrganization, setSelectedOrganization] = useState<string>(defaultOrganizationName);
    // Use KPIs from props (which may be updated after save) or initialKpis
    const propsKpis = (props as any)?.kpis;
    const [kpis, setKpis] = useState<OrganizationalKpi[]>(() => {
        // Initialize with initialKpis if available, otherwise empty array
        if (propsKpis && Array.isArray(propsKpis) && propsKpis.length > 0) {
            return propsKpis;
        }
        if (initialKpis && Array.isArray(initialKpis) && initialKpis.length > 0) {
            return initialKpis;
        }
        return [];
    });
    const [loading, setLoading] = useState(false);

    // Log initial state for debugging
    useEffect(() => {
        console.log('KpiReviewToken Initialized:', {
            token,
            organizationName: defaultOrganizationName,
            initialKpisCount: initialKpis?.length || 0,
            propsKpisCount: propsKpis?.length || 0,
            currentKpisCount: kpis.length,
        });
    }, []);

    // Reload KPIs when props change (after save/redirect)
    useEffect(() => {
        const pageKpis = (props as any)?.kpis;
        if (pageKpis && Array.isArray(pageKpis)) {
            setKpis(pageKpis);
        } else if (initialKpis && Array.isArray(initialKpis) && initialKpis.length > 0) {
            setKpis(initialKpis);
        } else if (initialKpis && Array.isArray(initialKpis)) {
            setKpis([]);
        }
        
        // Log for debugging
        console.log('KPIs loaded:', {
            pageKpis: pageKpis?.length || 0,
            initialKpis: initialKpis?.length || 0,
            finalKpis: pageKpis?.length || initialKpis?.length || 0,
        });
    }, [props, initialKpis]);

    // Auto-fetch KPIs when organization changes
    useEffect(() => {
        if (selectedOrganization) {
            setLoading(true);
            // Always fetch KPIs for selected organization
            fetch(`/kpi-review/token/${token}/organization/${encodeURIComponent(selectedOrganization)}`)
                .then(res => res.json())
                .then(data => {
                    setKpis(data.kpis || []);
                    // Set review history from response
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading KPIs:', err);
                    setKpis([]);
                    setLoading(false);
                });
        }
    }, [selectedOrganization, token]);

    const [reviewComments, setReviewComments] = useState<string>('');
    const [guideOpen, setGuideOpen] = useState(false);
    const [completed, setCompleted] = useState<boolean>(isCompleted);
    const [savingKpiIndex, setSavingKpiIndex] = useState<number | null>(null);

    const { data, setData, post, processing } = useForm({
        organization_name: selectedOrganization,
        review_comments: reviewComments,
        kpis: kpis.map(kpi => ({
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            purpose: kpi.purpose || '',
            category: kpi.category || '',
            linked_job_id: kpi.linked_job_id || null,
            linked_csf: kpi.linked_csf || '',
            formula: kpi.formula || '',
            measurement_method: kpi.measurement_method || '',
            weight: kpi.weight || null,
            is_active: kpi.is_active,
        })),
    });

    // Update form data when KPIs, organization, or review comments change
    useEffect(() => {
        setData('organization_name', selectedOrganization);
        setData('review_comments', reviewComments);
        setData('kpis', kpis.map(kpi => ({
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            purpose: kpi.purpose || '',
            category: kpi.category || '',
            linked_job_id: kpi.linked_job_id || null,
            linked_csf: kpi.linked_csf || '',
            formula: kpi.formula || '',
            measurement_method: kpi.measurement_method || '',
            weight: kpi.weight || null,
            is_active: kpi.is_active ?? true,
        })));
    }, [kpis, selectedOrganization, reviewComments, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/kpi-review/token/${token}`, {
            preserveScroll: false, // Allow page to reload
            onSuccess: () => {
                // The page will reload with updated KPIs from the redirect
                // Force a reload to get fresh data
                router.reload({
                    only: ['kpis'],
                    onSuccess: () => {
                        alert('Your KPI review has been submitted. HR will review your changes.');
                    }
                });
            },
            onError: (errors) => {
                console.error('Submit error:', errors);
                alert('Failed to submit review. Please try again.');
            },
        });
    };

    const addKpi = () => {
        const newKpi: OrganizationalKpi = {
            id: 0,
            organization_name: selectedOrganization,
            kpi_name: '',
            is_active: true,
            status: 'draft',
        };
        setKpis([...kpis, newKpi]);
        setData('kpis', [...data.kpis, {
            id: 0,
            kpi_name: '',
            purpose: '',
            category: '',
            linked_job_id: null,
            linked_csf: '',
            formula: '',
            measurement_method: '',
            weight: null,
            is_active: true,
        }]);
    };

    const removeKpi = (index: number) => {
        const updated = kpis.filter((_, i) => i !== index);
        setKpis(updated);
        setData('kpis', updated.map(kpi => ({
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            purpose: kpi.purpose || '',
            category: kpi.category || '',
            linked_job_id: kpi.linked_job_id || null,
            linked_csf: kpi.linked_csf || '',
            formula: kpi.formula || '',
            measurement_method: kpi.measurement_method || '',
            weight: kpi.weight || null,
            is_active: kpi.is_active,
        })));
    };

    const updateKpi = (index: number, field: string, value: any) => {
        const updated = [...kpis];
        updated[index] = { ...updated[index], [field]: value };
        setKpis(updated);

        const updatedData = [...data.kpis];
        updatedData[index] = { ...updatedData[index], [field]: value };
        setData('kpis', updatedData);
    };

    const handleSaveKpi = async (index: number) => {
        const kpi = kpis[index];
        if (!kpi.kpi_name || kpi.kpi_name.trim() === '') {
            alert('Please enter KPI name');
            return;
        }

        setSavingKpiIndex(index);
        
        router.post(`/kpi-review/token/${token}`, {
            organization_name: selectedOrganization,
            kpis: [{
                id: kpi.id || null,
                kpi_name: kpi.kpi_name,
                purpose: kpi.purpose || '',
                category: kpi.category || '',
                linked_job_id: kpi.linked_job_id || null,
                linked_csf: kpi.linked_csf || '',
                formula: kpi.formula || '',
                measurement_method: kpi.measurement_method || '',
                weight: kpi.weight || null,
                is_active: kpi.is_active,
            }],
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Reload KPIs
                fetch(`/kpi-review/token/${token}/organization/${encodeURIComponent(selectedOrganization)}`)
                    .then(res => res.json())
                    .then(data => {
                        setKpis(data.kpis || []);
                    })
                    .catch(err => console.error('Error reloading:', err));
                alert('KPI saved successfully!');
                setSavingKpiIndex(null);
            },
            onError: (errors) => {
                console.error('Error saving KPI:', errors);
                alert('Failed to save KPI. Please try again.');
                setSavingKpiIndex(null);
            },
        });
    };

    // Check for success message and completion status
    useEffect(() => {
        const flash = (props as any)?.flash;
        if (flash?.success) {
            setCompleted(true);
        }
        if (isCompleted) {
            setCompleted(true);
        }
    }, [props, isCompleted]);

    return (
        <div className="min-h-screen bg-background">
            <Head title={`KPI Review - ${selectedOrganization}`} />
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {/* Success Message */}
                {completed && (
                    <Card className="mb-6 border-green-500 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Check className="w-6 h-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-green-900">Review Submitted Successfully!</h3>
                                    <p className="text-sm text-green-700 mt-1">
                                        Your KPI review has been submitted. Thank you for your feedback!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <div className="space-y-6">
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">KPI Review Request</h1>
                        <p className="text-muted-foreground text-lg">
                            Please review and provide feedback on the Key Performance Indicators (KPIs) for your organization.
                        </p>
                    </div>
                    
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Organization</Label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedOrganization}</p>
                                </div>
                                {reviewerName && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">Reviewer</Label>
                                        <p className="text-sm text-gray-700">
                                            {reviewerName}
                                            {reviewerEmail && <span className="text-muted-foreground"> ({reviewerEmail})</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Organization Selector */}
                            {allOrganizations.length > 1 && (
                                <div className="mt-4 pt-4 border-t">
                                    <Label className="mb-2 block">Switch Organization</Label>
                                    <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                                        <SelectTrigger className="w-full max-w-md">
                                            <SelectValue placeholder="Select organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allOrganizations.map((org) => (
                                                <SelectItem key={org} value={org}>
                                                    {org}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Review Guide - Collapsible */}
                <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="text-2xl">📋</span>
                                        KPI Review Guide
                                    </CardTitle>
                                    {guideOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="p-6 pt-0">
                                <div className="space-y-3 text-sm text-gray-700">
                                    <p className="font-medium">Please review the KPIs using the following four criteria:</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li className="font-medium">Is the outcome primarily influenced by your organization's own efforts?</li>
                                        <li className="font-medium">Is it directly linked to your organization's core responsibilities and performance?</li>
                                        <li className="font-medium">Is it measurable and clearly defined?</li>
                                        <li className="font-medium">Is it manageable in scope? (4-6 KPIs per organization is generally appropriate)</li>
                                    </ol>
                                    <p className="mt-4 pt-4 border-t border-blue-200 text-xs text-gray-600">
                                        <strong>Note:</strong> You can edit, add, or remove KPIs as needed. Your changes will be submitted to HR for review.
                                    </p>
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">Loading KPIs...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mb-6">
                            {kpis.length === 0 ? (
                                <Card className="border-yellow-200 bg-yellow-50/50">
                                    <CardContent className="p-8 text-center">
                                        <div className="text-4xl mb-4">📊</div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-900">No KPIs Found</h3>
                                        <p className="text-muted-foreground mb-4">
                                            No KPIs have been defined yet for <strong className="text-gray-900">{selectedOrganization}</strong>.
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            You can add new KPIs using the "Add KPI" button below.
                                        </p>
                                        <p className="text-sm font-medium text-yellow-700">
                                            ⚠️ Please create at least one KPI before submitting a review.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                kpis.map((kpi, index) => (
                            <Card key={kpi.id || index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start border-b pb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900">KPI #{index + 1}</h3>
                                            {kpi.linked_job && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Linked to: <span className="font-medium">{kpi.linked_job.job_name}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleSaveKpi(index)}
                                                disabled={completed || savingKpiIndex === index || !kpi.kpi_name?.trim()}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {savingKpiIndex === index ? (
                                                    <>Saving...</>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Save
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={completed}
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this KPI?')) {
                                                        removeKpi(index);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>KPI Name *</Label>
                                            <Input
                                                value={kpi.kpi_name}
                                                onChange={(e) => updateKpi(index, 'kpi_name', e.target.value)}
                                                disabled={completed}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Weight (%)</Label>
                                            <Input
                                                type="number"
                                                value={kpi.weight || ''}
                                                onChange={(e) => updateKpi(index, 'weight', parseFloat(e.target.value) || null)}
                                                disabled={completed}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Purpose</Label>
                                        <Textarea
                                            value={kpi.purpose || ''}
                                            onChange={(e) => updateKpi(index, 'purpose', e.target.value)}
                                            disabled={completed}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Linked CSF</Label>
                                            <Input
                                                value={kpi.linked_csf || ''}
                                                onChange={(e) => updateKpi(index, 'linked_csf', e.target.value)}
                                                disabled={completed}
                                            />
                                        </div>
                                        <div>
                                            <Label>Category</Label>
                                            <Input
                                                value={kpi.category || ''}
                                                onChange={(e) => updateKpi(index, 'category', e.target.value)}
                                                disabled={completed}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Formula</Label>
                                        <Input
                                            value={kpi.formula || ''}
                                            onChange={(e) => updateKpi(index, 'formula', e.target.value)}
                                            disabled={completed}
                                        />
                                    </div>
                                    <div>
                                        <Label>Measurement Method</Label>
                                        <Textarea
                                            value={kpi.measurement_method || ''}
                                            onChange={(e) => updateKpi(index, 'measurement_method', e.target.value)}
                                            disabled={completed}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                            )}
                        </div>

                        {/* Review Comments Section */}
                        {kpis.length > 0 && (
                            <Card className="mb-6 border-green-200 bg-green-50/50">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                        <span className="text-2xl">💬</span>
                                        Overall Review Comments
                                    </h2>
                                    <div className="space-y-3">
                                        <Label htmlFor="review-comments" className="text-sm font-medium text-gray-700">
                                            Please provide any additional comments or feedback about the KPIs:
                                        </Label>
                                        <Textarea
                                            id="review-comments"
                                            value={reviewComments}
                                            onChange={(e) => setReviewComments(e.target.value)}
                                            placeholder="Enter your review comments, feedback, or suggestions here..."
                                            className="min-h-[120px]"
                                            rows={5}
                                            disabled={completed}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Your comments will be shared with HR for consideration.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addKpi}
                                disabled={completed || loading}
                                className="sm:w-auto"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add New KPI
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={completed || processing || loading || kpis.length === 0} 
                                className="flex-1 bg-primary hover:bg-primary/90"
                                size="lg"
                            >
                                <Save className="w-4 h-4 mr-2" /> Submit Review
                            </Button>
                        </div>
                    </form>
                )}
                    </div>

                </div>
            </div>
        </div>
    );
}
