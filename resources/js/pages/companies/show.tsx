import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Building2, Users, FileText, UserPlus, Mail, CheckCircle2, XCircle, 
    Clock, RefreshCw, ArrowLeft, MapPin, Hash, Globe, Trash2
} from 'lucide-react';

interface Invitation {
    id: number;
    email: string;
    status: 'pending' | 'accepted' | 'rejected';
    invited_by: {
        id: number;
        name: string;
    } | null;
    invited_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
    expires_at: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    public_listing_status: string;
    logo_path?: string;
    hrProjects?: Array<{
        id: number;
        status: string;
    }>;
    users?: User[];
    invitations?: Invitation[];
}

interface Props {
    company: Company;
}

export default function ShowCompany({ company }: Props) {
    const { auth, flash } = usePage().props as any;
    const user = auth?.user;
    const isHrManager = user?.roles?.some((role: { name: string }) => role.name === 'hr_manager') || false;
    const hasCeo = company.users && Array.isArray(company.users) 
        ? company.users.some((u) => u && u.role === 'ceo') 
        : false;
    
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [resendingInvitation, setResendingInvitation] = useState<number | null>(null);
    const [deletingInvitation, setDeletingInvitation] = useState<number | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        hr_project_id: company.hrProjects?.find(p => p.status === 'active')?.id || null,
    });

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/companies/${company.id}/invite-ceo`, {
            onSuccess: () => {
                reset();
                setShowInviteDialog(false);
                router.reload();
            },
        });
    };

    const handleResendInvitation = (invitationId: number) => {
        setResendingInvitation(invitationId);
        post(`/invitations/${invitationId}/resend`, {
            onSuccess: () => {
                setResendingInvitation(null);
                router.reload();
            },
            onError: () => {
                setResendingInvitation(null);
            },
        });
    };

    const handleDeleteInvitation = (invitationId: number) => {
        if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
            return;
        }
        
        setDeletingInvitation(invitationId);
        router.delete(`/invitations/${invitationId}`, {
            onSuccess: () => {
                setDeletingInvitation(null);
            },
            onError: () => {
                setDeletingInvitation(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const activeProject = company.hrProjects?.find(p => p.status === 'active');
    const companyLogo = company.logo_path 
        ? (company.logo_path.startsWith('http') ? company.logo_path : `/storage/${company.logo_path}`)
        : null;

    return (
        <AppLayout>
            <Head title={`${company.name} - Company Details`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/companies">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                            <p className="text-muted-foreground mt-1">Company Details & Management</p>
                        </div>
                    </div>
                    {isHrManager && (
                        <Button onClick={() => setShowInviteDialog(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite CEO
                        </Button>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Company Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {companyLogo && (
                                <img 
                                    src={companyLogo} 
                                    alt={company.name}
                                    className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                                />
                            )}
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{company.name}</CardTitle>
                                <CardDescription>Company Information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {company.registration_number && (
                                <div className="flex items-start gap-3">
                                    <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                                        <p className="text-base font-semibold">{company.registration_number}</p>
                                    </div>
                                </div>
                            )}
                            {company.hq_location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">HQ Location</p>
                                        <p className="text-base font-semibold">{company.hq_location}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Public Listing</p>
                                    <p className="text-base font-semibold capitalize">{company.public_listing_status.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="team" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="team">
                            <Users className="w-4 h-4 mr-2" />
                            Team Members ({company.users?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="invitations">
                            <Mail className="w-4 h-4 mr-2" />
                            Invitations ({company.invitations && Array.isArray(company.invitations) ? company.invitations.length : 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Team Members Tab */}
                    <TabsContent value="team" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>People associated with this company</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {company.users && Array.isArray(company.users) && company.users.length > 0 ? (
                                    <div className="space-y-3">
                                        {company.users.map((user) => (
                                            user && (
                                                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{user.name || 'N/A'}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email || 'N/A'}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role ? user.role.replace('_', ' ') : 'N/A'}
                                                    </Badge>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No team members yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invitations Tab */}
                    <TabsContent value="invitations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invitations</CardTitle>
                                <CardDescription>CEO invitation history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {company.invitations && Array.isArray(company.invitations) && company.invitations.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Invited By</TableHead>
                                                    <TableHead>Invited At</TableHead>
                                                    <TableHead>Expires At</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {company.invitations.map((invitation) => (
                                                    invitation && (
                                                        <TableRow key={invitation.id}>
                                                            <TableCell className="font-medium">{invitation.email || 'N/A'}</TableCell>
                                                            <TableCell>{getStatusBadge(invitation.status || 'pending')}</TableCell>
                                                            <TableCell>{invitation.invited_by?.name || 'N/A'}</TableCell>
                                                            <TableCell>{formatDate(invitation.invited_at)}</TableCell>
                                                            <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                                                            <TableCell>
                                                                {invitation.status === 'pending' && isHrManager && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleResendInvitation(invitation.id)}
                                                                            disabled={resendingInvitation === invitation.id || deletingInvitation === invitation.id}
                                                                        >
                                                                            <RefreshCw className={`w-3 h-3 mr-1 ${resendingInvitation === invitation.id ? 'animate-spin' : ''}`} />
                                                                            {resendingInvitation === invitation.id ? 'Resending...' : 'Resend'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteInvitation(invitation.id)}
                                                                            disabled={resendingInvitation === invitation.id || deletingInvitation === invitation.id}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                        >
                                                                            <Trash2 className={`w-3 h-3 mr-1 ${deletingInvitation === invitation.id ? 'animate-pulse' : ''}`} />
                                                                            {deletingInvitation === invitation.id ? 'Deleting...' : 'Delete'}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {invitation.status !== 'pending' && (
                                                                    <span className="text-xs text-muted-foreground">No actions</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No invitations sent yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>

                {/* Invite CEO Dialog */}
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Invite CEO for {company.name}</DialogTitle>
                            <DialogDescription>
                                {activeProject 
                                    ? `Invite a CEO to join ${company.name} and complete the Management Philosophy Survey for this HR project.`
                                    : `Invite a CEO to join ${company.name}. Once you create a project, the CEO will be assigned to it.`}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInviteCeo} className="space-y-4">
                            <div>
                                <Label htmlFor="ceo-email">CEO Email Address *</Label>
                                <Input
                                    id="ceo-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="ceo@example.com"
                                    required
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowInviteDialog(false);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                    {processing ? 'Sending...' : 'Send Invitation'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
