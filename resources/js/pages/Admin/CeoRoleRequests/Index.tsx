import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, UserCheck, X, CheckCircle2, Clock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

interface CeoRoleRequest {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    company_id: number;
    company_name: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    reviewed_at?: string;
    reviewer_name?: string;
    rejection_reason?: string;
}

interface Props {
    requests: CeoRoleRequest[];
}

export default function CeoRoleRequestsIndex({ requests }: Props) {
    const { t } = useTranslation();
    const [selectedRequest, setSelectedRequest] = useState<CeoRoleRequest | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    
    const approveForm = useForm({});
    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleApprove = (request: CeoRoleRequest) => {
        approveForm.post(`/admin/ceo-role-requests/${request.id}/approve`, {
            onSuccess: () => {
                setSelectedRequest(null);
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRequest) {
            rejectForm.post(`/admin/ceo-role-requests/${selectedRequest.id}/reject`, {
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setSelectedRequest(null);
                    rejectForm.reset();
                },
            });
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const approvedRequests = requests.filter(r => r.status === 'approved');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />{t('admin_ceo_role_requests.status.pending')}</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />{t('admin_ceo_role_requests.status.approved')}</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />{t('admin_ceo_role_requests.status.rejected')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_ceo_role_requests.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">{t('admin_ceo_role_requests.heading')}</h1>
                            <p className="text-muted-foreground">
                                {t('admin_ceo_role_requests.subheading')}
                            </p>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{t('admin_ceo_role_requests.stats.pending')}</p>
                                            <p className="text-3xl font-bold">{pendingRequests.length}</p>
                                        </div>
                                        <Clock className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{t('admin_ceo_role_requests.stats.approved')}</p>
                                            <p className="text-3xl font-bold">{approvedRequests.length}</p>
                                        </div>
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{t('admin_ceo_role_requests.stats.rejected')}</p>
                                            <p className="text-3xl font-bold">{rejectedRequests.length}</p>
                                        </div>
                                        <X className="w-8 h-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pending Requests */}
                        {pendingRequests.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>{t('admin_ceo_role_requests.pending.title')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {pendingRequests.map((request) => (
                                            <div key={request.id} className="p-4 border rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <UserCheck className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <p className="font-medium">{request.user_name}</p>
                                                                <p className="text-sm text-muted-foreground">{request.user_email}</p>
                                                            </div>
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                        <div className="ml-8 space-y-1">
                                                            <p className="text-sm">
                                                                <strong>{t('admin_ceo_role_requests.fields.company')}:</strong> {request.company_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {t('admin_ceo_role_requests.fields.requested')}: {new Date(request.requested_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleApprove(request)}
                                                            disabled={approveForm.processing}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            {approveForm.processing ? t('admin_ceo_role_requests.actions.approving') : t('admin_ceo_role_requests.actions.approve')}
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setShowRejectDialog(true);
                                                            }}
                                                            variant="destructive"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            {t('admin_ceo_role_requests.actions.reject')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* All Requests Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_ceo_role_requests.all.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {requests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">{t('admin_ceo_role_requests.all.empty')}</p>
                                    ) : (
                                        requests.map((request) => (
                                            <div key={request.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Building2 className="w-5 h-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">{request.user_name}</p>
                                                                <p className="text-sm text-muted-foreground">{request.user_email}</p>
                                                            </div>
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                        <div className="ml-8 space-y-1">
                                                            <p className="text-sm">
                                                                <strong>{t('admin_ceo_role_requests.fields.company')}:</strong> {request.company_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {t('admin_ceo_role_requests.fields.requested')}: {new Date(request.requested_at).toLocaleString()}
                                                            </p>
                                                            {request.reviewed_at && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {t('admin_ceo_role_requests.fields.reviewed')}: {new Date(request.reviewed_at).toLocaleString()}
                                                                    {request.reviewer_name && ` ${t('admin_ceo_role_requests.fields.by')} ${request.reviewer_name}`}
                                                                </p>
                                                            )}
                                                            {request.rejection_reason && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    <strong>{t('admin_ceo_role_requests.fields.reason')}:</strong> {request.rejection_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {request.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => handleApprove(request)}
                                                                disabled={approveForm.processing}
                                                                className="bg-green-600 hover:bg-green-700"
                                                                size="sm"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                {t('admin_ceo_role_requests.actions.approve')}
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedRequest(request);
                                                                    setShowRejectDialog(true);
                                                                }}
                                                                variant="destructive"
                                                                size="sm"
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                {t('admin_ceo_role_requests.actions.reject')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reject Dialog */}
                        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('admin_ceo_role_requests.reject_dialog.title')}</DialogTitle>
                                    <DialogDescription>
                                        {t('admin_ceo_role_requests.reject_dialog.description')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleReject} className="space-y-4">
                                    {selectedRequest && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm"><strong>{t('admin_ceo_role_requests.fields.hr_manager')}:</strong> {selectedRequest.user_name}</p>
                                            <p className="text-sm"><strong>{t('admin_ceo_role_requests.fields.email')}:</strong> {selectedRequest.user_email}</p>
                                            <p className="text-sm"><strong>{t('admin_ceo_role_requests.fields.company')}:</strong> {selectedRequest.company_name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="rejection_reason">{t('admin_ceo_role_requests.fields.rejection_reason_optional')}</Label>
                                        <Input
                                            id="rejection_reason"
                                            type="text"
                                            value={rejectForm.data.rejection_reason}
                                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                            placeholder={t('admin_ceo_role_requests.fields.rejection_reason_placeholder')}
                                            className={rejectForm.errors.rejection_reason ? 'border-red-500' : ''}
                                        />
                                        {rejectForm.errors.rejection_reason && (
                                            <p className="text-sm text-destructive mt-1">{rejectForm.errors.rejection_reason}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowRejectDialog(false);
                                                rejectForm.clearErrors('rejection_reason');
                                                setSelectedRequest(null);
                                                rejectForm.reset();
                                            }}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                            {rejectForm.processing ? t('admin_ceo_role_requests.actions.rejecting') : t('admin_ceo_role_requests.actions.reject_request')}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
