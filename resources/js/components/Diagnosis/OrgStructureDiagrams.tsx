import React from 'react';

const diagramClass = 'w-[140px] h-[100px] flex-shrink-0';

export function FunctionalDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="28" y="2" width="24" height="12" rx="3" fill="#1a2744" />
            <line x1="40" y1="14" x2="40" y2="22" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="12" y1="22" x2="68" y2="22" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="12" y1="22" x2="12" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="40" y1="22" x2="40" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="68" y1="22" x2="68" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <rect x="1" y="28" width="22" height="10" rx="2" fill="#4ecdc4" opacity="0.85" />
            <rect x="29" y="28" width="22" height="10" rx="2" fill="#4ecdc4" opacity="0.85" />
            <rect x="57" y="28" width="22" height="10" rx="2" fill="#4ecdc4" opacity="0.85" />
            <text x="12" y="35.5" textAnchor="middle" fontSize="5" fill="white" fontFamily="sans-serif" fontWeight="600">영업</text>
            <text x="40" y="35.5" textAnchor="middle" fontSize="5" fill="white" fontFamily="sans-serif" fontWeight="600">기술</text>
            <text x="68" y="35.5" textAnchor="middle" fontSize="5" fill="white" fontFamily="sans-serif" fontWeight="600">관리</text>
            <line x1="12" y1="38" x2="12" y2="44" stroke="#cdd3df" strokeWidth="1.2" />
            <line x1="40" y1="38" x2="40" y2="44" stroke="#cdd3df" strokeWidth="1.2" />
            <line x1="68" y1="38" x2="68" y2="44" stroke="#cdd3df" strokeWidth="1.2" />
            <rect x="4" y="44" width="16" height="8" rx="2" fill="#e2e6ee" />
            <rect x="32" y="44" width="16" height="8" rx="2" fill="#e2e6ee" />
            <rect x="60" y="44" width="16" height="8" rx="2" fill="#e2e6ee" />
        </svg>
    );
}

export function DivisionalDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="28" y="2" width="24" height="12" rx="3" fill="#1a2744" />
            <line x1="40" y1="14" x2="40" y2="22" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="18" y1="22" x2="62" y2="22" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="18" y1="22" x2="18" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="40" y1="22" x2="40" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="62" y1="22" x2="62" y2="28" stroke="#cdd3df" strokeWidth="1.5" />
            <rect x="6" y="28" width="24" height="24" rx="3" fill="#f0f2f6" stroke="#cdd3df" strokeWidth="1" />
            <rect x="28" y="28" width="24" height="24" rx="3" fill="#f0f2f6" stroke="#cdd3df" strokeWidth="1" />
            <rect x="50" y="28" width="24" height="24" rx="3" fill="#f0f2f6" stroke="#cdd3df" strokeWidth="1" />
            <rect x="10" y="31" width="16" height="6" rx="1.5" fill="#6c8ebf" />
            <rect x="32" y="31" width="16" height="6" rx="1.5" fill="#6c8ebf" />
            <rect x="54" y="31" width="16" height="6" rx="1.5" fill="#6c8ebf" />
            <text x="18" y="35.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">사업부A</text>
            <text x="40" y="35.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">사업부B</text>
            <text x="62" y="35.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">해외BU</text>
            <rect x="10" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
            <rect x="18" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
            <rect x="32" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
            <rect x="40" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
            <rect x="54" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
            <rect x="62" y="39" width="6" height="5" rx="1" fill="#cdd3df" />
        </svg>
    );
}

