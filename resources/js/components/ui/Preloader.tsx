import { router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { waitWebAnimationMs } from '@/lib/deferred';

type PreloaderProps = {
    appName?: string;
};

export default function Preloader({ appName = 'HR Path-Finder' }: PreloaderProps) {
    const [isVisible, setIsVisible] = useState(true);
    const initialHandledRef = useRef(false);
    const navigationChainRef = useRef<{ cancelled: boolean } | null>(null);
    const hardFallbackChainRef = useRef<{ cancelled: boolean } | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || initialHandledRef.current) {
            return;
        }
        initialHandledRef.current = true;

        setIsVisible(true);
        document.body.classList.add('preloader-active');

        const hide = () => {
            if (hardFallbackChainRef.current) {
                hardFallbackChainRef.current.cancelled = true;
                hardFallbackChainRef.current = null;
            }
            const preloaderElement = document.getElementById('preloader');
            if (!preloaderElement) return;

            void waitWebAnimationMs(350).then(() => {
                preloaderElement.classList.add('hide');
                setIsVisible(false);
                void waitWebAnimationMs(500).then(() => {
                    document.body.classList.remove('preloader-active');
                });
            });
        };

        const hardChain = { cancelled: false };
        hardFallbackChainRef.current = hardChain;
        void waitWebAnimationMs(2500).then(() => {
            if (!hardChain.cancelled) hide();
        });

        if (document.readyState === 'complete') {
            hide();
            return () => {
                hardChain.cancelled = true;
                window.removeEventListener('load', hide);
            };
        }

        window.addEventListener('load', hide, { once: true });
        return () => {
            window.removeEventListener('load', hide);
            hardChain.cancelled = true;
        };
    }, []);

    useEffect(() => {
        const hide = () => {
            if (navigationChainRef.current) {
                navigationChainRef.current.cancelled = true;
            }
            if (hardFallbackChainRef.current) {
                hardFallbackChainRef.current.cancelled = true;
                hardFallbackChainRef.current = null;
            }
            const chain = { cancelled: false };
            navigationChainRef.current = chain;
            void waitWebAnimationMs(250).then(() => {
                if (chain.cancelled) return;
                const el = document.getElementById('preloader');
                if (!el) return;
                el.classList.add('hide');
                setIsVisible(false);
                void waitWebAnimationMs(500).then(() => {
                    if (chain.cancelled) return;
                    document.body.classList.remove('preloader-active');
                });
            });
        };

        const show = () => {
            setIsVisible(true);
            document.body.classList.add('preloader-active');
            const el = document.getElementById('preloader');
            el?.classList.remove('hide');
            if (hardFallbackChainRef.current) {
                hardFallbackChainRef.current.cancelled = true;
            }
            const hardChain = { cancelled: false };
            hardFallbackChainRef.current = hardChain;
            void waitWebAnimationMs(3000).then(() => {
                if (!hardChain.cancelled) hide();
            });
        };

        const offStart = router.on('start', show);
        const offFinish = router.on('finish', hide);
        const offNavigate = router.on('navigate', hide);
        const offError = router.on('error', hide);
        const offInvalid = router.on('invalid', hide);
        const offException = router.on('exception', hide);

        return () => {
            offStart();
            offFinish();
            offNavigate();
            offError();
            offInvalid();
            offException();
            if (navigationChainRef.current) {
                navigationChainRef.current.cancelled = true;
            }
            if (hardFallbackChainRef.current) {
                hardFallbackChainRef.current.cancelled = true;
            }
        };
    }, []);

    return (
        <div id="preloader" className={isVisible ? '' : 'hide'} aria-hidden={!isVisible}>
            <div className="preloader">
                <div className="loader">
                    <div />
                </div>
                <div className="waviy" aria-label={appName}>
                    {appName.split('').map((char, index) => (
                        <span key={`${char}-${index}`} className="d-inline-block" style={{ animationDelay: `${index * 0.06}s` }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
