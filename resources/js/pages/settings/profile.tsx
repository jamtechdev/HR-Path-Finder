import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                        <Head title={t('settings_profile.page_title')} />
                        <h1 className="sr-only">{t('settings_profile.sr_title')}</h1>
                        <SettingsLayout>
                            <div className="space-y-6">
                                <Heading
                                    variant="small"
                                    title={t('settings_profile.heading_title')}
                                    description={t('settings_profile.heading_description')}
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
                                                                alt={t('settings_profile.photo_alt')}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-muted-foreground">{t('settings_profile.no_photo')}</span>
                                                        )}
                                                    </div>
                                                    <Label htmlFor="profile_photo" className="cursor-pointer">
                                                        {t('settings_profile.upload_photo')}
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
                                                        <Label htmlFor="name">{t('settings_profile.fields.name')}</Label>
                                                        <Input
                                                            id="name"
                                                            className="mt-1 block w-full"
                                                            defaultValue={auth.user.name}
                                                            name="name"
                                                            required
                                                            autoComplete="name"
                                                            placeholder={t('settings_profile.fields.name_placeholder')}
                                                        />
                                                        <InputError className="mt-2" message={errors.name} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email">{t('settings_profile.fields.email')}</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            className="mt-1 block w-full"
                                                            defaultValue={auth.user.email}
                                                            name="email"
                                                            required
                                                            autoComplete="username"
                                                            placeholder={t('settings_profile.fields.email_placeholder')}
                                                        />
                                                        <InputError className="mt-2" message={errors.email} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">{t('settings_profile.fields.phone')}</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.phone ?? ''}
                                                        autoComplete="tel"
                                                        placeholder={t('settings_profile.fields.phone_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.phone} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="address">{t('settings_profile.fields.address')}</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.address ?? ''}
                                                        autoComplete="street-address"
                                                        placeholder={t('settings_profile.fields.address_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.address} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="city">{t('settings_profile.fields.city')}</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.city ?? ''}
                                                        placeholder={t('settings_profile.fields.city_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.city} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="state">{t('settings_profile.fields.state')}</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.state ?? ''}
                                                        placeholder={t('settings_profile.fields.state_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.state} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="latitude">{t('settings_profile.fields.latitude')}</Label>
                                                    <Input
                                                        id="latitude"
                                                        name="latitude"
                                                        type="number"
                                                        step="any"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.latitude ?? ''}
                                                        placeholder={t('settings_profile.fields.latitude_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.latitude} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="longitude">{t('settings_profile.fields.longitude')}</Label>
                                                    <Input
                                                        id="longitude"
                                                        name="longitude"
                                                        type="number"
                                                        step="any"
                                                        className="mt-1 block w-full"
                                                        defaultValue={auth.user.longitude ?? ''}
                                                        placeholder={t('settings_profile.fields.longitude_placeholder')}
                                                    />
                                                    <InputError className="mt-2" message={errors.longitude} />
                                                </div>
                                            </div>

                                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-muted-foreground">
                                                        {t('settings_profile.unverified')}{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            {t('settings_profile.resend_verification')}
                                                        </Link>
                                                    </p>
                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            {t('settings_profile.verification_sent')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <Button
                                                    disabled={processing}
                                                    data-test="update-profile-button"
                                                >
                                                    {t('settings_profile.save')}
                                                </Button>

                                                {recentlySuccessful && (
                                                    <p className="text-sm text-neutral-600">
                                                        {t('settings_profile.saved')}
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
