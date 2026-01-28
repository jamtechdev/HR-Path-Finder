import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Briefcase, User, CheckCircle2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

type Props = {
    status?: string;
};

export default function Register({ status }: Props) {
    const [selectedRole, setSelectedRole] = useState<'hr_manager' | 'ceo' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });
    
    // Update form role when selectedRole changes
    useEffect(() => {
        if (selectedRole) {
            form.setData('role', selectedRole);
        }
    }, [selectedRole]);

    const handleRoleSelect = (role: 'hr_manager' | 'ceo') => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedRole(role);
            setIsAnimating(false);
        }, 150);
    };

    const handleBack = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedRole(null);
            setIsAnimating(false);
        }, 150);
    };

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
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 cursor-pointer">
                            <Sparkles className="w-6 h-6 text-white" />
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
                            Join HR Path-Finder<br />
                            <span className="text-success drop-shadow-lg">Design Your Future</span>
                        </h2>
                        <p className="text-white/80 text-lg max-w-md leading-relaxed">
                            Transform your HR strategy with our step-by-step guided approach. Build organization structures, performance systems, and compensation frameworks with consulting-grade precision.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Step-by-step guided process</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Consulting-grade logic & methodology</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <span className="text-sm">Real-time collaboration & approval</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8 text-white/60 text-sm animate-in fade-in slide-in-from-left-4 duration-1000 delay-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span>Trusted by 100+ companies</span>
                    </div>
                    <span>•</span>
                    <span>Enterprise-grade security</span>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background/95 backdrop-blur-sm relative z-10">
                <div className="w-full max-w-md">
                    <Head title="Create account" />

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg cursor-pointer">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold">HR Path-Finder</h1>
                            <p className="text-muted-foreground text-sm">by BetterCompany</p>
                        </div>
                    </div>

                    {!selectedRole ? (
                        <div className={`bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                            <div className="text-center lg:text-left animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                                    Choose your role
                                </h2>
                                <p className="text-muted-foreground mt-2 text-sm">Select how you will use HR Path-Finder</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 delay-150">
                                <button
                                    onClick={() => handleRoleSelect('hr_manager')}
                                    className="group relative flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                                >
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                                        <Briefcase className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-6" />
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="font-bold text-lg text-foreground mb-1">HR Manager</h3>
                                        <p className="text-sm text-muted-foreground">Design and manage the HR system</p>
                                    </div>
                                    <ArrowRight className="relative h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                                </button>

                                <button
                                    onClick={() => handleRoleSelect('ceo')}
                                    className="group relative flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                                >
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                                        <User className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-6" />
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="font-bold text-lg text-foreground mb-1">CEO / Owner</h3>
                                        <p className="text-sm text-muted-foreground">Review and approve HR strategy</p>
                                    </div>
                                    <ArrowRight className="relative h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <TextLink 
                                        href={login()} 
                                        className="text-primary font-semibold hover:text-primary/80 transition-all duration-200 hover:underline cursor-pointer inline-flex items-center gap-1"
                                    >
                                        Sign in
                                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    </TextLink>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={`bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}>
                            <button
                                onClick={handleBack}
                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200 group cursor-pointer w-fit"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
                                Back to role selection
                            </button>

                            <div className="text-center lg:text-left animate-in fade-in slide-in-from-right-4 delay-100">
                                <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                                    Create account
                                </h2>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Registering as <span className="text-primary font-bold capitalize px-2 py-1 rounded-md bg-primary/10">{selectedRole.replace('_', ' ')}</span>
                                </p>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center text-sm font-medium text-success animate-in fade-in slide-in-from-top-4">
                                    {status}
                                </div>
                            )}

                            {/* Register Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.post(store.url(), {
                                        onSuccess: () => {
                                            form.reset('password', 'password_confirmation');
                                        },
                                    });
                                }}
                                className="space-y-5"
                            >
                                {(() => {
                                    const { processing, errors } = form;
                                    return (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium leading-none cursor-pointer">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="John Doe"
                                                className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium leading-none cursor-pointer">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={form.data.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="you@company.com"
                                                className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium leading-none cursor-pointer">
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={form.data.password}
                                                onChange={(e) => form.setData('password', e.target.value)}
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium leading-none cursor-pointer">
                                                Confirm Password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={form.data.password_confirmation}
                                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                className="h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-text"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
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
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </Button>
                                    </>
                                    );
                                })()}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
