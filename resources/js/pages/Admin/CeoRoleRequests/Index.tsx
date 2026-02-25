import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, UserCheck, X, CheckCircle2, Clock, Mail } from 'lucide-react';

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
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="CEO Role Requests - Admin" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">CEO Role Requests</h1>
                            <p className="text-muted-foreground">
                                Review and manage CEO role requests from HR Managers
                            </p>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Pending</p>
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
                                            <p className="text-sm text-muted-foreground mb-1">Approved</p>
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
                                            <p className="text-sm text-muted-foreground mb-1">Rejected</p>
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
                                    <CardTitle>Pending Requests</CardTitle>
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
                                                                <strong>Company:</strong> {request.company_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Requested: {new Date(request.requested_at).toLocaleString()}
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
                                                            {approveForm.processing ? 'Approving...' : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setShowRejectDialog(true);
                                                            }}
                                                            variant="destructive"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Reject
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
                                <CardTitle>All Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {requests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No CEO role requests found.</p>
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
                                                                <strong>Company:</strong> {request.company_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Requested: {new Date(request.requested_at).toLocaleString()}
                                                            </p>
                                                            {request.reviewed_at && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Reviewed: {new Date(request.reviewed_at).toLocaleString()}
                                                                    {request.reviewer_name && ` by ${request.reviewer_name}`}
                                                                </p>
                                                            )}
                                                            {request.rejection_reason && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    <strong>Reason:</strong> {request.rejection_reason}
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
                                                                Approve
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
                                                                Reject
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
                                    <DialogTitle>Reject CEO Role Request</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to reject this CEO role request? You can provide an optional reason.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleReject} className="space-y-4">
                                    {selectedRequest && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm"><strong>HR Manager:</strong> {selectedRequest.user_name}</p>
                                            <p className="text-sm"><strong>Email:</strong> {selectedRequest.user_email}</p>
                                            <p className="text-sm"><strong>Company:</strong> {selectedRequest.company_name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="rejection_reason">Rejection Reason (Optional)</Label>
                                        <Input
                                            id="rejection_reason"
                                            type="text"
                                            value={rejectForm.data.rejection_reason}
                                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                            placeholder="Enter reason for rejection..."
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
                                                setSelectedRequest(null);
                                                rejectForm.reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                            {rejectForm.processing ? 'Rejecting...' : 'Reject Request'}
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
