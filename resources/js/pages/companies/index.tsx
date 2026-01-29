import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Plus, Users, Mail, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    name: string;
    email: string;
    pivot?: {
        role: string;
    };
}

interface Company {
    id: number;
    name: string;
    brand_name?: string | null;
    industry?: string | null;
    created_by?: number;
    users?: User[];
    invitations?: Array<{
        id: number;
        email: string;
        role: string;
        created_at: string;
    }>;
    hr_projects?: Array<{
        id: number;
        status: string;
    }>;
}

interface PageProps {
    companies: Company[];
}

export default function CompaniesIndex({ companies }: PageProps) {
    const { props } = usePage<PageProps>();
    const user = (props as any).auth?.user;
    const isHrManager = user?.roles?.some((role: any) => role.name === 'hr_manager') || false;

    return (
        <AppLayout>
            <Head title="Companies" />
            <div className="container mx-auto max-w-6xl py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Building2 className="h-8 w-8" />
                                Companies
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your companies and invite CEOs to join the workspace
                            </p>
                        </div>
                        {isHrManager && (
                            <Link href="/companies/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Company
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {companies.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Create your first company to get started with HR Path-Finder
                            </p>
                            {isHrManager && (
                                <Link href="/companies/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Company
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {companies.map((company) => {
                            const ceoUser = company.users?.find((u) => u.pivot?.role === 'ceo');
                            const hrManagerUser = company.users?.find((u) => u.pivot?.role === 'hr_manager');
                            const pendingInvitations = company.invitations || [];
                            const hasCeo = !!ceoUser;
                            const canInvite = isHrManager && company.created_by === user?.id;

                            return (
                                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                                                {company.brand_name && (
                                                    <CardDescription>{company.brand_name}</CardDescription>
                                                )}
                                                {company.industry && (
                                                    <Badge variant="outline" className="mt-2">
                                                        {company.industry}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Link href={`/companies/${company.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Team Members */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-muted-foreground">Team Members</h4>
                                            {hrManagerUser && (
                                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{hrManagerUser.name}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">HR Manager</Badge>
                                                </div>
                                            )}
                                            {ceoUser ? (
                                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{ceoUser.name}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">CEO</Badge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between p-2 bg-warning/10 rounded border border-warning/20">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-warning" />
                                                        <span className="text-sm text-warning">No CEO added yet</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pending Invitations */}
                                        {pendingInvitations.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-muted-foreground">Pending Invitations</h4>
                                                {pendingInvitations.map((invitation) => (
                                                    <div key={invitation.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{invitation.email}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">Pending</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="pt-4 border-t">
                                            <Link href={`/companies/${company.id}`} className="block">
                                                <Button variant="outline" className="w-full">
                                                    {hasCeo ? 'View Company' : 'Invite CEO'}
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
