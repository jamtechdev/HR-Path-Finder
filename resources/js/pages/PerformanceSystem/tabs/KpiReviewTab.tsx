import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Send, Mail, Edit, CheckCircle2, X, History, ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';

interface Kpi {
    id?: number;
    organization_name: string;
    category: string;
    kpi_name: string;
    purpose: string;
    linked_job_id?: number;
    linked_csf: string;
    formula: string;
    measurement_method: string;
    weight: number;
    is_active: boolean;
    status: string;
}

interface Props {
    project: {
        id: number;
    };
    jobDefinitions?: Array<{ id: number; job_name: string }>;
    orgChartMappings?: Array<{ org_unit_name: string; org_head_email?: string; org_head_name?: string }>;
    kpiReviewTokens?: Record<string, any>;
    organizationalKpis?: Array<{
        id?: number;
        organization_name?: string;
        category?: string;
        kpi_name?: string;
        purpose?: string;
        linked_job_id?: number;
        linked_csf?: string;
        formula?: string;
        measurement_method?: string;
        weight?: number;
        is_active?: boolean;
        status?: string;
    }>;
    onContinue: (kpis: Kpi[]) => void;
    onBack?: () => void;
}

export default function KpiReviewTab({ 
    project, 
    jobDefinitions = [], 
    orgChartMappings = [],
    kpiReviewTokens = {},
    organizationalKpis = [],
    onContinue,
    onBack 
}: Props) {
    const [kpis, setKpis] = useState<Kpi[]>(() => {
        // Initialize from organizationalKpis if available, removing duplicates
        if (!organizationalKpis || organizationalKpis.length === 0) {
            return [];
        }
        
        // Remove duplicates based on organization_name + kpi_name (case-insensitive)
        const uniqueKpisMap = new Map<string, any>();
        
        organizationalKpis.forEach((kpi: any) => {
            const orgName = (kpi.organization_name || '').trim().toLowerCase();
            const kpiName = (kpi.kpi_name || '').trim().toLowerCase();
            const key = `${orgName}::${kpiName}`;
            
            // Keep the one with the highest ID (most recent) or the one with an ID if others don't
            if (!uniqueKpisMap.has(key) || 
                (!uniqueKpisMap.get(key).id && kpi.id) || 
                (uniqueKpisMap.get(key).id && kpi.id && kpi.id > uniqueKpisMap.get(key).id)) {
                uniqueKpisMap.set(key, kpi);
            }
        });
        
        return Array.from(uniqueKpisMap.values()).map((kpi: any) => ({
            id: kpi.id,
            organization_name: kpi.organization_name || '',
            category: kpi.category || '',
            kpi_name: kpi.kpi_name || '',
            purpose: kpi.purpose || '',
            linked_job_id: kpi.linked_job_id,
            linked_csf: kpi.linked_csf || '',
            formula: kpi.formula || '',
            measurement_method: kpi.measurement_method || '',
            weight: kpi.weight || 0,
            is_active: kpi.is_active ?? false,
            status: kpi.status || 'draft',
        }));
    });
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);
    const [editHistoryOpen, setEditHistoryOpen] = useState(false);
    const [selectedKpiForHistory, setSelectedKpiForHistory] = useState<number | null>(null);
    const [editHistory, setEditHistory] = useState<any[]>([]);

    // Get unique organization names from org chart mappings
    const orgNames = Array.from(new Set(orgChartMappings.map(m => m.org_unit_name).filter(Boolean)));

    useEffect(() => {
        if (selectedOrg && orgNames.length > 0 && !selectedOrg) {
            setSelectedOrg(orgNames[0]);
        }
    }, [orgNames]);

    // Update KPIs when organizationalKpis prop changes (e.g., after reload or when CEO/Admin adds KPIs)
    useEffect(() => {
        if (organizationalKpis && organizationalKpis.length > 0) {
            // Remove duplicates based on organization_name + kpi_name combination (case-insensitive)
            const uniqueKpisMap = new Map<string, any>();
            
            organizationalKpis.forEach((kpi: any) => {
                const orgName = (kpi.organization_name || '').trim().toLowerCase();
                const kpiName = (kpi.kpi_name || '').trim().toLowerCase();
                const key = `${orgName}::${kpiName}`;
                
                // Keep the one with the highest ID (most recent) or the one with an ID if others don't
                if (!uniqueKpisMap.has(key) || 
                    (!uniqueKpisMap.get(key).id && kpi.id) || 
                    (uniqueKpisMap.get(key).id && kpi.id && kpi.id > uniqueKpisMap.get(key).id)) {
                    uniqueKpisMap.set(key, kpi);
                }
            });
            
            const updatedKpis = Array.from(uniqueKpisMap.values()).map((kpi: any) => ({
                id: kpi.id,
                organization_name: kpi.organization_name || '',
                category: kpi.category || '',
                kpi_name: kpi.kpi_name || '',
                purpose: kpi.purpose || '',
                linked_job_id: kpi.linked_job_id,
                linked_csf: kpi.linked_csf || '',
                formula: kpi.formula || '',
                measurement_method: kpi.measurement_method || '',
                weight: kpi.weight || 0,
                is_active: kpi.is_active ?? false,
                status: kpi.status || 'draft',
            }));
            setKpis(updatedKpis);
        }
    }, [organizationalKpis]);

    const handleAddKpi = () => {
        if (selectedOrg) {
            // Check if there's already a KPI with empty name for this organization (unsaved new KPI)
            const hasUnsavedKpi = kpis.some(k => 
                k.organization_name === selectedOrg && 
                (!k.id && (!k.kpi_name || k.kpi_name.trim() === ''))
            );
            
            if (hasUnsavedKpi) {
                alert('Please save or delete the existing unsaved KPI before adding a new one.');
                return;
            }
            
            const newKpi: Kpi = {
                organization_name: selectedOrg,
                category: '',
                kpi_name: '',
                purpose: '',
                linked_csf: '',
                formula: '',
                measurement_method: '',
                weight: 0,
                is_active: false,
                status: 'draft',
            };
            setKpis([...kpis, newKpi]);
            setEditingKpi(newKpi);
        }
    };

    const handleDeleteKpi = (index: number) => {
        if (confirm('Are you sure you want to delete this KPI?')) {
            setKpis(kpis.filter((_, i) => i !== index));
        }
    };

    const handleUpdateKpi = (index: number, updates: Partial<Kpi>) => {
        const updated = [...kpis];
        updated[index] = { ...updated[index], ...updates };
        setKpis(updated);
    };

    const handleActivateKpi = (index: number) => {
        handleUpdateKpi(index, { is_active: !kpis[index].is_active });
    };

    const [savingKpiIndex, setSavingKpiIndex] = useState<number | null>(null);

    const handleSaveKpi = async (index: number) => {
        const kpi = kpis[index];
        if (!kpi.kpi_name || kpi.kpi_name.trim() === '') {
            alert('Please enter KPI name');
            return;
        }

        // Check for duplicate KPI name in the same organization (case-insensitive)
        const duplicateKpi = kpis.find((k, i) => 
            i !== index &&
            k.id !== kpi.id && // Different KPI (not the same one being edited)
            k.organization_name.trim().toLowerCase() === kpi.organization_name.trim().toLowerCase() &&
            k.kpi_name.trim().toLowerCase() === kpi.kpi_name.trim().toLowerCase()
        );
        
        if (duplicateKpi) {
            alert(`A KPI with the name "${kpi.kpi_name}" already exists for "${kpi.organization_name}". Please use a different name.`);
            return;
        }

        setSavingKpiIndex(index);
        
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'kpi-review',
            kpis: [{
                id: kpi.id || null,
                organization_name: kpi.organization_name.trim(),
                kpi_name: kpi.kpi_name.trim(),
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
                // Reload KPIs to get the updated ID and any new KPIs from CEO/Admin
                router.reload({
                    only: ['organizationalKpis'],
                    onSuccess: () => {
                        alert('KPI saved successfully!');
                        setSavingKpiIndex(null);
                    },
                });
            },
            onError: (errors) => {
                console.error('Error saving KPI:', errors);
                alert('Failed to save KPI. Please try again.');
                setSavingKpiIndex(null);
            },
        });
    };

    const handleSendReviewRequest = (orgName: string) => {
        const orgMapping = orgChartMappings.find(m => m.org_unit_name === orgName);
        if (!orgMapping?.org_head_email) {
            alert('Organization head email is required. Please update the organization chart mapping first.');
            return;
        }

        if (confirm(`Send review request email to the organization leader (${orgMapping.org_head_email}) for "${orgName}"? CEOs and admins will also be notified.`)) {
            router.post(`/hr-manager/performance-system/${project.id}/send-review-request`, {
                organization_name: orgName,
            }, {
                onSuccess: (page: any) => {
                    const message = (page?.props?.flash as any)?.success || 'Review request emails sent successfully!';
                    alert(message);
                },
                onError: (errors) => {
                    const errorMsg = errors?.error || errors?.message || 'Failed to send emails. Please check logs.';
                    alert('Error: ' + errorMsg);
                },
            });
        }
    };

    const handleContinue = () => {
        onContinue(kpis);
    };

    const orgKpis = kpis.filter(k => k.organization_name === selectedOrg);

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                        <CardTitle className="text-2xl font-bold">Organization Manager KPI Review</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Review and adjust the organizational KPIs proposed by Pathfinder to ensure they reflect your organization's actual responsibilities and operating reality.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
                            {/* Left Panel - Organization and KPI Table */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Label className="text-lg font-semibold">Organization:</Label>
                                        <Select 
                                            value={selectedOrg} 
                                            onValueChange={(org) => {
                                                setSelectedOrg(org);
                                                // Show organization guidance in right panel
                                                setRightPanelContent({
                                                    concept: `KPI Review Guide for ${org}`,
                                                    key_characteristics: `This step allows you to review and adjust the organizational KPIs proposed by Pathfinder to ensure they reflect ${org}'s actual responsibilities and operating reality.`,
                                                    example: `Please review the KPIs using the following four criteria:\n\n1) Is the outcome primarily influenced by your organization's own efforts?\n2) Is it directly linked to your organization's core responsibilities and performance?\n3) Is it measurable and clearly defined?\n4) Is it manageable in scope? (4-6 KPIs per organization is generally appropriate)`,
                                                    pros: 'Ensures KPIs accurately reflect organizational reality and responsibilities',
                                                    cons: 'Requires careful review to avoid over- or under-scoping',
                                                    best_fit_organizations: 'All organizations should review their assigned KPIs',
                                                });
                                                setRightPanelOpen(true);
                                            }}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Select organization" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {orgNames.map((org) => (
                                                    <SelectItem key={org} value={org}>
                                                        {org}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleAddKpi} variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add KPI
                                    </Button>
                                </div>

                                {selectedOrg && (
                                    <>
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Purpose</TableHead>
                                                        <TableHead>Linked Job</TableHead>
                                                        <TableHead>Linked CSF</TableHead>
                                                        <TableHead>Formula</TableHead>
                                                        <TableHead>Measurement Method</TableHead>
                                                        <TableHead>Weight</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orgKpis.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                                                No KPIs defined for this organization. Click "Add KPI" to create one.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        orgKpis.map((kpi, index) => {
                                                            const globalIndex = kpis.findIndex(k => k === kpi);
                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.category}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { category: e.target.value })}
                                                                            placeholder="Category"
                                                                            className="w-24"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.kpi_name}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { kpi_name: e.target.value })}
                                                                            placeholder="KPI Name"
                                                                            className="w-32"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Textarea
                                                                            value={kpi.purpose}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { purpose: e.target.value })}
                                                                            placeholder="Purpose"
                                                                            className="w-40"
                                                                            rows={2}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Select
                                                                            value={kpi.linked_job_id?.toString() || ''}
                                                                            onValueChange={(value) => handleUpdateKpi(globalIndex, { linked_job_id: value ? parseInt(value) : undefined })}
                                                                        >
                                                                            <SelectTrigger className="w-32">
                                                                                <SelectValue placeholder="Select" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {jobDefinitions.map((job) => (
                                                                                    <SelectItem key={job.id} value={job.id.toString()}>
                                                                                        {job.job_name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.linked_csf}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { linked_csf: e.target.value })}
                                                                            placeholder="CSF"
                                                                            className="w-32"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.formula}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { formula: e.target.value })}
                                                                            placeholder="Formula"
                                                                            className="w-32"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            value={kpi.measurement_method}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { measurement_method: e.target.value })}
                                                                            placeholder="Method"
                                                                            className="w-32"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            value={kpi.weight}
                                                                            onChange={(e) => handleUpdateKpi(globalIndex, { weight: parseFloat(e.target.value) || 0 })}
                                                                            placeholder="%"
                                                                            className="w-20"
                                                                            min="0"
                                                                            max="100"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="default"
                                                                                size="sm"
                                                                                onClick={() => handleSaveKpi(globalIndex)}
                                                                                disabled={savingKpiIndex === globalIndex || !kpi.kpi_name?.trim()}
                                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                                title="Save KPI"
                                                                            >
                                                                                {savingKpiIndex === globalIndex ? (
                                                                                    <>Saving...</>
                                                                                ) : (
                                                                                    <Check className="w-4 h-4" />
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={async () => {
                                                                                    setSelectedKpiForHistory(kpi.id || null);
                                                                                    if (kpi.id) {
                                                                                        try {
                                                                                            const response = await fetch(`/hr-manager/performance-system/${project.id}/kpi-edit-history/${kpi.id}`, {
                                                                                                headers: {
                                                                                                    'Accept': 'application/json',
                                                                                                    'X-Requested-With': 'XMLHttpRequest',
                                                                                                },
                                                                                                credentials: 'include',
                                                                                            });
                                                                                            if (response.ok) {
                                                                                                const data = await response.json();
                                                                                                setEditHistory(data.editHistory || []);
                                                                                            } else {
                                                                                                setEditHistory([]);
                                                                                            }
                                                                                        } catch (error) {
                                                                                            console.error('Failed to load edit history:', error);
                                                                                            setEditHistory([]);
                                                                                        }
                                                                                    }
                                                                                    setEditHistoryOpen(true);
                                                                                }}
                                                                                title="View History"
                                                                            >
                                                                                <History className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteKpi(globalIndex)}
                                                                                className="text-destructive"
                                                                                title="Delete KPI"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => handleSendReviewRequest(selectedOrg)}
                                                className="flex items-center gap-2"
                                                disabled={orgKpis.length === 0}
                                            >
                                                <Send className="w-4 h-4" />
                                                Send Review Request Email to Organization Leader
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Panel - KPI Details and Guidance */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>KPI Review Guide</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div>
                                            <h4 className="font-semibold mb-1">1. Outcome Influence</h4>
                                            <p className="text-muted-foreground">
                                                Is the outcome primarily influenced by your organization's own efforts?
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">2. Core Responsibilities</h4>
                                            <p className="text-muted-foreground">
                                                Is it directly linked to your organization's core responsibilities and performance?
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">3. Measurability</h4>
                                            <p className="text-muted-foreground">
                                                Is it measurable and clearly defined?
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">4. Manageable Scope</h4>
                                            <p className="text-muted-foreground">
                                                A total of 4–6 KPIs per organization is generally appropriate.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {(() => {
                                    const tokensForOrg = kpiReviewTokens[selectedOrg];
                                    if (!tokensForOrg) return null;
                                    const tokenStatus = Array.isArray(tokensForOrg) ? tokensForOrg[0] : tokensForOrg;
                                    if (!tokenStatus) return null;
                                    const isActive = tokenStatus.is_valid === true;
                                    return (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Review Link Status</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Status:</span>
                                                        <Badge variant={isActive ? 'default' : 'destructive'}>
                                                            {isActive ? 'Active' : 'Expired'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Uses:</span>
                                                        <span>{tokenStatus.uses_count ?? 0} / {tokenStatus.max_uses ?? 3}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                    {onBack && (
                        <Button 
                            onClick={onBack} 
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button 
                        onClick={handleContinue} 
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                    >
                        Continue to CEO KPI Review
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Edit History Dialog */}
            <Dialog open={editHistoryOpen} onOpenChange={setEditHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>KPI Edit History</DialogTitle>
                        <DialogDescription>
                            View all modifications made to this KPI
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {editHistory.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No edit history found for this KPI.
                            </p>
                        ) : (
                            editHistory.map((history) => (
                                <div key={history.id} className="border-l-4 border-l-primary pl-4 py-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold">
                                            {new Date(history.created_at).toLocaleString()}
                                        </span>
                                        <Badge variant={
                                            history.edited_by_type === 'hr_manager' ? 'default' :
                                            history.edited_by_type === 'org_manager' ? 'secondary' :
                                            'destructive'
                                        }>
                                            {history.edited_by_type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    {history.edited_by_name && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Edited by: {history.edited_by_name}
                                        </p>
                                    )}
                                    {history.changes?.description && (
                                        <p className="text-sm">{history.changes.description}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title="KPI Guidance"
            />
        </>
    );
}
