import { Form, Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/toaster';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { register, home } from '@/routes';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = React.useState(false);
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    React.useEffect(() => {
        if (status) {
            toast({ title: status, variant: 'success' });
        }
    }, [status]);


    return (
        <div className="min-h-screen flex flex-nowrap relative overflow-hidden" data-auth-revision>
            <Toaster />
            <div className="absolute inset-0 overflow-hidden pointer-events-none lg:block hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#2ECFAB]/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C8A84B]/8 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="hidden lg:flex lg:w-1/2 lg:flex-shrink-0 flex-col justify-between p-12 bg-[#0B1E3D] text-white relative z-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <Link href={home()} className="flex items-center gap-3 mb-8 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-[#2ECFAB]/20">
                            HR
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-bold">HR <span className="text-[#2ECFAB]">Pathfinder</span></h1>
                            <p className="text-white/60 text-sm">powered by BetterCompany</p>
                        </div>
                    </Link>
                </div>
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                    <div>
                        <h2 className="font-serif text-4xl font-bold leading-tight mb-4">{t('auth.login.promo_title')}</h2>
                        <p className="text-white/70 text-lg max-w-md leading-relaxed">{t('auth.login.promo_subtitle')}</p>
                    </div>
                    <div className="space-y-4">
                        {[t('auth.login.feature_fast'), t('auth.login.feature_security'), t('auth.login.feature_collaboration')].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-[#2ECFAB]/20 flex items-center justify-center">
                                    {i === 0 ? <Zap className="w-5 h-5 text-[#2ECFAB]" /> : i === 1 ? <Shield className="w-5 h-5 text-[#2ECFAB]" /> : <CheckCircle2 className="w-5 h-5 text-[#2ECFAB]" />}
                                </div>
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-8 text-white/55 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2ECFAB] animate-pulse" />
                        <span>{t('auth.login.trusted')}</span>
                    </div>
                    <span>•</span>
                    <span>{t('auth.login.consulting_grade')}</span>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#FAF8F3] relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Sign in" />

                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#0B1E3D] flex items-center justify-center text-white font-bold">HR</div>
                            <div>
                                <h1 className="font-serif text-2xl font-bold text-[#0D1B2A]">HR <span className="text-[#2ECFAB]">Pathfinder</span></h1>
                                <p className="text-[#3D5068] text-sm">powered by BetterCompany</p>
                            </div>
                        </Link>
                    </div>
                    <div className="mb-4">
                        <Link href={home()} className="inline-flex items-center gap-2 text-sm text-[#3D5068] hover:text-[#0B1E3D] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {t('auth.login.back_to_home')}
                        </Link>
                    </div>
                    <div className="bg-white border border-[#EEF0F4] rounded-2xl shadow-lg p-8 space-y-6">
                        <div className="text-center lg:text-left">
                            <h2 className="font-serif text-3xl font-bold text-[#0B1E3D]">{t('auth.login.title')}</h2>
                            <p className="text-[#3D5068] mt-2 text-sm">{t('auth.login.subtitle')}</p>
                        </div>
                        {status && (
                            <div className="p-4 rounded-lg bg-[#E6FAF6] border border-[#2ECFAB]/30 text-sm font-medium text-[#1A8C6F]">
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
                                    onChange={(e) => {
                                        form.setData('email', e.target.value);
                                        clearInertiaFieldError(form.clearErrors, 'email');
                                    }}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('auth.login.email_placeholder')}
                                    className="h-11 w-full border-[#EEF0F4] focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium leading-none cursor-pointer">
                                        {t('auth.login.password_label')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="text-sm text-[#2ECFAB] hover:text-[#1A8C6F] font-medium hover:underline" tabIndex={5}>
                                            {t('auth.login.forgot_password')}
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.data.password}
                                        onChange={(e) => {
                                            form.setData('password', e.target.value);
                                            clearInertiaFieldError(form.clearErrors, 'password');
                                        }}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-11 w-full border-[#EEF0F4] pr-10 focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7585] hover:text-[#0B1E3D]"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={form.errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-[#2ECFAB] hover:bg-[#7EE8D0] text-[#0B1E3D] font-bold shadow-lg hover:shadow-xl transition-all"
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
                            <div className="pt-4 border-t border-[#EEF0F4]">
                                <p className="text-center text-sm text-[#3D5068]">
                                    {t('auth.login.no_account')}{' '}
                                    <TextLink href={register()} className="text-[#2ECFAB] font-semibold hover:text-[#1A8C6F] hover:underline inline-flex items-center gap-1" tabIndex={4}>
                                        {t('auth.login.create_account')}
                                        <ArrowRight className="h-3 w-3" />
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
