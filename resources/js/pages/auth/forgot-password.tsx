import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, home } from '@/routes';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowRight, Mail, Shield, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
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
                            <h1 className="font-display text-xl font-bold">HR Path-Finder</h1>
                            <p className="text-white/60 text-sm">by BetterCompany</p>
                        </div>
                    </Link>
                </div>
                <div className="space-y-6">
                    <h2 className="font-display text-4xl font-bold leading-tight">
                        Reset your password<br />
                        with secure<br />
                        <span className="text-success">OTP verification.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Enter your email address and we'll send you a 6-digit OTP code to reset your password securely.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>🔐 OTP-based security</span>
                    <span>•</span>
                    <span>10-minute validity</span>
                    <span>•</span>
                    <span>One-time use</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
            <Head title="Forgot password" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
                        <Link href={home()} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0a1629] flex items-center justify-center">
                                <span className="text-white font-bold">HR</span>
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-bold">HR Path-Finder</h1>
                                <p className="text-muted-foreground text-sm">by BetterCompany</p>
                            </div>
                        </Link>
                    </div>

                    {/* Back to Home Link */}
                    <div className="mb-4">
                        <Link href={home()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-display font-bold">Forgot password?</h2>
                        <p className="text-muted-foreground mt-2">Enter your email to receive a 6-digit OTP code</p>
                    </div>

            {status && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center text-sm font-medium text-green-800 dark:text-green-200">
                    {status}
                </div>
            )}

                    <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email address
                                    </Label>
                                <Input
                                    id="email"
                                    type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                autoComplete="email"
                                    autoFocus
                                        placeholder="you@company.com"
                                        className="h-10 w-full"
                                required
                                />
                            <InputError message={form.errors.email} />
                            </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium"
                            disabled={form.processing}
                                >
                            {form.processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                    Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                    Send OTP Code
                                        </>
                                    )}
                                </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <TextLink href={login()} className="text-[#0a1629] font-medium hover:underline">
                            Sign in
                        </TextLink>
                    </p>
                </div>
            </div>
        </div>
    );
}
