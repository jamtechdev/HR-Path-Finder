import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
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
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    companies,
}: Props) {
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

    const [createOpen, setCreateOpen] = useState(false);
    const createForm = useForm({
        name: '',
        email: '',
        role: 'ceo' as UserRole,
        company_id: null as number | null,
    });

    const [editOpen, setEditOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
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
        editForm.put(`/admin/users/${editUser.id}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setEditOpen(false);
                setEditUser(null);
                router.reload();
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
                        <Head title="Users & Beta Access" />

                        <div className="p-6 md:p-8 max-w-7xl mx-auto">
                            <div className="mb-6">
                                <div className="mb-4 flex items-start justify-between gap-6">
                                    <div>
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                                            <UserCheck className="w-6 h-6 text-primary" />
                                        </div>
                                        <h1 className="mt-3 text-3xl font-bold text-foreground">Users &amp; Beta Access</h1>
                                        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                                            Manage all non-admin users (CEO/HR) and approve pending accounts when admin approval is enabled.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Pending approval means <code className="rounded bg-muted px-1">access_granted_at === null</code>.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">Total HR</p>
                                            <p className="text-3xl font-bold text-foreground">{total_hr_users}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">Total CEO</p>
                                            <p className="text-3xl font-bold text-foreground">{total_ceo_users}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <p className="text-sm text-muted-foreground">Pending approval</p>
                                            <button
                                                type="button"
                                                className="text-3xl font-bold text-foreground hover:underline"
                                                onClick={() => setTab('pending')}
                                                title="Open pending users list"
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
                                        placeholder="Search by name, email, or company..."
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <Select
                                        value={roleFilter}
                                        onValueChange={(v) => setRoleFilter(v as 'all' | UserRole)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All roles</SelectItem>
                                            <SelectItem value="hr_manager">HR Manager</SelectItem>
                                            <SelectItem value="ceo">CEO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-4 flex justify-start md:justify-end">
                                    <Button onClick={() => setCreateOpen(true)}>Create CEO/HR</Button>
                                </div>
                            </div>

                            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-2">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="all">All ({filteredAll.length})</TabsTrigger>
                                    <TabsTrigger value="pending">Pending ({filteredPending.length})</TabsTrigger>
                                    <TabsTrigger value="active">Active ({filteredActive.length})</TabsTrigger>
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
                                        <DialogTitle>Create CEO/HR user</DialogTitle>
                                        <DialogDescription>
                                            Admin creates an account and attaches it to a company.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name">Name</Label>
                                                <Input
                                                    id="create-name"
                                                    value={createForm.data.name}
                                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="create-email">Email</Label>
                                                <Input
                                                    id="create-email"
                                                    type="email"
                                                    value={createForm.data.email}
                                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                                />
                                                {createForm.errors.email && (
                                                    <p className="text-sm text-destructive">{createForm.errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Select
                                                    value={createForm.data.role}
                                                    onValueChange={(v) => createForm.setData('role', v as UserRole)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                                                        <SelectItem value="ceo">CEO</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.role && (
                                                    <p className="text-sm text-destructive">{createForm.errors.role}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Company</Label>
                                                <Select
                                                    value={createForm.data.company_id ? String(createForm.data.company_id) : 'none'}
                                                    onValueChange={(v) =>
                                                        createForm.setData('company_id', v === 'none' ? null : Number(v))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select company" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Select...</SelectItem>
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
                                                {createForm.processing ? 'Creating...' : 'Create User'}
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
                                        <DialogTitle>Edit user profile</DialogTitle>
                                        <DialogDescription>
                                            Update name, contact, and location. Profile photo is optional.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {editUser && (
                                        <form onSubmit={handleEditSubmit} className="space-y-4">
                                            <div className="flex items-start gap-6">
                                                <div className="w-24">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                                        {editUser.profile_photo_url ? (
                                                            <img
                                                                src={editUser.profile_photo_url}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">No photo</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <Label htmlFor="edit-profile-photo" className="cursor-pointer">
                                                            Upload photo
                                                        </Label>
                                                        <Input
                                                            id="edit-profile-photo"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] ?? null;
                                                                editForm.setData('profile_photo', file);
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
                                                            <Label htmlFor="edit-name">Name</Label>
                                                            <Input
                                                                id="edit-name"
                                                                value={editForm.data.name}
                                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                            />
                                                            {editForm.errors.name && (
                                                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-email">Email</Label>
                                                            <Input
                                                                id="edit-email"
                                                                type="email"
                                                                value={editForm.data.email}
                                                                onChange={(e) => editForm.setData('email', e.target.value)}
                                                            />
                                                            {editForm.errors.email && (
                                                                <p className="text-sm text-destructive">{editForm.errors.email}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-phone">Phone</Label>
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
                                                            <Label htmlFor="edit-address">Address</Label>
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
                                                            <Label htmlFor="edit-city">City</Label>
                                                            <Input
                                                                id="edit-city"
                                                                value={editForm.data.city}
                                                                onChange={(e) => editForm.setData('city', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-state">State</Label>
                                                            <Input
                                                                id="edit-state"
                                                                value={editForm.data.state}
                                                                onChange={(e) => editForm.setData('state', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-latitude">Latitude</Label>
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
                                                            <Label htmlFor="edit-longitude">Longitude</Label>
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
                                                            <Label>Role / Companies (read-only)</Label>
                                                            <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                                                {editUser.role === 'ceo' ? 'CEO' : 'HR Manager'} /{' '}
                                                                {editUser.companyNames.length > 0
                                                                    ? editUser.companyNames.join(', ')
                                                                    : '-'}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                User record created {new Date(editUser.created_at).toLocaleDateString()}
                                                                {editUser.updated_at ? ` · last updated ${new Date(editUser.updated_at).toLocaleDateString()}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button type="submit" disabled={editForm.processing}>
                                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
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
                            {confirmAction?.type === 'delete' ? 'Delete user' : 'Change user access'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'delete'
                                ? `Delete ${confirmAction.user.email}? This action cannot be undone.`
                                : confirmAction
                                  ? `${confirmAction.nextActive ? 'Activate' : 'Deactivate'} access for ${confirmAction.user.email}?`
                                  : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                            onClick={runConfirmedAction}
                        >
                            {confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
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
    if (users.length === 0) {
        return (
            <Card className="mt-6">
                <CardContent className="py-14 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No users</p>
                    <p className="text-muted-foreground text-sm mt-2">Nothing to show for this filter.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Users list
                </CardTitle>
                <CardDescription>CEO/HR users excluding admin</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Address</TableHead>
                                <TableHead>Email verified</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
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
                                        <TableCell>{u.role === 'ceo' ? 'CEO' : 'HR Manager'}</TableCell>
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
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                                    No
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isPending ? (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                                                    <span className="inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Active
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
                                                    {isPending ? 'Activate' : 'Deactivate'}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => onEditUser(u)}>
                                                    Profile
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

