import { Button } from '@/components/ui/button';
import { register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export function CTASection({ canRegister = true }: { canRegister?: boolean }) {
    return (
        <section className="bg-brand-blue px-4 py-16 text-white md:px-8 lg:px-16">
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Ready to design your HR system?
                </h2>
                <p className="mb-8 text-lg text-blue-100 md:text-xl">
                    Start your free trial today and experience consulting-grade HR design that
                    scales from prototype to full implementation.
                </p>
                <Button asChild size="lg" variant="secondary" className="bg-white text-brand-blue hover:bg-gray-100">
                    <Link href={canRegister ? register() : '#'}>
                        Get Started Free
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
