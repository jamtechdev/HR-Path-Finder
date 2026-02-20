import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home } from '@/routes';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Shield, Lock, Settings, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function AdminLogin({
    status,
    canResetPassword,
}: Props) {
    const { t } = useTranslation();
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <Head title="Admin Login" />

                {/* Back to Home Link */}
                <div className="mb-6">
                    <Link 
                        href={home()} 
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('auth.login.back_to_home', 'Back to Home')}
                    </Link>
                </div>

                {/* Admin Login Card */}
                <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {t('auth.login.admin_title', 'Admin Portal')}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {t('auth.login.admin_subtitle', 'Sign in to access the administration panel')}
                            </p>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-sm font-medium text-green-400">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.transform((data) => ({
                                ...data,
                                _admin_login: true, // Flag to indicate admin login
                            })).post('/login', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    form.reset('password');
                                },
                            });
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                                {t('auth.login.email_label', 'Email Address')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder={t('auth.login.email_placeholder', 'admin@example.com')}
                                className="h-12 w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                                    {t('auth.login.password_label', 'Password')}
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        {t('auth.login.forgot_password', 'Forgot password?')}
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="h-12 w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-slate-800"
                            />
                            <Label htmlFor="remember" className="ml-2 text-sm text-slate-300 cursor-pointer">
                                {t('auth.login.remember_me', 'Remember me')}
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    {t('auth.login.signing_in', 'Signing in...')}
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 w-4 h-4" />
                                    {t('auth.login.sign_in', 'Sign In')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Security Notice */}
                    <div className="pt-4 border-t border-slate-700/50">
                        <div className="flex items-start gap-3 text-xs text-slate-400">
                            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                                {t('auth.login.admin_security_notice', 'This is a restricted area. Only authorized administrators are allowed to access this portal.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-slate-400">
                    <p>
                        {t('auth.login.admin_footer', 'HR Pathfinder Admin Portal')} &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
