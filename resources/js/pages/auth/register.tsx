import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, home } from '@/routes';
import { store } from '@/routes/register';
import { Head, Link, useForm } from '@inertiajs/react';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
    status?: string;
};

export default function Register({ status }: Props) {
    const { t } = useTranslation();
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'hr_manager', // Always HR Manager
    });
    
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    return (
        <div className="min-h-screen flex flex-nowrap relative overflow-hidden" data-auth-revision>
            <div className="absolute inset-0 overflow-hidden pointer-events-none lg:block hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#2ECFAB]/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C8A84B]/8 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0B1E3D] text-white relative z-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <Link href={home()} className="flex items-center gap-3 mb-8 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-[#2ECFAB]/20">HR</div>
                        <div>
                            <h1 className="font-serif text-2xl font-bold">HR <span className="text-[#2ECFAB]">Pathfinder</span></h1>
                            <p className="text-white/60 text-sm">powered by BetterCompany</p>
                        </div>
                    </Link>
                </div>
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                    <div>
                        <h2 className="font-serif text-4xl font-bold leading-tight mb-4">
                            {t('auth.register.promo_title')}<br />
                            <span className="text-[#2ECFAB]">{t('auth.register.promo_subtitle')}</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-md leading-relaxed">{t('auth.register.promo_description')}</p>
                    </div>
                    <div className="space-y-4">
                        {[t('auth.register.feature_guided'), t('auth.register.feature_consulting'), t('auth.register.feature_approval')].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/90">
                                <div className="w-8 h-8 rounded-lg bg-[#2ECFAB]/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-[#2ECFAB]" />
                                </div>
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-8 text-white/55 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2ECFAB] animate-pulse" />
                        <span>{t('auth.register.trusted')}</span>
                    </div>
                    <span>•</span>
                    <span>{t('auth.register.enterprise_security')}</span>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#FAF8F3] relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Create account" />

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
                            {t('auth.register.back_to_home')}
                        </Link>
                    </div>
                    <div className="bg-white border border-[#EEF0F4] rounded-2xl shadow-lg p-8 space-y-6">
                        <div className="text-center lg:text-left">
                            <h2 className="font-serif text-3xl font-bold text-[#0B1E3D]">{t('auth.register.title')}</h2>
                            <p className="text-[#3D5068] mt-2 text-sm">{t('auth.register.subtitle')}</p>
                        </div>
                        {status && (
                            <div className="p-4 rounded-lg bg-[#E6FAF6] border border-[#2ECFAB]/30 text-sm font-medium text-[#1A8C6F]">{status}</div>
                        )}

                            {/* Register Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (isSubmitting || form.processing) {
                                        return;
                                    }
                                    setIsSubmitting(true);
                                    form.post('/register', {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsSubmitting(false);
                                            form.reset('password', 'password_confirmation');
                                        },
                                        onError: (errors) => {
                                            console.error('Registration error:', errors);
                                            setIsSubmitting(false);
                                        },
                                        onCancel: () => {
                                            setIsSubmitting(false);
                                        },
                                        onFinish: () => {
                                            setIsSubmitting(false);
                                        },
                                    });
                                }}
                                className="space-y-5"
                            >
                                {(() => {
                                    const { processing, errors } = form;
                                    return (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium leading-none cursor-pointer">
                                                {t('auth.register.name_label')}
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={form.data.name}
                                                onChange={(e) => {
                                                    form.setData('name', e.target.value);
                                                    clearInertiaFieldError(form.clearErrors, 'name');
                                                }}
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder={t('auth.register.name_placeholder')}
                                                className="h-11 w-full border-[#EEF0F4] focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium leading-none cursor-pointer">
                                                {t('auth.register.email_label')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={form.data.email}
                                                onChange={(e) => {
                                                    form.setData('email', e.target.value);
                                                    clearInertiaFieldError(form.clearErrors, 'email');
                                                }}
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder={t('auth.register.email_placeholder')}
                                                className="h-11 w-full border-[#EEF0F4] focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium leading-none cursor-pointer">
                                                {t('auth.register.password_label')}
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={form.data.password}
                                                onChange={(e) => {
                                                    form.setData('password', e.target.value);
                                                    clearInertiaFieldError(form.clearErrors, 'password');
                                                }}
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder={t('auth.register.password_placeholder')}
                                                className="h-11 w-full border-[#EEF0F4] focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                            />
                                            <p className="text-xs text-[#3D5068]">{t('auth.register.password_hint')}</p>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium leading-none cursor-pointer">
                                                {t('auth.register.password_confirm_label')}
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={form.data.password_confirmation}
                                                onChange={(e) => {
                                                    form.setData('password_confirmation', e.target.value);
                                                    clearInertiaFieldError(form.clearErrors, 'password_confirmation');
                                                }}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder={t('auth.register.password_confirm_placeholder')}
                                                className="h-11 w-full border-[#EEF0F4] focus:ring-2 focus:ring-[#2ECFAB]/30 focus:border-[#2ECFAB]/50"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-[#2ECFAB] hover:bg-[#7EE8D0] text-[#0B1E3D] font-bold shadow-lg hover:shadow-xl transition-all"
                                            tabIndex={5}
                                            disabled={processing || isSubmitting}
                                            data-test="register-user-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    {t('auth.register.creating_account')}
                                                </>
                                            ) : (
                                                <>
                                                    {t('auth.register.create_account')}
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </Button>
                                    </>
                                    );
                                })()}
                            </form>

                            <div className="pt-4 border-t border-[#EEF0F4]">
                                <p className="text-center text-sm text-[#3D5068]">
                                    {t('auth.register.have_account')}{' '}
                                    <TextLink href={login()} className="text-[#2ECFAB] font-semibold hover:text-[#1A8C6F] hover:underline inline-flex items-center gap-1">
                                        {t('auth.register.sign_in')}
                                        <ArrowRight className="h-3 w-3" />
                                    </TextLink>
                                </p>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}
