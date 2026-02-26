import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, FileText, UserPlus, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    public_listing_status: string;
    hrProjects?: Array<{
        id: number;
        status: string;
    }>;
    users?: Array<{
        id: number;
        name: string;
        pivot: {
            role: string;
        };
    }>;
}

interface Props {
    company: Company;
}

export default function ShowCompany({ company }: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isHrManager = user?.roles?.some((role: { name: string }) => role.name === 'hr_manager') || false;
    const hasCeo = company.users?.some((u) => u.pivot.role === 'ceo') || false;
    
    const [showInviteForm, setShowInviteForm] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/companies/${company.id}/invite-ceo`, {
            onSuccess: () => {
                reset();
                setShowInviteForm(false);
            },
        });
    };

    const activeProject = company.hrProjects?.find(p => p.status === 'active');

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`${company.name} - Company Details`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold">{company.name}</h1>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {company.registration_number && (
                                        <p><strong>Registration Number:</strong> {company.registration_number}</p>
                                    )}
                                    {company.hq_location && (
                                        <p><strong>HQ Location:</strong> {company.hq_location}</p>
                                    )}
                                    <p><strong>Public Listing:</strong> {company.public_listing_status}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Team Members</CardTitle>
                                        {isHrManager && !hasCeo && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowInviteForm(!showInviteForm)}
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Invite CEO
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {showInviteForm && isHrManager && !hasCeo && (
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <form onSubmit={handleInviteCeo} className="space-y-3">
                                                <div>
                                                    <Label htmlFor="ceo-email">CEO Email Address</Label>
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
                                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" disabled={processing} size="sm">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        {processing ? 'Sending...' : 'Send Invitation'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowInviteForm(false);
                                                            reset();
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                    
                                    {company.users && company.users.length > 0 ? (
                                        <div className="space-y-2">
                                            {company.users.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between">
                                                    <span>{user.name}</span>
                                                    <span className="text-sm text-muted-foreground capitalize">
                                                        {user.pivot.role.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No team members</p>
                                    )}
                                    
                                    {hasCeo && (
                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            CEO has been added to this company
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {activeProject && (
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Active HR Project</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Project #{activeProject.id}</p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    Status: {activeProject.status}
                                                </p>
                                            </div>
                                            <Link href={`/hr-projects/${activeProject.id}`}>
                                                <Button>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Project
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
