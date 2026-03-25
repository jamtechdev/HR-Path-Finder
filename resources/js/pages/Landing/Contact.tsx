import { Head, Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const mailto = useMemo(() => {
        const subject = 'HR Pathfinder - Contact Us';
        const bodyLines = [
            `Name: ${name || '-'}`,
            `Email: ${email || '-'}`,
            `Company: ${company || '-'}`,
            '',
            'Message:',
            message || '-',
        ];

        return `mailto:contact@hrpathfinder.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            bodyLines.join('\n')
        )}`;
    }, [name, email, company, message]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        // No backend endpoint for this MVP contact page:
        // open the user’s email client with a pre-filled template.
        window.location.href = mailto;
    };

    return (
        <>
            <Head title="Contact Us" />
            <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#0B1E3D' }}>
                <div className="w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                            ← Back to Home
                        </Link>
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#2ECFAB]">
                            Contact Us
                        </span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
                        <div className="px-6 py-6 border-b border-white/10">
                            <h1 className="text-2xl font-extrabold text-white">Let’s talk</h1>
                            <p className="text-sm text-white/70 mt-2 leading-relaxed">
                                Fill this short form and we’ll open your email client with a pre-filled message.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="px-6 py-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Name</div>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="Your name"
                                    />
                                </label>

                                <label className="space-y-2 block">
                                    <div className="text-xs font-semibold text-white/70">Email</div>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="space-y-2 block">
                                <div className="text-xs font-semibold text-white/70">Company</div>
                                <input
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                    placeholder="Company name"
                                />
                            </label>

                            <label className="space-y-2 block">
                                <div className="text-xs font-semibold text-white/70">Message</div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#2ECFAB]/40"
                                    placeholder="Tell us what you need help with..."
                                    required
                                />
                            </label>

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                                <p className="text-xs text-white/60 leading-relaxed">
                                    By submitting, we’ll open your email app (no data is stored).
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center rounded-lg bg-[#2ECFAB] px-6 py-3.5 text-sm font-extrabold text-[#0B1E3D] hover:bg-[#7EE8D0] transition-all disabled:opacity-60"
                                >
                                    {submitting ? 'Opening...' : 'Send message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