export function MatrixDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="22" y="2" width="16" height="8" rx="2" fill="#4ecdc4" opacity="0.9" />
            <rect x="42" y="2" width="16" height="8" rx="2" fill="#4ecdc4" opacity="0.9" />
            <text x="30" y="7.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">기술팀</text>
            <text x="50" y="7.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">디자인</text>
            <rect x="2" y="16" width="16" height="8" rx="2" fill="#1a2744" />
            <rect x="2" y="30" width="16" height="8" rx="2" fill="#1a2744" />
            <rect x="2" y="44" width="16" height="8" rx="2" fill="#1a2744" />
            <text x="10" y="21.5" textAnchor="middle" fontSize="4.2" fill="white" fontFamily="sans-serif" fontWeight="600">PJT A</text>
            <text x="10" y="35.5" textAnchor="middle" fontSize="4.2" fill="white" fontFamily="sans-serif" fontWeight="600">PJT B</text>
            <text x="10" y="49.5" textAnchor="middle" fontSize="4.2" fill="white" fontFamily="sans-serif" fontWeight="600">PJT C</text>
            <rect x="22" y="16" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <rect x="40" y="16" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <rect x="22" y="30" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <rect x="40" y="30" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <rect x="22" y="44" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <rect x="40" y="44" width="14" height="8" rx="2" fill="#e8f4f3" stroke="#4ecdc4" strokeWidth="1" />
            <circle cx="29" cy="20" r="2" fill="#2ea89e" />
            <circle cx="47" cy="20" r="2" fill="#2ea89e" />
            <circle cx="29" cy="34" r="2" fill="#2ea89e" />
            <circle cx="47" cy="34" r="2" fill="#2ea89e" />
        </svg>
    );
}

export function HqDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="20" y="2" width="40" height="14" rx="3" fill="#1a2744" />
            <text x="40" y="11" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" fontWeight="700">본사 (HQ)</text>
            <line x1="40" y1="16" x2="40" y2="24" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="16" y1="24" x2="64" y2="24" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="16" y1="24" x2="16" y2="30" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="40" y1="24" x2="40" y2="30" stroke="#cdd3df" strokeWidth="1.5" />
            <line x1="64" y1="24" x2="64" y2="30" stroke="#cdd3df" strokeWidth="1.5" />
            <rect x="4" y="30" width="24" height="12" rx="2.5" fill="#d6b656" opacity="0.85" />
            <rect x="28" y="30" width="24" height="12" rx="2.5" fill="#d6b656" opacity="0.85" />
            <rect x="52" y="30" width="24" height="12" rx="2.5" fill="#d6b656" opacity="0.85" />
            <text x="16" y="37.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">자회사A</text>
            <text x="40" y="37.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">자회사B</text>
            <text x="64" y="37.5" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif" fontWeight="600">지사C</text>
            <text x="16" y="42" textAnchor="middle" fontSize="3.5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">운영 독립</text>
            <text x="40" y="42" textAnchor="middle" fontSize="3.5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">운영 독립</text>
            <text x="64" y="42" textAnchor="middle" fontSize="3.5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">운영 독립</text>
        </svg>
    );
}

export function TftDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="2" y="2" width="18" height="10" rx="2" fill="#e2e6ee" />
            <rect x="24" y="2" width="18" height="10" rx="2" fill="#e2e6ee" />
            <rect x="46" y="2" width="18" height="10" rx="2" fill="#e2e6ee" />
            <rect x="60" y="2" width="18" height="10" rx="2" fill="#e2e6ee" />
            <text x="11" y="8.5" textAnchor="middle" fontSize="4" fill="#9ba5bc" fontFamily="sans-serif">개발팀</text>
            <text x="33" y="8.5" textAnchor="middle" fontSize="4" fill="#9ba5bc" fontFamily="sans-serif">디자인</text>
            <text x="55" y="8.5" textAnchor="middle" fontSize="4" fill="#9ba5bc" fontFamily="sans-serif">마케팅</text>
            <text x="69" y="8.5" textAnchor="middle" fontSize="4" fill="#9ba5bc" fontFamily="sans-serif">기획</text>
            <line x1="11" y1="12" x2="11" y2="24" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="33" y1="12" x2="33" y2="24" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="55" y1="12" x2="55" y2="24" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="69" y1="12" x2="69" y2="24" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,2" />
            <rect x="4" y="24" width="72" height="18" rx="4" fill="#1a2744" />
            <text x="40" y="30" textAnchor="middle" fontSize="5" fill="#4ecdc4" fontFamily="sans-serif" fontWeight="700">⚡ TFT</text>
            <text x="40" y="38" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">목표 달성 후 해산</text>
            <circle cx="15" cy="30" r="3" fill="#4ecdc4" opacity="0.8" />
            <circle cx="28" cy="30" r="3" fill="#4ecdc4" opacity="0.8" />
            <circle cx="52" cy="30" r="3" fill="#4ecdc4" opacity="0.8" />
            <circle cx="65" cy="30" r="3" fill="#4ecdc4" opacity="0.8" />
            <line x1="11" y1="42" x2="11" y2="52" stroke="#4ecdc4" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="33" y1="42" x2="33" y2="52" stroke="#4ecdc4" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="55" y1="42" x2="55" y2="52" stroke="#4ecdc4" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="69" y1="42" x2="69" y2="52" stroke="#4ecdc4" strokeWidth="1" strokeDasharray="2,2" />
            <text x="40" y="52" textAnchor="middle" fontSize="3.5" fill="#9ba5bc" fontFamily="sans-serif">해산 후 원소속 복귀</text>
        </svg>
    );
}

