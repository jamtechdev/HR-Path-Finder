/**
 * Run after the next paint (replaces setTimeout(fn, 0) for focus/scroll-after-layout).
 * Returns a cancel function.
 */
export function afterPaint(callback: () => void): () => void {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(callback);
    });
    return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
    };
}

/**
 * Wait for a duration without setTimeout (Web Animations API).
 * Falls back to immediate resolution if animations are unavailable (e.g. some test envs).
 */
export function waitWebAnimationMs(durationMs: number): Promise<void> {
    if (typeof document === 'undefined' || durationMs <= 0) {
        return Promise.resolve();
    }
    try {
        const el = document.createElement('div');
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none;visibility:hidden';
        document.body.appendChild(el);
        const anim = el.animate([{ opacity: 0 }, { opacity: 0 }], {
            duration: durationMs,
            fill: 'both',
        });
        return anim.finished
            .then(() => undefined)
            .catch(() => undefined)
            .finally(() => el.remove());
    } catch {
        return Promise.resolve();
    }
}
