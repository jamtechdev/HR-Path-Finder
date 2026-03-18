import { useEffect, useRef } from 'react';
import { loadAllTabDrafts } from '@/lib/diagnosisDraftStorage';

/**
 * Merge saved tab draft from sessionStorage once on mount (after server props).
 */
export function useDiagnosisDraftHydrate(
    projectId: number | undefined,
    tabId: string,
    merge: (patch: Record<string, unknown>) => void,
    options: { enabled?: boolean } = {}
): void {
    const { enabled = true } = options;
    const done = useRef(false);
    useEffect(() => {
        if (!enabled || !projectId || done.current) return;
        const patch = loadAllTabDrafts(projectId)[tabId];
        if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) {
            done.current = true;
            return;
        }
        done.current = true;
        merge(patch);
    }, [enabled, projectId, tabId, merge]);
}
