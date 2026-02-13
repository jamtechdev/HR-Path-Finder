import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logout } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import { Mail, ArrowRight, AlertCircle, Settings, CheckCircle } from 'lucide-react';
import React from 'react';

export default function VerifyEmail({ status, smtpConfigured = true }: { status?: string; smtpConfigured?: boolean }) {
    const [isVerifying, setIsVerifying] = React.useState(false);
    const form = useForm({});
    
    const handleManualVerify = () => {
        if (confirm('Are you sure you want to manually verify your email? This option is only available when SMTP is not configured.')) {
            setIsVerifying(true);
            router.post('/email/verify-manual', {}, {
                onSuccess: () => {
                    setIsVerifying(false);
                },
                onError: () => {
                    setIsVerifying(false);
                },
            });
        }
    };
    
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
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                            <span className="text-white font-bold text-lg">HR</span>
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-white/70 text-sm">by BetterCompany</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg border border-white/20">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="font-display text-5xl font-bold leading-tight mb-4">
                            Verify your email<br />
                            to unlock full<br />
                            <span className="text-success drop-shadow-lg">access.</span>
                        </h2>
                        <p className="text-white/80 text-lg max-w-md leading-relaxed">
                            We've sent a verification link to your email. Click it to complete your registration and start designing your HR system with consulting-grade precision.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Secure email verification</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Quick and easy setup</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Instant access to dashboard</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8 text-white/60 text-sm animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span>Email verification</span>
                    </div>
                    <span>•</span>
                    <span>Secure access</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 lg:flex-shrink-0 flex items-center justify-center p-6 md:p-12 bg-background/95 backdrop-blur-sm relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Email verification" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg cursor-pointer text-white">
                            <span className="text-white font-bold">HR</span>
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-muted-foreground text-sm">by BetterCompany</p>
                        </div>
                    </div>

                    {/* Verification Card */}
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* Header */}
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-display font-bold">
                                Check your email
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                We've sent a verification link to your email address. Click the link in the email to verify your account.
                            </p>
                        </div>

                        {/* Success Message */}
                        {status === 'verification-link-sent' && (
                            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center text-sm font-medium text-success animate-in fade-in slide-in-from-top-4">
                                <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                                A new verification link has been sent to your email address.
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="rounded-lg bg-muted/40 p-5 border border-border">
                            <p className="text-sm font-semibold mb-2">What happens next?</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                                    <span>Check your inbox for the verification email</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                                    <span>Click the "Verify Email Address" button</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                                    <span>Get instant access to your dashboard</span>
                                </li>
                            </ul>
                        </div>

                        {/* SMTP Configuration Warning */}
                        {!smtpConfigured && (
                            <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <AlertDescription className="space-y-3">
                                    <div>
                                        <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                            SMTP Configuration Required
                                        </p>
                                        <p className="text-sm text-orange-800 dark:text-orange-200">
                                            Email services are not configured. Verification emails cannot be sent until SMTP settings are configured.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => {
                                                router.visit('/settings?tab=smtp');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-orange-600 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/30"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure SMTP Settings
                                        </Button>
                                        <Button
                                            onClick={handleManualVerify}
                                            variant="outline"
                                            size="sm"
                                            disabled={isVerifying}
                                            className="w-full border-green-800 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900/30"
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <Spinner className="w-4 h-4 mr-2" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Verify Email Manually
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Resend Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post('/email/verification-notification', {
                                    preserveScroll: true,
                                });
                            }}
                            className="space-y-4"
                        >
                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                disabled={form.processing}
                            >
                                {form.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Resend verification email
                                    </>
                                )}
                            </Button>

                            <div className="pt-4 border-t border-border">
                                <TextLink
                                    href={logout()}
                                    className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Log out and use a different account
                                </TextLink>
                            </div>
                        </form>

                        {/* Security Note */}
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                            <p className="text-xs text-destructive font-medium">
                                🔒 Security Note: If you did not create an account, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
