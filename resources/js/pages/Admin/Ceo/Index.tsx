import { Head, Link, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { toastCopy } from '@/lib/toastCopy';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const { flash } = usePage().props as any;

        useEffect(() => {
            if (flash?.success) {
                toast({ title: toastCopy.success, description: flash.success });
            }

            if (flash?.error) {
                toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
            }

            if (flash?.message) {
                toast({ title: toastCopy.info, description: flash.message });
            }
        }, [flash]);
    
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'pending' | 'accepted' | 'rejected'
        >('all');
    const [showCreateCeoDialog, setShowCreateCeoDialog] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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

    const filteredInvitations =
        statusFilter === 'all'
            ? invitations
            : invitations.filter((inv) => inv.status === statusFilter);

    const pendingCount = invitations.filter(
        (inv) => inv.status === 'pending',
    ).length;
    const acceptedCount = invitations.filter(
        (inv) => inv.status === 'accepted',
    ).length;
    const rejectedCount = invitations.filter(
        (inv) => inv.status === 'rejected',
    ).length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {t('admin_ceo.status.pending')}
                    </Badge>
                );
            case 'accepted':
                return (
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t('admin_ceo.status.accepted')}
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                        <XCircle className="mr-1 h-3 w-3" />
                        {t('admin_ceo.status.rejected')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return t('admin_ceo.na');
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm(t('admin_ceo.confirm_delete'))) {
            destroy(`/admin/ceos/${id}`);
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
                    <Head title={t('admin_ceo.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg dark:from-blue-600 dark:to-purple-700">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t('admin_ceo.heading')}
                                </h1>
                                <p className="text-muted-foreground">
                                    View all CEO invitations and manage CEO
                                    accounts
                                </p>
                            </div>
                            <Dialog
                                open={showCreateCeoDialog}
                                onOpenChange={setShowCreateCeoDialog}
                            >
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {t('admin_ceo.create_cta')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t('admin_ceo.create_dialog.title')}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Create a new CEO user account and
                                            optionally assign them to a company.
                                            A temporary password will be
                                            generated.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleCreateCeo}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <Label htmlFor="ceo-name">
                                                Name
                                            </Label>
                                            <Input
                                                id="ceo-name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => {
                                                    setData('name', e.target.value);
                                                    clearInertiaFieldError(clearErrors, 'name');
                                                }}
                                                placeholder="CEO Name"
                                                required
                                                className={
                                                    errors.name
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="ceo-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="ceo-email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => {
                                                    setData('email', e.target.value);
                                                    clearInertiaFieldError(clearErrors, 'email');
                                                }}
                                                placeholder="ceo@example.com"
                                                required
                                                className={
                                                    errors.email
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="company_id">
                                                Assign to Company (Optional)
                                            </Label>
                                            <Select
                                                value={
                                                    data.company_id
                                                        ? String(
                                                              data.company_id,
                                                          )
                                                        : 'none'
                                                }
                                                onValueChange={(value) => {
                                                    setData(
                                                        'company_id',
                                                        value === 'none'
                                                            ? null
                                                            : Number(value),
                                                    );
                                                    clearInertiaFieldError(clearErrors, 'company_id');
                                                }}
                                            >
                                                <SelectTrigger
                                                    className={
                                                        errors.company_id
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                >
                                                    <SelectValue placeholder="Select a company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        {t('admin_ceo.fields.none_without_company')}
                                                    </SelectItem>
                                                    {companies.map(
                                                        (company) => (
                                                            <SelectItem
                                                                key={company.id}
                                                                value={String(
                                                                    company.id,
                                                                )}
                                                            >
                                                                {company.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.company_id && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.company_id}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                If you select a company, the CEO
                                                will be assigned to it and HR
                                                will see them.
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
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? t('admin_ceo.actions.creating')
                                                    : t('admin_ceo.actions.create_ceo')}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Statistics Cards */}
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                {t('admin_ceo.stats.total_ceos')}
                                            </p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {ceos.length}
                                            </p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                {t('admin_ceo.stats.pending_invitations')}
                                            </p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {pendingCount}
                                            </p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
                                            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                {t('admin_ceo.stats.accepted')}
                                            </p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {acceptedCount}
                                            </p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20">
                                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                {t('admin_ceo.stats.rejected')}
                                            </p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {rejectedCount}
                                            </p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                                    {t('admin_ceo.tabs.active_ceos')} ({ceos.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="invitations"
                                className="space-y-4"
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>
                                                    CEO Invitation Listings
                                                </CardTitle>
                                                <CardDescription>
                                                    All CEO invitations with
                                                    their status and details
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setStatusFilter('all')
                                                    }
                                                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                                        statusFilter === 'all'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    All ({invitations.length})
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setStatusFilter(
                                                            'pending',
                                                        )
                                                    }
                                                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                                        statusFilter ===
                                                        'pending'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    {t('admin_ceo.filters.pending')} ({pendingCount})
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setStatusFilter(
                                                            'accepted',
                                                        )
                                                    }
                                                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                                        statusFilter ===
                                                        'accepted'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    {t('admin_ceo.filters.accepted')} ({acceptedCount})
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setStatusFilter(
                                                            'rejected',
                                                        )
                                                    }
                                                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                                        statusFilter ===
                                                        'rejected'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                                >
                                                    {t('admin_ceo.filters.rejected')} ({rejectedCount})
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {filteredInvitations.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {t('admin_ceo.invitation_list.empty')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                Email
                                                            </TableHead>
                                                            <TableHead>
                                                                Company
                                                            </TableHead>
                                                            <TableHead>
                                                                Status
                                                            </TableHead>
                                                            <TableHead>
                                                                Invited By
                                                            </TableHead>
                                                            <TableHead>
                                                                Invited At
                                                            </TableHead>
                                                            <TableHead>
                                                                Accepted/Rejected
                                                                At
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredInvitations.map(
                                                            (invitation) => (
                                                                <TableRow
                                                                    key={
                                                                        invitation.id
                                                                    }
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        <div className="flex items-center gap-2">
                                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                                            {
                                                                                invitation.email
                                                                            }
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {invitation.company ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                                {
                                                                                    invitation
                                                                                        .company
                                                                                        .name
                                                                                }
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted-foreground">
                                                                                {t('admin_ceo.na')}
                                                                            </span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {getStatusBadge(
                                                                            invitation.status,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {invitation.invited_by ? (
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        invitation
                                                                                            .invited_by
                                                                                            .name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        invitation
                                                                                            .invited_by
                                                                                            .email
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted-foreground">
                                                                                {t('admin_ceo.na')}
                                                                            </span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                            {formatDate(
                                                                                invitation.invited_at,
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {invitation.status ===
                                                                            'accepted' &&
                                                                            invitation.accepted_at && (
                                                                                <div className="flex items-center gap-2 text-green-600">
                                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                                    {formatDate(
                                                                                        invitation.accepted_at,
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        {invitation.status ===
                                                                            'rejected' &&
                                                                            invitation.rejected_at && (
                                                                                <div className="flex items-center gap-2 text-red-600">
                                                                                    <XCircle className="h-4 w-4" />
                                                                                    {formatDate(
                                                                                        invitation.rejected_at,
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        {invitation.status ===
                                                                            'pending' && (
                                                                            <span className="text-muted-foreground">
                                                                                -
                                                                            </span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
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
                                        <CardTitle>{t('admin_ceo.active_ceos.title')}</CardTitle>
                                        <CardDescription>
                                            All users with CEO role and their
                                            associated companies
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {ceos.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {t('admin_ceo.active_ceos.empty')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                Name
                                                            </TableHead>
                                                            <TableHead>
                                                                Email
                                                            </TableHead>
                                                            <TableHead>
                                                                Companies
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Action
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {ceos.map((ceo) => (
                                                            <TableRow
                                                                key={ceo.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {ceo.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {ceo.email}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {ceo.companies &&
                                                                    ceo
                                                                        .companies
                                                                        .length >
                                                                        0 ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {ceo.companies.map(
                                                                                (
                                                                                    company,
                                                                                ) => (
                                                                                    <Badge
                                                                                        key={
                                                                                            company.id
                                                                                        }
                                                                                        variant="outline"
                                                                                    >
                                                                                        {
                                                                                            company.name
                                                                                        }
                                                                                    </Badge>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            No
                                                                            companies
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="flex justify-end gap-2 text-right">
                                                                    <Link
                                                                        href={`/admin/ceos/${ceo.id}`}
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                        >
                                                                            Show
                                                                        </Button>
                                                                    </Link>
                                                                    <Link
                                                                        href={`/admin/ceos/${ceo.id}/edit`}
                                                                    >
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                ceo.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </Button>
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
