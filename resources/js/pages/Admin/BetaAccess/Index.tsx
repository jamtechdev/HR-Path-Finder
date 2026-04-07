import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { toastCopy } from '@/lib/toastCopy';

interface PendingUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    pendingUsers: PendingUser[];
}

export default function BetaAccessIndex({ pendingUsers }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash?: { success?: string; info?: string } };
    const flashSig = useRef<string>('');

    useEffect(() => {
        const sig = `${flash?.success ?? ''}|${flash?.info ?? ''}`;
        if (!sig.replace(/\|/g, '').length) {
            return;
        }
        if (flashSig.current === sig) {
            return;
        }
        flashSig.current = sig;
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }
        if (flash?.info) {
            toast({ title: toastCopy.info, description: flash.info });
        }
    }, [flash?.success, flash?.info]);

    const approve = (userId: number) => {
        router.post(`/admin/beta-access/${userId}/approve`, {}, { preserveScroll: true });
    };

    return (
        <>
           
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden bg-background">
                    <AppHeader />
                    <main className="flex-1 overflow-auto bg-background">
                        <Head title={t('admin_beta_access.page_title')} />
                        <div className="p-6 md:p-8 max-w-5xl mx-auto">
                            <div className="mb-6 flex items-center gap-3">
                                <UserCheck className="w-9 h-9 text-primary" />
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{t('admin_beta_access.heading')}</h1>
                                    <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                                        {t('admin_beta_access.subheading')}
                                    </p>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Clock className="w-5 h-5" />
                                        {t('admin_beta_access.pending_title', { count: pendingUsers.length })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingUsers.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                                            </div>
                                            <p className="text-foreground font-medium">{t('admin_beta_access.no_pending_title')}</p>
                                            <p className="text-muted-foreground text-sm mt-2 max-w-md">
                                                {t('admin_beta_access.no_pending_desc')}
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('admin_beta_access.table_name')}</TableHead>
                                                    <TableHead>{t('admin_beta_access.table_email')}</TableHead>
                                                    <TableHead>{t('admin_beta_access.table_email_verified')}</TableHead>
                                                    <TableHead>{t('admin_beta_access.table_registered')}</TableHead>
                                                    <TableHead className="text-right">{t('admin_beta_access.table_action')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pendingUsers.map((u) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-medium">{u.name}</TableCell>
                                                        <TableCell>{u.email}</TableCell>
                                                        <TableCell>
                                                            {u.email_verified_at ? (
                                                                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                                                    {t('admin_beta_access.yes')}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                                                    {t('admin_beta_access.no')}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-sm">
                                                            {new Date(u.created_at).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                className="gap-1"
                                                                onClick={() => approve(u.id)}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                {t('admin_beta_access.approve')}
                                                            </Button>
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
