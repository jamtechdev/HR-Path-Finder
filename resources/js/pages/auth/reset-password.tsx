import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
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
                        Set a new password<br />
                        and secure your<br />
                        <span className="text-success">account.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Choose a strong password to protect your HR system design workspace.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>Secure reset</span>
                    <span>•</span>
                    <span>One-time link</span>
                    <span>•</span>
                    <span>Instant access</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
            <Head title="Reset password" />

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
                        <h2 className="text-2xl font-display font-bold">Reset password</h2>
                        <p className="text-muted-foreground mt-2">Please enter your new password below</p>
                    </div>

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                        className="space-y-4"
            >
                {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email
                                    </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                        className="h-10 w-full bg-muted"
                            />
                                    <InputError message={errors.email} />
                        </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium leading-none">
                                        New Password
                                    </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                        placeholder="••••••••"
                                        className="h-10 w-full"
                            />
                            <InputError message={errors.password} />
                        </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium leading-none">
                                        Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="h-10 w-full"
                            />
                                    <InputError message={errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                            Reset password
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                        </Button>
                            </>
                )}
            </Form>
                </div>
            </div>
        </div>
    );
}
