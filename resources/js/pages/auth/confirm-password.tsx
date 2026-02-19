import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { home } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ConfirmPassword() {
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
                        Confirm your password<br />
                        to access secure<br />
                        <span className="text-success">features.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        This is a secure area of the application. Please confirm your password before continuing.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>Secure confirmation</span>
                    <span>•</span>
                    <span>Protected access</span>
                    <span>•</span>
                    <span>Privacy first</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
            <Head title="Confirm password" />

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
                        <h2 className="text-2xl font-display font-bold">Confirm your password</h2>
                        <p className="text-muted-foreground mt-2">This is a secure area. Please confirm your password before continuing.</p>
                    </div>

                    <Form {...store.form()} resetOnSuccess={['password']} className="space-y-4">
                {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium leading-none">
                                        Password
                                    </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                        placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
                                        className="h-10 w-full"
                            />
                            <InputError message={errors.password} />
                        </div>

                            <Button
                                    type="submit"
                                    className="w-full h-10 bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                Confirm password
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
