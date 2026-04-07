import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Globe,
    Hash,
    Mail,
    MapPin,
    RefreshCw,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
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

    const handleInviteCeo = (e: FormEvent) => {
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
        if (!confirm(t('companies_show.confirm_delete_invitation'))) {
            return;
        }
        
        setDeletingInvitation(invitationId);
        router.delete(`/invitations/${invitationId}`, {
            onSuccess: () => setDeletingInvitation(null),
            onError: () => setDeletingInvitation(null),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />{t('companies_show.status.accepted')}</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />{t('companies_show.status.rejected')}</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"><Clock className="w-3 h-3 mr-1" />{t('companies_show.status.pending')}</Badge>;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return t('companies_show.na');
        return new Date(date).toLocaleString('en-US', {
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
    const activeProject =
        company.hrProjects?.find((project) => project.status === 'active') ??
        null;

    return (
        <AppLayout>
            <Head title={t('companies_show.page_title', { company: company.name })} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/hr-manager/companies">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('common.back')}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                            <p className="text-muted-foreground mt-1">{t('companies_show.subheading')}</p>
                        </div>
                    </div>
                    {isHrManager && (
                        <Button onClick={() => setShowInviteDialog(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {t('companies_show.invite_ceo')}
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
                                <CardDescription>{t('companies_show.company_info')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {company.registration_number && (
                                <div className="flex items-start gap-3">
                                    <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('companies_show.registration_number')}</p>
                                        <p className="text-base font-semibold">{company.registration_number}</p>
                                    </div>
                                </div>
                            )}
                            {company.hq_location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('companies_show.hq_location')}</p>
                                        <p className="text-base font-semibold">{company.hq_location}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('companies_show.public_listing')}</p>
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
                            {t('companies_show.tabs.team_members', { count: company.users?.length || 0 })}
                        </TabsTrigger>
                        <TabsTrigger value="invitations">
                            <Mail className="w-4 h-4 mr-2" />
                            {t('companies_show.tabs.invitations', { count: company.invitations && Array.isArray(company.invitations) ? company.invitations.length : 0 })}
                        </TabsTrigger>
                    </TabsList>

                    {/* Team Members Tab */}
                    <TabsContent value="team" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('companies_show.team_members_title')}</CardTitle>
                                <CardDescription>{t('companies_show.team_members_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {company.users && Array.isArray(company.users) && company.users.length > 0 ? (
                                    <div className="space-y-3">
                                        {company.users.map((user) => (
                                            user && (
                                                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{user.name || t('companies_show.na')}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email || t('companies_show.na')}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role ? user.role.replace('_', ' ') : t('companies_show.na')}
                                                    </Badge>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>{t('companies_show.no_team_members')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invitations Tab */}
                    <TabsContent value="invitations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('companies_show.invitations_title')}</CardTitle>
                                <CardDescription>{t('companies_show.invitations_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {company.invitations && Array.isArray(company.invitations) && company.invitations.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('companies_show.table.email')}</TableHead>
                                                    <TableHead>{t('companies_show.table.status')}</TableHead>
                                                    <TableHead>{t('companies_show.table.invited_by')}</TableHead>
                                                    <TableHead>{t('companies_show.table.invited_at')}</TableHead>
                                                    <TableHead>{t('companies_show.table.expires_at')}</TableHead>
                                                    <TableHead>{t('companies_show.table.actions')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {company.invitations.map((invitation) => (
                                                    invitation && (
                                                        <TableRow key={invitation.id}>
                                                            <TableCell className="font-medium">{invitation.email || t('companies_show.na')}</TableCell>
                                                            <TableCell>{getStatusBadge(invitation.status || 'pending')}</TableCell>
                                                            <TableCell>{invitation.invited_by?.name || t('companies_show.na')}</TableCell>
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
                                                                            {resendingInvitation === invitation.id ? t('companies_show.resending') : t('companies_show.resend')}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteInvitation(invitation.id)}
                                                                            disabled={resendingInvitation === invitation.id || deletingInvitation === invitation.id}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                        >
                                                                            <Trash2 className={`w-3 h-3 mr-1 ${deletingInvitation === invitation.id ? 'animate-pulse' : ''}`} />
                                                                            {deletingInvitation === invitation.id ? t('companies_show.deleting') : t('companies_show.delete')}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {invitation.status !== 'pending' && (
                                                                    <span className="text-xs text-muted-foreground">{t('companies_show.no_actions')}</span>
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
                                        <p>{t('companies_show.no_invitations')}</p>
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
                            <DialogTitle>{t('companies_show.invite_dialog.title', { company: company.name })}</DialogTitle>
                            <DialogDescription>
                                {activeProject
                                    ? t('companies_show.dialog.desc_with_project', {
                                          company: company.name,
                                      })
                                    : t(
                                          'companies_show.dialog.desc_without_project',
                                          { company: company.name },
                                      )}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInviteCeo} className="space-y-4">
                            <div>
                                <Label htmlFor="ceo-email">{t('companies_show.invite_dialog.email_label')}</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        clearInertiaFieldError(clearErrors, 'email');
                                    }}
                                    placeholder={t('companies_show.invite_dialog.email_placeholder')}
                                    required
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
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                    {processing ? t('companies_show.sending') : t('companies_show.send_invitation')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
