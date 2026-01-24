import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Briefcase, User } from 'lucide-react';
import { useState } from 'react';

type Props = {
    status?: string;
};

export default function Register({ status }: Props) {
    const [selectedRole, setSelectedRole] = useState<'hr_manager' | 'ceo' | null>(null);

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
                        Join HR Path-Finder<br />
                        and design your system<br />
                        <span className="text-success">today.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Start your journey towards a professional HR system. Choose your role and complete the setup to begin.
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

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Head title="Create account" />

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

                    {!selectedRole ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center lg:text-left">
                                <h2 className="text-2xl font-display font-bold">Choose your role</h2>
                                <p className="text-muted-foreground mt-2">Select how you will use HR Path-Finder</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setSelectedRole('hr_manager')}
                                    className="group relative flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <Briefcase className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-foreground">HR Manager</h3>
                                        <p className="text-sm text-muted-foreground">Design and manage the HR system</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </button>

                                <button
                                    onClick={() => setSelectedRole('ceo')}
                                    className="group relative flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <User className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-foreground">CEO / Owner</h3>
                                        <p className="text-sm text-muted-foreground">Review and approve HR strategy</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <TextLink href={login()} className="text-primary font-medium hover:underline">
                                    Sign in
                                </TextLink>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Back to role selection
                            </button>

                            <div className="text-center lg:text-left">
                                <h2 className="text-2xl font-display font-bold">Create account</h2>
                                <p className="text-muted-foreground mt-2">
                                    Registering as <span className="text-primary font-bold capitalize">{selectedRole.replace('_', ' ')}</span>
                                </p>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className="mb-4 text-center text-sm font-medium text-green-600">
                                    {status}
                                </div>
                            )}

                            {/* Register Form */}
            <Form
                {...store.form()}
                                data={{ role: selectedRole }}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium leading-none">
                                                Full Name
                                            </Label>
                                <Input
                                    id="name"
                                    type="text"
                                                name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                                placeholder="John Doe"
                                                className="h-10 w-full"
                                />
                                            <InputError message={errors.name} />
                            </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium leading-none">
                                                Email address
                                            </Label>
                                <Input
                                    id="email"
                                    type="email"
                                                name="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                                placeholder="you@company.com"
                                                className="h-10 w-full"
                                />
                                <InputError message={errors.email} />
                            </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium leading-none">
                                                Password
                                            </Label>
                                <Input
                                    id="password"
                                    type="password"
                                                name="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
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
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                                placeholder="••••••••"
                                                className="h-10 w-full"
                                />
                                            <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                tabIndex={5}
                                            disabled={processing}
                                data-test="register-user-button"
                            >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Creating account...
                                                </>
                                            ) : (
                                                <>
                                Create account
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                            </Button>
                    </>
                )}
            </Form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
