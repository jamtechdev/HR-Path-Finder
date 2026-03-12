import React from 'react';

interface LandingFooterProps {
    logoText?: string;
    companySub?: string;
    copyright?: string;
}

export function LandingFooter({
    logoText = 'HR Pathfinder',
    companySub = 'powered by BetterCompany',
    copyright = '© 2026 (주)Everthere. All rights reserved.',
}: LandingFooterProps) {
    return (
        <footer className="bg-[#0D1B2A] py-10 px-12 md:px-20 flex flex-wrap items-center justify-between gap-4">
            <div className="font-serif font-bold text-base text-white">
                HR <span className="text-[#2ECFAB]">Pathfinder</span>
                <span className="font-light text-xs text-white/30 ml-2">{companySub}</span>
            </div>
            <div className="text-xs text-white/30">
                {copyright}
            </div>
        </footer>
    );
}
