import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { UserPlus, Mail, Building2, Edit, Trash2, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface PageProps extends Record<string, unknown> {
    ceos: CEO[];
    pendingInvitations: PendingInvitation[];
    companies: Company[];
}

export default function CEOsIndex({ ceos, pendingInvitations, companies }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = (props as any).flash || {};

    const handleDelete = (ceoId: number, companyId: number) => {
        if (confirm('Are you sure you want to remove this CEO from the company?')) {
            router.delete(`/ceos/${ceoId}/companies/${companyId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSendInvitation = (ceoId: number, companyId: number) => {
        router.post(`/ceos/${ceoId}/companies/${companyId}/invite`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="CEO Management" />
            <div className="container mx-auto max-w-6xl py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <UserPlus className="h-8 w-8" />
                                CEO Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage CEOs and send invitations to join your companies
                            </p>
                        </div>
                        <Link href="/ceos/create">
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add CEO
                            </Button>
                        </Link>
                    </div>
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
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{invitation.email}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {invitation.company_name} • Sent {new Date(invitation.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">Pending</Badge>
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
                            <Link href="/ceos/create">
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
                                        <Link href={`/ceos/${ceo.id}/edit`}>
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
                                                    {ceo.companies.map((company) => (
                                                        <div
                                                            key={company.id}
                                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{company.name}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleSendInvitation(ceo.id, company.id)}
                                                                >
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Send Invitation
                                                                </Button>
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
                                                    ))}
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
        </AppLayout>
    );
}
