import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Building2, 
    UserPlus, 
    Mail, 
    Clock, 
    CheckCircle2, 
    XCircle,
    Users,
    Calendar
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Invitation {
    id: number;
    email: string;
    company: {
        id: number;
        name: string;
    } | null;
    status: 'pending' | 'accepted' | 'rejected';
    invited_by: {
        id: number;
        name: string;
        email: string;
    } | null;
    invited_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
    hr_project: {
        id: number;
    } | null;
}

interface CEO {
    id: number;
    name: string;
    email: string;
    companies: Array<{
        id: number;
        name: string;
    }>;
}

interface Company {
    id: number;
    name: string;
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface Props {
    ceos: CEO[];
    companies: Company[];
    invitations: Invitation[];
}

export default function AdminCeoIndex({ ceos, companies, invitations }: Props) {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
    const [showCreateCeoDialog, setShowCreateCeoDialog] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        company_id: null as number | null,
    });

    const handleCreateCeo = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/ceo/create', {
            onSuccess: () => {
                reset();
                setShowCreateCeoDialog(false);
            },
        });
    };

    const filteredInvitations = statusFilter === 'all' 
        ? invitations 
        : invitations.filter(inv => inv.status === statusFilter);

    const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
    const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
    const rejectedCount = invitations.filter(inv => inv.status === 'rejected').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="CEO Management - Admin" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 shadow-lg mb-4">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">CEO Management</h1>
                                <p className="text-muted-foreground">
                                    View all CEO invitations and manage CEO accounts
                                </p>
                            </div>
                            <Dialog open={showCreateCeoDialog} onOpenChange={setShowCreateCeoDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create CEO
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New CEO</DialogTitle>
                                        <DialogDescription>
                                            Create a new CEO user account and optionally assign them to a company. A temporary password will be generated.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateCeo} className="space-y-4">
                                        <div>
                                            <Label htmlFor="ceo-name">Name</Label>
                                            <Input
                                                id="ceo-name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="CEO Name"
                                                required
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="ceo-email">Email</Label>
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
                                        <div>
                                            <Label htmlFor="company_id">Assign to Company (Optional)</Label>
                                            <Select
                                                value={data.company_id ? String(data.company_id) : 'none'}
                                                onValueChange={(value) => setData('company_id', value === 'none' ? null : Number(value))}
                                            >
                                                <SelectTrigger className={errors.company_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None - Create CEO without company</SelectItem>
                                                    {companies.map((company) => (
                                                        <SelectItem key={company.id} value={String(company.id)}>
                                                            {company.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.company_id && (
                                                <p className="text-sm text-destructive mt-1">{errors.company_id}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                If you select a company, the CEO will be assigned to it and HR will see them.
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowCreateCeoDialog(false);
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Creating...' : 'Create CEO'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total CEOs</p>
                                            <p className="text-3xl font-bold text-foreground">{ceos.length}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Pending Invitations</p>
                                            <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Accepted</p>
                                            <p className="text-3xl font-bold text-foreground">{acceptedCount}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                                            <p className="text-3xl font-bold text-foreground">{rejectedCount}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for Invitations and CEOs */}
                        <Tabs defaultValue="invitations" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="invitations">
                                    CEO Invitations ({invitations.length})
                                </TabsTrigger>
                                <TabsTrigger value="ceos">
                                    Active CEOs ({ceos.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="invitations" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>CEO Invitation Listings</CardTitle>
                                                <CardDescription>
                                                    All CEO invitations with their status and details
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setStatusFilter('all')}
                                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                        statusFilter === 'all'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    All ({invitations.length})
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('pending')}
                                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                        statusFilter === 'pending'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    Pending ({pendingCount})
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('accepted')}
                                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                        statusFilter === 'accepted'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    Accepted ({acceptedCount})
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('rejected')}
                                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                        statusFilter === 'rejected'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    Rejected ({rejectedCount})
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {filteredInvitations.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">No invitations found</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Company</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Invited By</TableHead>
                                                            <TableHead>Invited At</TableHead>
                                                            <TableHead>Accepted/Rejected At</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredInvitations.map((invitation) => (
                                                            <TableRow key={invitation.id}>
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                                        {invitation.email}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {invitation.company ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                                                            {invitation.company.name}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">N/A</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getStatusBadge(invitation.status)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {invitation.invited_by ? (
                                                                        <div>
                                                                            <p className="font-medium">{invitation.invited_by.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{invitation.invited_by.email}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">N/A</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                                        {formatDate(invitation.invited_at)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {invitation.status === 'accepted' && invitation.accepted_at && (
                                                                        <div className="flex items-center gap-2 text-green-600">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            {formatDate(invitation.accepted_at)}
                                                                        </div>
                                                                    )}
                                                                    {invitation.status === 'rejected' && invitation.rejected_at && (
                                                                        <div className="flex items-center gap-2 text-red-600">
                                                                            <XCircle className="w-4 h-4" />
                                                                            {formatDate(invitation.rejected_at)}
                                                                        </div>
                                                                    )}
                                                                    {invitation.status === 'pending' && (
                                                                        <span className="text-muted-foreground">-</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="ceos" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Active CEOs</CardTitle>
                                        <CardDescription>
                                            All users with CEO role and their associated companies
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {ceos.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">No CEOs found</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Companies</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {ceos.map((ceo) => (
                                                            <TableRow key={ceo.id}>
                                                                <TableCell className="font-medium">{ceo.name}</TableCell>
                                                                <TableCell>{ceo.email}</TableCell>
                                                                <TableCell>
                                                                    {ceo.companies && ceo.companies.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {ceo.companies.map((company) => (
                                                                                <Badge key={company.id} variant="outline">
                                                                                    {company.name}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">No companies</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
