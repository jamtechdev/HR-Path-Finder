import { Link } from '@inertiajs/react';

interface DiagnosisHeaderProps {
    title: string;
    status: 'not_started' | 'in_progress' | 'submitted';
    backHref?: string;
    stepCounter?: string; // e.g. "3 of 10"
}

export default function DiagnosisHeader({
    title,
    status,
    backHref = '/diagnosis',
    stepCounter,
}: DiagnosisHeaderProps) {
    const statusLabel = status === 'in_progress' ? '● 진행 중' : status === 'submitted' ? '완료' : '미시작';
    const showMintBadge = status === 'in_progress';

    return (
        <div className="flex items-center gap-3 mb-3.5">
            <Link
                href={backHref}
                className="w-7 h-7 rounded-[7px] bg-[var(--hr-gray-100)] hover:bg-[var(--hr-gray-200)] flex items-center justify-center text-[14px] text-[var(--hr-gray-600)] transition-colors shrink-0"
            >
                ←
            </Link>
            <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-bold text-[var(--hr-gray-800)] tracking-[-0.3px]">{title}</h2>
                <span
                    className={`text-[10.5px] font-semibold py-[3px] px-[9px] rounded-[20px] ${
                        showMintBadge
                            ? 'bg-[rgba(78,205,196,0.15)] text-[#2ea89e]'
                            : status === 'submitted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[var(--hr-gray-100)] text-[var(--hr-gray-400)]'
                    }`}
                >
                    {statusLabel}
                </span>
            </div>
            {stepCounter && (
                <span className="text-[12px] text-[var(--hr-gray-400)] ml-auto">{stepCounter}</span>
            )}
        </div>
    );
}
