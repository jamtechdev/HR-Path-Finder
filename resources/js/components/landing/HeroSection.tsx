import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection({ canRegister = true }: { canRegister?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-8 px-4 py-12 md:flex-row md:justify-between md:px-8 lg:px-16">
            <div className="flex flex-1 flex-col gap-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-4 py-1.5 text-sm font-medium text-brand-green">
                    <Sparkles className="size-4" />
                    <span>Consulting-grade HR Design Platform</span>
                </div>

                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                    Design your HR system with precision.
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Transform how SMBs build HR frameworks. Our step-by-step guided approach
                    replicates professional consulting engagements inside a modern SaaS platform.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button asChild size="lg" className="bg-brand-blue text-white hover:bg-brand-blue/90">
                        <Link href={canRegister ? register() : login()}>
                            Start Free Trial
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="#demo">Watch Demo</Link>
                    </Button>
                </div>

                <div className="mt-4 flex items-center gap-6">
                    <div className="flex -space-x-2">
                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                            <div
                                key={i}
                                className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-muted text-sm font-semibold"
                            >
                                {letter}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">100+ companies trust HR Copilot</p>
                </div>
            </div>
        </div>
    );
}
