import React from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { request } from '@/routes/password';
import { register, home } from '@/routes';
import { Form, Head, Link, useForm, useForm as useInertiaForm } from '@inertiajs/react';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap, ArrowLeft, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PendingInvitation = {
    id: number;
    company_id: number;
    company_name: string;
    inviter_name: string;
    token: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    pendingCeoInvitations?: PendingInvitation[];
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
    pendingCeoInvitations = [],
}: Props) {
    const { t } = useTranslation();
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [selectedCompanyId, setSelectedCompanyId] = React.useState<number | null>(null);
    const [assignHrManagerRole, setAssignHrManagerRole] = React.useState(false);
    
    const ceoRoleForm = useInertiaForm({
        company_id: null as number | null,
        assign_hr_manager_role: false,
    });

    return (
        <div className="min-h-screen gradient-hero flex flex-nowrap relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Left Side - Promotional Section */}
            <div className="hidden lg:flex lg:w-1/2 lg:flex-shrink-0 flex-col justify-between p-12 text-white relative z-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <Link href={home()} className="flex items-center gap-3 mb-8 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                            HR
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-white/70 text-sm">by BetterCompany</p>
                        </div>
                    </Link>
                </div>
                
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                        <div>
                            <h2 className="font-display text-5xl font-bold leading-tight mb-4">
                                {t('auth.login.promo_title')}
                            </h2>
                            <p className="text-white/80 text-lg max-w-md leading-relaxed">
                                {t('auth.login.promo_subtitle')}
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-success" />
                                </div>
                                <span className="text-sm">{t('auth.login.feature_fast')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-success" />
                                </div>
                                <span className="text-sm">{t('auth.login.feature_security')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <span className="text-sm">{t('auth.login.feature_collaboration')}</span>
                            </div>
                        </div>
                </div>
                
                <div className="flex items-center gap-8 text-white/60 text-sm animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span>{t('auth.login.trusted')}</span>
                    </div>
                    <span>•</span>
                    <span>{t('auth.login.consulting_grade')}</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 lg:flex-shrink-0 flex items-center justify-center p-6 md:p-12 bg-background/95 backdrop-blur-sm relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Sign in" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8 animate-in fade-in slide-in-from-top-4">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#0a1629] flex items-center justify-center shadow-lg cursor-pointer text-white">
                                HR
                            </div>
                            <div>
                                <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                                <p className="text-muted-foreground text-sm">by BetterCompany</p>
                            </div>
                        </Link>
                    </div>

                    {/* Back to Home Link */}
                    <div className="mb-4">
                        <Link href={home()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {t('auth.login.back_to_home')}
                        </Link>
                    </div>

                    {/* Login Card */}
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-display font-bold">
                                {t('auth.login.title')}
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">{t('auth.login.subtitle')}</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center text-sm font-medium text-success animate-in fade-in slide-in-from-top-4">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post('/login', {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        form.reset('password');
                                        
                                        // If CEO role assignment is selected, assign roles after login
                                        if (selectedCompanyId) {
                                            ceoRoleForm.setData('company_id', selectedCompanyId);
                                            ceoRoleForm.setData('assign_hr_manager_role', assignHrManagerRole);
                                            ceoRoleForm.post('/ceo-role/assign', {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    // Redirect will be handled by LoginResponse
                                                },
                                            });
                                        }
                                    },
                                });
                            }}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium leading-none cursor-pointer">
                                    {t('auth.login.email_label')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('auth.login.email_placeholder')}
                                    className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium leading-none cursor-pointer">
                                        {t('auth.login.password_label')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm text-[#0a1629] hover:text-[#0d1b35] font-medium transition-all duration-200 hover:underline cursor-pointer"
                                            tabIndex={5}
                                        >
                                            {t('auth.login.forgot_password')}
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            {/* CEO Role Assignment Checkbox - Show if user has pending invitations */}
                            {pendingCeoInvitations && pendingCeoInvitations.length > 0 && (
                                <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="assign-ceo-role"
                                            checked={selectedCompanyId !== null}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedCompanyId(pendingCeoInvitations[0].company_id);
                                                } else {
                                                    setSelectedCompanyId(null);
                                                    setAssignHrManagerRole(false);
                                                }
                                            }}
                                        />
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="assign-ceo-role" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                Become CEO for {pendingCeoInvitations[0].company_name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                You have been invited as CEO. Check this box to assign CEO role and access CEO dashboard.
                                            </p>
                                            {selectedCompanyId && (
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="assign-hr-manager-role"
                                                            checked={assignHrManagerRole}
                                                            onCheckedChange={(checked) => {
                                                                setAssignHrManagerRole(checked === true);
                                                            }}
                                                        />
                                                        <Label htmlFor="assign-hr-manager-role" className="text-sm font-medium cursor-pointer">
                                                            Also assign HR Manager role (dual role)
                                                        </Label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                                tabIndex={3}
                                disabled={form.processing}
                                data-test="login-button"
                            >
                                {form.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        {t('auth.login.signing_in')}
                                    </>
                                ) : (
                                    <>
                                        {t('auth.login.sign_in')}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {canRegister && (
                            <div className="pt-4 border-t border-border">
                                <p className="text-center text-sm text-muted-foreground">
                                    {t('auth.login.no_account')}{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-[#0a1629] font-semibold hover:text-[#0d1b35] transition-all duration-200 hover:underline cursor-pointer inline-flex items-center gap-1"
                                        tabIndex={4}
                                    >
                                        {t('auth.login.create_account')}
                                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    </TextLink>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
