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
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap } from 'lucide-react';

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
        <div className="min-h-screen gradient-hero flex relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Left Side - Promotional Section */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative z-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                            HR
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-white/70 text-sm">by BetterCompany</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                    <div>
                        <h2 className="font-display text-5xl font-bold leading-tight mb-4">
                            Design your HR system<br />
                            with <span className="text-success drop-shadow-lg">consulting-grade</span><br />
                            precision.
                        </h2>
                        <p className="text-white/80 text-lg max-w-md leading-relaxed">
                            Transform your HR strategy with our step-by-step guided approach. Build organization structures, performance systems, and compensation frameworks.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Fast & intuitive workflow</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Enterprise-grade security</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Real-time collaboration</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8 text-white/60 text-sm animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span>Trusted by 100+ companies</span>
                    </div>
                    <span>•</span>
                    <span>Consulting-grade logic</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background/95 backdrop-blur-sm relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Sign in" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg cursor-pointer text-white">
                            HR
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-muted-foreground text-sm">by BetterCompany</p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-display font-bold">
                                Welcome back
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">Sign in to continue your HR system design</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center text-sm font-medium text-success animate-in fade-in slide-in-from-top-4">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium leading-none cursor-pointer">
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
                                            className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium leading-none cursor-pointer">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-all duration-200 hover:underline cursor-pointer"
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
                                            className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
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
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>

                        {canRegister && (
                            <div className="pt-4 border-t border-border">
                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="text-primary font-semibold hover:text-primary/80 transition-all duration-200 hover:underline cursor-pointer inline-flex items-center gap-1"
                                        tabIndex={4}
                                    >
                                        Create account
                                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    </TextLink>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
