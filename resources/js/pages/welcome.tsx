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
    Play,
    DollarSign,
    BookOpen,
    FileText,
    Video,
    HelpCircle,
    Zap,
    TrendingUp,
    Award,
    Clock,
    CheckCircle,
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import React, { useRef, useEffect, useState } from 'react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const page = usePage<SharedData>();
    const auth = page?.props?.auth || { user: null };
    
    const heroRef = useRef<HTMLElement>(null);
    const featuresRef = useRef<HTMLElement>(null);
    const whyRef = useRef<HTMLElement>(null);
    const howItWorksRef = useRef<HTMLElement>(null);
    const pricingRef = useRef<HTMLElement>(null);
    const resourcesRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle anchor navigation on page load
    useEffect(() => {
        if (mounted && window.location.hash) {
            const hash = window.location.hash;
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                    });
                }, 100);
            }
        }
    }, [mounted]);

    // Use scroll hooks safely - they should work in browser context
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
    const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
    const whyInView = useInView(whyRef, { once: true, margin: '-100px' });
    const howItWorksInView = useInView(howItWorksRef, { once: true, margin: '-50px' });
    const pricingInView = useInView(pricingRef, { once: true, margin: '-50px' });
    const resourcesInView = useInView(resourcesRef, { once: true, margin: '-50px' });
    const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

    // Prevent hydration mismatch - show loading state initially
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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

    const howItWorksSteps = [
        {
            step: 1,
            title: 'Diagnosis',
            description:
                'Complete comprehensive business profile, workforce analysis, and current HR assessment to understand your organization.',
            icon: Building2,
        },
        {
            step: 2,
            title: 'Organization Design',
            description:
                'Structure your company with functional, team-based, divisional, or matrix organizational models.',
            icon: Users,
        },
        {
            step: 3,
            title: 'Performance System',
            description:
                'Design KPI, MBO, OKR, or BSC-based performance evaluation frameworks tailored to your needs.',
            icon: Target,
        },
        {
            step: 4,
            title: 'Compensation System',
            description:
                'Build competitive pay structures with merit, incentives, and role-based differentiation.',
            icon: Wallet,
        },
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            price: '$99',
            period: '/month',
            description: 'Perfect for small businesses getting started',
            features: [
                '1 HR Project',
                'Up to 50 employees',
                'Basic HR system design',
                'Email support',
                'Standard reports',
            ],
            popular: false,
        },
        {
            name: 'Professional',
            price: '$299',
            period: '/month',
            description: 'Ideal for growing companies',
            features: [
                '3 HR Projects',
                'Up to 200 employees',
                'Advanced HR system design',
                'Priority support',
                'Advanced reports & exports',
                'CEO Philosophy alignment',
            ],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations with complex needs',
            features: [
                'Unlimited HR Projects',
                'Unlimited employees',
                'Full consulting-grade features',
                'Dedicated support',
                'Custom integrations',
                'White-label options',
                'Training & onboarding',
            ],
            popular: false,
        },
    ];

    const resourcesItems = [
        {
            title: 'Getting Started Guide',
            description: 'Learn how to set up your first HR system design project',
            icon: BookOpen,
            type: 'Guide',
        },
        {
            title: 'Video Tutorials',
            description: 'Watch step-by-step video guides for each module',
            icon: Video,
            type: 'Video',
        },
        {
            title: 'Best Practices',
            description: 'Discover industry best practices for HR system design',
            icon: Award,
            type: 'Article',
        },
        {
            title: 'Case Studies',
            description: 'See how other companies have successfully implemented HR systems',
            icon: FileText,
            type: 'Case Study',
        },
        {
            title: 'FAQ',
            description: 'Find answers to commonly asked questions',
            icon: HelpCircle,
            type: 'FAQ',
        },
        {
            title: 'API Documentation',
            description: 'Integrate HR Path-Finder with your existing systems',
            icon: FileText,
            type: 'Documentation',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 1, y: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    };

    return (
        <>
            <Head title="HR Path-Finder - Design your HR system with precision">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background overflow-hidden scroll-smooth">
                {/* Animated Background Gradient */}
                <motion.div
                    className="fixed inset-0 -z-10"
                    style={{ opacity }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10" />
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.div>

                {/* Enhanced Header */}
                <Header canRegister={canRegister} />

                {/* Hero Section - Matched to Reference */}
                <section ref={heroRef as React.RefObject<HTMLElement>} className="pt-24 pb-4 px-4 sm:pt-32 sm:pb-20 sm:px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column */}
                            <motion.div
                                className="space-y-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Badge */}
                                <motion.div
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-800"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <Sparkles className="size-4" />
                                    </motion.div>
                                    <span>Consulting-grade HR Design Platform</span>
                                </motion.div>

                                {/* Main Heading */}
                                <motion.h1
                                    className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    Design your{' '}
                                    <span className="text-primary">HR system</span> with precision
                                </motion.h1>

                                {/* Description */}
                                <motion.p
                                    className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    Transform how SMBs build HR frameworks. Our step-by-step guided approach
                                    replicates professional consulting engagements inside a modern SaaS platform.
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button asChild size="lg" className="h-12 px-8">
                                            <Link href={canRegister ? register() : login()}>
                                                Start Free Trial
                                                <motion.span
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                    className="inline-block ml-2"
                                                >
                                                    <ArrowRight className="size-5" />
                                                </motion.span>
                                            </Link>
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button asChild size="lg" variant="outline" className="h-12 px-8">
                                            <Link href="#demo">Watch Demo</Link>
                                        </Button>
                                    </motion.div>
                                </motion.div>

                                {/* Social Proof */}
                                <motion.div
                                    className="flex items-center gap-4 pt-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                >
                                    <div className="flex -space-x-2">
                                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-background flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={heroInView ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
                                                transition={{
                                                    delay: 0.6 + i * 0.1,
                                                    type: 'spring',
                                                    stiffness: 200,
                                                    damping: 15,
                                                }}
                                                whileHover={{ scale: 1.15, zIndex: 10 }}
                                            >
                                                {letter}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">100+ companies</span> trust HR Path-Finder
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Right Column - HR System Overview Card */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 20 }}
                                animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Card className="relative overflow-hidden border-0 shadow-xl p-0 gradient-hero">
                                        {/* Top Section - Dark Blue Background */}
                                        <div className="p-6 text-white relative overflow-hidden">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                                animate={{
                                                    x: ['-100%', '100%'],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            />
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <span className="text-sm font-medium text-white/90">
                                                    HR System Overview
                                                </span>
                                                <motion.span
                                                    className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30"
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                >
                                                    4/4 Complete
                                                </motion.span>
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                {[
                                                    { id: 1, name: 'Diagnosis' },
                                                    { id: 2, name: 'Organization' },
                                                    { id: 3, name: 'Performance' },
                                                    { id: 4, name: 'Compensation' },
                                                ].map((step, index) => (
                                                    <motion.div
                                                        key={step.id}
                                                        className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={
                                                            heroInView
                                                                ? { opacity: 1, x: 0 }
                                                                : { opacity: 1, x: 0 }
                                                        }
                                                        transition={{
                                                            delay: 0.7 + index * 0.1,
                                                            duration: 0.5,
                                                        }}
                                                        whileHover={{
                                                            scale: 1.02,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                        }}
                                                    >
                                                        <motion.div
                                                            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={
                                                                heroInView
                                                                    ? { scale: 1, rotate: 0 }
                                                                    : { scale: 1, rotate: 0 }
                                                            }
                                                            transition={{
                                                                delay: 0.8 + index * 0.1,
                                                                type: 'spring',
                                                                stiffness: 200,
                                                            }}
                                                        >
                                                            <CheckCircle2 className="size-5 text-white" />
                                                        </motion.div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm text-white">
                                                                Step {step.id}: {step.name}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-white/60">Completed</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Bottom Section - Light Background */}
                                        <div className="p-6 space-y-4 bg-white dark:bg-gray-900">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    CEO Alignment
                                                </span>
                                                <motion.span
                                                    className="font-semibold text-green-600 dark:text-green-400"
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                >
                                                    High
                                                </motion.span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-green-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={heroInView ? { width: '85%' } : { width: '85%' }}
                                                    transition={{
                                                        delay: 1.2,
                                                        duration: 1,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Your HR system design aligns well with CEO management
                                                philosophy
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Main Features Section - Scroll Animated */}
                <section
                    ref={featuresRef as React.RefObject<HTMLElement>}
                    id="features"
                    className="py-6 sm:py-20 px-6 relative scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                                Everything you need to build a complete HR system
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Our platform guides you through each step with consulting-grade logic and
                                rule-based recommendations.
                            </p>
                        </motion.div>
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                            variants={containerVariants}
                            initial="visible"
                            animate={featuresInView ? 'visible' : 'visible'}
                        >
                            {mainFeatures.map((feature, index) => (
                                <motion.div key={index} variants={cardVariants}>
                                    <motion.div
                                        whileHover={{
                                            y: -10,
                                            transition: { type: 'spring', stiffness: 300 },
                                        }}
                                    >
                                        <Card className="card-hover border shadow-sm overflow-hidden group relative">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                initial={false}
                                            />
                                            <CardContent className="p-6 relative z-10">
                                                <motion.div
                                                    className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4"
                                                    whileHover={{
                                                        rotate: [0, -10, 10, -10, 0],
                                                        scale: 1.1,
                                                    }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <feature.icon className="size-6 text-white" />
                                                </motion.div>
                                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {feature.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section
                    ref={howItWorksRef as React.RefObject<HTMLElement>}
                    id="how-it-works"
                    className="py-6 sm:py-20 px-6 bg-muted/30 relative scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 1, y: 0 }}
                            animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                                How It Works
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Our platform guides you through a structured 4-step process to design your
                                complete HR system.
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {howItWorksSteps.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 1, y: 0 }}
                                    animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card className="card-hover border shadow-sm overflow-hidden group relative h-full">
                                            <CardContent className="p-6 relative z-10">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <motion.div
                                                        className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0"
                                                        whileHover={{
                                                            rotate: [0, -10, 10, 0],
                                                            scale: 1.1,
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <item.icon className="size-6 text-white" />
                                                    </motion.div>
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-primary font-bold text-sm">
                                                            {item.step}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {item.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Button asChild size="lg" variant="outline" className="h-12 px-8">
                                <Link href={canRegister ? register() : login()}>
                                    Start Your First Project
                                    <ArrowRight className="ml-2 size-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section
                    ref={pricingRef as React.RefObject<HTMLElement>}
                    id="pricing"
                    className="py-6 sm:py-20 px-6 relative scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 1, y: 0 }}
                            animate={pricingInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Choose the plan that fits your organization's needs. All plans include a 14-day
                                free trial.
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {pricingPlans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 1, y: 0 }}
                                    animate={pricingInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card
                                            className={`card-hover border shadow-lg overflow-hidden group relative h-full ${
                                                plan.popular
                                                    ? 'border-primary border-2 shadow-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
                                                    Most Popular
                                                </div>
                                            )}
                                            <CardContent className="p-8 relative z-10">
                                                <div className="mb-6">
                                                    <h3 className="font-semibold text-2xl mb-2">{plan.name}</h3>
                                                    <p className="text-muted-foreground text-sm mb-4">
                                                        {plan.description}
                                                    </p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-bold text-foreground">
                                                            {plan.price}
                                                        </span>
                                                        {plan.period && (
                                                            <span className="text-muted-foreground">
                                                                {plan.period}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ul className="space-y-3 mb-8">
                                                    {plan.features.map((feature, featureIndex) => (
                                                        <li key={featureIndex} className="flex items-start gap-3">
                                                            <CheckCircle2 className="size-5 text-success flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className={`w-full h-12 ${
                                                        plan.popular
                                                            ? ''
                                                            : 'variant-outline'
                                                    }`}
                                                    variant={plan.popular ? 'default' : 'outline'}
                                                >
                                                    <Link href={canRegister ? register() : login()}>
                                                        {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                                                        <ArrowRight className="ml-2 size-5" />
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                All plans include a 14-day free trial. No credit card required.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Resources Section */}
                <section
                    ref={resourcesRef as React.RefObject<HTMLElement>}
                    id="resources"
                    className="py-6 sm:py-20 px-6 bg-muted/30 relative scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 1, y: 0 }}
                            animate={resourcesInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                                Resources & Support
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Everything you need to get started and succeed with HR Path-Finder.
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resourcesItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 1, y: 0 }}
                                    animate={resourcesInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card className="card-hover border shadow-sm overflow-hidden group relative h-full cursor-pointer">
                                            <CardContent className="p-6 relative z-10">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <motion.div
                                                        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: [0, -5, 5, 0],
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <item.icon className="size-6 text-primary" />
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground text-sm">{item.description}</p>
                                                <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                                                    Learn more
                                                    <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why HR Path-Finder Section */}
                <section ref={whyRef as React.RefObject<HTMLElement>} className="py-6 sm:py-20 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Side */}
                            <motion.div
                                initial={{ opacity: 1, x: 0 }}
                                animate={whyInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                                    Why HR Path-Finder?
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    We replicate the structured approach of professional HR consulting, making
                                    it accessible to companies without dedicated HR planning teams.
                                </p>
                                <motion.div
                                    className="grid gap-4"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate={whyInView ? 'visible' : 'hidden'}
                                >
                                    {whyFeatures.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-3"
                                            variants={itemVariants}
                                            whileHover={{ x: 5 }}
                                        >
                                            <motion.div
                                                className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"
                                                whileHover={{ scale: 1.2, rotate: 360 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <CheckCircle2 className="size-4 text-success" />
                                            </motion.div>
                                            <span className="font-medium">{feature}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                            {/* Right Side - 2x2 Grid */}
                                <motion.div
                                    className="grid sm:grid-cols-2 grid-cols-1 gap-4"
                                    variants={containerVariants}
                                    initial="visible"
                                    animate={whyInView ? 'visible' : 'visible'}
                                >
                                {capabilityFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        variants={cardVariants}
                                        className={index === 1 || index === 3 ? 'mt-8' : ''}
                                    >
                                        <motion.div
                                            whileHover={{
                                                y: -5,
                                                rotate: [0, -2, 2, 0],
                                            }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <Card className="card-hover border shadow-sm overflow-hidden group relative">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                    initial={false}
                                                />
                                                <CardContent className="p-6 space-y-3 relative z-10">
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.2,
                                                            rotate: [0, -10, 10, 0],
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                    >
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
                                                    </motion.div>
                                                    <h3 className="font-semibold">{feature.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {feature.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section - Animated */}
                <section ref={ctaRef as React.RefObject<HTMLElement>} className="py-6 md:py-20 px-6 relative">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 1, scale: 1 }}
                            animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, type: 'spring' }}
                        >
                            <Card className="gradient-primary overflow-hidden border-0 shadow-2xl relative">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                                <CardContent className="p-8 md:p-12 text-center text-white relative z-10">
                                    <motion.h2
                                        className="font-display text-3xl md:text-4xl font-bold mb-4"
                                        animate={{
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        Ready to design your HR system?
                                    </motion.h2>
                                    <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                                        Start your free trial today and experience consulting-grade HR design
                                        that scales from prototype to full implementation.
                                    </p>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="secondary"
                                            className="h-12 has-[>svg]:px-8 bg-white text-foreground hover:bg-white/90 shadow-lg"
                                        >
                                            <Link href={canRegister ? register() : '#'}>
                                                Get Started Free
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                    }}
                                                >
                                                    <ArrowRight className="ml-2 size-5" />
                                                </motion.div>
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* Enhanced Footer */}
                <Footer canRegister={canRegister} />
            </div>
        </>
    );
}
