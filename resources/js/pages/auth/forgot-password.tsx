import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowRight, Mail, Shield, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { login, home } from '@/routes';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const form = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/forgot-password', {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen gradient-hero flex">
            {/* Left Side - Promotional Section */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
                <div>
                    <Link href={home()} className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <span className="text-white font-bold">HR</span>
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold">{t('auth.brand_title_hyphen', 'HR Path-Finder')}</h1>
                            <p className="text-white/60 text-sm">{t('auth.brand_by', 'by BetterCompany')}</p>
                        </div>
                    </Link>
                </div>
                <div className="space-y-6">
                    <h2 className="font-display text-4xl font-bold leading-tight">
                        {t('auth_forgot_password.hero_line_1')}<br />
                        {t('auth_forgot_password.hero_line_2')}<br />
                        <span className="text-success">{t('auth_forgot_password.hero_highlight')}</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        {t('auth_forgot_password.hero_description')}
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>{t('auth_forgot_password.footer_security')}</span>
                    <span>•</span>
                    <span>{t('auth_forgot_password.footer_validity')}</span>
                    <span>•</span>
                    <span>{t('auth_forgot_password.footer_one_time')}</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-muted">
                <div className="w-full max-w-md space-y-8">
            <Head title={t('auth_forgot_password.page_title')} />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0a1629] flex items-center justify-center">
                                <span className="text-white font-bold">HR</span>
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-bold">{t('auth.brand_title_hyphen', 'HR Path-Finder')}</h1>
                                <p className="text-muted-foreground text-sm">{t('auth.brand_by', 'by BetterCompany')}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Back to Home Link */}
                    <div className="mb-4">
                        <Link href={home()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {t('auth_forgot_password.back_to_home')}
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-8 space-y-6 text-center lg:text-left">
                        <h2 className="text-2xl font-display font-bold mb-0">{t('auth_forgot_password.heading')}</h2>
                        <p className="text-muted-foreground mt-2">{t('auth_forgot_password.subheading')}</p>
                    

            {status && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center text-sm font-medium text-green-800 dark:text-green-200">
                    {status}
                </div>
            )}

                    <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none">
                                        {t('auth_forgot_password.email_label')}
                                    </Label>
                                <Input
                                    id="email"
                                    type="email"
                                value={form.data.email}
                                onChange={(e) => {
                                    form.setData('email', e.target.value);
                                    clearInertiaFieldError(form.clearErrors, 'email');
                                }}
                                autoComplete="email"
                                    autoFocus
                                        placeholder={t('auth_forgot_password.email_placeholder')}
                                        className="h-10 w-full"
                                required
                                />
                            <InputError message={form.errors.email} />
                            </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-[#2ECFAB] hover:bg-[#7EE8D0] text-[#0B1E3D] font-medium"
                            disabled={form.processing}
                                >
                            {form.processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                    {t('auth_forgot_password.sending_otp')}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                    {t('auth_forgot_password.send_otp')}
                                        </>
                                    )}
                                </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        {t('auth_forgot_password.remember_password')}{' '}
                        <TextLink href={login()} className="text-[#2ECFAB] font-medium hover:underline">
                            {t('auth_forgot_password.sign_in')}
                        </TextLink>
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
}
