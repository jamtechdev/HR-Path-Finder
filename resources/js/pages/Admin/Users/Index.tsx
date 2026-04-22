import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';

type UserRole = 'ceo' | 'hr_manager';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    companyNames: string[];
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    profile_photo_url?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at?: string | null;
    access_granted_at: string | null;
};
type ConfirmAction =
    | { type: 'toggle'; user: UserRow; nextActive: boolean }
    | { type: 'delete'; user: UserRow }
    | null;

interface Props {
    users: UserRow[];
    total_hr_users: number;
    total_ceo_users: number;
    pending_users_count: number;
    require_admin_approval: boolean;
    companies: Array<{ id: number; name: string }>;
}

export default function AdminUsersIndex({
    users,
    total_hr_users,
    total_ceo_users,
    pending_users_count,
    require_admin_approval,
    companies,
}: Props) {
    const { t } = useTranslation();
    const page = usePage();
    const { flash } = page.props as { flash?: { success?: string; info?: string; error?: string } };
    const flashSig = useRef<string>('');

    useEffect(() => {
        const sig = `${flash?.success ?? ''}|${flash?.info ?? ''}|${flash?.error ?? ''}`;
        if (!sig.replace(/\|/g, '').length) return;
        if (flashSig.current === sig) return;
        flashSig.current = sig;

        if (flash?.success) toast({ title: toastCopy.success, description: flash.success, variant: 'success' });
        if (flash?.info) toast({ title: toastCopy.info, description: flash.info });
        if (flash?.error) toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
    }, [flash]);

    const pendingUsers = useMemo(() => users.filter((u) => u.access_granted_at === null), [users]);
    const activeUsers = useMemo(() => users.filter((u) => u.access_granted_at !== null), [users]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const initialTab = useMemo<'all' | 'pending' | 'active'>(() => {
        const raw = page.url?.split('?')[1] ?? '';
        const params = new URLSearchParams(raw);
        const value = params.get('tab');
        if (value === 'pending' || value === 'active') return value;
        return 'all';
    }, [page.url]);
    const [tab, setTab] = useState<'all' | 'pending' | 'active'>(initialTab);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    useEffect(() => {
        const raw = page.url?.split('?')[1] ?? '';
        const value = new URLSearchParams(raw).get('tab');
        if (value === 'pending' || value === 'active') {
            setTab(value);
        } else {
            setTab('all');
        }
    }, [page.url]);

    const navigateToTab = (next: 'all' | 'pending' | 'active') => {
        setTab(next);
        router.get(
            '/admin/ceo',
            next === 'all' ? {} : { tab: next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const [createOpen, setCreateOpen] = useState(false);
    const createForm = useForm({
        name: '',
        email: '',
        role: 'ceo' as UserRole,
        company_id: null as number | null,
    });

    const [editOpen, setEditOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        profile_photo: null as File | null,
    });

    useEffect(() => {
        if (!editUser) return;
        editForm.setData('name', editUser.name ?? '');
        editForm.setData('email', editUser.email ?? '');
        editForm.setData('phone', editUser.phone ?? '');
        editForm.setData('address', editUser.address ?? '');
        editForm.setData('city', editUser.city ?? '');
        editForm.setData('state', editUser.state ?? '');
        editForm.setData('latitude', editUser.latitude ?? '');
        editForm.setData('longitude', editUser.longitude ?? '');
        editForm.setData('profile_photo', null);
        setEditPhotoPreview(editUser.profile_photo_url ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editUser?.id]);

    const toggleAccess = (user: UserRow) => {
        const isActive = user.access_granted_at !== null;
        const nextActive = !isActive;
        setConfirmAction({ type: 'toggle', user, nextActive });
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/ceo/create', {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
                router.reload();
            },
        });
    };

    const handleEditSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editUser) return;

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', editForm.data.name);
        formData.append('email', editForm.data.email);
        formData.append('phone', editForm.data.phone ?? '');
        formData.append('address', editForm.data.address ?? '');
        formData.append('city', editForm.data.city ?? '');
        formData.append('state', editForm.data.state ?? '');
        formData.append('latitude', String(editForm.data.latitude ?? ''));
        formData.append('longitude', String(editForm.data.longitude ?? ''));
        if (editForm.data.profile_photo) {
            formData.append('profile_photo', editForm.data.profile_photo);
        }

        router.post(`/admin/users/${editUser.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                setEditUser(null);
                router.reload();
            },
            onError: (errors) => {
                editForm.setError(errors as any);
            },
        });
    };

    const openEditDialog = (u: UserRow) => {
        setEditUser(u);
        setEditOpen(true);
    };

    const deleteUser = (user: UserRow) => {
        setConfirmAction({ type: 'delete', user });
    };
    const runConfirmedAction = () => {
        if (!confirmAction) return;
        if (confirmAction.type === 'toggle') {
            router.post(
                `/admin/users/${confirmAction.user.id}/toggle-access`,
                { active: confirmAction.nextActive },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setConfirmAction(null);
                        router.reload();
                    },
                },
            );
            return;
        }

        router.delete(`/admin/users/${confirmAction.user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmAction(null);
                router.reload();
            },
        });
    };

    const applyFilters = (list: UserRow[]) => {
        const q = search.trim().toLowerCase();
        return list.filter((u) => {
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            if (!matchesRole) return false;
            if (!q) return true;
            return (
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.companyNames.join(' ').toLowerCase().includes(q)
            );
        });
    };

    const filteredAll = applyFilters(users);
    const filteredPending = applyFilters(pendingUsers);
    const filteredActive = applyFilters(activeUsers);

    return (
        <>
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden bg-background">
                    <AppHeader />
                    <main className="flex-1 overflow-auto bg-background">
                        <Head title={t('admin_users.page_title')} />

                        <div className="p-6 md:p-8 max-w-7xl mx-auto">
                            <div className="mb-6">
                                <div className="mb-4 flex items-start justify-between gap-6">
                                    <div>
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                                            <UserCheck className="w-6 h-6 text-primary" />
                                        </div>
                                        <h1 className="mt-3 text-3xl font-bold text-foreground">{t('admin_users.heading')}</h1>
                                        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                                            {t('admin_users.subheading')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {t('admin_users.help.pending_access_explainer', 'Pending approval means the account is waiting for you to grant access (access_granted_at is empty). Click the number below to open the Pending tab (URL updates so you can bookmark or refresh).')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('admin_users.help.primary_action_explainer', 'The primary action shows Activate only on pending users; active users show Deactivate.')}
                                            {!require_admin_approval && (
                                                <>
                                                    {' '}{t('admin_users.help.admin_approval_off', 'Admin approval is currently off in app settings, so new users are usually created active and the pending count may stay at 0.')}
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            {t('admin_users.help.admin_guide', 'Admin guide: use Activate to approve pending accounts, Deactivate to block sign-in, and the trash icon to permanently delete user access.')}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">{t('admin_users.stats.total_hr')}</p>
                                            <p className="text-3xl font-bold text-foreground">{total_hr_users}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">{t('admin_users.stats.total_ceo')}</p>
                                            <p className="text-3xl font-bold text-foreground">{total_ceo_users}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">{t('admin_users.stats.pending_approval')}</p>
                                            <button
                                                type="button"
                                                className="text-3xl font-bold text-foreground hover:underline"
                                                onClick={() => navigateToTab('pending')}
                                                title={t('admin_users.open_pending_title')}
                                            >
                                                {pending_users_count}
                                            </button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
                                <div className="md:col-span-5">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('admin_users.search_placeholder')}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <Select
                                        value={roleFilter}
                                        onValueChange={(v) => setRoleFilter(v as 'all' | UserRole)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('admin_users.filter_role')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('admin_users.roles.all')}</SelectItem>
                                            <SelectItem value="hr_manager">{t('admin_users.roles.hr_manager')}</SelectItem>
                                            <SelectItem value="ceo">CEO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-4 flex justify-start md:justify-end">
                                    <Button onClick={() => setCreateOpen(true)}>{t('admin_users.create_cta')}</Button>
                                </div>
                            </div>

                            <Tabs value={tab} onValueChange={(v) => navigateToTab(v as typeof tab)} className="mt-2">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="all">{t('admin_users.tabs.all')} ({filteredAll.length})</TabsTrigger>
                                    <TabsTrigger value="pending">{t('admin_users.tabs.pending')} ({filteredPending.length})</TabsTrigger>
                                    <TabsTrigger value="active">{t('admin_users.tabs.active')} ({filteredActive.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all">
                                    <UsersTable
                                        users={filteredAll}
                                        onEditUser={openEditDialog}
                                        onToggleAccess={toggleAccess}
                                        onDeleteUser={deleteUser}
                                    />
                                </TabsContent>
                                <TabsContent value="pending">
                                    <UsersTable
                                        users={filteredPending}
                                        onEditUser={openEditDialog}
                                        onToggleAccess={toggleAccess}
                                        onDeleteUser={deleteUser}
                                    />
                                </TabsContent>
                                <TabsContent value="active">
                                    <UsersTable
                                        users={filteredActive}
                                        onEditUser={openEditDialog}
                                        onToggleAccess={toggleAccess}
                                        onDeleteUser={deleteUser}
                                    />
                                </TabsContent>
                            </Tabs>

                            {/* Create User Dialog */}
                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>{t('admin_users.dialogs.create.title')}</DialogTitle>
                                        <DialogDescription>
                                            {t('admin_users.dialogs.create.description')}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name">{t('admin_users.fields.name')}</Label>
                                                <Input
                                                    id="create-name"
                                                    value={createForm.data.name}
                                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                                    placeholder={t('admin_users.fields.name_placeholder', 'John Doe')}
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="create-email">{t('admin_users.fields.email')}</Label>
                                                <Input
                                                    id="create-email"
                                                    type="email"
                                                    value={createForm.data.email}
                                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                                    placeholder={t('admin_users.fields.email_placeholder', 'you@company.com')}
                                                />
                                                {createForm.errors.email && (
                                                    <p className="text-sm text-destructive">{createForm.errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t('admin_users.fields.role')}</Label>
                                                <Select
                                                    value={createForm.data.role}
                                                    onValueChange={(v) => createForm.setData('role', v as UserRole)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('admin_users.fields.select_role')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hr_manager">{t('admin_users.roles.hr_manager')}</SelectItem>
                                                        <SelectItem value="ceo">CEO</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.role && (
                                                    <p className="text-sm text-destructive">{createForm.errors.role}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>{t('admin_users.fields.company')}</Label>
                                                <Select
                                                    value={createForm.data.company_id ? String(createForm.data.company_id) : 'none'}
                                                    onValueChange={(v) =>
                                                        createForm.setData('company_id', v === 'none' ? null : Number(v))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('admin_users.fields.select_company')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">{t('admin_users.fields.select_none')}</SelectItem>
                                                        {companies.map((c) => (
                                                            <SelectItem key={c.id} value={String(c.id)}>
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.company_id && (
                                                    <p className="text-sm text-destructive">{createForm.errors.company_id}</p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button type="submit" disabled={createForm.processing}>
                                                {createForm.processing ? t('admin_users.actions.creating') : t('admin_users.actions.create_user')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Edit Profile Dialog */}
                            <Dialog
                                open={editOpen}
                                onOpenChange={(o) => {
                                    setEditOpen(o);
                                    if (!o) setEditUser(null);
                                }}
                            >
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>{t('admin_users.dialogs.edit.title')}</DialogTitle>
                                        <DialogDescription>
                                            {t('admin_users.dialogs.edit.description')}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {editUser && (
                                        <form onSubmit={handleEditSubmit} className="space-y-4">
                                            <div className="flex items-start gap-6">
                                                <div className="w-24">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                                        {editPhotoPreview ? (
                                                            <img
                                                                src={editPhotoPreview}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">{t('admin_users.fields.no_photo')}</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <Label htmlFor="edit-profile-photo" className="cursor-pointer">
                                                            {t('admin_users.fields.upload_photo')}
                                                        </Label>
                                                        <Input
                                                            id="edit-profile-photo"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] ?? null;
                                                                editForm.setData('profile_photo', file);
                                                                if (file) {
                                                                    setEditPhotoPreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                        {editForm.errors.profile_photo && (
                                                            <p className="text-sm text-destructive mt-2">{editForm.errors.profile_photo}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-name">{t('admin_users.fields.name')}</Label>
                                                            <Input
                                                                id="edit-name"
                                                                value={editForm.data.name}
                                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                                placeholder={t('admin_users.fields.name_placeholder', 'John Doe')}
                                                            />
                                                            {editForm.errors.name && (
                                                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-email">{t('admin_users.fields.email')}</Label>
                                                            <Input
                                                                id="edit-email"
                                                                type="email"
                                                                value={editForm.data.email}
                                                                onChange={(e) => editForm.setData('email', e.target.value)}
                                                                placeholder={t('admin_users.fields.email_placeholder', 'you@company.com')}
                                                            />
                                                            {editForm.errors.email && (
                                                                <p className="text-sm text-destructive">{editForm.errors.email}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-phone">{t('admin_users.fields.phone')}</Label>
                                                            <Input
                                                                id="edit-phone"
                                                                value={editForm.data.phone}
                                                                onChange={(e) => editForm.setData('phone', e.target.value)}
                                                            />
                                                            {editForm.errors.phone && (
                                                                <p className="text-sm text-destructive">{editForm.errors.phone}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-address">{t('admin_users.fields.address')}</Label>
                                                            <Input
                                                                id="edit-address"
                                                                value={editForm.data.address}
                                                                onChange={(e) => editForm.setData('address', e.target.value)}
                                                            />
                                                            {editForm.errors.address && (
                                                                <p className="text-sm text-destructive">{editForm.errors.address}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-city">{t('admin_users.fields.city')}</Label>
                                                            <Input
                                                                id="edit-city"
                                                                value={editForm.data.city}
                                                                onChange={(e) => editForm.setData('city', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-state">{t('admin_users.fields.state')}</Label>
                                                            <Input
                                                                id="edit-state"
                                                                value={editForm.data.state}
                                                                onChange={(e) => editForm.setData('state', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-latitude">{t('admin_users.fields.latitude')}</Label>
                                                            <Input
                                                                id="edit-latitude"
                                                                type="number"
                                                                step="any"
                                                                value={editForm.data.latitude}
                                                                onChange={(e) => editForm.setData('latitude', e.target.value)}
                                                            />
                                                            {editForm.errors.latitude && (
                                                                <p className="text-sm text-destructive">{editForm.errors.latitude}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-longitude">{t('admin_users.fields.longitude')}</Label>
                                                            <Input
                                                                id="edit-longitude"
                                                                type="number"
                                                                step="any"
                                                                value={editForm.data.longitude}
                                                                onChange={(e) => editForm.setData('longitude', e.target.value)}
                                                            />
                                                            {editForm.errors.longitude && (
                                                                <p className="text-sm text-destructive">{editForm.errors.longitude}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>{t('admin_users.fields.role_companies')}</Label>
                                                            <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                                                {editUser.role === 'ceo' ? 'CEO' : t('admin_users.roles.hr_manager')} /{' '}
                                                                {editUser.companyNames.length > 0
                                                                    ? editUser.companyNames.join(', ')
                                                                    : '-'}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                User record created {new Date(editUser.created_at).toLocaleDateString()}
                                                                {editUser.updated_at ? ` · ${t('admin_users.fields.last_updated', 'last updated')} ${new Date(editUser.updated_at).toLocaleDateString()}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button type="submit" disabled={editForm.processing}>
                                                    {editForm.processing ? t('admin_users.actions.saving') : t('admin_users.actions.save_changes')}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
            <AlertDialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'delete' ? t('admin_users.confirm.delete_title') : t('admin_users.confirm.access_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'delete'
                                ? t('admin_users.confirm.delete_desc', { email: confirmAction.user.email })
                                : confirmAction
                                  ? t('admin_users.confirm.access_desc', { action: confirmAction.nextActive ? t('admin_users.actions.activate') : t('admin_users.actions.deactivate'), email: confirmAction.user.email })
                                  : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                            onClick={runConfirmedAction}
                        >
                            {confirmAction?.type === 'delete' ? t('common.delete') : t('common.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function UsersTable({
    users,
    onEditUser,
    onToggleAccess,
    onDeleteUser,
}: {
    users: UserRow[];
    onEditUser: (u: UserRow) => void;
    onToggleAccess: (u: UserRow) => void;
    onDeleteUser: (u: UserRow) => void;
}) {
    const { t } = useTranslation();
    if (users.length === 0) {
        return (
            <Card className="mt-6">
                <CardContent className="py-14 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">{t('admin_users.table.no_users')}</p>
                    <p className="text-muted-foreground text-sm mt-2">{t('admin_users.table.no_users_desc')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t('admin_users.table.title')}
                </CardTitle>
                <CardDescription>{t('admin_users.table.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('admin_users.table.columns.user')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.role')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.company')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.phone')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.address')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.email_verified')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.access')}</TableHead>
                                <TableHead>{t('admin_users.table.columns.created')}</TableHead>
                                <TableHead className="text-right">{t('admin_users.table.columns.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => {
                                const isPending = u.access_granted_at === null;
                                return (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{u.name}</span>
                                                <span className="text-xs text-muted-foreground">{u.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{u.role === 'ceo' ? 'CEO' : t('admin_users.roles.hr_manager')}</TableCell>
                                        <TableCell>
                                            {u.companyNames.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {u.companyNames.map((c) => (
                                                        <Badge key={c} variant="outline">
                                                            {c}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{u.phone ? u.phone : <span className="text-muted-foreground">-</span>}</TableCell>
                                        <TableCell>
                                            {u.address ? (
                                                <span className="text-muted-foreground">{u.address}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.email_verified_at ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                                    {t('admin_users.table.yes')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                                    {t('admin_users.table.no')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isPending ? (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {t('admin_users.tabs.pending')}
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                                                    <span className="inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {t('admin_users.tabs.active')}
                                                    </span>
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={isPending ? 'default' : 'destructive'}
                                                    onClick={() => onToggleAccess(u)}
                                                >
                                                    {isPending ? t('admin_users.actions.activate') : t('admin_users.actions.deactivate')}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => onEditUser(u)}>
                                                    {t('admin_users.actions.edit_user')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => onDeleteUser(u)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

