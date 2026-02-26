import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';

interface OrganizationalKpi {
    id: number;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    is_active: boolean;
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
}

export default function KpiReviewToken({ token, project, organizationName: defaultOrganizationName, allOrganizations = [], kpis: initialKpis, reviewerName, reviewerEmail }: Props) {
    const [selectedOrganization, setSelectedOrganization] = useState<string>(defaultOrganizationName);
    const [kpis, setKpis] = useState<OrganizationalKpi[]>(initialKpis);
    const [loading, setLoading] = useState(false);

    // Load KPIs when organization changes
    useEffect(() => {
        if (selectedOrganization && selectedOrganization !== defaultOrganizationName) {
            setLoading(true);
            fetch(`/kpi-review/token/${token}/organization/${encodeURIComponent(selectedOrganization)}`)
                .then(res => res.json())
                .then(data => {
                    setKpis(data.kpis || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading KPIs:', err);
                    setLoading(false);
                });
        } else if (selectedOrganization === defaultOrganizationName) {
            // Reset to initial KPIs if default organization is selected
            setKpis(initialKpis);
        }
    }, [selectedOrganization, token, defaultOrganizationName]);

    const { data, setData, post, processing } = useForm({
        organization_name: selectedOrganization,
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

    // Update form data when KPIs or organization changes
    useEffect(() => {
        setData('organization_name', selectedOrganization);
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
    }, [kpis, selectedOrganization, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/kpi-review/token/${token}`, {
            onSuccess: () => {
                alert('Your KPI review has been submitted. HR will review your changes.');
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

    return (
        <div className="min-h-screen bg-background">
            <Head title={`KPI Review - ${selectedOrganization}`} />
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Organization Manager KPI Review</h1>
                    
                    {/* Organization Selector */}
                    {allOrganizations.length > 0 && (
                        <div className="mb-4">
                            <Label className="mb-2 block">Select Organization</Label>
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
                    
                    <p className="text-muted-foreground">
                        Organization: <strong>{selectedOrganization}</strong>
                    </p>
                    {reviewerName && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Reviewer: {reviewerName} ({reviewerEmail})
                        </p>
                    )}
                </div>

                <Card className="mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Review Guide</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Please review the KPIs using the following four criteria:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                                <li>Is the outcome primarily influenced by your organization's own efforts?</li>
                                <li>Is it directly linked to your organization's core responsibilities and performance?</li>
                                <li>Is it measurable and clearly defined?</li>
                                <li>Is it manageable in scope? (4-6 KPIs per organization is generally appropriate)</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>

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
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <p className="text-muted-foreground">
                                            No KPIs defined yet for <strong>{selectedOrganization}</strong>.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                kpis.map((kpi, index) => (
                            <Card key={index}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold">KPI #{index + 1}</h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeKpi(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>KPI Name *</Label>
                                            <Input
                                                value={kpi.kpi_name}
                                                onChange={(e) => updateKpi(index, 'kpi_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Weight (%)</Label>
                                            <Input
                                                type="number"
                                                value={kpi.weight || ''}
                                                onChange={(e) => updateKpi(index, 'weight', parseFloat(e.target.value) || null)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Purpose</Label>
                                        <Textarea
                                            value={kpi.purpose || ''}
                                            onChange={(e) => updateKpi(index, 'purpose', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Linked CSF</Label>
                                            <Input
                                                value={kpi.linked_csf || ''}
                                                onChange={(e) => updateKpi(index, 'linked_csf', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Category</Label>
                                            <Input
                                                value={kpi.category || ''}
                                                onChange={(e) => updateKpi(index, 'category', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Formula</Label>
                                        <Input
                                            value={kpi.formula || ''}
                                            onChange={(e) => updateKpi(index, 'formula', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Measurement Method</Label>
                                        <Textarea
                                            value={kpi.measurement_method || ''}
                                            onChange={(e) => updateKpi(index, 'measurement_method', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addKpi}
                                disabled={loading}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add KPI
                            </Button>
                            <Button type="submit" disabled={processing || loading} className="flex-1">
                                <Save className="w-4 h-4 mr-2" /> Submit Review
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
