import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Settings, 
    User, 
    Mail, 
    Save, 
    TestTube,
    CheckCircle2,
    AlertCircle,
    Building2,
    Lock,
    Palette,
    ShieldBan,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import InputError from '@/components/input-error';
import { Form, Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import AppearanceToggleTab from '@/components/appearance-tabs';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import { send } from '@/routes/verification';
import DeleteUser from '@/components/delete-user';
import { Transition } from '@headlessui/react';
import { useRef } from 'react';

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
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [testingEmail, setTestingEmail] = useState(false);
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
            setActiveTab(tabParam);
        }
    }, []);

    // Update URL when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        window.history.replaceState({}, '', url.toString());
    };
    
    // Profile Form
    const profileForm = useForm({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
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
    });

    // Test Email Form
    const testEmailForm = useForm({
        test_email: '',
    });

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
        profileForm.patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Settings" />
                    
                    <div className="p-6 md:p-8 max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-primary" />
                                </div>
                                <h1 className="text-3xl font-display font-bold">Settings</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Manage your application settings, email configuration, and profile
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

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
                                <TabsTrigger value="profile" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Profile</span>
                                </TabsTrigger>
                                <TabsTrigger value="password" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span className="hidden sm:inline">Password</span>
                                </TabsTrigger>
                                <TabsTrigger value="smtp" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="hidden sm:inline">Email</span>
                                </TabsTrigger>
                                <TabsTrigger value="app" className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">App</span>
                                </TabsTrigger>
                                <TabsTrigger value="appearance" className="flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    <span className="hidden lg:inline">Appearance</span>
                                </TabsTrigger>
                                <TabsTrigger value="security" className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="hidden lg:inline">Security</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>
                                            Update your personal information and email address
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={profileForm.data.name}
                                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                                    required
                                                />
                                                <InputError message={profileForm.errors.name} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    required
                                                />
                                                <InputError message={profileForm.errors.email} />
                                            </div>
                                            {mustVerifyEmail && auth?.user?.email_verified_at === null && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Your email address is unverified.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
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
                                                <Button type="submit" disabled={profileForm.processing}>
                                                    {profileForm.processing ? (
                                                        <>Saving...</>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </Button>
                                                {profileForm.recentlySuccessful && (
                                                    <span className="text-sm text-success">Saved!</span>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                                <DeleteUser />
                            </TabsContent>

                            {/* Password Tab */}
                            <TabsContent value="password" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>
                                            Update your account password. Ensure your account is using a long, random password to stay secure.
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
                                            {({ errors, processing, recentlySuccessful }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="current_password">Current password</Label>
                                                        <Input
                                                            id="current_password"
                                                            ref={currentPasswordInput}
                                                            name="current_password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="current-password"
                                                            placeholder="Current password"
                                                        />
                                                        <InputError message={errors.current_password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password">New password</Label>
                                                        <Input
                                                            id="password"
                                                            ref={passwordInput}
                                                            name="password"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder="New password"
                                                        />
                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password_confirmation">Confirm password</Label>
                                                        <Input
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            type="password"
                                                            className="mt-1 block w-full"
                                                            autoComplete="new-password"
                                                            placeholder="Confirm password"
                                                        />
                                                        <InputError message={errors.password_confirmation} />
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Button disabled={processing} data-test="update-password-button">
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save password
                                                        </Button>

                                                        <Transition
                                                            show={recentlySuccessful}
                                                            enter="transition ease-in-out"
                                                            enterFrom="opacity-0"
                                                            leave="transition ease-in-out"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <p className="text-sm text-success">Saved</p>
                                                        </Transition>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SMTP/Email Tab */}
                            <TabsContent value="smtp" className="space-y-6">
                                {/* SMTP Status */}
                                <Alert className={smtpConfigured ? 'border-success/50 bg-success/5' : 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20'}>
                                    {smtpConfigured ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-success font-medium">SMTP is configured and active</span>
                                                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                        Active
                                                    </Badge>
                                                </div>
                                            </AlertDescription>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-orange-800 dark:text-orange-200 font-medium">
                                                        SMTP is not configured. Email services are disabled.
                                                    </span>
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                                        Inactive
                                                    </Badge>
                                                </div>
                                            </AlertDescription>
                                        </>
                                    )}
                                </Alert>

                                {/* SMTP Configuration */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Email Configuration</CardTitle>
                                        <CardDescription>
                                            Configure SMTP settings for sending emails
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSmtpSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mailer">Mailer Type</Label>
                                                    <select
                                                        id="mailer"
                                                        value={smtpForm.data.mailer}
                                                        onChange={(e) => smtpForm.setData('mailer', e.target.value)}
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
                                                            <Label htmlFor="host">SMTP Host</Label>
                                                            <Input
                                                                id="host"
                                                                value={smtpForm.data.host}
                                                                onChange={(e) => smtpForm.setData('host', e.target.value)}
                                                                placeholder="smtp.mailtrap.io"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="port">SMTP Port</Label>
                                                            <Input
                                                                id="port"
                                                                type="number"
                                                                value={smtpForm.data.port}
                                                                onChange={(e) => smtpForm.setData('port', parseInt(e.target.value))}
                                                                placeholder="587"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="username">Username</Label>
                                                            <Input
                                                                id="username"
                                                                value={smtpForm.data.username}
                                                                onChange={(e) => smtpForm.setData('username', e.target.value)}
                                                                placeholder="SMTP username"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="password">Password</Label>
                                                            <Input
                                                                id="password"
                                                                type="password"
                                                                value={smtpForm.data.password}
                                                                onChange={(e) => smtpForm.setData('password', e.target.value)}
                                                                placeholder="Leave empty to keep current"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="encryption">Encryption</Label>
                                                            <select
                                                                id="encryption"
                                                                value={smtpForm.data.encryption}
                                                                onChange={(e) => smtpForm.setData('encryption', e.target.value)}
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
                                                    <Label htmlFor="from_address">From Email Address</Label>
                                                    <Input
                                                        id="from_address"
                                                        type="email"
                                                        value={smtpForm.data.from_address}
                                                        onChange={(e) => smtpForm.setData('from_address', e.target.value)}
                                                        placeholder="noreply@example.com"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="from_name">From Name</Label>
                                                    <Input
                                                        id="from_name"
                                                        value={smtpForm.data.from_name}
                                                        onChange={(e) => smtpForm.setData('from_name', e.target.value)}
                                                        placeholder="HR Path-Finder"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4">
                                                <Button type="submit" disabled={smtpForm.processing}>
                                                    {smtpForm.processing ? (
                                                        <>Saving...</>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save SMTP Settings
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="rounded-lg border bg-muted/50 p-4 mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Note:</strong> After updating SMTP settings, you need to update your <code className="text-xs bg-background px-1 py-0.5 rounded">.env</code> file with these values and restart your application.
                                                </p>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Test Email */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test Email Configuration</CardTitle>
                                        <CardDescription>
                                            Send a test email to verify your SMTP settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleTestEmail} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="test_email">Test Email Address</Label>
                                                <Input
                                                    id="test_email"
                                                    type="email"
                                                    value={testEmailForm.data.test_email}
                                                    onChange={(e) => testEmailForm.setData('test_email', e.target.value)}
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
                                                    <>Sending...</>
                                                ) : (
                                                    <>
                                                        <TestTube className="w-4 h-4 mr-2" />
                                                        Send Test Email
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Application Settings Tab */}
                            <TabsContent value="app" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Application Settings</CardTitle>
                                        <CardDescription>
                                            Configure your application name and logo
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleAppSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="app_name">Application Name</Label>
                                                <Input
                                                    id="app_name"
                                                    value={appForm.data.name}
                                                    onChange={(e) => appForm.setData('name', e.target.value)}
                                                    placeholder="HR Path-Finder"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="app_logo">Application Logo</Label>
                                                <div className="flex items-center gap-4">
                                                    {appSettings.logo && (
                                                        <img 
                                                            src={appSettings.logo} 
                                                            alt="Current logo" 
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
                                                            }
                                                        }}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Recommended: SVG or PNG, max 2MB
                                                </p>
                                            </div>

                                            <Button type="submit" disabled={appForm.processing}>
                                                {appForm.processing ? (
                                                    <>Saving...</>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Application Settings
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Appearance Tab */}
                            <TabsContent value="appearance" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Appearance Settings</CardTitle>
                                        <CardDescription>
                                            Customize the look and feel of your application
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Theme</Label>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Choose your preferred theme
                                                </p>
                                                <AppearanceToggleTab />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Two-Factor Authentication</CardTitle>
                                        <CardDescription>
                                            Manage your two-factor authentication settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {twoFactorEnabled ? (
                                            <div className="flex flex-col items-start justify-start space-y-4">
                                                <Badge variant="default">Enabled</Badge>
                                                <p className="text-muted-foreground">
                                                    With two-factor authentication enabled, you will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.
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
                                                                Disable 2FA
                                                            </Button>
                                                        )}
                                                    </Form>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start justify-start space-y-4">
                                                <Badge variant="destructive">Disabled</Badge>
                                                <p className="text-muted-foreground">
                                                    When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.
                                                </p>

                                                <div>
                                                    {hasSetupData ? (
                                                        <Button onClick={() => setShowSetupModal(true)}>
                                                            <ShieldCheck className="w-4 h-4 mr-2" />
                                                            Continue Setup
                                                        </Button>
                                                    ) : (
                                                        <Form
                                                            {...enable.form()}
                                                            onSuccess={() => setShowSetupModal(true)}
                                                        >
                                                            {({ processing }) => (
                                                                <Button type="submit" disabled={processing}>
                                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                                    Enable 2FA
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
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
