import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <div className="min-h-screen gradient-hero flex">
            {/* Left Side - Promotional Section */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <span className="text-white font-bold">HR</span>
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold">HR Path-Finder</h1>
                            <p className="text-white/60 text-sm">by BetterCompany</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <h2 className="font-display text-4xl font-bold leading-tight">
                        Verify your email<br />
                        to unlock full<br />
                        <span className="text-success">access.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        We've sent a verification link to your email. Click it to complete your registration and start designing your HR system.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>Email verification</span>
                    <span>•</span>
                    <span>Secure access</span>
                    <span>•</span>
                    <span>Quick setup</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
            <Head title="Email verification" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold">HR</span>
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold">HR Path-Finder</h1>
                            <p className="text-muted-foreground text-sm">by BetterCompany</p>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-display font-bold">Verify your email</h2>
                        <p className="text-muted-foreground mt-2">Please verify your email address by clicking on the link we just emailed to you.</p>
                    </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                            A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

                    <Form {...send.form()} className="space-y-4">
                {({ processing }) => (
                    <>
                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                    disabled={processing}
                                >
                                    {processing ? (
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

                        <TextLink
                            href={logout()}
                                    className="block text-center text-sm text-primary font-medium hover:underline"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
                </div>
            </div>
        </div>
    );
}
