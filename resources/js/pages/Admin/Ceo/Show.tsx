import { Head, Link } from '@inertiajs/react';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ArrowLeft, Building2, Mail, User } from 'lucide-react';

interface Company {
    id: number;
    name: string;
}

interface Ceo {
    id: number;
    name: string;
    email: string;
    companies: Company[];
}

interface Props {
    ceo: Ceo;
}

export default function Show({ ceo }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={`CEO - ${ceo.name}`} />

                    <div className="mx-auto max-w-5xl p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <Link href="/admin/ceo">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>

                            <h1 className="text-2xl font-bold">CEO Details</h1>
                        </div>

                        {/* Profile */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Name
                                    </p>

                                    <p className="text-lg font-medium">
                                        {ceo.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Email
                                    </p>

                                    <p className="flex items-center gap-2 font-medium">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {ceo.email}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Companies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Assigned Companies
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                {ceo.companies?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {ceo.companies.map((company) => (
                                            <Badge
                                                key={company.id}
                                                variant="outline"
                                            >
                                                {company.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        No companies assigned
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
