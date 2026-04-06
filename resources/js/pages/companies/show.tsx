import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Clock,
    Mail,
    RefreshCw,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Invitation {
    id: number;
    email: string;
    status: 'pending' | 'accepted' | 'rejected';
    invited_by: { id: number; name: string } | null;
    invited_at: string;
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
    hrProjects?: Array<{ id: number; status: string }>;
    users?: User[];
    invitations?: Invitation[];
}

interface Props {
    company: Company;
}

export default function ShowCompany({ company }: Props) {
    const { t } = useTranslation();
    const { auth, flash } = usePage().props as any;
    const user = auth?.user;
    const isHrManager =
        user?.roles?.some(
            (role: { name: string }) => role.name === 'hr_manager',
        ) || false;

    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [resendingInvitation, setResendingInvitation] = useState<
        number | null
    >(null);
    const [deletingInvitation, setDeletingInvitation] = useState<number | null>(
        null,
    );

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            email: '',
            hr_project_id:
                company.hrProjects?.find((p) => p.status === 'active')?.id ||
                null,
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
            onSuccess: () => setResendingInvitation(null),
            onError: () => setResendingInvitation(null),
        });
    };

    const handleDeleteInvitation = (invitationId: number) => {
        if (!confirm(t('company_details.confirm_delete_invite'))) return;
        setDeletingInvitation(invitationId);
        router.delete(`/invitations/${invitationId}`, {
            onSuccess: () => setDeletingInvitation(null),
            onError: () => setDeletingInvitation(null),
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            accepted:
                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
            rejected:
                'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400',
            pending:
                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
        };

        if (status === 'accepted')
            return (
                <Badge variant="outline" className={styles.accepted}>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {t('company_details.status_accepted')}
                </Badge>
            );
        if (status === 'rejected')
            return (
                <Badge variant="outline" className={styles.rejected}>
                    <XCircle className="mr-1 h-3 w-3" />
                    {t('company_details.status_rejected')}
                </Badge>
            );
        return (
            <Badge variant="outline" className={styles.pending}>
                <Clock className="mr-1 h-3 w-3" />
                {t('company_details.status_pending')}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const companyLogo = company.logo_path
        ? company.logo_path.startsWith('http')
            ? company.logo_path
            : `/storage/${company.logo_path}`
        : null;

    return (
        <AppLayout>
            <Head
                title={`${company.name} | ${t('company_details.page_title')}`}
            />

            <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <Link
                            href="/hr-manager/companies"
                            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />{' '}
                            {t('company_details.back_to_list')}
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {company.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('company_details.subtitle')}
                        </p>
                    </div>
                    {isHrManager && (
                        <Button
                            onClick={() => setShowInviteDialog(true)}
                            className="shadow-sm"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('company_details.invite_ceo_btn')}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Card */}
                    <Card className="border-none bg-card/50 shadow-lg backdrop-blur lg:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={company.name}
                                        className="mx-auto h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-background"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 shadow-md">
                                        <Building2 className="h-12 w-12 text-primary" />
                                    </div>
                                )}
                            </div>
                            <CardTitle>
                                {t('company_details.profile_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between rounded-xl border bg-background/50 p-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t('company_details.reg_no')}
                                </span>
                                <span className="text-sm font-semibold">
                                    {company.registration_number || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between rounded-xl border bg-background/50 p-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t('company_details.location')}
                                </span>
                                <span className="text-sm font-semibold">
                                    {company.hq_location || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between rounded-xl border bg-background/50 p-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t('company_details.listing')}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                    {company.public_listing_status.replace(
                                        '_',
                                        ' ',
                                    )}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Tabs */}
                    <div className="space-y-6 lg:col-span-2">
                        <Tabs defaultValue="team">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                                <TabsTrigger
                                    value="team"
                                    className="rounded-lg py-2.5"
                                >
                                    <Users className="mr-2 h-4 w-4" />{' '}
                                    {t('company_details.tab_team')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="invitations"
                                    className="rounded-lg py-2.5"
                                >
                                    <Mail className="mr-2 h-4 w-4" />{' '}
                                    {t('company_details.tab_invitations')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="team" className="mt-6">
                                <Card className="border-none shadow-md">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>
                                                    {t(
                                                        'company_details.table_name',
                                                    )}
                                                </TableHead>
                                                <TableHead>
                                                    {t(
                                                        'company_details.table_role',
                                                    )}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {company.users?.length ? (
                                                company.users.map((u) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">
                                                                    {u.name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {u.email}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="secondary"
                                                                className="capitalize"
                                                            >
                                                                <ShieldCheck className="mr-1 h-3 w-3" />
                                                                {u.role.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        className="h-32 text-center text-muted-foreground"
                                                    >
                                                        {t(
                                                            'company_details.no_members',
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            <TabsContent value="invitations" className="mt-6">
                                <Card className="overflow-hidden border-none shadow-md">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>
                                                    {t(
                                                        'company_details.table_email',
                                                    )}
                                                </TableHead>
                                                <TableHead>
                                                    {t(
                                                        'company_details.table_status',
                                                    )}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t(
                                                        'company_details.table_actions',
                                                    )}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {company.invitations?.length ? (
                                                company.invitations.map(
                                                    (inv) => (
                                                        <TableRow key={inv.id}>
                                                            <TableCell className="text-sm">
                                                                {inv.email}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusBadge(
                                                                    inv.status,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {inv.status ===
                                                                    'pending' &&
                                                                    isHrManager && (
                                                                        <div className="flex justify-end gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    handleResendInvitation(
                                                                                        inv.id,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    !!resendingInvitation
                                                                                }
                                                                            >
                                                                                <RefreshCw
                                                                                    className={`h-4 w-4 ${resendingInvitation === inv.id ? 'animate-spin' : ''}`}
                                                                                />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    handleDeleteInvitation(
                                                                                        inv.id,
                                                                                    )
                                                                                }
                                                                                className="text-rose-500"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="h-32 text-center text-muted-foreground"
                                                    >
                                                        {t(
                                                            'company_details.no_invitations',
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Invite Modal */}
                <Dialog
                    open={showInviteDialog}
                    onOpenChange={setShowInviteDialog}
                >
                    <DialogContent className="overflow-hidden rounded-2xl border-none p-0">
                        <div className="bg-primary p-6 text-primary-foreground">
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    {t('company_details.modal_title')}
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-primary-foreground/80">
                                    {company.hrProjects?.some(
                                        (p) => p.status === 'active',
                                    )
                                        ? t(
                                              'company_details.modal_desc_project',
                                          )
                                        : t(
                                              'company_details.modal_desc_general',
                                          )}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form
                            onSubmit={handleInviteCeo}
                            className="space-y-4 bg-card p-6"
                        >
                            <div className="space-y-2">
                                <Label>
                                    {t('company_details.email_label')}
                                </Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    required
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowInviteDialog(false)}
                                >
                                    {t('company_details.btn_cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600"
                                >
                                    {processing
                                        ? t('company_details.btn_sending')
                                        : t('company_details.btn_send')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
