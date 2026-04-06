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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Mail,
    Plus,
    RefreshCw,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CEO {
    id: number;
    name: string;
    email: string;
    status: string;
}

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

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    public_listing_status: string;
    hasCeo: boolean;
    ceos: CEO[];
    invitations: Invitation[];
    activeProject?: {
        id: number;
        status: string;
    };
    created_at: string;
}

interface Props {
    companies: Company[];
}

export default function CompaniesIndex({ companies }: Props) {
    const { t } = useTranslation();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(
        null,
    );
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(
        new Set(),
    );

    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            email: '',
            hr_project_id: null as number | null,
        });
    const [resendingInvitation, setResendingInvitation] = useState<
        number | null
    >(null);
    const [deletingInvitation, setDeletingInvitation] = useState<number | null>(
        null,
    );

    const toggleCompany = (companyId: number) => {
        const newExpanded = new Set(expandedCompanies);
        if (newExpanded.has(companyId)) {
            newExpanded.delete(companyId);
        } else {
            newExpanded.add(companyId);
        }
        setExpandedCompanies(newExpanded);
    };

    const openInviteDialog = (company: Company) => {
        setSelectedCompany(company);
        setData('hr_project_id', company.activeProject?.id || null);
        setShowInviteDialog(true);
    };

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCompany) {
            setData('hr_project_id', selectedCompany.activeProject?.id || null);
            post(`/companies/${selectedCompany.id}/invite-ceo`, {
                onSuccess: () => {
                    reset();
                    setShowInviteDialog(false);
                },
            });
        }
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
        if (!confirm(t('companies_page.confirm_delete_invitation'))) return;

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
            case 'active':
                return (
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t('companies_page.status.active')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {t('companies_page.status.pending')}
                    </Badge>
                );
            case 'accepted':
                return (
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t('companies_page.status.accepted')}
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                        <XCircle className="mr-1 h-3 w-3" />
                        {t('companies_page.status.rejected')}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {t(`companies_page.status.${status}`)}
                    </Badge>
                );
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return t('common.na');
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const hasNoCompanies = companies.length === 0;

    return (
        <AppLayout>
            <Head
                title={
                    hasNoCompanies
                        ? t('companies_page.no_company_title')
                        : t('companies_page.title')
                }
            />
            <div className="mx-auto max-w-7xl p-6 md:p-8">
                {hasNoCompanies ? (
                    /* No company yet: show create-company page (this page) */
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {t('companies_page.no_company_title')}
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                {t('companies_page.no_company_desc')}
                            </p>
                        </div>
                        <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/30">
                            <CardContent className="py-16 text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {t('companies_page.no_company_card_title')}
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                    {t('companies_page.no_company_card_desc')}
                                </p>
                                <Link href="/hr-manager/companies/create">
                                    <Button size="lg" className="gap-2">
                                        <Plus className="h-5 w-5" />
                                        {t('companies_page.create_company')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Company created: show card-style companies list (dashboard-style) */
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">
                                    {t('companies_page.title')}
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {t('companies_page.subtitle')}
                                </p>
                            </div>
                            <Link href="/hr-manager/companies/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('companies_page.create_company')}
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {companies.map((company) => {
                                const isExpanded = expandedCompanies.has(
                                    company.id,
                                );
                                const allCeos = [
                                    ...company.ceos,
                                    ...company.invitations
                                        .filter(
                                            (inv) => inv.status === 'accepted',
                                        )
                                        .map((inv) => ({
                                            id: 0,
                                            name: t(
                                                'companies_page.invited_user',
                                            ),
                                            email: inv.email,
                                            status: 'accepted' as const,
                                        })),
                                ];
                                const totalAssignments =
                                    allCeos.length +
                                    company.invitations.filter(
                                        (inv) => inv.status !== 'accepted',
                                    ).length;

                                return (
                                    <Card
                                        key={company.id}
                                        className="overflow-hidden"
                                    >
                                        <Collapsible
                                            open={isExpanded}
                                            onOpenChange={() =>
                                                toggleCompany(company.id)
                                            }
                                        >
                                            <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl">
                                                                {company.name}
                                                            </CardTitle>
                                                            <CardDescription className="mt-1">
                                                                {company.registration_number &&
                                                                    `Reg: ${company.registration_number} • `}
                                                                {company.hq_location &&
                                                                    `${company.hq_location} • `}
                                                                {
                                                                    company.public_listing_status
                                                                }
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium">
                                                                {
                                                                    totalAssignments
                                                                }{' '}
                                                                {t(
                                                                    'companies_page.ceo_count',
                                                                    {
                                                                        count: totalAssignments,
                                                                    },
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    company.ceos
                                                                        .length
                                                                }{' '}
                                                                {t(
                                                                    'companies_page.active',
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!company.hasCeo && (
                                                            <Button
                                                                onClick={() =>
                                                                    openInviteDialog(
                                                                        company,
                                                                    )
                                                                }
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                {t(
                                                                    'companies_page.invite_ceo',
                                                                )}
                                                            </Button>
                                                        )}
                                                        <Link
                                                            href={`/hr-manager/companies/${company.id}`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                {t(
                                                                    'companies_page.view_details',
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CollapsibleContent>
                                                <CardContent className="pt-0">
                                                    <Tabs
                                                        defaultValue="ceos"
                                                        className="w-full"
                                                    >
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="ceos">
                                                                {t(
                                                                    'companies_page.tabs.assigned_ceos',
                                                                )}{' '}
                                                                (
                                                                {
                                                                    company.ceos
                                                                        .length
                                                                }
                                                                )
                                                            </TabsTrigger>
                                                            <TabsTrigger value="invitations">
                                                                {t(
                                                                    'companies_page.tabs.invitations',
                                                                )}{' '}
                                                                (
                                                                {
                                                                    company
                                                                        .invitations
                                                                        .length
                                                                }
                                                                )
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent
                                                            value="ceos"
                                                            className="mt-4"
                                                        >
                                                            {company.ceos
                                                                .length > 0 ? (
                                                                <div className="overflow-hidden rounded-lg border">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.name',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.email',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.status',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.actions',
                                                                                    )}
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {company.ceos.map(
                                                                                (
                                                                                    ceo,
                                                                                ) => (
                                                                                    <TableRow
                                                                                        key={
                                                                                            ceo.id
                                                                                        }
                                                                                    >
                                                                                        <TableCell className="font-medium">
                                                                                            {
                                                                                                ceo.name
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                ceo.email
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {getStatusBadge(
                                                                                                ceo.status,
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Link
                                                                                                href={`/hr-manager/companies/${company.id}`}
                                                                                            >
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                >
                                                                                                    {t(
                                                                                                        'companies_page.actions.view',
                                                                                                    )}
                                                                                                </Button>
                                                                                            </Link>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ),
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            ) : (
                                                                <div className="py-8 text-center text-muted-foreground">
                                                                    <Users className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                                    <p>
                                                                        {t(
                                                                            'companies_page.empty.no_ceo',
                                                                        )}
                                                                    </p>
                                                                    <Button
                                                                        onClick={() =>
                                                                            openInviteDialog(
                                                                                company,
                                                                            )
                                                                        }
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-4"
                                                                    >
                                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                                        {t(
                                                                            'companies_page.invite_ceo',
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TabsContent>

                                                        <TabsContent
                                                            value="invitations"
                                                            className="mt-4"
                                                        >
                                                            {company.invitations
                                                                .length > 0 ? (
                                                                <div className="overflow-hidden rounded-lg border">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.email',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.status',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.invited_by',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.invited_at',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.expires_at',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.accepted_rejected_at',
                                                                                    )}
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    {t(
                                                                                        'companies_page.table.actions',
                                                                                    )}
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {company.invitations.map(
                                                                                (
                                                                                    invitation,
                                                                                ) => {
                                                                                    const isPending =
                                                                                        invitation.status ===
                                                                                        'pending';
                                                                                    return (
                                                                                        <TableRow
                                                                                            key={
                                                                                                invitation.id
                                                                                            }
                                                                                        >
                                                                                            <TableCell className="font-medium">
                                                                                                {
                                                                                                    invitation.email
                                                                                                }
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {getStatusBadge(
                                                                                                    invitation.status,
                                                                                                )}
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {invitation
                                                                                                    .invited_by
                                                                                                    ?.name ||
                                                                                                    'N/A'}
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {formatDate(
                                                                                                    invitation.invited_at,
                                                                                                )}
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {formatDate(
                                                                                                    invitation.expires_at,
                                                                                                )}
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {invitation.accepted_at
                                                                                                    ? formatDate(
                                                                                                          invitation.accepted_at,
                                                                                                      )
                                                                                                    : invitation.rejected_at
                                                                                                      ? formatDate(
                                                                                                            invitation.rejected_at,
                                                                                                        )
                                                                                                      : 'N/A'}
                                                                                            </TableCell>
                                                                                            <TableCell className="whitespace-nowrap">
                                                                                                {isPending ? (
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <Button
                                                                                                            variant="outline"
                                                                                                            size="sm"
                                                                                                            onClick={() =>
                                                                                                                handleResendInvitation(
                                                                                                                    invitation.id,
                                                                                                                )
                                                                                                            }
                                                                                                            disabled={
                                                                                                                resendingInvitation ===
                                                                                                                    invitation.id ||
                                                                                                                deletingInvitation ===
                                                                                                                    invitation.id
                                                                                                            }
                                                                                                            className="h-8 px-3 text-xs"
                                                                                                        >
                                                                                                            <RefreshCw
                                                                                                                className={`mr-1 h-3 w-3 ${resendingInvitation === invitation.id ? 'animate-spin' : ''}`}
                                                                                                            />
                                                                                                            {resendingInvitation ===
                                                                                                            invitation.id
                                                                                                                ? t(
                                                                                                                      'companies_page.actions.resending',
                                                                                                                  )
                                                                                                                : t(
                                                                                                                      'companies_page.actions.resend',
                                                                                                                  )}
                                                                                                        </Button>
                                                                                                        <Button
                                                                                                            variant="outline"
                                                                                                            size="sm"
                                                                                                            onClick={() =>
                                                                                                                handleDeleteInvitation(
                                                                                                                    invitation.id,
                                                                                                                )
                                                                                                            }
                                                                                                            disabled={
                                                                                                                resendingInvitation ===
                                                                                                                    invitation.id ||
                                                                                                                deletingInvitation ===
                                                                                                                    invitation.id
                                                                                                            }
                                                                                                            className="h-8 border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                                                                                                        >
                                                                                                            <Trash2
                                                                                                                className={`mr-1 h-3 w-3 ${deletingInvitation === invitation.id ? 'animate-pulse' : ''}`}
                                                                                                            />
                                                                                                            {deletingInvitation ===
                                                                                                            invitation.id
                                                                                                                ? t(
                                                                                                                      'companies_page.actions.deleting',
                                                                                                                  )
                                                                                                                : t(
                                                                                                                      'companies_page.actions.delete',
                                                                                                                  )}
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        {t(
                                                                                                            'companies_page.empty.no_invites',
                                                                                                        )}
                                                                                                    </span>
                                                                                                )}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            ) : (
                                                                <div className="py-8 text-center text-muted-foreground">
                                                                    <Mail className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                                    <p>
                                                                        {t(
                                                                            'companies_page.no_invitations',
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </TabsContent>
                                                    </Tabs>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Invite CEO Dialog */}
                {selectedCompany && (
                    <Dialog
                        open={showInviteDialog}
                        onOpenChange={setShowInviteDialog}
                    >
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    {t('companies_page.dialog.title', {
                                        company: selectedCompany.name,
                                    })}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedCompany.activeProject
                                        ? t(
                                              'companies_page.dialog.desc_with_project',
                                              {
                                                  company: selectedCompany.name,
                                              },
                                          )
                                        : t(
                                              'companies_page.dialog.desc_without_project',
                                              {
                                                  company: selectedCompany.name,
                                              },
                                          )}
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleInviteCeo}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="ceo-email">
                                        CEO Email Address *
                                    </Label>
                                    <Input
                                        id="ceo-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => {
                                            setData('email', e.target.value);
                                            clearInertiaFieldError(
                                                clearErrors,
                                                'email',
                                            );
                                        }}
                                        placeholder="ceo@example.com"
                                        required
                                        className={
                                            errors.email ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                    {selectedCompany.activeProject && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            This invitation will be linked to
                                            the active HR project for{' '}
                                            {selectedCompany.name}.
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowInviteDialog(false);
                                            reset();
                                            setSelectedCompany(null);
                                        }}
                                    >
                                        {t('companies_page.dialog.cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing
                                            ? t('companies_page.dialog.sending')
                                            : t('companies_page.dialog.send')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
