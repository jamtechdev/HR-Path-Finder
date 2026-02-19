import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrganizationalKpi {
    id: number;
    organization_name: string;
    kpi_name: string;
    purpose?: string;
    category?: string;
    linked_job_id?: number;
    linked_csf?: string;
    formula?: string;
    measurement_method?: string;
    weight?: number;
    status: string;
    revision_comment?: string;
    linked_job?: {
        id: number;
        job_name: string;
    };
}

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        };
    };
    kpisByOrganization: Record<string, OrganizationalKpi[]>;
    organizations: string[];
}

export default function CeoKpiReview({ project, kpisByOrganization, organizations }: Props) {
    const [revisionRequests, setRevisionRequests] = useState<Record<string, string>>({});
    const [selectedOrg, setSelectedOrg] = useState<string>('');

    const { data, setData, post, processing } = useForm({
        action: 'approve',
        revision_requests: [] as Array<{ organization_name: string; comment: string }>,
    });

    const handleApprove = () => {
        post(`/ceo/kpi-review/${project.id}`, {
            action: 'approve',
        }, {
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    const handleRequestRevision = () => {
        const requests = Object.entries(revisionRequests)
            .filter(([_, comment]) => comment.trim())
            .map(([org, comment]) => ({
                organization_name: org,
                comment: comment.trim(),
            }));

        if (requests.length === 0) {
            alert('Please add at least one revision comment.');
            return;
        }

        post(`/ceo/kpi-review/${project.id}`, {
            action: 'request_revision',
            revision_requests: requests,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="default" className="bg-green-500">Approved</Badge>;
            case 'revision_requested':
                return <Badge variant="destructive">Revision Requested</Badge>;
            case 'proposed':
                return <Badge variant="secondary">Proposed</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`CEO KPI Review - ${project?.company?.name || 'KPI Review'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link href="/ceo/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">CEO KPI Review</h1>
                            </div>
                            <p className="text-muted-foreground mt-1">Review and finalize organizational KPIs from a company-wide perspective</p>
                        </div>

                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">CEO KPI Review Guide</h2>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>Please review them using the following four criteria:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                        <li>Are they aligned with the company's overall strategy?</li>
                                        <li>Is there an appropriate balance across organizations?</li>
                                        <li>Are there any overlaps or gaps in accountability?</li>
                                        <li>Is the scope practical and manageable?</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6 mb-6">
                            {organizations.map((orgName) => {
                                const orgKpis = kpisByOrganization[orgName] || [];
                                return (
                                    <Card key={orgName}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold">{orgName}</h3>
                                                {getStatusBadge(orgKpis[0]?.status || 'draft')}
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>No.</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Purpose</TableHead>
                                                        <TableHead>Linked Job</TableHead>
                                                        <TableHead>Linked CSF</TableHead>
                                                        <TableHead>Formula</TableHead>
                                                        <TableHead>Measurement Method</TableHead>
                                                        <TableHead>Weight</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orgKpis.map((kpi, idx) => (
                                                        <TableRow key={kpi.id}>
                                                            <TableCell>{idx + 1}</TableCell>
                                                            <TableCell className="font-medium">{kpi.kpi_name}</TableCell>
                                                            <TableCell>{kpi.category || '-'}</TableCell>
                                                            <TableCell>{kpi.purpose || '-'}</TableCell>
                                                            <TableCell>{kpi.linked_job?.job_name || '-'}</TableCell>
                                                            <TableCell>{kpi.linked_csf || '-'}</TableCell>
                                                            <TableCell>{kpi.formula || '-'}</TableCell>
                                                            <TableCell>{kpi.measurement_method || '-'}</TableCell>
                                                            <TableCell>{kpi.weight ? `${kpi.weight}%` : '-'}</TableCell>
                                                            <TableCell>{getStatusBadge(kpi.status)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {orgKpis[0]?.revision_comment && (
                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                    <p className="text-sm">
                                                        <strong>Revision Comment:</strong> {orgKpis[0].revision_comment}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="mt-4">
                                                <Label>Revision Comment (if needed)</Label>
                                                <Textarea
                                                    value={revisionRequests[orgName] || ''}
                                                    onChange={(e) => setRevisionRequests({ ...revisionRequests, [orgName]: e.target.value })}
                                                    placeholder="Enter revision comments for this organization..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleRequestRevision}
                                disabled={processing || Object.values(revisionRequests).every(v => !v.trim())}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> Request Revision
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Finalize Company-wide KPIs
                            </Button>
                        </div>
                    </div>
        </AppLayout>
    );
}
