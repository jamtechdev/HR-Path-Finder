import { router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

type PreloaderProps = {
    appName?: string;
};

export default function Preloader({ appName = 'HR Path-Finder' }: PreloaderProps) {
    const [isVisible, setIsVisible] = useState(true);
    const initialHandledRef = useRef(false);
    const navigationTimerRef = useRef<number | null>(null);
    const hardFallbackTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || initialHandledRef.current) {
            return;
        }
        initialHandledRef.current = true;

        setIsVisible(true);
        document.body.classList.add('preloader-active');

        const hide = () => {
            const preloaderElement = document.getElementById('preloader');
            if (!preloaderElement) return;

            setTimeout(() => {
                preloaderElement.classList.add('hide');
                setIsVisible(false);
                if (hardFallbackTimerRef.current) {
                    window.clearTimeout(hardFallbackTimerRef.current);
                    hardFallbackTimerRef.current = null;
                }

                setTimeout(() => {
                    document.body.classList.remove('preloader-active');
                }, 500);
            }, 350);
        };

        // Safety net: never keep loader forever on refresh.
        hardFallbackTimerRef.current = window.setTimeout(hide, 2500);

        if (document.readyState === 'complete') {
            hide();
            return;
        }

        window.addEventListener('load', hide, { once: true });
        return () => {
            window.removeEventListener('load', hide);
            if (hardFallbackTimerRef.current) {
                window.clearTimeout(hardFallbackTimerRef.current);
                hardFallbackTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const show = () => {
            setIsVisible(true);
            document.body.classList.add('preloader-active');
            const el = document.getElementById('preloader');
            el?.classList.remove('hide');
            if (hardFallbackTimerRef.current) {
                window.clearTimeout(hardFallbackTimerRef.current);
            }
            hardFallbackTimerRef.current = window.setTimeout(hide, 3000);
        };

        const hide = () => {
            if (navigationTimerRef.current) {
                window.clearTimeout(navigationTimerRef.current);
            }
            navigationTimerRef.current = window.setTimeout(() => {
                const el = document.getElementById('preloader');
                if (!el) return;
                el.classList.add('hide');
                setIsVisible(false);
                if (hardFallbackTimerRef.current) {
                    window.clearTimeout(hardFallbackTimerRef.current);
                    hardFallbackTimerRef.current = null;
                }
                window.setTimeout(() => {
                    document.body.classList.remove('preloader-active');
                }, 500);
            }, 250);
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
            if (navigationTimerRef.current) {
                window.clearTimeout(navigationTimerRef.current);
            }
            if (hardFallbackTimerRef.current) {
                window.clearTimeout(hardFallbackTimerRef.current);
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
