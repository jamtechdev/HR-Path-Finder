import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Building2, Mail, UserPlus, X, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    pivot?: {
        role: string;
    };
}

interface Invitation {
    id: number;
    email: string;
    role: string;
    created_at: string;
    expires_at: string | null;
}

interface Company {
    id: number;
    name: string;
    brand_name?: string | null;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    users?: User[];
    invitations?: Invitation[];
    hr_projects?: Array<{
        id: number;
        status: string;
    }>;
}

interface PageProps {
    company: Company;
    canInvite?: boolean;
}

export default function CompanyShow({ company, canInvite: canInviteProp }: PageProps) {
    const { props } = usePage<PageProps>();
    const user = (props as any).auth?.user;
    const canInvite = canInviteProp ?? false;

    const [showInviteForm, setShowInviteForm] = useState(false);

    const inviteForm = useForm({
        email: '',
        role: 'ceo',
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        inviteForm.post(`/companies/${company.id}/invitations`, {
            onSuccess: () => {
                inviteForm.reset();
                setShowInviteForm(false);
            },
        });
    };

    const handleCancelInvitation = (invitationId: number) => {
        if (confirm('Are you sure you want to cancel this invitation?')) {
            router.delete(`/companies/${company.id}/invitations/${invitationId}`, {
                preserveScroll: true,
            });
        }
    };

    const ceoUser = company.users?.find((u) => u.pivot?.role === 'ceo');
    const hrManagerUser = company.users?.find((u) => u.pivot?.role === 'hr_manager');

    return (
        <AppLayout>
            <Head title={`${company.name} - Company Details`} />
            <div className="container mx-auto max-w-6xl py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Building2 className="h-8 w-8" />
                                {company.name}
                            </h1>
                            {company.brand_name && (
                                <p className="text-muted-foreground mt-1">{company.brand_name}</p>
                            )}
                        </div>
                        {canInvite && (
                            <Button
                                onClick={() => setShowInviteForm(!showInviteForm)}
                                variant={showInviteForm ? 'outline' : 'default'}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                {showInviteForm ? 'Cancel' : 'Invite CEO'}
                            </Button>
                        )}
                    </div>

                    {/* Invite Form */}
                    {showInviteForm && canInvite && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Invite CEO to Workspace</CardTitle>
                                <CardDescription>
                                    Send an invitation to the CEO to join this workspace. They will be able to review
                                    and modify company information before completing the Management Philosophy Survey.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleInvite} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">CEO Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={inviteForm.data.email}
                                            onChange={(e) => inviteForm.setData('email', e.target.value)}
                                            placeholder="ceo@example.com"
                                            required
                                        />
                                        {inviteForm.errors.email && (
                                            <p className="text-sm text-destructive">{inviteForm.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={inviteForm.processing}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            {inviteForm.processing ? 'Sending...' : 'Send Invitation'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowInviteForm(false);
                                                inviteForm.reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Success/Error Messages */}
                    {(props as any).flash?.success && (
                        <Alert className="mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{(props as any).flash.success}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Industry</Label>
                                <p className="font-medium">{company.industry || 'Not specified'}</p>
                            </div>
                            {company.hq_location && (
                                <div>
                                    <Label className="text-muted-foreground">Headquarters</Label>
                                    <p className="font-medium">{company.hq_location}</p>
                                </div>
                            )}
                            {company.foundation_date && (
                                <div>
                                    <Label className="text-muted-foreground">Foundation Date</Label>
                                    <p className="font-medium">
                                        {new Date(company.foundation_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Users with access to this workspace</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {hrManagerUser && (
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{hrManagerUser.name}</p>
                                        <p className="text-sm text-muted-foreground">{hrManagerUser.email}</p>
                                    </div>
                                    <Badge variant="outline">HR Manager</Badge>
                                </div>
                            )}
                            {ceoUser && (
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{ceoUser.name}</p>
                                        <p className="text-sm text-muted-foreground">{ceoUser.email}</p>
                                    </div>
                                    <Badge variant="outline">CEO</Badge>
                                </div>
                            )}
                            {!ceoUser && (
                                <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50">
                                    No CEO has been added to this workspace yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Invitations */}
                {company.invitations && company.invitations.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>Invitations that have been sent but not yet accepted</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {company.invitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{invitation.email}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Invited as {invitation.role.toUpperCase()} •{' '}
                                                    {new Date(invitation.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {canInvite && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancelInvitation(invitation.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* HR Projects */}
                {company.hr_projects && company.hr_projects.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>HR Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {company.hr_projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/hr-projects/${project.id}`}
                                        className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Project #{project.id}</span>
                                            <Badge variant={project.status === 'submitted' ? 'default' : 'outline'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <Link href="/diagnosis">
                        <Button variant="outline">
                            <Building2 className="h-4 w-4 mr-2" />
                            View Diagnosis
                        </Button>
                    </Link>
                    <Link href="/companies">
                        <Button variant="ghost">Back to Companies</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
