import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, Shield, RotateCcw, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PageProps {
    email: string;
    status?: string;
}

export default function VerifyOtp({ email, status }: PageProps) {
    const form = useForm({
        email: email || '',
        otp: '',
    });

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Update form data
        form.setData('otp', newOtpDigits.join(''));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtpDigits(digits);
            form.setData('otp', pastedData);
            inputRefs.current[5]?.focus();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/verify-otp', {
            preserveScroll: true,
        });
    };

    const handleResend = () => {
        router.post('/resend-otp', {}, {
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
                        Verify your<br />
                        identity with<br />
                        <span className="text-success">OTP code.</span>
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Enter the 6-digit code sent to your email address to continue with password reset.
                    </p>
                </div>
                <div className="flex items-center gap-8 text-white/50 text-sm">
                    <span>🔐 Secure verification</span>
                    <span>•</span>
                    <span>10-minute validity</span>
                    <span>•</span>
                    <span>One-time use</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Head title="Verify OTP" />

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
                        <h2 className="text-2xl font-display font-bold">Verify OTP</h2>
                        <p className="text-muted-foreground mt-2">
                            Enter the 6-digit code sent to <strong>{email}</strong>
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center text-sm font-medium text-green-800 dark:text-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* OTP Input Fields */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium leading-none text-center block">
                                Enter 6-digit OTP
                            </Label>
                            <div className="flex justify-center gap-2">
                                {otpDigits.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="h-14 w-14 text-center text-2xl font-bold border-2 focus:border-primary"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                            <InputError message={form.errors.otp} />
                            <input type="hidden" name="email" value={email} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            disabled={form.processing || otpDigits.join('').length !== 6}
                        >
                            {form.processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Verify OTP
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResend}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resend OTP
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Didn't receive the code? Check your spam folder or{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-primary font-medium hover:underline"
                            >
                                resend OTP
                            </button>
                        </p>

                        <p className="text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <TextLink href={login()} className="text-primary font-medium hover:underline">
                                Sign in
                            </TextLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
