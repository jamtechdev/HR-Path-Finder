import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

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
                        Design your HR system<br />
                        with consulting-grade<br />
                        <span className="text-success">precision.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Transform your HR strategy with our step-by-step guided approach. Build organization structures, performance systems, and compensation frameworks.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>Trusted by 100+ companies</span>
                    <span>•</span>
                    <span>Consulting-grade logic</span>
                    <span>•</span>
                    <span>No AI guesswork</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Head title="Sign in" />

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
                        <h2 className="text-2xl font-display font-bold">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Sign in to continue your HR system design</p>
                    </div>

                    {/* Login Form */}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
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
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                        placeholder="you@company.com"
                                        className="h-10 w-full"
                                />
                                <InputError message={errors.email} />
                            </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium leading-none">
                                            Password
                                        </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                                className="text-sm text-primary hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-10 w-full"
                                />
                                <InputError message={errors.password} />
                            </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                    tabIndex={3}
                                disabled={processing}
                                data-test="login-button"
                            >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                            </Button>
                    </>
                )}
            </Form>

                    {canRegister && (
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                className="text-primary font-medium hover:underline"
                                tabIndex={4}
                            >
                                Create account
                            </TextLink>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