export function FlatDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <circle cx="40" cy="12" r="8" fill="#1a2744" />
            <text x="40" y="14.5" textAnchor="middle" fontSize="5" fill="white" fontFamily="sans-serif" fontWeight="700">CEO</text>
            <line x1="40" y1="20" x2="12" y2="36" stroke="#cdd3df" strokeWidth="1.3" />
            <line x1="40" y1="20" x2="26" y2="42" stroke="#cdd3df" strokeWidth="1.3" />
            <line x1="40" y1="20" x2="40" y2="44" stroke="#cdd3df" strokeWidth="1.3" />
            <line x1="40" y1="20" x2="54" y2="42" stroke="#cdd3df" strokeWidth="1.3" />
            <line x1="40" y1="20" x2="68" y2="36" stroke="#cdd3df" strokeWidth="1.3" />
            <circle cx="12" cy="38" r="5" fill="#9ba5bc" />
            <circle cx="26" cy="44" r="5" fill="#9ba5bc" />
            <circle cx="40" cy="46" r="5" fill="#9ba5bc" />
            <circle cx="54" cy="44" r="5" fill="#9ba5bc" />
            <circle cx="68" cy="38" r="5" fill="#9ba5bc" />
        </svg>
    );
}

export function UndefinedDiagram() {
    return (
        <svg className={diagramClass} viewBox="0 0 80 56">
            <rect x="14" y="8" width="20" height="14" rx="3" fill="#e2e6ee" stroke="#cdd3df" strokeWidth="1.2" strokeDasharray="3,2" />
            <rect x="46" y="8" width="20" height="14" rx="3" fill="#e2e6ee" stroke="#cdd3df" strokeWidth="1.2" strokeDasharray="3,2" />
            <rect x="8" y="34" width="18" height="14" rx="3" fill="#e2e6ee" stroke="#cdd3df" strokeWidth="1.2" strokeDasharray="3,2" />
            <rect x="30" y="34" width="18" height="14" rx="3" fill="#e2e6ee" stroke="#cdd3df" strokeWidth="1.2" strokeDasharray="3,2" />
            <rect x="54" y="34" width="18" height="14" rx="3" fill="#e2e6ee" stroke="#cdd3df" strokeWidth="1.2" strokeDasharray="3,2" />
            <line x1="24" y1="22" x2="17" y2="34" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,3" />
            <line x1="56" y1="22" x2="39" y2="34" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,3" />
            <line x1="34" y1="22" x2="63" y2="34" stroke="#cdd3df" strokeWidth="1" strokeDasharray="2,3" />
            <text x="24" y="18" textAnchor="middle" fontSize="7" fill="#9ba5bc" fontFamily="sans-serif" fontWeight="700">?</text>
            <text x="56" y="18" textAnchor="middle" fontSize="7" fill="#9ba5bc" fontFamily="sans-serif" fontWeight="700">?</text>
            <text x="17" y="44" textAnchor="middle" fontSize="7" fill="#9ba5bc" fontFamily="sans-serif" fontWeight="700">?</text>
            <text x="39" y="44" textAnchor="middle" fontSize="7" fill="#9ba5bc" fontFamily="sans-serif" fontWeight="700">?</text>
            <text x="63" y="44" textAnchor="middle" fontSize="7" fill="#9ba5bc" fontFamily="sans-serif" fontWeight="700">?</text>
        </svg>
    );
}

const diagrams: Record<string, React.FC> = {
    functional: FunctionalDiagram,
    divisional: DivisionalDiagram,
    matrix: MatrixDiagram,
    hq: HqDiagram,
    tft: TftDiagram,
    flat: FlatDiagram,
    undefined: UndefinedDiagram,
};

export function OrgStructureDiagram({ id }: { id: string }) {
    const C = diagrams[id];
    return C ? <C /> : null;
}
