import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';

type Props = {
    email: string;
    status?: string;
};

export default function ResetPassword({ email, status }: Props) {
    const form = useForm({
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/reset-password', {
            preserveScroll: true,
        });
    };

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

            {status && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center text-sm font-medium text-green-800 dark:text-green-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email
                                    </Label>
                            <Input
                                id="email"
                                type="email"
                        value={form.data.email}
                                readOnly
                                        className="h-10 w-full bg-muted"
                            />
                    <InputError message={form.errors.email} />
                        </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium leading-none">
                                        New Password
                                    </Label>
                            <Input
                                id="password"
                                type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                                autoComplete="new-password"
                                autoFocus
                                        placeholder="••••••••"
                                        className="h-10 w-full"
                        required
                            />
                    <InputError message={form.errors.password} />
                        </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium leading-none">
                                        Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                        value={form.data.password_confirmation}
                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="h-10 w-full"
                        required
                            />
                    <InputError message={form.errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={form.processing}
                            data-test="reset-password-button"
                        >
                    {form.processing ? (
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
            </form>
                </div>
            </div>
        </div>
    );
}
