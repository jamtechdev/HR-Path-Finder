import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Form, Link } from '@inertiajs/react';
import { 
    Settings, 
    Save, 
    TestTube,
    CheckCircle2,
    AlertCircle,
    ShieldBan,
    ShieldCheck,
    Upload
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import AppearanceToggleTab from '@/components/appearance-tabs';
import DeleteUser from '@/components/delete-user';
import AppHeader from '@/components/Header/AppHeader';
import InputError from '@/components/input-error';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { disable, enable } from '@/routes/two-factor';
import { send } from '@/routes/verification';

interface PageProps {
    smtpConfigured: boolean;
    smtpSettings: {
        mailer: string;
        host: string;
        port: number;
        username: string;
        from_address: string;
        from_name: string;
        encryption?: string;
    };
    appSettings: {
        name: string;
        logo: string;
        require_admin_approval?: boolean;
    };
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
    mustVerifyEmail?: boolean;
    activeTab?: string;
    status?: string;
}

export default function SettingsIndex({ 
    smtpConfigured, 
    smtpSettings, 
    appSettings, 
    twoFactorEnabled = false,
    requiresConfirmation = false,
    mustVerifyEmail = false,
    activeTab: initialTab = 'profile',
    status 
}: PageProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const isAdmin = Array.isArray(auth?.user?.roles)
        ? auth.user.roles.some((role: { name?: string }) => role?.name === 'admin')
        : false;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [testingEmail, setTestingEmail] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
        auth?.user?.profile_photo_url ?? null,
    );
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    
    // Two-factor auth hook
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors: twoFactorErrors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    // Sync activeTab with URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && tabParam !== activeTab) {
            if (!isAdmin && (tabParam === 'smtp' || tabParam === 'app')) {
                setActiveTab('profile');
            } else {
                setActiveTab(tabParam);
            }
        }
    }, [activeTab, isAdmin]);

    // Update URL when tab changes
    const handleTabChange = (value: string) => {
        if (!isAdmin && (value === 'smtp' || value === 'app')) {
            setActiveTab('profile');
            return;
        }
        setActiveTab(value);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        window.history.replaceState({}, '', url.toString());
    };
    
    // Profile Form
    const profileForm = useForm({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: auth?.user?.phone ?? '',
        address: auth?.user?.address ?? '',
        city: auth?.user?.city ?? '',
        state: auth?.user?.state ?? '',
        profile_photo: null as File | null,
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // SMTP Form
    const smtpForm = useForm({
        mailer: smtpSettings.mailer || 'smtp',
        host: smtpSettings.host || '',
        port: smtpSettings.port || 587,
        username: smtpSettings.username || '',
        password: '',
        encryption: smtpSettings.encryption || 'tls',
        from_address: smtpSettings.from_address || '',
        from_name: smtpSettings.from_name || '',
    });

    // Application Form
    const appForm = useForm({
        name: appSettings.name || '',
        logo: null as File | null,
        require_admin_approval: Boolean(appSettings.require_admin_approval),
    });

    // Test Email Form
    const testEmailForm = useForm({
        test_email: '',
    });

    useEffect(() => {
        const user = auth?.user;
        if (!user) return;
        // Keep profile form state in sync for all roles (admin/ceo/hr)
        // to avoid accidental empty required fields on first submit.
        profileForm.setData((prev) => ({
            ...prev,
            name: prev.name?.trim() ? prev.name : (user.name || ''),
            email: prev.email?.trim() ? prev.email : (user.email || ''),
            phone: prev.phone ?? (user.phone ?? ''),
            address: prev.address ?? (user.address ?? ''),
            city: prev.city ?? (user.city ?? ''),
            state: prev.state ?? (user.state ?? ''),
        }));
    }, [auth?.user]);

    const handleSmtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        smtpForm.post('/settings/smtp/update', {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const handleAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        appForm.post('/settings/app/update', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const handleTestEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setTestingEmail(true);
        testEmailForm.post('/settings/smtp/test', {
            preserveScroll: true,
            onSuccess: () => {
                setTestingEmail(false);
            },
            onError: () => {
                setTestingEmail(false);
            },
        });
    };
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = String(profileForm.data.name ?? '').trim();
        const email = String(profileForm.data.email ?? '').trim();
        profileForm.clearErrors();
        let hasClientError = false;
        if (!name) {
            profileForm.setError('name', t('settings_index.profile.fields.full_name') + ' is required.');
            hasClientError = true;
        }
        if (!email) {
            profileForm.setError('email', t('settings_index.profile.fields.email_address') + ' is required.');
            hasClientError = true;
        }
        if (hasClientError) return;

        const normalizedData = {
            ...profileForm.data,
            name,
            email,
            _method: 'patch' as const,
        };

        profileForm.transform(() => normalizedData as any);
        profileForm.post('/settings/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    useEffect(() => {
        return () => {
            if (profilePhotoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(profilePhotoPreview);
            }
        };
    }, [profilePhotoPreview]);


    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={t('settings_index.page_title')} />
                    
                    <div className="p-6 md:p-8 max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-primary" />
                                </div>
                                <h1 className="text-3xl font-display font-bold">{t('settings_index.heading')}</h1>
                            </div>
                            <p className="text-muted-foreground">
                                {t('settings_index.subheading')}
                            </p>
                        </div>

                        {/* Status Messages */}
                        {status && (
                            <Alert className="mb-6 border-success/50 bg-success/5">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <AlertDescription className="text-success">
                                    {status}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Tab-based Settings */}
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="profile">{t('settings_index.tabs.profile')}</TabsTrigger>
                                <TabsTrigger value="password">{t('settings_index.tabs.password')}</TabsTrigger>
                                {isAdmin && <TabsTrigger value="smtp">{t('settings_index.tabs.smtp')}</TabsTrigger>}
                                {isAdmin && <TabsTrigger value="app">{t('settings_index.tabs.app')}</TabsTrigger>}
                                <TabsTrigger value="appearance">{t('settings_index.tabs.appearance')}</TabsTrigger>
                                <TabsTrigger value="security">{t('settings_index.tabs.security')}</TabsTrigger>
                            </TabsList>

                            <div className="space-y-6 mt-6">

                            {/* Profile */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.profile.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.profile.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handleProfileSubmit}
                                            className="space-y-4"
                                            encType="multipart/form-data"
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                                        {profilePhotoPreview ? (
                                                            <img
                                                                src={profilePhotoPreview}
                                                                alt={t('settings_index.profile.photo_alt')}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-muted-foreground">{t('settings_index.profile.no_photo')}</span>
                                                        )}
                                                    </div>
                                                    <Label
                                                        htmlFor="profile_photo"
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        {t(
                                                            'settings_index.profile.upload_photo',
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id="profile_photo"
                                                        type="file"
                                                        name="profile_photo"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            profileForm.setData('profile_photo', file);
                                                            clearInertiaFieldError(profileForm.clearErrors, 'profile_photo');
                                                            if (profilePhotoPreview?.startsWith('blob:')) {
                                                                URL.revokeObjectURL(profilePhotoPreview);
                                                            }
                                                            if (file) {
                                                                setProfilePhotoPreview(
                                                                    URL.createObjectURL(
                                                                        file,
                                                                    ),
                                                                );
                                                            } else {
                                                                setProfilePhotoPreview(
                                                                    auth?.user
                                                                        ?.profile_photo_url ??
                                                                        null,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <InputError message={profileForm.errors.profile_photo} />
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">{t('settings_index.profile.fields.full_name')}</Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            value={profileForm.data.name}
                                                            onChange={(e) => {
                                                                profileForm.setData('name', e.target.value);
                                                                clearInertiaFieldError(profileForm.clearErrors, 'name');
                                                            }}
                                                            required
                                                        />
                                                        <InputError message={profileForm.errors.name} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">{t('settings_index.profile.fields.email_address')}</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            name="email"
                                                            value={profileForm.data.email}
                                                            onChange={(e) => {
                                                                profileForm.setData('email', e.target.value);
                                                                clearInertiaFieldError(profileForm.clearErrors, 'email');
                                                            }}
                                                            required
                                                        />
                                                        <InputError message={profileForm.errors.email} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">{t('settings_index.profile.fields.phone')}</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={profileForm.data.phone}
                                                        onChange={(e) => {
                                                            profileForm.setData('phone', e.target.value);
                                                            clearInertiaFieldError(profileForm.clearErrors, 'phone');
                                                        }}
                                                        autoComplete="tel"
                                                        placeholder={t('settings_index.profile.fields.phone_placeholder')}
                                                    />
                                                    <InputError message={profileForm.errors.phone} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address">{t('settings_index.profile.fields.address')}</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={profileForm.data.address}
                                                        onChange={(e) => {
                                                            profileForm.setData('address', e.target.value);
                                                            clearInertiaFieldError(profileForm.clearErrors, 'address');
                                                        }}
                                                        autoComplete="street-address"
                                                        placeholder={t('settings_index.profile.fields.address_placeholder')}
                                                    />
                                                    <InputError message={profileForm.errors.address} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">{t('settings_index.profile.fields.city')}</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={profileForm.data.city}
                                                        onChange={(e) => {
                                                            profileForm.setData('city', e.target.value);
                                                            clearInertiaFieldError(profileForm.clearErrors, 'city');
                                                        }}
                                                        placeholder={t('settings_index.profile.fields.city_placeholder')}
                                                    />
                                                    <InputError message={profileForm.errors.city} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="state">{t('settings_index.profile.fields.state')}</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={profileForm.data.state}
                                                        onChange={(e) => {
                                                            profileForm.setData('state', e.target.value);
                                                            clearInertiaFieldError(profileForm.clearErrors, 'state');
                                                        }}
                                                        placeholder={t('settings_index.profile.fields.state_placeholder')}
                                                    />
                                                    <InputError message={profileForm.errors.state} />
                                                </div>
                                            </div>

                                            {mustVerifyEmail && auth?.user?.email_verified_at === null && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('settings_index.profile.unverified_message')}{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                                        >
                                                            {t('settings_index.profile.resend_verification')}
                                                        </Link>
                                                    </p>
                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            {t('settings_index.profile.verification_sent')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 flex-wrap">
                                                <Button type="submit" disabled={profileForm.processing}>
                                                    {profileForm.processing ? (
                                                        <>{t('settings_index.common.saving')}</>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            {t('settings_index.profile.save_changes')}
                                                        </>
                                                    )}
                                                </Button>
                                                {profileForm.recentlySuccessful && (
                                                    <span className="text-sm text-success">{t('settings_index.common.saved_bang')}</span>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                                <DeleteUser />
                            </div>
                            )}

                            {/* Password */}
                            {activeTab === 'password' && (
                                <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.password.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.password.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form
                                            {...PasswordController.update.form()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            resetOnError={['password', 'password_confirmation', 'current_password']}
                                            resetOnSuccess
                                            onError={(errors) => {
                                                if (errors.password) {
                                                    passwordInput.current?.focus();
                                                }
                                                if (errors.current_password) {
                                                    currentPasswordInput.current?.focus();
                                                }
                                            }}
                                            className="space-y-6"
                                        >
                                            {({ errors, processing, recentlySuccessful, clearErrors }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="current_password">{t('settings_index.password.fields.current_password')}</Label>
                                                        <Input
                                                            id="current_password"
                                                            ref={currentPasswordInput}
                                                            name="current_password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="current-password"
                                                            placeholder={t('settings_index.password.fields.current_password_placeholder')}
                                                            onChange={() => clearInertiaFieldError(clearErrors, 'current_password')}
                                                        />
                                                        <InputError message={errors.current_password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password">{t('settings_index.password.fields.new_password')}</Label>
                                                        <Input
                                                            id="password"
                                                            ref={passwordInput}
                                                            name="password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder={t('settings_index.password.fields.new_password_placeholder')}
                                                            onChange={() => clearInertiaFieldError(clearErrors, 'password')}
                                                        />
                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password_confirmation">{t('settings_index.password.fields.confirm_password')}</Label>
                                                        <Input
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder={t('settings_index.password.fields.confirm_password_placeholder')}
                                                            onChange={() => clearInertiaFieldError(clearErrors, 'password_confirmation')}
                                                        />
                                                        <InputError message={errors.password_confirmation} />
                                                    </div>

                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <Button disabled={processing} data-test="update-password-button">
                                                            <Save className="w-4 h-4 mr-2" />
                                                            {t('settings_index.password.save_password')}
                                                        </Button>

                                                        {recentlySuccessful && (
                                                            <p className="text-sm text-success">{t('settings_index.common.saved')}</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </CardContent>
                                    </Card>
                                </div>
                                )}

                            {/* SMTP/Email (Admin only) */}
                            {isAdmin && activeTab === 'smtp' && (
                            <div className="space-y-6">
                                {/* SMTP Status */}
                                <Alert className={smtpConfigured ? 'border-success/50 bg-success/5' : 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20'}>
                                    {smtpConfigured ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between flex-wrap">
                                                    <span className="text-success font-medium">{t('settings_index.smtp.configured_active')}</span>
                                                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                        {t('settings_index.smtp.active')}
                                                    </Badge>
                                                </div>
                                            </AlertDescription>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between flex-wrap">
                                                    <span className="text-orange-800 dark:text-orange-200 font-medium">
                                                        {t('settings_index.smtp.not_configured')}
                                                    </span>
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                                        {t('settings_index.smtp.inactive')}
                                                    </Badge>
                                                </div>
                                            </AlertDescription>
                                        </>
                                    )}
                                </Alert>

                                {/* SMTP Configuration */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.smtp.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.smtp.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSmtpSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mailer">{t('settings_index.smtp.fields.mailer_type')}</Label>
                                                    <select
                                                        id="mailer"
                                                        value={smtpForm.data.mailer}
                                                        onChange={(e) => {
                                                            smtpForm.setData('mailer', e.target.value);
                                                            clearInertiaFieldError(smtpForm.clearErrors, 'mailer');
                                                        }}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <option value="smtp">SMTP</option>
                                                        <option value="ses">Amazon SES</option>
                                                        <option value="postmark">Postmark</option>
                                                        <option value="resend">Resend</option>
                                                    </select>
                                                </div>

                                                {smtpForm.data.mailer === 'smtp' && (
                                                    <>
                                                        <div className="space-y-2">
                                                        <Label htmlFor="host">{t('settings_index.smtp.fields.smtp_host')}</Label>
                                                            <Input
                                                                id="host"
                                                                value={smtpForm.data.host}
                                                                onChange={(e) => {
                                                                    smtpForm.setData('host', e.target.value);
                                                                    clearInertiaFieldError(smtpForm.clearErrors, 'host');
                                                                }}
                                                                placeholder="smtp.mailtrap.io"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                        <Label htmlFor="port">{t('settings_index.smtp.fields.smtp_port')}</Label>
                                                            <Input
                                                                id="port"
                                                                type="number"
                                                                value={smtpForm.data.port}
                                                                onChange={(e) => {
                                                                    smtpForm.setData('port', parseInt(e.target.value));
                                                                    clearInertiaFieldError(smtpForm.clearErrors, 'port');
                                                                }}
                                                                placeholder="587"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                        <Label htmlFor="username">{t('settings_index.smtp.fields.username')}</Label>
                                                            <Input
                                                                id="username"
                                                                value={smtpForm.data.username}
                                                                onChange={(e) => {
                                                                    smtpForm.setData('username', e.target.value);
                                                                    clearInertiaFieldError(smtpForm.clearErrors, 'username');
                                                                }}
                                                                placeholder={t('settings_index.smtp.fields.username_placeholder')}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="password">{t('settings_index.smtp.fields.password')}</Label>
                                                            <Input
                                                                id="password"
                                                                type="password"
                                                                value={smtpForm.data.password}
                                                                onChange={(e) => {
                                                                    smtpForm.setData('password', e.target.value);
                                                                    clearInertiaFieldError(smtpForm.clearErrors, 'password');
                                                                }}
                                                                placeholder={t('settings_index.smtp.fields.password_placeholder')}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="encryption">{t('settings_index.smtp.fields.encryption')}</Label>
                                                            <select
                                                                id="encryption"
                                                                value={smtpForm.data.encryption}
                                                                onChange={(e) => {
                                                                    smtpForm.setData('encryption', e.target.value);
                                                                    clearInertiaFieldError(smtpForm.clearErrors, 'encryption');
                                                                }}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            >
                                                                <option value="tls">TLS</option>
                                                                <option value="ssl">SSL</option>
                                                            </select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                                <div className="space-y-2">
                                                    <Label htmlFor="from_address">{t('settings_index.smtp.fields.from_email')}</Label>
                                                    <Input
                                                        id="from_address"
                                                        type="email"
                                                        value={smtpForm.data.from_address}
                                                        onChange={(e) => {
                                                            smtpForm.setData('from_address', e.target.value);
                                                            clearInertiaFieldError(smtpForm.clearErrors, 'from_address');
                                                        }}
                                                        placeholder="noreply@example.com"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="from_name">{t('settings_index.smtp.fields.from_name')}</Label>
                                                    <Input
                                                        id="from_name"
                                                        value={smtpForm.data.from_name}
                                                        onChange={(e) => {
                                                            smtpForm.setData('from_name', e.target.value);
                                                            clearInertiaFieldError(smtpForm.clearErrors, 'from_name');
                                                        }}
                                                        placeholder="HR Path-Finder"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 flex-wrap pt-4">
                                                <Button type="submit" disabled={smtpForm.processing}>
                                                    {smtpForm.processing ? (
                                                        <>{t('settings_index.common.saving')}</>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            {t('settings_index.smtp.save_settings')}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="rounded-lg border bg-muted/50 p-4 mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>{t('settings_index.smtp.note_label')}</strong> {t('settings_index.smtp.note_text')} <code className="text-xs bg-background px-1 py-0.5 rounded">.env</code> {t('settings_index.smtp.note_text_tail')}
                                                </p>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Test Email */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.smtp.test_title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.smtp.test_description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleTestEmail} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="test_email">{t('settings_index.smtp.fields.test_email')}</Label>
                                                <Input
                                                    id="test_email"
                                                    type="email"
                                                    value={testEmailForm.data.test_email}
                                                    onChange={(e) => {
                                                        testEmailForm.setData('test_email', e.target.value);
                                                        clearInertiaFieldError(testEmailForm.clearErrors, 'test_email');
                                                    }}
                                                    placeholder="your@email.com"
                                                    required
                                                />
                                            </div>
                                            <Button 
                                                type="submit" 
                                                variant="outline"
                                                disabled={testingEmail || !smtpConfigured}
                                            >
                                                {testingEmail ? (
                                                    <>{t('settings_index.smtp.sending')}</>
                                                ) : (
                                                    <>
                                                        <TestTube className="w-4 h-4 mr-2" />
                                                        {t('settings_index.smtp.send_test_email')}
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                            )}

                            {/* Application Settings (Admin only) */}
                            {isAdmin && activeTab === 'app' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.app.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.app.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleAppSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="app_name">{t('settings_index.app.fields.application_name')}</Label>
                                                <Input
                                                    id="app_name"
                                                    value={appForm.data.name}
                                                    onChange={(e) => {
                                                        appForm.setData('name', e.target.value);
                                                        clearInertiaFieldError(appForm.clearErrors, 'name');
                                                    }}
                                                    placeholder="HR Path-Finder"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="app_logo">{t('settings_index.app.fields.application_logo')}</Label>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    {appSettings.logo && (
                                                        <img 
                                                            src={appSettings.logo} 
                                                            alt={t('settings_index.app.fields.current_logo_alt')} 
                                                            className="w-16 h-16 object-contain border rounded"
                                                        />
                                                    )}
                                                    <Input
                                                        id="app_logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                appForm.setData('logo', file);
                                                                clearInertiaFieldError(appForm.clearErrors, 'logo');
                                                            }
                                                        }}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('settings_index.app.fields.logo_help')}
                                                </p>
                                            </div>

                                            <div className="space-y-2 border rounded-md p-4 bg-muted/30">
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div>
                                                        <Label htmlFor="require_admin_approval">{t('settings_index.app.fields.require_admin_approval')}</Label>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {t('settings_index.app.fields.require_admin_approval_help')}
                                                        </p>
                                                    </div>
                                                    <input
                                                        id="require_admin_approval"
                                                        type="checkbox"
                                                        checked={Boolean(appForm.data.require_admin_approval)}
                                                        onChange={(e) => appForm.setData('require_admin_approval', e.target.checked)}
                                                        className="h-5 w-5 accent-primary"
                                                    />
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={appForm.processing}>
                                                {appForm.processing ? (
                                                    <>{t('settings_index.common.saving')}</>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        {t('settings_index.app.save_settings')}
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                            )}

                            {/* Appearance */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.appearance.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.appearance.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>{t('settings_index.appearance.theme')}</Label>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {t('settings_index.appearance.theme_help')}
                                                </p>
                                                <AppearanceToggleTab />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            )}

                            {/* Two-Factor Security */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('settings_index.security.title')}</CardTitle>
                                        <CardDescription>
                                            {t('settings_index.security.description')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {twoFactorEnabled ? (
                                            <div className="flex flex-col items-start justify-start space-y-4">
                                                <Badge variant="default">{t('settings_index.security.enabled')}</Badge>
                                                <p className="text-muted-foreground">
                                                    {t('settings_index.security.enabled_help')}
                                                </p>

                                                <TwoFactorRecoveryCodes
                                                    recoveryCodesList={recoveryCodesList}
                                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                                    errors={twoFactorErrors}
                                                />

                                                <div className="relative inline">
                                                    <Form {...disable.form()}>
                                                        {({ processing }) => (
                                                            <Button
                                                                variant="destructive"
                                                                type="submit"
                                                                disabled={processing}
                                                            >
                                                                <ShieldBan className="w-4 h-4 mr-2" />
                                                                {t('settings_index.security.disable_2fa')}
                                                            </Button>
                                                        )}
                                                    </Form>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start justify-start space-y-4">
                                                <Badge variant="destructive">{t('settings_index.security.disabled')}</Badge>
                                                <p className="text-muted-foreground">
                                                    {t('settings_index.security.disabled_help')}
                                                </p>

                                                <div>
                                                    {hasSetupData ? (
                                                        <Button onClick={() => setShowSetupModal(true)}>
                                                            <ShieldCheck className="w-4 h-4 mr-2" />
                                                            {t('settings_index.security.continue_setup')}
                                                        </Button>
                                                    ) : (
                                                        <Form
                                                            {...enable.form()}
                                                            onSuccess={() => setShowSetupModal(true)}
                                                        >
                                                            {({ processing }) => (
                                                                <Button type="submit" disabled={processing}>
                                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                                    {t('settings_index.security.enable_2fa')}
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <TwoFactorSetupModal
                                            isOpen={showSetupModal}
                                            onClose={() => setShowSetupModal(false)}
                                            requiresConfirmation={requiresConfirmation}
                                            twoFactorEnabled={twoFactorEnabled}
                                            qrCodeSvg={qrCodeSvg}
                                            manualSetupKey={manualSetupKey}
                                            clearSetupData={clearSetupData}
                                            fetchSetupData={fetchSetupData}
                                            errors={twoFactorErrors}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            )}
                            </div>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
