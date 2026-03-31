import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import AppHeader from '@/components/Header/AppHeader';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                        <Head title="Profile settings" />
                        <h1 className="sr-only">Profile Settings</h1>
                        <SettingsLayout>
                            <div className="space-y-6">
                                <Heading
                                    variant="small"
                                    title="Profile information"
                                    description="Update your name, contact details, and location"
                                />

                                <Form
                                    {...ProfileController.update.form()}
                                    options={{
                                        preserveScroll: true,
                                    }}
                                    encType="multipart/form-data"
                                    className="space-y-6"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            <div className="flex items-start gap-6">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                                        {auth.user.profile_photo_url ? (
                                                            <img
                                                                src={auth.user.profile_photo_url}
                                                                alt="Profile photo"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-muted-foreground">No photo</span>
                                                        )}
                                                    </div>
                                                    <Label htmlFor="profile_photo" className="cursor-pointer">
                                                        Upload photo
                                                    </Label>
                                                    <Input
                                                        id="profile_photo"
                                                        name="profile_photo"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name">Name</Label>
                                                        <Input
                                                            id="name"
                                                            className="mt-1 block w-full"
                                                            defaultValue={auth.user.name}
                                                            name="name"
                                                            required
                                                            autoComplete="name"
                                                            placeholder="Full name"
                                                        />
                                                        <InputError className="mt-2" message={errors.name} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email">Email address</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            className="mt-1 block w-full"
                                                            defaultValue={auth.user.email}
                                                            name="email"
                                                            required
                                                            autoComplete="username"
                                                            placeholder="Email address"
                                                        />
                                                        <InputError className="mt-2" message={errors.email} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Phone number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.phone ?? ''}
                                                        autoComplete="tel"
                                                        placeholder="Phone number"
                                                    />
                                                    <InputError className="mt-2" message={errors.phone} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.address ?? ''}
                                                        autoComplete="street-address"
                                                        placeholder="Street address"
                                                    />
                                                    <InputError className="mt-2" message={errors.address} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.city ?? ''}
                                                        placeholder="City"
                                                    />
                                                    <InputError className="mt-2" message={errors.city} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="state">State / Province</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.state ?? ''}
                                                        placeholder="State"
                                                    />
                                                    <InputError className="mt-2" message={errors.state} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="latitude">Latitude</Label>
                                                    <Input
                                                        id="latitude"
                                                        name="latitude"
                                                        type="number"
                                                        step="any"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.latitude ?? ''}
                                                        placeholder="Latitude"
                                                    />
                                                    <InputError className="mt-2" message={errors.latitude} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="longitude">Longitude</Label>
                                                    <Input
                                                        id="longitude"
                                                        name="longitude"
                                                        type="number"
                                                        step="any"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.longitude ?? ''}
                                                        placeholder="Longitude"
                                                    />
                                                    <InputError className="mt-2" message={errors.longitude} />
                                                </div>
                                            </div>

                                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-muted-foreground">
                                                        Your email address is unverified.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            Click here to resend the verification email.
                                                        </Link>
                                                    </p>
                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            A new verification link has been sent to your email address.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <Button
                                                    disabled={processing}
                                                    data-test="update-profile-button"
                                                >
                                                    Save
                                                </Button>

                                                {recentlySuccessful && (
                                                    <p className="text-sm text-neutral-600">
                                                        Saved
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>

                            <DeleteUser />
                        </SettingsLayout>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
