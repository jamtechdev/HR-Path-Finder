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
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import React, { useRef, useEffect, useState } from 'react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const page = usePage<SharedData>();
    const auth = page?.props?.auth || { user: null };
    
    const heroRef = useRef<HTMLElement>(null);
    const featuresRef = useRef<HTMLElement>(null);
    const whyRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
    const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
    const whyInView = useInView(whyRef, { once: true, margin: '-100px' });
    const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

    // Prevent hydration mismatch
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
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

            <div className="min-h-screen bg-background overflow-hidden">
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

                {/* Hero Section - Fully Animated */}
                <section ref={heroRef as React.RefObject<HTMLElement>} className="pt-24 pb-4 px-4 sm:pt-32 sm:pb-20 sm:px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <motion.div
                                className="space-y-8"
                                initial="hidden"
                                animate={heroInView ? 'visible' : 'hidden'}
                                variants={containerVariants}
                            >
                                {/* Badge */}
                                <motion.div
                                    variants={itemVariants}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium backdrop-blur-sm border border-success/20"
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
                                    variants={itemVariants}
                                    className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-none text-foreground text-center sm:text-start"
                                >
                                    Design your{' '}
                                    <motion.span
                                        className="text-primary inline-block"
                                        animate={{
                                            backgroundPosition: ['0%', '100%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }}
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--success)), hsl(var(--primary)))',
                                            backgroundSize: '200%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        HR system
                                    </motion.span>{' '}
                                    with precision
                                </motion.h1>

                                {/* Description */}
                                <motion.p
                                    variants={itemVariants}
                                    className="text-xl text-muted-foreground leading-relaxed max-w-lg text-center sm:text-start"
                                >
                                    Transform how SMBs build HR frameworks. Our step-by-step guided approach
                                    replicates professional consulting engagements inside a modern SaaS platform.
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button asChild size="lg" className="h-12 has-[>svg]:px-8">
                                            <Link href={canRegister ? register() : login()}>
                                                Start Free Trial
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button asChild size="lg" variant="outline" className="h-12 px-8">
                                            <Link href="#demo">Watch Demo</Link>
                                        </Button>
                                    </motion.div>
                                </motion.div>

                                {/* Social Proof */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-center gap-6 pt-4"
                                >
                                    <div className="flex -space-x-2">
                                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={heroInView ? { scale: 1, rotate: 0 } : {}}
                                                transition={{
                                                    delay: i * 0.1,
                                                    type: 'spring',
                                                    stiffness: 200,
                                                    damping: 15,
                                                }}
                                                whileHover={{ scale: 1.2, zIndex: 10 }}
                                            >
                                                {letter}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">100+ companies</span>
                                        <span className="text-muted-foreground"> trust HR Path-Finder</span>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Right Column - HR System Overview Card */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 50 }}
                                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <motion.div
                                    className="absolute inset-0 gradient-primary opacity-10 rounded-3xl blur-3xl"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.15, 0.1],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Card className="relative overflow-hidden border-2 shadow-lg p-0 backdrop-blur-sm bg-card/80">
                                        {/* Gradient Header */}
                                        <div className="gradient-hero p-6 text-white relative overflow-hidden">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
                                                <span className="text-sm font-medium text-white/70">
                                                    HR System Overview
                                                </span>
                                                <motion.span
                                                    className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium"
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
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
                                                        className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={
                                                            heroInView
                                                                ? { opacity: 1, x: 0 }
                                                                : {}
                                                        }
                                                        transition={{
                                                            delay: 0.5 + index * 0.1,
                                                            duration: 0.5,
                                                        }}
                                                        whileHover={{
                                                            scale: 1.02,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                        }}
                                                    >
                                                        <motion.div
                                                            className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={
                                                                heroInView
                                                                    ? { scale: 1, rotate: 0 }
                                                                    : {}
                                                            }
                                                            transition={{
                                                                delay: 0.6 + index * 0.1,
                                                                type: 'spring',
                                                                stiffness: 200,
                                                            }}
                                                        >
                                                            <CheckCircle2 className="size-5 text-white" />
                                                        </motion.div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                Step {step.id}: {step.name}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-white/60">Completed</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="p-6 space-y-4 bg-card">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    CEO Alignment
                                                </span>
                                                <motion.span
                                                    className="font-semibold text-success"
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                    }}
                                                >
                                                    High
                                                </motion.span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-success rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={heroInView ? { width: '85%' } : {}}
                                                    transition={{
                                                        delay: 1,
                                                        duration: 1,
                                                        ease: 'easeOut',
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
                    className="py-6 sm:py-20 px-6 bg-muted/30 relative"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
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
                            initial="hidden"
                            animate={featuresInView ? 'visible' : 'hidden'}
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

                {/* Why HR Path-Finder Section */}
                <section ref={whyRef as React.RefObject<HTMLElement>} className="py-6 sm:py-20 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Side */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={whyInView ? { opacity: 1, x: 0 } : {}}
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
                                initial="hidden"
                                animate={whyInView ? 'visible' : 'hidden'}
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
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
