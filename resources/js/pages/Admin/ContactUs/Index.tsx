import { Head, usePage } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import React, { useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    SidebarProvider,
    Sidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

interface ContactSubmission {
    id: number;
    company_name: string;
    manager_name: string;
    manager_email: string;
    phone: string | null;
    inquiry: string;
    agreed_personal_information: boolean;
    created_at: string;
}

interface Props {
    submissions: ContactSubmission[];
}

export default function ContactUsAdminIndex({ submissions }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };

    useEffect(() => {
        if (flash?.success) {
            toast({ title: 'Success', description: flash.success });
        }
    }, [flash?.success]);

    return (
        <>
            <Toaster />
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden bg-background">
                    <AppHeader />
                    <main className="flex-1 overflow-auto bg-background">
                        <Head title="Contact Us - Admin" />
                        <div className="p-6 md:p-8 max-w-6xl mx-auto">
                            <div className="mb-6 flex items-center gap-3">
                                <Mail className="w-9 h-9 text-purple-600" />
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        All contact submissions (latest first).
                                    </p>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Submissions</span>
                                        <Badge variant="outline">{submissions.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {submissions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <Mail className="w-7 h-7 text-muted-foreground" />
                                            </div>
                                            <p className="text-foreground font-medium">No submissions yet</p>
                                            <p className="text-muted-foreground text-sm mt-2 max-w-md">
                                                When users submit the contact form, entries will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Manager</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Agreed</TableHead>
                                                    <TableHead className="w-[360px]">Inquiry</TableHead>
                                                    <TableHead className="text-right">Received</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {submissions.map((s) => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-medium">
                                                            {s.company_name}
                                                        </TableCell>
                                                        <TableCell>{s.manager_name}</TableCell>
                                                        <TableCell>{s.manager_email}</TableCell>
                                                        <TableCell>{s.phone ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {s.agreed_personal_information ? (
                                                                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                                                    Yes
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                                                    No
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs text-muted-foreground whitespace-pre-line max-h-24 overflow-auto">
                                                                {s.inquiry}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-muted-foreground text-sm">
                                                            {new Date(s.created_at).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

