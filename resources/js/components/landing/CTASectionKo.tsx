import { Button } from '@/components/ui/button';
import { register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface CTASectionKoProps {
    canRegister?: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
}

export function CTASectionKo({ 
    canRegister = true,
    title = 'HR 시스템을 설계할 준비가 되셨나요?',
    description = '오늘 무료 체험을 시작하고 프로토타입부터 전체 구현까지 확장 가능한 컨설팅급 HR 설계를 경험해보세요.',
    buttonText = '무료로 시작하기'
}: CTASectionKoProps) {
    return (
        <section className="bg-[#0a1629] px-4 py-20 md:px-8 lg:px-16">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="mb-6 text-4xl md:text-5xl font-bold text-white">
                    {title}
                </h2>
                <p className="mb-10 text-xl md:text-2xl text-blue-100 leading-relaxed">
                    {description}
                </p>
                <Button asChild className="bg-white hover:bg-gray-100 text-[#0a1629] font-medium px-6 py-3 rounded-lg text-base h-auto shadow-sm">
                    <Link href={canRegister ? register() : '#'}>
                        {buttonText}
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
