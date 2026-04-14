import { Head, usePage } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
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
    const { t } = useTranslation();

    useEffect(() => {
        if (flash?.success) {
            toast({ title: t('common.success'), description: flash.success });
        }
    }, [flash?.success]);

    return (
        <>
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>

                <SidebarInset className="flex flex-col overflow-hidden bg-background">
                    <AppHeader />

                    <main className="flex-1 overflow-auto bg-background">
                        <Head title={t('contact.title')} />

                        <div className="mx-auto max-w-6xl p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <Mail className="h-9 w-9 text-purple-600" />
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">
                                        {t('contact.heading')}
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t('contact.subheading')}
                                    </p>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between flex-wrap">
                                        <span>{t('contact.submissions')}</span>
                                        <Badge variant="outline">
                                            {submissions.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    {submissions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                                <Mail className="h-7 w-7 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-foreground">
                                                {t('contact.no_submissions')}
                                            </p>
                                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                                {t(
                                                    'contact.no_submissions_desc',
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        {t('contact.company')}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t('contact.manager')}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t('contact.email')}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t('contact.phone')}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t('contact.agreed')}
                                                    </TableHead>
                                                    <TableHead className="w-[360px]">
                                                        {t('contact.inquiry')}
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        {t('contact.received')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {submissions.map((s) => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-medium">
                                                            {s.company_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {s.manager_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {s.manager_email}
                                                        </TableCell>
                                                        <TableCell>
                                                            {s.phone ?? '—'}
                                                        </TableCell>

                                                        <TableCell>
                                                            {s.agreed_personal_information ? (
                                                                <Badge className="border-green-200 bg-green-50 text-green-800">
                                                                    {t(
                                                                        'contact.yes',
                                                                    )}
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                                                                    {t(
                                                                        'contact.no',
                                                                    )}
                                                                </Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="max-h-24 overflow-auto text-xs whitespace-pre-line text-muted-foreground">
                                                                {s.inquiry}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-right text-sm text-muted-foreground">
                                                            {new Date(
                                                                s.created_at,
                                                            ).toLocaleString()}
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

            <Toaster />
        </>
    );
}
