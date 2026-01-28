import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    ChartColumn,
    Shield,
    Sparkles,
    Target,
    Users,
    Wallet,
} from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    const mainFeatures = [
        {
            icon: Building2,
            title: 'Organization Design',
            description:
                'Structure your company with functional, team-based, divisional, or matrix organizations.',
        },
        {
            icon: Target,
            title: 'Performance System',
            description:
                'Design KPI, MBO, OKR, or BSC-based performance evaluation frameworks.',
        },
        {
            icon: Wallet,
            title: 'Compensation System',
            description:
                'Build competitive pay structures with merit, incentives, and role-based differentiation.',
        },
        {
            icon: Users,
            title: 'CEO Philosophy',
            description:
                'Align HR systems with leadership style through structured management philosophy surveys.',
        },
    ];

    const whyFeatures = [
        'Sequential, consulting-grade workflow',
        'Rule-based recommendations (no AI guesswork)',
        'CEO and HR Manager collaboration',
        'Complete audit trail for all decisions',
        'Professional HR system dashboard',
        'Export-ready reports and policies',
    ];

    const capabilityFeatures = [
        {
            icon: Shield,
            title: 'Role-Based Access',
            description:
                'CEO, HR Manager, and Consultant each have specific permissions and views.',
        },
        {
            icon: ChartColumn,
            title: 'Visual Dashboard',
            description:
                'See your entire HR system at a glance with professional visualizations.',
        },
        {
            icon: Target,
            title: 'Logical Validation',
            description:
                'System blocks incompatible selections ensuring consistent HR design.',
        },
        {
            icon: Users,
            title: 'Collaborative Flow',
            description:
                'CEO and HR Manager work together with clear handoffs and approvals.',
        },
    ];

    return (
        <>
            <Head title="HR Path-Finder - Design your HR system with precision">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Enhanced Header */}
                <Header canRegister={canRegister} />

                {/* Hero Section - Exact Match */}
                <section className="pt-8 pb-4 px-4 sm:pt-32 sm:pb-20 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                                    <Sparkles className="size-4" />
                                    <span>Consulting-grade HR Design Platform</span>
                                </div>

                                {/* Main Heading */}
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-none text-foreground text-center sm:text-start">
                                    Design your <span className="text-primary">HR system</span> with precision
                                </h1>

                                {/* Description */}
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg text-center sm:text-start">
                                    Transform how SMBs build HR frameworks. Our step-by-step guided approach
                                    replicates professional consulting engagements inside a modern SaaS platform.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button asChild size="lg" className="h-12 has-[>svg]:px-8">
                                        <Link href={canRegister ? register() : login()}>
                                            Start Free Trial
                                            <ArrowRight className="ml-2 size-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="h-12 px-8">
                                        <Link href="#demo">Watch Demo</Link>
                                    </Button>
                                </div>

                                {/* Social Proof */}
                                <div className="flex items-center gap-6 pt-4">
                                    <div className="flex -space-x-2">
                                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                                            <div
                                                key={i}
                                                className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                                            >
                                                {letter}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">100+ companies</span>
                                        <span className="text-muted-foreground"> trust HR Path-Finder</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - HR System Overview Card */}
                            <div className="relative">
                                <div className="absolute inset-0 gradient-primary opacity-10 rounded-3xl blur-3xl"></div>
                                <Card className="relative overflow-hidden border-2 shadow-sm p-0">
                                    {/* Gradient Header */}
                                    <div className="gradient-hero p-6 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-white/70">
                                                HR System Overview
                                            </span>
                                            <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium">
                                                4/4 Complete
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { id: 1, name: 'Diagnosis' },
                                                { id: 2, name: 'Organization' },
                                                { id: 3, name: 'Performance' },
                                                { id: 4, name: 'Compensation' },
                                            ].map((step) => (
                                                <div
                                                    key={step.id}
                                                    className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="size-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            Step {step.id}: {step.name}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-white/60">Completed</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="p-6 space-y-4 bg-card">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">CEO Alignment</span>
                                            <span className="font-semibold text-success">High</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-success rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Your HR system design aligns well with CEO management philosophy
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Features Section */}
                <section className="py-6 sm:py-20 px-6 bg-muted/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                                Everything you need to build a complete HR system
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Our platform guides you through each step with consulting-grade logic and
                                rule-based recommendations.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mainFeatures.map((feature, index) => (
                                <Card key={index} className="card-hover border shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                                            <feature.icon className="size-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why HR Path-Finder Section */}
                <section className="py-6 sm:py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Side */}
                            <div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                                    Why HR Path-Finder?
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    We replicate the structured approach of professional HR consulting, making
                                    it accessible to companies without dedicated HR planning teams.
                                </p>
                                <div className="grid gap-4">
                                    {whyFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="size-4 text-success" />
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Right Side - 2x2 Grid */}
                            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                                {capabilityFeatures.map((feature, index) => (
                                    <Card
                                        key={index}
                                        className={`card-hover border shadow-sm ${index === 1 || index === 3 ? 'mt-8' : ''}`}
                                    >
                                        <CardContent className="p-6 space-y-3">
                                            <feature.icon
                                                className={`size-10 ${
                                                    index === 0
                                                        ? 'text-primary'
                                                        : index === 1
                                                          ? 'text-success'
                                                          : index === 2
                                                            ? 'text-accent'
                                                            : 'text-warning'
                                                }`}
                                            />
                                            <h3 className="font-semibold">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-6 md:py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <Card className="gradient-primary overflow-hidden border-0 shadow-sm">
                            <CardContent className="p-8 md:p-12 text-center text-white">
                                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                                    Ready to design your HR system?
                                </h2>
                                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                                    Start your free trial today and experience consulting-grade HR design that
                                    scales from prototype to full implementation.
                                </p>
                                <Button asChild size="lg" variant="secondary" className="h-12 has-[>svg]:px-8 bg-white text-foreground hover:bg-white/90">
                                    <Link href={canRegister ? register() : '#'}>
                                        Get Started Free
                                        <ArrowRight className="ml-2 size-5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Enhanced Footer */}
                <Footer canRegister={canRegister} />
            </div>
        </>
    );
}
