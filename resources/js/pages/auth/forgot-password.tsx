import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { email } from '@/routes/password';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
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
                        Reset your password<br />
                        and get back to<br />
                        <span className="text-success">designing.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>Secure password reset</span>
                    <span>•</span>
                    <span>Email verification</span>
                    <span>•</span>
                    <span>Quick recovery</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
            <Head title="Forgot password" />

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
                        <h2 className="text-2xl font-display font-bold">Forgot password?</h2>
                        <p className="text-muted-foreground mt-2">Enter your email to receive a password reset link</p>
                    </div>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

                    <Form {...email.form()} className="space-y-4">
                    {({ processing, errors }) => (
                        <>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email address
                                    </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                        placeholder="you@company.com"
                                        className="h-10 w-full"
                                />
                                <InputError message={errors.email} />
                            </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                    Email password reset link
                                        </>
                                    )}
                                </Button>
                        </>
                    )}
                </Form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <TextLink href={login()} className="text-primary font-medium hover:underline">
                            Sign in
                        </TextLink>
                    </p>
                </div>
            </div>
        </div>
    );
}
