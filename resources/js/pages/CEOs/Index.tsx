import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { UserPlus, Mail, Building2, Edit, Trash2, Send, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

interface Company {
    id: number;
    name: string;
}

interface CEO {
    id: number;
    name: string;
    email: string;
    companies: Company[];
    created_at: string;
}

interface PendingInvitation {
    id: number;
    email: string;
    company_id: number;
    company_name: string;
    created_at: string;
    expires_at: string | null;
}

interface AcceptedInvitation {
    id: number;
    email: string;
    company_id: number;
    company_name: string;
    accepted_at: string;
}

interface PageProps extends Record<string, unknown> {
    ceos: CEO[];
    pendingInvitations: PendingInvitation[];
    pendingInvitationsMap?: Record<string, number>; // email_companyId -> invitationId
    acceptedInvitationsMap?: Record<string, AcceptedInvitation>; // email_companyId -> invitation
    companies: Company[];
}

export default function CEOsIndex({ ceos, pendingInvitations, pendingInvitationsMap = {}, acceptedInvitationsMap = {}, companies }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = (props as any).flash || {};

    const handleDelete = (ceoId: number, companyId: number) => {
        if (confirm('Are you sure you want to remove this CEO from the company?')) {
            router.delete(`/hr-manager/ceos/${ceoId}/companies/${companyId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSendInvitation = (ceoId: number, companyId: number) => {
        router.post(`/hr-manager/ceos/${ceoId}/companies/${companyId}/invite`, {}, {
            preserveScroll: true,
        });
    };

    const handleResendInvitation = (invitationId: number) => {
        router.post(`/hr-manager/invitations/${invitationId}/resend`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="CEO Management" />
                    
                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <DashboardHeader
                                title="CEO Management"
                                subtitle="Manage CEOs and send invitations to join your companies"
                                breadcrumbs={[
                                    { title: 'CEO Management' }
                                ]}
                            />
                            <Link href="/hr-manager/ceos/create">
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add CEO
                                </Button>
                            </Link>
                        </div>

                        {/* Success/Error Messages */}
                        {flash.success && (
                            <Alert className="mb-4">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash.error && (
                            <Alert className="mb-4" variant="destructive">
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Pending Invitations */}
                        {pendingInvitations.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>
                                Invitations that have been sent but not yet accepted
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingInvitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{invitation.email}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {invitation.company_name} • Sent {new Date(invitation.created_at).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">Pending</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResendInvitation(invitation.id)}
                                                className="text-xs"
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Resend
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                        {/* CEOs List */}
                        {ceos.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No CEOs yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Add your first CEO to get started
                            </p>
                            <Link href="/hr-manager/ceos/create">
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Your First CEO
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {ceos.map((ceo) => (
                            <Card key={ceo.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {ceo.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Mail className="h-4 w-4" />
                                                {ceo.email}
                                            </CardDescription>
                                        </div>
                                        <Link href={`/hr-manager/ceos/${ceo.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Companies */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Associated Companies
                                            </h4>
                                            {ceo.companies.length > 0 ? (
                                                <div className="space-y-2">
                                                    {ceo.companies.map((company) => {
                                                        const invitationKey = `${ceo.email}_${company.id}`;
                                                        const pendingInvitationId = pendingInvitationsMap[invitationKey];
                                                        const acceptedInvitation = acceptedInvitationsMap[invitationKey];
                                                        const hasPendingInvitation = !!pendingInvitationId;
                                                        const hasAcceptedInvitation = !!acceptedInvitation;
                                                        
                                                        return (
                                                            <div
                                                                key={company.id}
                                                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">{company.name}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {hasAcceptedInvitation ? (
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                            Accepted
                                                                        </Badge>
                                                                    ) : hasPendingInvitation ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleResendInvitation(pendingInvitationId)}
                                                                        >
                                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                                            Resend
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleSendInvitation(ceo.id, company.id)}
                                                                        >
                                                                            <Send className="h-4 w-4 mr-2" />
                                                                            Send Invitation
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(ceo.id, company.id)}
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No companies associated</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                                                        </div>
                                                    )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
