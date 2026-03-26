import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

export default function Contact() {
    const { flash } = usePage().props as any;
    const lastShownMessage = useRef<string>('');
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        manager_name: '',
        manager_email: '',
        phone: '',
        inquiry: '',
        agreed_personal_information: false,
    });

    useEffect(() => {
        const successMessage = String(flash?.success ?? '').trim();
        if (!successMessage || lastShownMessage.current === successMessage) {
            return;
        }
        lastShownMessage.current = successMessage;
        toast({
            title: successMessage,
            variant: 'warning',
            duration: 7000,
        });
    }, [flash?.success]);

    const bgImageStyle = useMemo(
        () => ({
            backgroundImage: "url('/contact-us.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }),
        [],
    );

    return (
        <>
            <Head title="Contact Us" />
            <LandingNav />
            <Toaster />
            <div className="min-h-screen px-4 pt-24 pb-14" style={{ background: '#0B1E3D' }}>
                <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Left: image hero */}
                    <div className="relative rounded-2xl overflow-hidden h-64 lg:h-auto" style={bgImageStyle}>
                        <div className="absolute inset-0 bg-[#0B1E3D]/35" />
                        <div className="absolute left-8 top-10">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#2ECFAB]">
                                Contact Us
                            </div>
                            <h1 className="mt-4 text-4xl font-extrabold text-white leading-tight">
                                Better Company is with you.
                            </h1>
                            <p className="mt-3 text-white/70 text-sm max-w-[380px] leading-relaxed">
                                Tell us what you need and we will contact you.
                            </p>
                        </div>
                    </div>

                    {/* Right: form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
                        <div className="px-6 py-6 border-b border-white/10">
                            <div className="flex items-center justify-between gap-4">
                                <Link href="/" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                                    ← Back to Home
                                </Link>
                                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#2ECFAB]">
                                    Contact Us
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/contact', {
                                    onSuccess: () => {
                                        reset();
                                    },
                                });
                            }}
                            className="px-6 py-6 space-y-5"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Company Name</div>
                                    <input
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="Company name"
                                        required
                                    />
                                    {errors.company_name && <div className="text-xs text-red-300">{String(errors.company_name)}</div>}
                                </label>

                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Manager Name</div>
                                    <input
                                        value={data.manager_name}
                                        onChange={(e) => setData('manager_name', e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="Manager name"
                                        required
                                    />
                                    {errors.manager_name && <div className="text-xs text-red-300">{String(errors.manager_name)}</div>}
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Email</div>
                                    <input
                                        value={data.manager_email}
                                        onChange={(e) => setData('manager_email', e.target.value)}
                                        type="email"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="you@company.com"
                                        required
                                    />
                                    {errors.manager_email && <div className="text-xs text-red-300">{String(errors.manager_email)}</div>}
                                </label>

                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Phone (optional)</div>
                                    <input
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="Phone number"
                                    />
                                    {errors.phone && <div className="text-xs text-red-300">{String(errors.phone)}</div>}
                                </label>
                            </div>

                            <label className="space-y-2 block">
                                <div className="text-xs font-semibold text-white/70">Inquiry</div>
                                <textarea
                                    value={data.inquiry}
                                    onChange={(e) => setData('inquiry', e.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                    placeholder="Tell us what you need..."
                                    required
                                />
                                {errors.inquiry && <div className="text-xs text-red-300">{String(errors.inquiry)}</div>}
                            </label>

                            <label className="flex items-start gap-3 pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.agreed_personal_information}
                                    onChange={(e) => setData('agreed_personal_information', e.target.checked)}
                                    className="mt-1"
                                />
                                <span className="text-xs text-white/70 leading-relaxed">
                                    I agree to the collection and use of personal information.
                                </span>
                            </label>
                            {errors.agreed_personal_information && (
                                <div className="text-xs text-red-300">{String(errors.agreed_personal_information)}</div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Your message will be stored and visible to admin.
                                </p>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    onClick={() => {
                                        // reset happens in onSuccess below
                                    }}
                                    className="inline-flex items-center justify-center rounded-lg bg-[#2ECFAB] px-6 py-3.5 text-sm font-extrabold text-[#0B1E3D] hover:bg-[#7EE8D0] transition-all disabled:opacity-60"
                                >
                                    {processing ? 'Submitting...' : 'Contact Us'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

