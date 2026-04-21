import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Send, Save } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Kpi {
    id?: number;
    organization_name: string;
    kpi_name: string;
    purpose: string;
    linked_job_id?: number;
    linked_job?: { job_name: string };
    linked_csf: string;
    formula: string;
    measurement_method: string;
    weight: number;
    status?: string;
    ceo_approval_status?: string;
    ceo_revision_comment?: string;
}

interface Props {
    project: {
        id: number;
    };
    kpis?: Kpi[];
    onContinue?: () => void;
    onBack?: () => void;
    isViewOnly?: boolean; // For HR Manager view-only mode
}

export default function CeoKpiReviewTab({ project, kpis = [], onContinue, onBack, isViewOnly = false }: Props) {
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const WEIGHT_EPS = 0.01;
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
    const [orgPopupOpen, setOrgPopupOpen] = useState<string | null>(null);
    const [revisionComments, setRevisionComments] = useState<Record<string, string>>({});
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);

    const orgNames = Array.from(new Set(kpis.map(k => k.organization_name).filter(Boolean)));
    const getOrgWeight = (orgName: string) =>
        kpis
            .filter((k) => k.organization_name === orgName)
            .reduce((sum, k) => sum + (Number(k.weight) || 0), 0);
    const isOrgWeightBalanced = (orgName: string) => Math.abs(getOrgWeight(orgName) - 100) <= WEIGHT_EPS;

    const getOrgStatus = (orgName: string): 'not_reviewed' | 'revision_requested' | 'approved' => {
        const orgKpis = kpis.filter(k => k.organization_name === orgName);
        if (orgKpis.length === 0) return 'not_reviewed';
        
        const hasApproved = orgKpis.some(k => k.ceo_approval_status === 'approved');
        const hasRevisionRequested = orgKpis.some(k => k.ceo_approval_status === 'revision_requested');
        
        if (hasApproved) return 'approved';
        if (hasRevisionRequested) return 'revision_requested';
        return 'not_reviewed';
    };

    const handleSave = () => {
        if (isViewOnly) return;
        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'ceo-kpi-review',
            kpis: kpis.map(kpi => ({
                id: kpi.id,
                ceo_approval_status: kpi.ceo_approval_status,
                ceo_revision_comment: kpi.ceo_revision_comment,
            })),
        }, {
            onSuccess: () => {
                alert(tx('ceo_kpi.review.legacy.saved', 'KPI review saved successfully.'));
            },
        });
    };

    const handleRequestRevision = (orgName: string) => {
        if (isViewOnly) return;
        const comment = revisionComments[orgName] || '';
        if (!comment.trim()) {
            alert(tx('ceo_kpi.review.revision_alert', 'Please add at least one revision comment.'));
            return;
        }

        const orgKpis = kpis.filter(k => k.organization_name === orgName);
        const updatedKpis = orgKpis.map(kpi => ({
            ...kpi,
            ceo_approval_status: 'revision_requested',
            ceo_revision_comment: comment,
        }));

        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'ceo-kpi-review',
            action: 'request_revision',
            organization_name: orgName,
            kpis: updatedKpis.map(k => ({
                id: k.id,
                ceo_approval_status: k.ceo_approval_status,
                ceo_revision_comment: k.ceo_revision_comment,
            })),
        }, {
            onSuccess: () => {
                alert(tx('ceo_kpi.review.legacy.revision_sent', 'Revision request sent to organization leader.'));
                setRevisionComments({ ...revisionComments, [orgName]: '' });
            },
        });
    };

    const handleOrgApproval = (orgName: string) => {
        if (isViewOnly) return;
        const orgKpis = kpis.filter(k => k.organization_name === orgName);
        const updatedKpis = orgKpis.map(kpi => ({
            ...kpi,
            ceo_approval_status: 'approved',
        }));

        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'ceo-kpi-review',
            action: 'approve_org',
            organization_name: orgName,
            kpis: updatedKpis.map(k => ({
                id: k.id,
                ceo_approval_status: k.ceo_approval_status,
            })),
        }, {
            onSuccess: () => {
                alert(tx('ceo_kpi.review.legacy.org_approved', '{{org}} KPIs approved.').replace('{{org}}', orgName));
            },
        });
    };

    const handleFinalize = () => {
        if (isViewOnly) return;
        const invalidWeightOrgs = orgNames.filter((org) => !isOrgWeightBalanced(org));
        if (invalidWeightOrgs.length > 0) {
            alert(
                tx(
                    'ceo_kpi.review.weight_100_required',
                    '각 조직의 KPI 가중치 합은 정확히 100%여야 최종 확정할 수 있습니다.',
                ) + ` (${invalidWeightOrgs.join(', ')})`,
            );
            return;
        }
        const allApproved = orgNames.every(org => getOrgStatus(org) === 'approved');
        if (!allApproved) {
            if (!confirm(tx('ceo_kpi.review.legacy.not_all_approved_confirm', 'Not all organizations have been approved. Do you want to finalize anyway?'))) {
                return;
            }
        }

        router.post(`/hr-manager/performance-system/${project.id}`, {
            tab: 'ceo-kpi-review',
            action: 'finalize',
        }, {
            onSuccess: () => {
                if (onContinue) onContinue();
            },
        });
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                        <CardTitle className="text-2xl font-bold">{tx('ceo_kpi.review.step_title', 'CEO KPI Review')}</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {tx('ceo_kpi.review.legacy.review_desc', 'Review and finalize the KPIs submitted by each organization from a company-wide perspective.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Review Guide */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-lg">{tx('ceo_kpi.review.legacy.guide_title', 'CEO KPI Review Guide')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">{tx('ceo_kpi.review.legacy.guide_1_title', '1. Strategic Alignment')}</h4>
                                    <p className="text-muted-foreground">
                                        {tx('ceo_kpi.review.legacy.guide_1_body', "Are they aligned with the company's overall strategy? Ensure each organizational KPI is clearly linked to key strategic priorities.")}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{tx('ceo_kpi.review.legacy.guide_2_title', '2. Balance Across Organizations')}</h4>
                                    <p className="text-muted-foreground">
                                        {tx('ceo_kpi.review.legacy.guide_2_body', 'Is there an appropriate balance? Review whether responsibilities are fairly distributed.')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{tx('ceo_kpi.review.legacy.guide_3_title', '3. Overlaps and Gaps')}</h4>
                                    <p className="text-muted-foreground">
                                        {tx('ceo_kpi.review.legacy.guide_3_body', 'Are there any overlaps or gaps in accountability? Ensure no redundancy and no important areas left without ownership.')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">{tx('ceo_kpi.review.legacy.guide_4_title', '4. Practical Scope')}</h4>
                                    <p className="text-muted-foreground">
                                        {tx('ceo_kpi.review.legacy.guide_4_body', 'Is the scope practical and manageable? Confirm that the number of KPIs is reasonable.')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organizations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orgNames.map((orgName) => {
                                const orgKpis = kpis.filter(k => k.organization_name === orgName);
                                const status = getOrgStatus(orgName);
                                const orgWeight = getOrgWeight(orgName);
                                const orgWeightNormalized = Math.round(orgWeight * 100) / 100;
                                
                                return (
                                    <Card 
                                        key={orgName} 
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            selectedOrg === orgName ? 'ring-2 ring-primary' : ''
                                        }`}
                                        onClick={() => {
                                            setOrgPopupOpen(orgName);
                                            setSelectedOrg(orgName);
                                        }}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between flex-wrap">
                                                <CardTitle className="text-lg">{orgName}</CardTitle>
                                                <Badge 
                                                    variant={
                                                        status === 'approved' ? 'default' :
                                                        status === 'revision_requested' ? 'destructive' :
                                                        'secondary'
                                                    }
                                                >
                                                    {status === 'approved' ? tx('ceo_kpi.status_approved', 'Approved') :
                                                     status === 'revision_requested' ? tx('ceo_kpi.status_revision_requested', 'Revision Requested') :
                                                     tx('ceo_kpi.review.legacy.not_reviewed', 'Not Reviewed')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {tx('ceo_kpi.review.legacy.kpi_count_label', '{{count}} KPI').replace('{{count}}', String(orgKpis.length))}
                                            </p>
                                            <p className={`text-xs mt-1 ${isOrgWeightBalanced(orgName) ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {tx('ceo_kpi.review.total_weight', 'Total weight')}: {orgWeightNormalized}% / 100%
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Organization Popup/Dialog - Opens when organization name is clicked */}
                        <Dialog open={orgPopupOpen !== null} onOpenChange={(open) => setOrgPopupOpen(open ? orgPopupOpen : null)}>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{orgPopupOpen} - {tx('ceo_kpi.review.step_title', 'CEO KPI Review')}</DialogTitle>
                                    <DialogDescription>
                                        {tx('ceo_kpi.review.legacy.dialog_desc', 'Review and manage KPIs for this organization. You can approve, request revisions, or send feedback to the organization leader.')}
                                    </DialogDescription>
                                </DialogHeader>
                                {orgPopupOpen && (
                                    <div className="space-y-4">
                                        {/* KPI Table */}
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>No.</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.kpi_table_name', 'Name')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.purpose', 'Purpose')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.legacy.linked_job', 'Linked Job')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.legacy.linked_csf', 'Linked CSF')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.formula', 'Formula')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.legacy.measurement_method', 'Measurement Method')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.kpi_table_weight', 'Weight')}</TableHead>
                                                        <TableHead>{tx('ceo_kpi.review.status', 'Status')}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {kpis
                                                        .filter(k => k.organization_name === orgPopupOpen)
                                                        .map((kpi, idx) => (
                                                            <TableRow key={kpi.id || idx}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>{kpi.kpi_name}</TableCell>
                                                                <TableCell>{kpi.purpose || '-'}</TableCell>
                                                                <TableCell>{kpi.linked_job?.job_name || '-'}</TableCell>
                                                                <TableCell>{kpi.linked_csf || '-'}</TableCell>
                                                                <TableCell>{kpi.formula || '-'}</TableCell>
                                                                <TableCell>{kpi.measurement_method || '-'}</TableCell>
                                                                <TableCell>{kpi.weight || 0}%</TableCell>
                                                                <TableCell>
                                                                    <Badge variant={kpi.ceo_approval_status === 'approved' ? 'default' : 'secondary'}>
                                                                        {kpi.ceo_approval_status === 'approved' ? tx('ceo_kpi.status_approved', 'Approved') : 
                                                                         kpi.ceo_approval_status === 'revision_requested' ? tx('ceo_kpi.status_revision_requested', 'Revision Requested') : 
                                                                         tx('ceo_kpi.review.legacy.not_reviewed', 'Not Reviewed')}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">{tx('ceo_kpi.review.revision_comment', 'Revision comment')}</Label>
                                                <Textarea
                                                    value={revisionComments[orgPopupOpen] || ''}
                                                    onChange={(e) => setRevisionComments({ ...revisionComments, [orgPopupOpen]: e.target.value })}
                                                    placeholder={tx('ceo_kpi.review.revision_comment_placeholder', 'Enter revision comments for this organization...')}
                                                    rows={4}
                                                    disabled={isViewOnly}
                                                />
                                            </div>
                                            {!isViewOnly && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Button
                                                        onClick={() => {
                                                            handleSave();
                                                            setOrgPopupOpen(null);
                                                        }}
                                                        variant="outline"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {tx('common.save', 'Save')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            handleRequestRevision(orgPopupOpen);
                                                            setOrgPopupOpen(null);
                                                        }}
                                                        variant="outline"
                                                        className="flex items-center gap-2"
                                                        disabled={!revisionComments[orgPopupOpen]?.trim()}
                                                    >
                                                        {tx('ceo_kpi.review.request_revision', 'Request Revision')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            handleOrgApproval(orgPopupOpen);
                                                            setOrgPopupOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        {tx('ceo_kpi.status_approved', 'Approved')} {orgPopupOpen}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            if (revisionComments[orgPopupOpen]?.trim()) {
                                                                handleRequestRevision(orgPopupOpen);
                                                            }
                                                            setOrgPopupOpen(null);
                                                        }}
                                                        variant="outline"
                                                        className="flex items-center gap-2"
                                                        disabled={!revisionComments[orgPopupOpen]?.trim()}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {tx('ceo_kpi.review.legacy.send_to_leader', 'Send to Organization Leader')}
                                                    </Button>
                                                </div>
                                            )}
                                            {isViewOnly && (
                                                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                                    {tx('ceo_kpi.review.legacy.view_only', 'This is a view-only mode. To make changes, please access this section from the CEO dashboard.')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* KPI Table for Selected Organization (Main View) */}
                        {selectedOrg && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{selectedOrg} - {tx('ceo_kpi.review.legacy.kpis_title', 'KPIs')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No.</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.kpi_table_name', 'Name')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.purpose', 'Purpose')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.legacy.linked_job', 'Linked Job')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.legacy.linked_csf', 'Linked CSF')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.formula', 'Formula')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.legacy.measurement_method', 'Measurement Method')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.kpi_table_weight', 'Weight')}</TableHead>
                                                <TableHead>{tx('ceo_kpi.review.legacy.actions', 'Actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kpis
                                                .filter(k => k.organization_name === selectedOrg)
                                                .map((kpi, idx) => (
                                                    <TableRow key={kpi.id || idx}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{kpi.kpi_name}</TableCell>
                                                        <TableCell>{kpi.purpose || '-'}</TableCell>
                                                        <TableCell>{kpi.linked_job?.job_name || '-'}</TableCell>
                                                        <TableCell>{kpi.linked_csf || '-'}</TableCell>
                                                        <TableCell>{kpi.formula || '-'}</TableCell>
                                                        <TableCell>{kpi.measurement_method || '-'}</TableCell>
                                                        <TableCell>{kpi.weight || 0}%</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOrgApproval(selectedOrg)}
                                                                className={kpi.ceo_approval_status === 'approved' ? 'bg-green-100' : ''}
                                                            >
                                                                {kpi.ceo_approval_status === 'approved' ? (
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                ) : (
                                                                    tx('ceo_kpi.review.legacy.activate', 'Activate')
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>

                                    {/* Action Buttons for Selected Organization */}
                                    {!isViewOnly && (
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">{tx('ceo_kpi.review.revision_comment', 'Revision comment')}</Label>
                                                <Textarea
                                                    value={revisionComments[selectedOrg] || ''}
                                                    onChange={(e) => setRevisionComments({ ...revisionComments, [selectedOrg]: e.target.value })}
                                                    placeholder={tx('ceo_kpi.review.revision_comment_placeholder', 'Enter revision comments for this organization...')}
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handleSave()}
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {tx('common.save', 'Save')}
                                                </Button>
                                                <Button
                                                    onClick={() => handleRequestRevision(selectedOrg)}
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    {tx('ceo_kpi.review.request_revision', 'Request Revision')}
                                                </Button>
                                                <Button
                                                    onClick={() => handleOrgApproval(selectedOrg)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {selectedOrg} {tx('ceo_kpi.status_approved', 'Approved')}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (revisionComments[selectedOrg]) {
                                                            handleRequestRevision(selectedOrg);
                                                        }
                                                    }}
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {tx('ceo_kpi.review.legacy.send_to_leader', 'Send to Organization Leader')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {isViewOnly && (
                                        <div className="mt-6 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                            {tx('ceo_kpi.review.legacy.view_only', 'This is a view-only mode. To make changes, please access this section from the CEO dashboard.')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border">
                    {onBack && (
                        <Button 
                            onClick={onBack} 
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {tx('common.back', 'Back')}
                        </Button>
                    )}
                    <div className="flex-1" />
                    {!isViewOnly && (
                        <Button 
                            onClick={handleFinalize} 
                            size="lg"
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                        >
                            {tx('ceo_kpi.review.legacy.save_finalize', 'Save & Finalize Company-wide KPIs')}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title={tx('ceo_kpi.review.legacy.guidance', 'Guidance')}
            />
        </>
    );
}
